import { API_BASE, request, buildQuery } from './client';

export const taskApi = {
  list: (params) => request(`/tasks?${buildQuery(params)}`),
  get: (id) => request(`/tasks/${id}`),
  create: (data) => request('/tasks', { method: 'POST', body: data }),
  update: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: data }),
  changeStatus: (id, status) => request(`/tasks/${id}/status`, { method: 'PUT', body: { status } }),
  remove: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  exportUrl: (params) => `${API_BASE}/tasks/export.csv?${buildQuery(params)}`,
};
