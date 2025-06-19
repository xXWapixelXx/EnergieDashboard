import axios from 'axios';
import type { LoginCredentials, User } from '../types/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create the service class
class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    console.log('AuthService: Initializing');
    this.token = localStorage.getItem('token');
    this.user = this.getUserFromToken(this.token);
    console.log('AuthService: Initial state:', { hasToken: !!this.token, user: this.user });
  }

  private getUserFromToken(token: string | null): User | null {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('AuthService: Error parsing token:', error);
      return null;
    }
  }

  public isAuthenticated(): boolean {
    const isAuth = !!this.token && !!this.user;
    console.log('AuthService: isAuthenticated =', isAuth);
    return isAuth;
  }

  public async login(credentials: LoginCredentials): Promise<void> {
    console.log('AuthService: Attempting login', credentials);
    try {
      // Send as form data to /token endpoint
      const params = new URLSearchParams();
      params.append('username', credentials.email); // using email as username
      params.append('password', credentials.password);
      console.log('AuthService: Posting to', `${API_URL}/token`, params.toString());
      // Extra debug: log before axios
      console.log('AuthService: About to send axios POST');
      const response = await axios.post(`${API_URL}/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      // Extra debug: log after axios
      console.log('AuthService: Login response', response);
      const { access_token } = response.data;
      this.token = access_token;
      this.user = this.getUserFromToken(access_token);
      localStorage.setItem('token', access_token);
      console.log('AuthService: Login successful');
    } catch (error: any) {
      // Extra debug: log error details
      if (error.response) {
        console.error('AuthService: Login failed with response:', error.response);
      } else if (error.request) {
        console.error('AuthService: Login failed, no response received:', error.request);
      } else {
        console.error('AuthService: Login failed, error:', error.message);
      }
      throw error;
    }
  }

  public logout(): void {
    console.log('AuthService: Logging out');
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser(): User | null {
    return this.user;
  }
}

// Create and export the singleton instance
const authService = new AuthService();
export default authService; 