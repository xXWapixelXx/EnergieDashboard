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

# SQL for notifications table
# CREATE TABLE notifications (
#     id INT AUTO_INCREMENT PRIMARY KEY,
#     title VARCHAR(255) NOT NULL,
#     message TEXT,
#     type VARCHAR(50),
#     is_read BOOLEAN DEFAULT FALSE,
#     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
# );

# Load environment variables
load_dotenv()

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

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown."""
    data_processor.close()
    user_db.connection.close() 