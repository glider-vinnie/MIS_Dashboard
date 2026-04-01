import api from './api'

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
}

export const dashboardService = {
  getOverview: (params) => api.get('/dashboard/overview', { params }),
  getStats: (params) => api.get('/dashboard/stats', { params }),
}

export const operationsService = {
  getAll: () => api.get('/operations'),
  getById: (id) => api.get(`/operations/${id}`),
  create: (data) => api.post('/operations', data),
  update: (id, data) => api.put(`/operations/${id}`, data),
  delete: (id) => api.delete(`/operations/${id}`),
}

export const trainingService = {
  getAll: () => api.get('/training'),
  getById: (id) => api.get(`/training/${id}`),
  create: (data) => api.post('/training', data),
  update: (id, data) => api.put(`/training/${id}`, data),
  delete: (id) => api.delete(`/training/${id}`),
}

export const financialService = {
  getAll: () => api.get('/financial'),
  getById: (id) => api.get(`/financial/${id}`),
  create: (data) => api.post('/financial', data),
  update: (id, data) => api.put(`/financial/${id}`, data),
}

export const fieldService = {
  getAll: () => api.get('/field'),
  getById: (id) => api.get(`/field/${id}`),
  create: (data) => api.post('/field', data),
  update: (id, data) => api.put(`/field/${id}`, data),
}

export const reportsService = {
  getAll: () => api.get('/reports'),
  generate: (params) => api.post('/reports/generate', params),
  download: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
}
