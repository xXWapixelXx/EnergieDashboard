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