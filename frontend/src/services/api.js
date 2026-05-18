import axios from 'axios'

// ─────────────────────────────────────────────────────────────────────────────
// Base URL of our FastAPI backend
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = 'http://127.0.0.1:8000'

// ─────────────────────────────────────────────────────────────────────────────
// Create axios instance with default settings
// ─────────────────────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
})

// ─────────────────────────────────────────────────────────────────────────────
// Automatically attach JWT token to every request
// ─────────────────────────────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
// ─────────────────────────────────────────────────────────────────────────────
// Automatically handle expired tokens (401 errors)
// Redirects user to login page when token expires
// ─────────────────────────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,    // Pass successful responses through
  (error) => {
    // If we get 401 (Unauthorized) → token expired
    if (error.response?.status === 401) {
      // Clear stored credentials
      localStorage.removeItem('token')
      localStorage.removeItem('username')

      // Avoid redirect loop if already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// AUTH FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const registerUser = async (username, email, password) => {
  const response = await api.post('/api/v1/auth/register', {
    username,
    email,
    password,
  })
  return response.data
}

export const loginUser = async (username, password) => {
  // Login uses form-data, not JSON
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const response = await api.post('/api/v1/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/api/v1/auth/me')
  return response.data
}

// ─────────────────────────────────────────────────────────────────────────────
// DETECTION FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const analyzeMedia = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/api/v1/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY & STATS FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export const getHistory = async () => {
  const response = await api.get('/api/v1/history')
  return response.data
}

export const getStats = async () => {
  const response = await api.get('/api/v1/stats')
  return response.data
}

export const getReport = async (scanId) => {
  const response = await api.get(`/api/v1/report/${scanId}`)
  return response.data
}
// ─────────────────────────────────────────────────────────────────────────────
// Download PDF Report
// ─────────────────────────────────────────────────────────────────────────────
export const downloadPdfReport = async (scanId, filename) => {
  const response = await api.get(`/api/v1/report/${scanId}/pdf`, {
    responseType: 'blob',  // Important: this tells axios to expect binary data
  })
  
    // Create a download link and trigger it
  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url  = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `DeepGuard_Report_${scanId}_${filename}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
  // ─────────────────────────────────────────────────────────────────────────────
// Share Link Functions
// ─────────────────────────────────────────────────────────────────────────────
export const createShareLink = async (scanId) => {
  const response = await api.post(`/api/v1/scans/${scanId}/share`)
  return response.data
}

export const viewSharedScan = async (token) => {
  const response = await api.get(`/api/v1/share/${token}`)
  return response.data
}


// ─────────────────────────────────────────────────────────────────────────────
// LOGOUT FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
}

export default api