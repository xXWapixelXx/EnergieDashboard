import requests
import json

BASE_URL = "http://localhost:8000"

def test_user_registration():
    """Test user registration endpoint."""
    url = f"{BASE_URL}/users/"
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    }
    
    print("\nTesting user registration...")
    try:
        response = requests.post(url, json=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.json()
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

def test_user_login():
    """Test user login endpoint."""
    url = f"{BASE_URL}/token"
    data = {
        "username": "testuser",
        "password": "password123"
    }
    
    print("\nTesting user login...")
    try:
        response = requests.post(url, data=data)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.json()
    except Exception as e:
        print(f"Error: {str(e)}")
        return None

if __name__ == "__main__":
    # Test user registration
    user_data = test_user_registration()
    
    if user_data:
        # Test user login
        login_data = test_user_login() 