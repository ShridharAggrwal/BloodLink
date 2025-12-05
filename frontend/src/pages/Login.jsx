import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/common/Navbar'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await login(formData.email, formData.password, formData.role)
      
      switch (user.role) {
        case 'admin':
          navigate('/admin')
          break
        case 'ngo':
          navigate('/ngo')
          break
        case 'blood_bank':
          navigate('/blood-bank')
          break
        default:
          navigate('/dashboard')
      }
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.error || 'Login failed. Please try again.')
      return
    }
  }

  const roles = [
    { value: 'user', label: 'Donor/User' },
    { value: 'admin', label: 'Admin' },
    { value: 'ngo', label: 'NGO' },
    { value: 'blood_bank', label: 'Blood Bank' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-red-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-red-50 rounded-full blur-3xl opacity-40" />
        </div>

        <div className="w-full max-w-md relative">
          <div className="card shadow-xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/20">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12z"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-500 mt-2">Sign in to your account</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Login as</label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role.value })}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                        formData.role === role.value
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-red-600 hover:text-red-700 font-medium">
                Register here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
