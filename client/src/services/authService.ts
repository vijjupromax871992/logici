// src/services/authService.ts
import {BACKEND_URL} from '../config/api';
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  isAdmin: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

class AuthService {
  private static instance: AuthService;
  private baseUrl = BACKEND_URL;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(emailOrMobile: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrMobile, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data;
      }

      return {
        success: false,
        message: data.message || 'Login failed'
      };
    } catch (error) {
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  }

  async checkGoogleConfig(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/google/test-config`);
      const data = await response.json();
      return data.clientIdExists && data.clientSecretExists;
    } catch (error) {
      return false;
    }
  }

  initiateGoogleLogin(): void {
    window.location.href = `${this.baseUrl}/auth/google`;
  }

  getDashboardPath(isAdmin: boolean): string {
    return isAdmin ? '/admin/dashboard' : '/user/dashboard';
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.isAdmin || false;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }
}

export const authService = AuthService.getInstance();
export default authService;