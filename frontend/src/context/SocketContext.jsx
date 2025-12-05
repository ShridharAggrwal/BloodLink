import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [alerts, setAlerts] = useState([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      // Connect to socket server
      const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000'
      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'], // Support both for production
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      newSocket.on('connect', () => {
        console.log('Socket connected')
        // Join user's room
        newSocket.emit('join-room', { id: user.id, type: user.role })
      })

      // Listen for new blood requests
      newSocket.on('blood-request:new', (request) => {
        setAlerts(prev => [request, ...prev])
      })

      // Listen for accepted requests (remove from alerts)
      newSocket.on('blood-request:accepted', ({ requestId }) => {
        setAlerts(prev => prev.filter(alert => alert.id !== requestId))
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [user])

  const removeAlert = (requestId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== requestId))
  }

  const clearAlerts = () => {
    setAlerts([])
  }

  return (
    <SocketContext.Provider value={{ socket, alerts, removeAlert, clearAlerts }}>
      {children}
    </SocketContext.Provider>
  )
}

