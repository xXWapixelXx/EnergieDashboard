import mysql.connector
from mysql.connector import Error
from typing import Optional, List
from datetime import datetime
import logging
from .auth import get_password_hash, verify_password
from ..models.user import UserCreate, UserUpdate, UserInDB

logger = logging.getLogger(__name__)

class UserDB:
    def __init__(self, host: str, user: str, password: str, database: str):
        self.host = host
        self.user = user
        self.password = password
        self.database = database
        self.connection = None
        self.connect()

    def connect(self):
        """Establish database connection."""
        try:
            self.connection = mysql.connector.connect(
                host=self.host,
                user=self.user,
                password=self.password,
                database=self.database
            )
            logger.info("Successfully connected to database")
        except Error as e:
            logger.error(f"Error connecting to database: {e}")
            raise

    def create_user(self, user: UserCreate, role: str = "user") -> UserInDB:
        """Create a new user."""
        try:
            cursor = self.connection.cursor(dictionary=True)
            query = """
                INSERT INTO users (username, email, password_hash, role)
                VALUES (%s, %s, %s, %s)
            """
            password_hash = get_password_hash(user.password)
            cursor.execute(query, (user.username, user.email, password_hash, role))
            self.connection.commit()
            
            # Get the created user
            cursor.execute("SELECT * FROM users WHERE id = LAST_INSERT_ID()")
            user_data = cursor.fetchone()
            return UserInDB(**user_data)
        except Error as e:
            logger.error(f"Error creating user: {e}")
            raise
        finally:
            cursor.close()

    def get_user_by_username(self, username: str) -> Optional[UserInDB]:
        """Get user by username."""
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
            user_data = cursor.fetchone()
            return UserInDB(**user_data) if user_data else None
        except Error as e:
            logger.error(f"Error getting user: {e}")
            raise
        finally:
            cursor.close()

    def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email."""
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user_data = cursor.fetchone()
            return UserInDB(**user_data) if user_data else None
        except Error as e:
            logger.error(f"Error getting user: {e}")
            raise
        finally:
            cursor.close()

    def update_user(self, user_id: int, user_update: UserUpdate) -> Optional[UserInDB]:
        """Update user information."""
        try:
            cursor = self.connection.cursor(dictionary=True)
            update_fields = []
            values = []
            
            if user_update.username is not None:
                update_fields.append("username = %s")
                values.append(user_update.username)
            if user_update.email is not None:
                update_fields.append("email = %s")
                values.append(user_update.email)
            if user_update.password is not None:
                update_fields.append("password_hash = %s")
                values.append(get_password_hash(user_update.password))
            if user_update.is_active is not None:
                update_fields.append("is_active = %s")
                values.append(user_update.is_active)
            
            if not update_fields:
                return None
            
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
            values.append(user_id)
            cursor.execute(query, tuple(values))
            self.connection.commit()
            
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user_data = cursor.fetchone()
            return UserInDB(**user_data) if user_data else None
        except Error as e:
            logger.error(f"Error updating user: {e}")
            raise
        finally:
            cursor.close()

    def update_last_login(self, user_id: int):
        """Update user's last login timestamp."""
        try:
            cursor = self.connection.cursor()
            cursor.execute(
                "UPDATE users SET last_login = %s WHERE id = %s",
                (datetime.utcnow(), user_id)
            )
            self.connection.commit()
        except Error as e:
            logger.error(f"Error updating last login: {e}")
            raise
        finally:
            cursor.close()

    def delete_user(self, user_id: int) -> bool:
        """Delete a user."""
        try:
            cursor = self.connection.cursor()
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            self.connection.commit()
            return cursor.rowcount > 0
        except Error as e:
            logger.error(f"Error deleting user: {e}")
            raise
        finally:
            cursor.close()

    def get_all_users(self) -> List[UserInDB]:
        """Get all users."""
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users")
            users = cursor.fetchall()
            return [UserInDB(**user) for user in users]
        except Error as e:
            logger.error(f"Error getting users: {e}")
            raise
        finally:
            cursor.close()

    def verify_user_credentials(self, username_or_email: str, password: str) -> Optional[UserInDB]:
        """Verify user credentials by username or email."""
        try:
            cursor = self.connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username_or_email, username_or_email))
            user_data = cursor.fetchone()
            if user_data and verify_password(password, user_data["password_hash"]):
                return UserInDB(**user_data)
            return None
        except Error as e:
            logger.error(f"Error verifying credentials: {e}")
            raise
        finally:
            cursor.close() 