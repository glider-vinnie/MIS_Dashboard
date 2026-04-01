import axios from 'axios'
import toast from 'react-hot-toast'
import { API_BASE_URL } from '../constants'
import { useAuthStore } from '../store/authStore'

/* ══════════════════════════════════════════════════════════
   apiClient — hardened Axios instance
   • Attaches Bearer token from authStore
   • 401  → clears auth, redirects to /login
   • 5xx  → toast "Server error, try again"
   • Network error → toast "Check your connection"
   ══════════════════════════════════════════════════════════ */

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

/* ── Request interceptor — attach Bearer token ─────────── */
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/* ── Response interceptor — global error handling ──────── */
let lastToastTime = 0
const TOAST_COOLDOWN = 3000 // prevent toast spam

function showToast(msg, type = 'error') {
  const now = Date.now()
  if (now - lastToastTime < TOAST_COOLDOWN) return
  lastToastTime = now
  if (type === 'error') toast.error(msg)
  else toast(msg)
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    /* No response at all — network / timeout */
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        showToast('Request timed out. Please try again.')
      } else {
        showToast('Check your connection and try again.')
      }
      return Promise.reject(error)
    }

    const { status } = error.response

    /* 401 — unauthorized → clear auth, redirect */
    if (status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/'
      return Promise.reject(error)
    }

    /* 403 — forbidden */
    if (status === 403) {
      showToast('You do not have permission for this action.')
      return Promise.reject(error)
    }

    /* 5xx — server error */
    if (status >= 500) {
      showToast('Server error. Please try again later.')
      return Promise.reject(error)
    }

    /* Everything else (4xx) — let component handle */
    return Promise.reject(error)
  }
)

export default apiClient
