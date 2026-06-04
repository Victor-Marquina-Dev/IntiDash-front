import { apiClient } from './api-client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  user: AuthUser | null;
}

export const authService = {
  me: () => apiClient.get<AuthResponse>('/auth/me'),
  login: (email: string, password: string) => apiClient.post<AuthResponse>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) => apiClient.post<AuthResponse>('/auth/register', { name, email, password }),
  logout: () => apiClient.post<{ ok: boolean }>('/auth/logout'),
};
