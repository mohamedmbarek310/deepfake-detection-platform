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
// LOGOUT FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
}

export default api