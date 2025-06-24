from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from src.utils.data_processor import DataProcessor
from src.utils.user_db import UserDB
from src.utils.auth import create_access_token, create_refresh_token, verify_token
from src.models.user import UserCreate, UserInDB, Token, UserUpdate, PasswordUpdate
import logging
import os
import asyncio
from datetime import datetime
from dotenv import load_dotenv
import requests
import pandas as pd

# Load environment variables
load_dotenv()

MISTRAL_API_URL = os.getenv('MISTRAL_API_URL')
MISTRAL_API_KEY = os.getenv('MISTRAL_API_KEY')

# SQL for notifications table
# CREATE TABLE notifications (
#     id INT AUTO_INCREMENT PRIMARY KEY,
#     title VARCHAR(255) NOT NULL,
#     message TEXT,
#     type VARCHAR(50),
#     is_read BOOLEAN DEFAULT FALSE,
#     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
# );

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Energy Dashboard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize data processor
data_processor = DataProcessor(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "energydashboard")
)

user_db = UserDB(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "energydashboard")
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Dependency to get current user
async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    username: str = payload.get("sub")
    if username is None:
        raise credentials_exception
    
    user = user_db.get_user_by_username(username)
    if user is None:
        raise credentials_exception
    
    return user

# Authentication endpoints
@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Accepts either username or email in the 'username' field
    user = user_db.verify_user_credentials(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login
    user_db.update_last_login(user.id)
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/users/", response_model=UserInDB)
async def create_user(user: UserCreate):
    # Check if username exists
    if user_db.get_user_by_username(user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    if user_db.get_user_by_email(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    return user_db.create_user(user)

@app.get("/users/me", response_model=UserInDB)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=UserInDB)
async def update_user_me(
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    updated_user = user_db.update_user(current_user.id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No changes provided"
        )
    return updated_user

@app.post("/users/me/change-password")
async def change_password(
    password_update: PasswordUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    # Verify current password
    if not user_db.verify_user_credentials(current_user.username, password_update.current_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Update to new password
    success = user_db.update_user_password(current_user.id, password_update.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not update password"
        )
        
    return {"message": "Password updated successfully"}

# Admin endpoints
@app.get("/users/", response_model=List[UserInDB])
async def read_users(current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return user_db.get_all_users()

@app.put("/users/{user_id}", response_model=UserInDB)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Optional: Prevent admins from editing superadmins
    if current_user.role == 'admin':
        target_user = user_db.get_user_by_id(user_id)
        if target_user and target_user.role == 'superadmin':
            raise HTTPException(status_code=403, detail="Admins cannot edit superadmins")

    updated_user = user_db.update_user(user_id, user_update)
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or no changes made"
        )
    return updated_user

@app.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    current_user: UserInDB = Depends(get_current_user)
):
    if current_user.role != "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    if not user_db.delete_user(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {"message": "User deleted successfully"}

# Websocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We can receive messages here if needed, for now, it just keeps the connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Notification endpoints
@app.get("/api/notifications")
async def get_notifications(current_user: UserInDB = Depends(get_current_user)):
    # Allow all roles to access notifications for now
    # TODO: In the future, filter notifications for users to only their own
    if current_user.role in ["admin", "superadmin"]:
        return user_db.get_all_notifications()
    elif current_user.role == "user":
        # For now, return all notifications to users as well (replace with user-specific notifications later)
        return user_db.get_all_notifications()
    else:
        raise HTTPException(status_code=403, detail="Not enough permissions")

@app.post("/api/notifications/read/{notification_id}")
async def mark_notification_as_read(notification_id: int, current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if not user_db.mark_notification_as_read(notification_id):
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@app.post("/api/notifications/test-alert")
async def test_alert(current_user: UserInDB = Depends(get_current_user)):
    if current_user.role not in ["superadmin"]:
         raise HTTPException(status_code=403, detail="Only superadmins can trigger test alerts")
    
    notification = {
        "title": "High Consumption Alert",
        "message": "Power consumption has exceeded the threshold of 5 kWh.",
        "type": "warning",
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Store in DB and get the full notification object with ID
    new_notification = user_db.create_notification(notification)

    # Broadcast to all connected clients
    await manager.broadcast(str(new_notification))
    return {"message": "Test alert sent", "data": new_notification}

@app.get("/")
async def root():
    """Root endpoint returning API information."""
    return {
        "name": "Energy Dashboard API",
        "version": "1.0.0",
        "description": "API for energy consumption and production monitoring"
    }

@app.get("/api/measurements/latest")
async def get_latest_measurements(limit: int = 100) -> List[Dict[str, Any]]:
    """Get the latest measurements."""
    try:
        return data_processor.get_latest_measurements(limit)
    except Exception as e:
        logger.error(f"Error in get_latest_measurements: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/measurements/daily")
async def get_daily_aggregations(days: int = 30) -> List[Dict[str, Any]]:
    """Get daily aggregations for the specified number of days."""
    try:
        return data_processor.get_daily_aggregations(days)
    except Exception as e:
        logger.error(f"Error in get_daily_aggregations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/measurements/import")
async def import_data():
    """Import data from the CSV file."""
    try:
        df = data_processor.process_csv("data/energy_consumption.csv")
        data_processor.insert_data(df)
        return {"message": "Data imported successfully"}
    except Exception as e:
        logger.error(f"Error in import_data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Device mapping: known columns to device names
DEVICE_INFO_MAP = {
    'Zonnepaneelspanning (V)': {'id': 'solar_voltage', 'label': 'Zonnepaneelspanning', 'icon': 'FiSun', 'unit': 'V'},
    'Zonnepaneelstroom (A)': {'id': 'solar_current', 'label': 'Zonnepaneelstroom', 'icon': 'FiZap', 'unit': 'A'},
    'Waterstofproductie (L/u)': {'id': 'hydrogen_production', 'label': 'Waterstofproductie', 'icon': 'FiDroplet', 'unit': 'L/u'},
    'Stroomverbruik woning (kW)': {'id': 'power_consumption', 'label': 'Stroomverbruik woning', 'icon': 'FiHome', 'unit': 'kW'},
    'Waterstofverbruik auto (L/u)': {'id': 'hydrogen_consumption', 'label': 'Waterstofverbruik auto', 'icon': 'FiTruck', 'unit': 'L/u'},
    'Buitentemperatuur (°C)': {'id': 'outside_temperature', 'label': 'Buitentemperatuur', 'icon': 'FiThermometer', 'unit': '°C'},
    'Binnentemperatuur (°C)': {'id': 'inside_temperature', 'label': 'Binnentemperatuur', 'icon': 'FiThermometer', 'unit': '°C'},
    'Luchtdruk (hPa)': {'id': 'air_pressure', 'label': 'Luchtdruk', 'icon': 'FiWind', 'unit': 'hPa'},
    'Luchtvochtigheid (%)': {'id': 'humidity', 'label': 'Luchtvochtigheid', 'icon': 'FiCloudRain', 'unit': '%'},
    'Accuniveau (%)': {'id': 'battery_level', 'label': 'Accuniveau', 'icon': 'FiBattery', 'unit': '%'},
    'CO2-concentratie binnen (ppm)': {'id': 'co2_level', 'label': 'CO2-concentratie binnen', 'icon': 'FiActivity', 'unit': 'ppm'},
    'Waterstofopslag woning (%)': {'id': 'hydrogen_storage_house', 'label': 'Waterstofopslag woning', 'icon': 'FiBox', 'unit': '%'},
    'Waterstofopslag auto (%)': {'id': 'hydrogen_storage_car', 'label': 'Waterstofopslag auto', 'icon': 'FiBox', 'unit': '%'},
}

IGNORE_COLUMNS = {'Tijdstip', 'timestamp'}

def ai_guess_device(column_name):
    if not MISTRAL_API_URL or not MISTRAL_API_KEY:
        # Fallback: prettify the column name, unknown unit/icon
        return {
            'label': column_name.replace('_', ' ').capitalize(),
            'unit': '',
            'icon': 'FiCpu'
        }
    prompt = (
        "Geef ALLEEN een korte string in het formaat: LABEL | EENHEID | ICON. "
        "Gebruik een Nederlands label (géén Engelse woorden), een standaard eenheid (zoals V, A, kW, %, °C, ppm, L/u, hPa, kg, m³), en een Feather icon naam zoals FiSun, FiBattery, FiThermometer, FiZap, FiBox, FiDroplet, FiCloudRain, FiActivity, FiTruck, FiHome, FiWind. "
        "Geen emoji, geen uitleg, geen nieuwe regels. "
        "Voor deze sensor of apparaat: '" + column_name + "'. "
        "Voorbeelden: \n"
        "Zonnepaneelspanning | V | FiSun\n"
        "Zonnepaneelstroom | A | FiZap\n"
        "Waterstofproductie | L/u | FiDroplet\n"
        "Stroomverbruik woning | kW | FiHome\n"
        "Waterstofverbruik auto | L/u | FiTruck\n"
        "Buitentemperatuur | °C | FiThermometer\n"
        "Binnentemperatuur | °C | FiThermometer\n"
        "Luchtdruk | hPa | FiWind\n"
        "Luchtvochtigheid | % | FiCloudRain\n"
        "Accuniveau | % | FiBattery\n"
        "CO2-concentratie binnen | ppm | FiActivity\n"
        "Waterstofopslag woning | % | FiBox\n"
        "Waterstofopslag auto | % | FiBox"
        "\nLet op: Gebruik GEEN Engelse woorden."
    )
    # Mapping: key is lowercase, spaties/underscores verwijderd
    label_translations = {
        "solarvoltage": "Zonnepaneelspanning",
        "zonnepaneelspanning": "Zonnepaneelspanning",
        "solarcurrent": "Zonnepaneelstroom",
        "zonnepaneelstroom": "Zonnepaneelstroom",
        "hydrogenproduction": "Waterstofproductie",
        "waterstofproductie": "Waterstofproductie",
        "powerconsumption": "Stroomverbruik woning",
        "stroomverbruikwoning": "Stroomverbruik woning",
        "hydrogenconsumption": "Waterstofverbruik auto",
        "waterstofverbruikauto": "Waterstofverbruik auto",
        "outsidetemperature": "Buitentemperatuur",
        "buitentemperatuur": "Buitentemperatuur",
        "insidetemperature": "Binnentemperatuur",
        "binnentemperatuur": "Binnentemperatuur",
        "airpressure": "Luchtdruk",
        "druklucht": "Luchtdruk",
        "humidity": "Luchtvochtigheid",
        "luchtvochtigheid": "Luchtvochtigheid",
        "batterylevel": "Accuniveau",
        "batterijniveau": "Accuniveau",
        "co2level": "CO2-concentratie binnen",
        "co2concentratiebinnen": "CO2-concentratie binnen",
        "hydrogenstoragehouse": "Waterstofopslag woning",
        "waterstofopslaghuis": "Waterstofopslag woning",
        "hydrogenstoragecar": "Waterstofopslag auto",
        "waterstofopslagauto": "Waterstofopslag auto",
        # Extra Engelse varianten
        "humidity": "Luchtvochtigheid",
        "hydrogen storage car": "Waterstofopslag auto",
        "hydrogen storage house": "Waterstofopslag woning"
    }
    try:
        response = requests.post(
            MISTRAL_API_URL,
            headers={"Authorization": f"Bearer {MISTRAL_API_KEY}"},
            json={
                "model": "mistral-tiny",
                "messages": [
                    {"role": "system", "content": "Je bent een slimme energie-assistent."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 60,
                "temperature": 0.1
            }
        )
        if response.status_code == 200:
            result = response.json().get('choices', [{}])[0].get('message', {}).get('content')
            import re
            if result:
                # 1. Probeer direct pipe-formaat
                if '|' in result:
                    parts = [p.strip() for p in result.split('|')]
                else:
                    # 2. Probeer op basis van Label/Eenheid/Icon met of zonder nieuwe regels
                    label = unit = icon = ''
                    label_match = re.search(r'Label\s*[:|-]?\s*(.+)', result, re.IGNORECASE)
                    unit_match = re.search(r'Eenheid\s*[:|-]?\s*(.+)', result, re.IGNORECASE)
                    icon_match = re.search(r'Icon\s*[:|-]?\s*(.+)', result, re.IGNORECASE)
                    if label_match:
                        label = label_match.group(1).split('\n')[0].strip()
                    if unit_match:
                        unit = unit_match.group(1).split('\n')[0].strip()
                    if icon_match:
                        icon = icon_match.group(1).split('\n')[0].strip()
                    parts = [label, unit, icon]
                # 3. Fallback: vul aan tot 3 delen
                while len(parts) < 3:
                    parts.append('')
                # 4. Alleen Feather icons toestaan, anders FiCpu
                feather_icons = {"FiSun", "FiBattery", "FiThermometer", "FiZap", "FiBox", "FiDroplet", "FiCloudRain", "FiActivity", "FiTruck", "FiHome", "FiWind"}
                icon = parts[2]
                if icon not in feather_icons:
                    icon = 'FiCpu'
                # 5. Super-robuuste label mapping: lowercase, spaties/underscores weg, dan mapping, anders nette fallback
                raw_label = parts[0].strip().lower().replace('_', '').replace(' ', '')
                label = label_translations.get(raw_label, None)
                if not label or label.strip() == '':
                    label = column_name.replace('_', ' ').capitalize()
                # Bekende units, anders leeg
                known_units = {"v", "a", "kw", "%", "°c", "ppm", "l/u", "hpa", "kg", "m³", "m³/h"}
                unit = parts[1].replace(' ', '').lower()
                unit = unit if unit in known_units else ''
                # Speciaal: als unit leeg, fallback
                if not unit:
                    fallback_units = {
                        "humidity": "%",
                        "battery_level": "%",
                        "co2_level": "ppm",
                        "outside_temperature": "°c",
                        "inside_temperature": "°c",
                        "air_pressure": "hpa",
                        "power_consumption": "kw",
                        "solar_voltage": "v",
                        "solar_current": "a",
                        "hydrogen_production": "l/u",
                        "hydrogen_consumption": "l/u",
                        "hydrogen_storage_house": "%",
                        "hydrogen_storage_car": "%"
                    }
                    unit = fallback_units.get(column_name.lower(), '')
                return {'label': label, 'unit': unit, 'icon': icon}
    except Exception as e:
        logger.error(f"Mistral API error: {e}")
    # Fallback
    return {
        'label': column_name.replace('_', ' ').capitalize(),
        'unit': '',
        'icon': 'FiCpu'
    }

@app.get("/api/devices/usage")
async def get_devices_usage():
    df = data_processor.process_csv("data/energy_consumption.csv")
    devices = []
    # Debiet-kolommen: totaal volume in L
    total_volume_columns = {
        'Waterstofproductie (L/u)': {'id': 'hydrogen_production', 'label': 'Waterstofproductie', 'icon': 'FiDroplet', 'unit': 'L'},
        'Waterstofverbruik auto (L/u)': {'id': 'hydrogen_consumption', 'label': 'Waterstofverbruik auto', 'icon': 'FiDroplet', 'unit': 'L'}
    }
    # Energie-kolommen: totaal in kWh
    total_energy_columns = {
        'Stroomverbruik woning (kW)': {'id': 'power_consumption', 'label': 'Stroomverbruik woning', 'icon': 'FiHome', 'unit': 'kWh'}
    }
    for col in df.columns:
        if col in IGNORE_COLUMNS:
            continue
        # Debiet: totaal volume in L
        if col in total_volume_columns:
            info = total_volume_columns[col]
            usage = float(df[col].sum()) * 0.25
            usage_str = f"{usage:,.2f}".replace(",", "X", 1).replace(".", ",").replace("X", ".")
            devices.append({
                'id': info['id'],
                'label': info['label'],
                'icon': info['icon'],
                'unit': info['unit'],
                'usage': usage_str
            })
            continue
        # Energie: totaal in kWh
        if col in total_energy_columns:
            info = total_energy_columns[col]
            usage = float(df[col].sum()) * 0.25
            usage_str = f"{usage:,.2f}".replace(",", "X", 1).replace(".", ",").replace("X", ".")
            devices.append({
                'id': info['id'],
                'label': info['label'],
                'icon': info['icon'],
                'unit': info['unit'],
                'usage': usage_str
            })
            continue
        # Sensoren: gemiddelde waarde
        info = DEVICE_INFO_MAP.get(col)
        if info:
            label = info['label']
            icon = info['icon']
            unit = info['unit']
            device_id = info['id']
        else:
            ai_info = ai_guess_device(col)
            label = ai_info['label']
            unit = ai_info['unit']
            icon = ai_info['icon']
            device_id = col.lower().replace(' ', '_')
        try:
            usage = float(df[col].mean())
            usage_str = f"{usage:,.2f}".replace(",", "X", 1).replace(".", ",").replace("X", ".")
        except Exception:
            usage_str = ''
        devices.append({
            'id': device_id,
            'label': label,
            'icon': icon,
            'unit': unit,
            'usage': usage_str
        })
    return devices

@app.get("/api/devices/current")
async def get_devices_current():
    df = data_processor.process_csv("data/energy_consumption.csv")
    devices = []
    # Sorteer op tijdstip als kolom bestaat
    if 'Tijdstip' in df.columns:
        try:
            df['Tijdstip'] = pd.to_datetime(df['Tijdstip'], dayfirst=True, errors='coerce')
            df = df.sort_values('Tijdstip')
        except Exception as e:
            print('DEBUG: Fout bij sorteren op Tijdstip:', e)
    for col in df.columns:
        if col in IGNORE_COLUMNS:
            continue
        info = DEVICE_INFO_MAP.get(col)
        if info:
            label = info['label']
            icon = info['icon']
            unit = info['unit']
            device_id = info['id']
        else:
            ai_info = ai_guess_device(col)
            label = ai_info['label']
            unit = ai_info['unit']
            icon = ai_info['icon']
            device_id = col.lower().replace(' ', '_')
        try:
            # Pak de laatste NIET-lege waarde
            current = df[col].dropna().iloc[-1]
            # Zoek bijbehorend tijdstip (indien aanwezig)
            tijdstip = None
            if 'Tijdstip' in df.columns:
                tijdstip = df.loc[df[col].dropna().index[-1], 'Tijdstip']
            print(f'DEBUG: {col} -> {current} (tijdstip: {tijdstip})')
            usage_str = f"{current:,.2f}".replace(",", "X", 1).replace(".", ",").replace("X", ".")
        except Exception as e:
            print(f'DEBUG: Fout bij {col}:', e)
            usage_str = ''
        devices.append({
            'id': device_id,
            'label': label,
            'icon': icon,
            'unit': unit,
            'current_usage': usage_str
        })
    return devices

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    data_processor.close()
    user_db.connection.close()

# Remove debug prints for Mistral API
# print('DEBUG: MISTRAL_API_URL:', MISTRAL_API_URL)
# print('DEBUG: MISTRAL_API_KEY:', MISTRAL_API_KEY) 