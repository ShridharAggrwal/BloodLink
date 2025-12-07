import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 errors (unauthorized/token expired)
    // Only redirect to login if:
    // 1. It's a 401 error
    // 2. It's NOT a login request (to avoid clearing form on wrong credentials)
    // 3. User has a token (meaning they were logged in but token expired)
    if (
      error.response?.status === 401 &&
      !error.config.url.includes('/auth/login') &&
      localStorage.getItem('token')
    ) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    // Handle 403 errors (account suspended)
    if (error.response?.status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Show alert with suspension message
      alert(error.response?.data?.error || 'Your account has been suspended.')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
