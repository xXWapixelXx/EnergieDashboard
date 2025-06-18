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
    console.log('AuthService: Attempting login');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      const { token } = response.data;
      this.token = token;
      this.user = this.getUserFromToken(token);
      localStorage.setItem('token', token);
      console.log('AuthService: Login successful');
    } catch (error) {
      console.error('AuthService: Login failed:', error);
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
export const authService = new AuthService(); 