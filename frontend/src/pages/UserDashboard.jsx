import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import api from '../services/api'
import Modal from '../components/common/Modal'
import Toast from '../components/common/Toast'

// Sidebar Component
const Sidebar = () => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { alerts } = useSocket()

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: '📊' },
    { path: '/dashboard/request-blood', label: 'Request Blood', icon: '🩸' },
    { path: '/dashboard/donate', label: 'Donate Blood', icon: '💉' },
    { path: '/dashboard/history', label: 'History', icon: '📋' },
    { path: '/dashboard/alerts', label: 'Alerts', icon: '🔔', badge: alerts.length },
    { path: '/dashboard/nearby', label: 'Nearby', icon: '📍' },
    { path: '/dashboard/profile', label: 'Profile', icon: '👤' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-4 fixed left-0 top-0 shadow-sm">
      <Link to="/" className="flex items-center gap-2 mb-8 px-2">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12z"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-900">BloodLink</span>
      </Link>

      <div className="mb-6 px-2">
        <p className="text-gray-500 text-sm">Welcome back,</p>
        <p className="font-semibold text-gray-900 truncate">{user?.name}</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === item.path
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 mt-8 text-gray-500 hover:text-gray-700 transition-colors w-full"
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>
    </aside>
  )
}

// Overview Section
const Overview = () => {
  const { user } = useAuth()
  const { alerts } = useSocket()
  const [stats, setStats] = useState({ donations: 0, requests: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/users/history')
        setStats({
          donations: response.data.donations.length,
          requests: response.data.requests.length
        })
      } catch (error) {
        console.log('Failed to fetch stats')
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl mb-3">🩸</div>
          <div className="text-2xl font-bold text-gray-900">{stats.donations}</div>
          <div className="text-gray-500">Donations Made</div>
        </div>
        <div className="card">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-3">📋</div>
          <div className="text-2xl font-bold text-gray-900">{stats.requests}</div>
          <div className="text-gray-500">Blood Requests</div>
        </div>
        <div className="card">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl mb-3">🔔</div>
          <div className="text-2xl font-bold text-gray-900">{alerts.length}</div>
          <div className="text-gray-500">Active Alerts</div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-500">Blood Group:</span>
            <span className="ml-2 font-semibold text-red-600">{user?.blood_group || 'Not set'}</span>
          </div>
          <div>
            <span className="text-gray-500">Email:</span>
            <span className="ml-2 text-gray-900">{user?.email}</span>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="card mt-6 border-red-200 bg-red-50/50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Recent Alerts
          </h2>
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="font-semibold text-red-600">{alert.blood_group}</span>
                  <span className="text-gray-500 ml-2">needed</span>
                  <p className="text-sm text-gray-400">{alert.address}</p>
                </div>
                <Link to="/dashboard/alerts" className="btn-primary text-sm py-2 px-4">
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Request Blood Section
const RequestBlood = () => {
  const [formData, setFormData] = useState({
    blood_group: '',
    units_needed: 1,
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/blood-requests', formData)
      setToast({ type: 'success', message: `Request created! ${response.data.alertsSent} donors notified.` })
      setFormData({ blood_group: '', units_needed: 1, address: '' })
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to create request' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Request Blood</h1>
      
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="card max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group Needed</label>
            <select
              value={formData.blood_group}
              onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Units Needed</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.units_needed}
              onChange={(e) => setFormData({ ...formData, units_needed: parseInt(e.target.value) })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location / Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field resize-none"
              rows="3"
              placeholder="Enter the address where blood is needed"
              required
            />
            <p className="text-sm text-gray-400 mt-1">
              Donors within 35km will be notified
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating Request...' : 'Request Blood'}
          </button>
        </form>
      </div>
    </div>
  )
}

// Donate Blood Section
const DonateBlood = () => {
  const { alerts } = useSocket()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const handleAccept = async (requestId) => {
    setLoading(true)
    try {
      await api.put(`/blood-requests/${requestId}/accept`)
      setToast({ type: 'success', message: 'Thank you for accepting! Contact the requester.' })
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to accept request' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Donate Blood</h1>
      
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <p className="text-gray-600 mb-6">
        Accept blood requests from people nearby who need your help.
      </p>

      {alerts.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Requests</h3>
          <p className="text-gray-500">There are no blood requests in your area right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="card flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold text-red-600">{alert.blood_group}</span>
                  <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-sm">
                    {alert.units_needed} unit(s)
                  </span>
                </div>
                <p className="text-gray-600">{alert.address}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleAccept(alert.id)}
                disabled={loading}
                className="btn-primary"
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// History Section
const History = () => {
  const [history, setHistory] = useState({ donations: [], requests: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('donations')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/users/history')
        setHistory(response.data)
      } catch (error) {
        console.log('Failed to fetch history')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">History</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('donations')}
          className={`px-4 py-2 rounded-xl transition-all font-medium ${
            activeTab === 'donations' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Donations ({history.donations.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-xl transition-all font-medium ${
            activeTab === 'requests' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Requests ({history.requests.length})
        </button>
      </div>

      {activeTab === 'donations' && (
        <div className="space-y-4">
          {history.donations.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">No donations yet</p>
            </div>
          ) : (
            history.donations.map((donation) => (
              <div key={donation.id} className="card flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-red-600">{donation.blood_group}</span>
                  <span className="text-gray-500 ml-2">- {donation.units} unit(s)</span>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(donation.donated_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-green-600 font-medium">✓ Completed</span>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          {history.requests.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">No requests yet</p>
            </div>
          ) : (
            history.requests.map((request) => (
              <div key={request.id} className="card flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-red-600">{request.blood_group}</span>
                  <span className="text-gray-500 ml-2">- {request.units_needed} unit(s)</span>
                  <p className="text-gray-400 text-sm mt-1">{request.address}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  request.status === 'active' ? 'bg-yellow-50 text-yellow-600' :
                  request.status === 'fulfilled' ? 'bg-green-50 text-green-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {request.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Alerts Section
const Alerts = () => {
  const { alerts } = useSocket()
  const [allAlerts, setAllAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await api.get('/blood-requests/alerts')
        setAllAlerts(response.data)
      } catch (error) {
        console.log('Failed to fetch alerts')
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [alerts])

  const handleAccept = async (requestId) => {
    try {
      await api.put(`/blood-requests/${requestId}/accept`)
      setToast({ type: 'success', message: 'Request accepted! Thank you for helping.' })
      setAllAlerts(prev => prev.filter(a => a.id !== requestId))
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to accept' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blood Request Alerts</h1>
      
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <p className="text-gray-600 mb-6">
        These are active blood requests within 35km of your location.
      </p>

      {allAlerts.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-500">No blood requests in your area right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allAlerts.map((alert) => (
            <div key={alert.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-red-600">{alert.blood_group}</span>
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-medium">
                      {alert.units_needed} unit(s) needed
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{alert.address}</p>
                  <p className="text-sm text-gray-400">
                    Posted {new Date(alert.created_at).toLocaleString()}
                  </p>
                  {alert.distance && (
                    <p className="text-sm text-gray-400">
                      {(alert.distance / 1000).toFixed(1)} km away
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleAccept(alert.id)}
                  className="btn-primary"
                >
                  Accept & Help
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Nearby Section
const Nearby = () => {
  const [data, setData] = useState({ campaigns: [], bloodBanks: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('campaigns')

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const response = await api.get('/users/nearby')
        setData(response.data)
      } catch (error) {
        console.log('Failed to fetch nearby')
      } finally {
        setLoading(false)
      }
    }
    fetchNearby()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nearby</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-xl transition-all font-medium ${
            activeTab === 'campaigns' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Campaigns ({data.campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('bloodBanks')}
          className={`px-4 py-2 rounded-xl transition-all font-medium ${
            activeTab === 'bloodBanks' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Blood Banks ({data.bloodBanks.length})
        </button>
      </div>

      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {data.campaigns.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">No active campaigns nearby</p>
            </div>
          ) : (
            data.campaigns.map((campaign) => (
              <div key={campaign.id} className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                <p className="text-gray-500 mb-2">by {campaign.ngo_name}</p>
                <p className="text-sm text-gray-400">{campaign.address}</p>
                <p className="text-sm text-gray-400">
                  {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'bloodBanks' && (
        <div className="space-y-4">
          {data.bloodBanks.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">No blood banks nearby</p>
            </div>
          ) : (
            data.bloodBanks.map((bank) => (
              <div key={bank.id} className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{bank.name}</h3>
                <p className="text-gray-500">{bank.address}</p>
                <p className="text-sm text-gray-400">{bank.contact_info}</p>
                {bank.distance && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    {(bank.distance / 1000).toFixed(1)} km away
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// Profile Section
const Profile = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    blood_group: '',
    address: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile')
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          gender: response.data.gender || '',
          blood_group: response.data.blood_group || '',
          address: response.data.address || ''
        })
      } catch (error) {
        console.log('Failed to fetch profile')
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.put('/users/profile', formData)
      updateUser(response.data.user)
      setToast({ type: 'success', message: 'Profile updated successfully' })
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ type: 'error', message: 'Passwords do not match' })
      return
    }

    setLoading(true)
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      setToast({ type: 'success', message: 'Password changed successfully' })
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to change password' })
    } finally {
      setLoading(false)
    }
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="card max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email}
              className="input-field bg-gray-50"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="input-field"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                className="input-field"
              >
                <option value="">Select</option>
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field resize-none"
              rows="2"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="btn-secondary"
            >
              Change Password
            </button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

// Main Dashboard Component
const UserDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 p-8">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="request-blood" element={<RequestBlood />} />
          <Route path="donate" element={<DonateBlood />} />
          <Route path="history" element={<History />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="nearby" element={<Nearby />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  )
}

export default UserDashboard
