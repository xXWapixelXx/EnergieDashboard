from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from src.utils.data_processor import DataProcessor
import logging

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

# Initialize data processor
data_processor = DataProcessor()

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
async def get_daily_aggregations(days: int = 7) -> List[Dict[str, Any]]:
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