import os
import mysql.connector
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def setup_database():
    """Set up the database and create necessary tables."""
    load_dotenv()
    
    # Get database connection parameters from environment variables
    db_params = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', '')
    }
    
    try:
        # Connect to MySQL
        conn = mysql.connector.connect(**db_params)
        cursor = conn.cursor()
        
        # Read and execute schema.sql
        logger.info("Creating database schema...")
        schema_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'schema.sql')
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
            
            # Split the SQL file into individual statements
            statements = schema_sql.split(';')
            
            # Execute each statement
            for statement in statements:
                if statement.strip():
                    cursor.execute(statement)
                    conn.commit()
        
        logger.info("Database setup completed successfully!")
        
    except Exception as e:
        logger.error(f"Error setting up database: {str(e)}")
        raise
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    setup_database() 