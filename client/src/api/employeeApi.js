import { request, buildQuery } from './client';

export const employeeApi = {
  list: (params) => request(`/employees?${buildQuery(params)}`),
  lookup: () => request('/employees/lookup'),
  get: (id) => request(`/employees/${id}`),
  create: (data) => request('/employees', { method: 'POST', body: data }),
  update: (id, data) => request(`/employees/${id}`, { method: 'PUT', body: data }),
  remove: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
};
