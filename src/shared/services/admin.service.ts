import { apiClient } from './api-client';
import type { UserRole } from './auth.service';

export interface AdminSummary {
  usersTotal: number;
  adminsTotal: number;
  regularUsersTotal: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export const adminService = {
  getSummary: () => apiClient.get<AdminSummary>('/admin/summary'),
  getUsers: () => apiClient.get<AdminUser[]>('/admin/users'),
};
