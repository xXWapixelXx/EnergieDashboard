import pandas as pd
import mysql.connector
from mysql.connector import Error
import logging
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class DataProcessor:
    def __init__(self, host=None, user=None, password=None, database=None):
        """Initialize the data processor with database connection."""
        self.host = host or os.getenv('DB_HOST', 'localhost')
        self.user = user or os.getenv('DB_USER', 'root')
        self.password = password or os.getenv('DB_PASSWORD', '')
        self.database = database or os.getenv('DB_NAME', 'energydashboard')
        self.conn = None
        self.connect()

    def connect(self):
        """Connect to the MySQL database."""
        try:
            self.conn = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            logger.info("Successfully connected to database")
        except Error as e:
            logger.error(f"Error connecting to database: {e}")
            raise

    def process_csv(self, file_path: str) -> pd.DataFrame:
        """Process the CSV file and return a DataFrame."""
        try:
            # Read CSV with tab delimiter and handle special characters
            df = pd.read_csv(file_path, 
                           delimiter='\t',
                           encoding='utf-8',
                           decimal=',',  # Handle European decimal format
                           parse_dates=['Tijdstip'])
            
            # Rename columns to match database schema
            column_mapping = {
                'Tijdstip': 'timestamp',
                'Zonnepaneelspanning (V)': 'solar_voltage',
                'Zonnepaneelstroom (A)': 'solar_current',
                'Waterstofproductie (L/u)': 'hydrogen_production',
                'Stroomverbruik woning (kW)': 'power_consumption',
                'Waterstofverbruik auto (L/u)': 'hydrogen_consumption',
                'Buitentemperatuur (°C)': 'outside_temperature',
                'Binnentemperatuur (°C)': 'inside_temperature',
                'Luchtdruk (hPa)': 'air_pressure',
                'Luchtvochtigheid (%)': 'humidity',
                'Accuniveau (%)': 'battery_level',
                'CO2-concentratie binnen (ppm)': 'co2_level',
                'Waterstofopslag woning (%)': 'hydrogen_storage_house',
                'Waterstofopslag auto (%)': 'hydrogen_storage_car'
            }
            
            df = df.rename(columns=column_mapping)
            
            # Convert timestamp to datetime if it's not already
            if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
                df['timestamp'] = pd.to_datetime(df['timestamp'], format='%d-%m-%Y %H:%M')
            
            return df
            
        except Exception as e:
            logger.error(f"Error processing CSV file: {e}")
            raise

    def insert_data(self, df: pd.DataFrame):
        """Insert data into the database."""
        cursor = None
        try:
            cursor = self.conn.cursor()
            
            # Prepare the insert query
            insert_query = """
                INSERT INTO measurements (
                    timestamp, solar_voltage, solar_current, hydrogen_production,
                    power_consumption, hydrogen_consumption, outside_temperature,
                    inside_temperature, air_pressure, humidity, battery_level,
                    co2_level, hydrogen_storage_house, hydrogen_storage_car
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
            """
            
            # Convert DataFrame rows to list of tuples
            values = df.values.tolist()
            
            # Execute batch insert
            cursor.executemany(insert_query, values)
            self.conn.commit()
            
            logger.info(f"Successfully inserted {len(values)} records")
            
        except Error as e:
            if self.conn:
                self.conn.rollback()
            logger.error(f"Error inserting data: {e}")
            raise
        finally:
            if cursor:
                cursor.close()

    def get_latest_measurements(self, limit: int = 100) -> list:
        """Get the latest measurements from the database."""
        cursor = None
        try:
            cursor = self.conn.cursor(dictionary=True)
            
            query = """
                SELECT * FROM measurements 
                ORDER BY timestamp DESC 
                LIMIT %s
            """
            
            cursor.execute(query, (limit,))
            results = cursor.fetchall()
            
            # Convert datetime objects to strings
            for row in results:
                row['timestamp'] = row['timestamp'].isoformat()
            
            return results
            
        except Error as e:
            logger.error(f"Error fetching latest measurements: {e}")
            raise
        finally:
            if cursor:
                cursor.close()

    def get_daily_aggregations(self, days: int = 7) -> list:
        """Get daily aggregations for the specified number of days."""
        cursor = None
        try:
            cursor = self.conn.cursor(dictionary=True)
            
            query = """
                SELECT 
                    DATE(timestamp) as date,
                    AVG(solar_voltage) as avg_solar_voltage,
                    AVG(solar_current) as avg_solar_current,
                    AVG(hydrogen_production) as avg_hydrogen_production,
                    AVG(power_consumption) as avg_power_consumption,
                    AVG(hydrogen_consumption) as avg_hydrogen_consumption,
                    AVG(outside_temperature) as avg_outside_temperature,
                    AVG(inside_temperature) as avg_inside_temperature,
                    AVG(air_pressure) as avg_air_pressure,
                    AVG(humidity) as avg_humidity,
                    AVG(battery_level) as avg_battery_level,
                    AVG(co2_level) as avg_co2_level,
                    AVG(hydrogen_storage_house) as avg_hydrogen_storage_house,
                    AVG(hydrogen_storage_car) as avg_hydrogen_storage_car
                FROM measurements
                WHERE timestamp >= DATE_SUB(CURDATE(), INTERVAL %s DAY)
                GROUP BY DATE(timestamp)
                ORDER BY date DESC
            """
            
            cursor.execute(query, (days,))
            results = cursor.fetchall()
            
            # Convert date objects to strings
            for row in results:
                row['date'] = row['date'].isoformat()
            
            return results
            
        except Error as e:
            logger.error(f"Error fetching daily aggregations: {e}")
            raise
        finally:
            if cursor:
                cursor.close()

    def close(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()
            logger.info("Database connection closed") 