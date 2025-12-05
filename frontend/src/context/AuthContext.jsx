import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token and user on mount
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password, role = 'user') => {
    const response = await api.post('/auth/login', { email, password, role })
    const { token, user: userData } = response.data
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    
    return userData
  }

  const register = async (formData) => {
    const response = await api.post('/auth/register', formData)
    return response.data
  }

  const registerWithToken = async (type, token, formData) => {
    const endpoint = type === 'ngo' 
      ? `/auth/register/ngo/${token}` 
      : `/auth/register/blood-bank/${token}`
    
    const response = await api.post(endpoint, formData)
    const { token: jwtToken, user: userData } = response.data
    
    localStorage.setItem('token', jwtToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    
    return userData
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData }
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      registerWithToken, 
      logout,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

