# Energy Dashboard

A real-time energy consumption monitoring system that tracks solar power production, hydrogen production, and various environmental metrics.

## Features

- Real-time energy consumption monitoring
- Solar power production tracking
- Hydrogen production and storage monitoring
- Environmental conditions monitoring (temperature, humidity, CO2)
- Battery level tracking
- Daily aggregations and historical data

## Tech Stack

### Backend
- FastAPI
- PostgreSQL with TimescaleDB
- Python 3.8+

### Frontend
- Vue.js 3
- Pinia for state management
- Tailwind CSS for styling

## Setup Instructions

### Backend Setup

1. Create a PostgreSQL database with TimescaleDB extension:
```sql
CREATE DATABASE energydashboard;
\c energydashboard
CREATE EXTENSION IF NOT EXISTS timescaledb;
```

2. Create a `.env` file in the backend directory with the following content:
```
DB_NAME=energydashboard
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
```

3. Install backend dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. Initialize the database:
```bash
psql -U your_postgres_user -d energydashboard -f src/models/schema.sql
```

5. Start the backend server:
```bash
uvicorn src.main:app --reload
```

### Frontend Setup

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Data Import

The system comes with a sample CSV file containing energy consumption data. To import the data:

1. Make sure the backend server is running
2. Click the "Import Data" button in the dashboard
3. The data will be processed and stored in the database

## API Endpoints

- `GET /api/measurements/latest` - Get latest measurements
- `GET /api/measurements/daily` - Get daily aggregations
- `GET /api/measurements/import` - Import data from CSV

## Development

### Backend Development

The backend uses FastAPI and follows a modular structure:
- `src/models/` - Database models and schema
- `src/utils/` - Utility functions
- `src/main.py` - Main application file

### Frontend Development

The frontend uses Vue.js 3 with the Composition API:
- `src/components/` - Vue components
- `src/stores/` - Pinia stores
- `src/views/` - Page components

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

# EnergieDashboard Data Fields & Widget Data Flow

## Available Data Fields (from CSV)

- Tijdstip (timestamp)
- Zonnepaneelspanning (V) (solar_voltage)
- Zonnepaneelstroom (A) (solar_current)
- Waterstofproductie (L/u) (hydrogen_production)
- Stroomverbruik woning (kW) (power_consumption)
- Waterstofverbruik auto (L/u) (hydrogen_consumption)
- Buitentemperatuur (°C) (outside_temperature)
- Binnentemperatuur (°C) (inside_temperature)
- Luchtdruk (hPa) (air_pressure)
- Luchtvochtigheid (%) (humidity)
- Accuniveau (%) (battery_level)
- CO2-concentratie binnen (ppm) (co2_level)
- Waterstofopslag woning (%) (hydrogen_storage_house)
- Waterstofopslag auto (%) (hydrogen_storage_car)

## How Data Flows to Widgets

### 1. Live Energieverbruik (Live Energy Usage)
- **Data Source:** `/api/measurements/latest` (backend endpoint)
- **How:**
  - Backend reads the latest rows from the database (imported from the CSV)
  - Widget displays the most recent `power_consumption` and its `timestamp`
  - The backend gets this by ordering by `timestamp DESC` and taking the first row

### 2. Historiek (History)
- **Data Source:** `/api/measurements/daily` (backend endpoint)
- **How:**
  - Backend aggregates daily averages from the measurements table (imported from the CSV)
  - Widget displays `avg_power_consumption` for each day (with the date)
  - The backend groups by date and calculates the average for each field

## Adding More Data Fields to Widgets
- You can add widgets for any of the above fields (e.g., solar voltage, battery level, temperature, etc.)
- For live widgets, use the latest value from `/api/measurements/latest`
- For historical/average widgets, use the corresponding `avg_*` field from `/api/measurements/daily`
- Example: To show average humidity per day, use `avg_humidity` from the daily endpoint

## CSV Import
- The backend imports data from `backend/data/energy_consumption.csv`
- Column names are mapped to English field names in the database
- Data is processed and stored in the `measurements` table
- Daily aggregations are calculated and stored in `daily_aggregations`

---

**For developers:**
- To add a new widget, create a new component in `frontend/src/components/widgets/` and register it in `index.tsx`
- Use the appropriate backend endpoint and field for your data 