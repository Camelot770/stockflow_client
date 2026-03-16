import apiClient from './client';

export interface Permission {
  key: string;
  label: string;
  group: string;
}

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  _count?: { users: number };
}

export const rbacApi = {
  getRoles: () => apiClient.get('/rbac/roles').then(r => r.data),
  createRole: (data: { name: string; description?: string; permissions: string[] }) =>
    apiClient.post('/rbac/roles', data).then(r => r.data),
  updateRole: (id: string, data: { name?: string; description?: string; permissions?: string[] }) =>
    apiClient.put(`/rbac/roles/${id}`, data).then(r => r.data),
  deleteRole: (id: string) =>
    apiClient.delete(`/rbac/roles/${id}`).then(r => r.data),
  assignRole: (userId: string, roleId: string) =>
    apiClient.post('/rbac/roles/assign', { userId, roleId }).then(r => r.data),
  getPermissions: () => apiClient.get('/rbac/permissions').then(r => r.data),
};
