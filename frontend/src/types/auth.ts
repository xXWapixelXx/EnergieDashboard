export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  role: string;
  sub?: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
} 