// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// App metadata
export const APP_NAME = 'NGO MIS Dashboard'
export const APP_VERSION = '1.0.0'

// Pagination
export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

// Route paths
export const ROUTES = {
  LOGIN: '/',
  DASHBOARD: '/dashboard',
  OPERATIONS: '/operations',
  TRAINING: '/training',
  FINANCIAL: '/financial',
  FIELD: '/field',
  REPORTS: '/reports',
}

// Status labels
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
}
