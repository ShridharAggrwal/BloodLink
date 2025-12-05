import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import api from '../services/api'

const VerifyEmail = () => {
  const { token } = useParams()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')
  const hasVerified = useRef(false) // Prevent double verification in StrictMode

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent double call in React StrictMode
      if (hasVerified.current) return
      hasVerified.current = true

      try {
        const response = await api.get(`/auth/verify/${token}`)
        setStatus('success')
        setMessage(response.data.message)
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.error || 'Verification failed')
      }
    }
    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center shadow-xl">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-500 mx-auto mb-6"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying your email...</h2>
              <p className="text-gray-500">Please wait while we verify your account.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
              <p className="text-gray-500 mb-6">{message}</p>
              <Link to="/login" className="btn-primary inline-block">
                Sign In Now
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
              <p className="text-gray-500 mb-6">{message}</p>
              <p className="text-gray-400 text-sm mb-4">
                If you already verified, try logging in.
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/login" className="btn-primary">
                  Try Login
                </Link>
                <Link to="/register" className="btn-secondary">
                  Register Again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
