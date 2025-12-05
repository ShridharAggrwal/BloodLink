import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/common/Navbar'
import api from '../services/api'

const RegisterWithToken = () => {
  const { type, token } = useParams()
  const navigate = useNavigate()
  const { registerWithToken } = useAuth()
  
  const [validating, setValidating] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isNGO = type === 'ngo'

  const [formData, setFormData] = useState(
    isNGO
      ? { name: '', owner_name: '', email: '', password: '', confirmPassword: '', age: '', gender: '', address: '', volunteer_count: '' }
      : { name: '', email: '', password: '', confirmPassword: '', contact_info: '', address: '' }
  )

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await api.get(`/auth/validate-token/${type}/${token}`)
        setTokenValid(response.data.valid)
      } catch (err) {
        setTokenValid(false)
        setError('Invalid or expired registration link')
      } finally {
        setValidating(false)
      }
    }
    validateToken()
  }, [type, token])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { confirmPassword, ...dataToSend } = formData
      await registerWithToken(type, token, dataToSend)
      navigate(type === 'ngo' ? '/ngo' : '/blood-bank')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="card max-w-md w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
            <p className="text-gray-500">{error || 'This registration link is invalid or has expired.'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-lg relative">
          <div className="card shadow-xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-lg shadow-red-600/20">
                {isNGO ? '🤝' : '🏥'}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Register {isNGO ? 'NGO' : 'Blood Bank'}
              </h1>
              <p className="text-gray-500 mt-2">Complete your registration</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isNGO ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NGO Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter NGO name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label>
                    <input
                      type="text"
                      name="owner_name"
                      value={formData.owner_name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter owner name"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Age"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Volunteers</label>
                    <input
                      type="number"
                      name="volunteer_count"
                      value={formData.volunteer_count}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter volunteer count"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Bank Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Enter blood bank name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Info</label>
                    <input
                      type="text"
                      name="contact_info"
                      value={formData.contact_info}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Phone number"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field resize-none"
                  rows="2"
                  placeholder="Enter full address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Min 6 characters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Confirm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6 disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterWithToken
