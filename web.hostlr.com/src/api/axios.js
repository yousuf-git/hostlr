import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : '/api'

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  try {
    const stored = JSON.parse(localStorage.getItem('hostlr-auth') || '{}')
    const token = stored?.state?.token
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {}
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hostlr-auth')
      window.location.href = '/auth/login'
    }
    return Promise.reject(err)
  }
)

export default api
