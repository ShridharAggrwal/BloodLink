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
    { path: '/ngo', label: 'Overview', icon: '📊' },
    { path: '/ngo/campaigns', label: 'Campaigns', icon: '📅' },
    { path: '/ngo/create-campaign', label: 'Create Campaign', icon: '➕' },
    { path: '/ngo/alerts', label: 'Alerts', icon: '🔔', badge: alerts.length },
    { path: '/ngo/request-blood', label: 'Request Blood', icon: '🩸' },
    { path: '/ngo/profile', label: 'Profile', icon: '👤' },
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
        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-lg font-medium">NGO</span>
        <p className="font-semibold text-gray-900 mt-2 truncate">{user?.name}</p>
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
  const { alerts } = useSocket()
  const [stats, setStats] = useState({ activeCampaigns: 0, totalCampaigns: 0, volunteerCount: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/ngo/stats')
        setStats(response.data)
      } catch (error) {
        console.log('Failed to fetch stats')
      }
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">NGO Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-2xl mb-3">📅</div>
          <div className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</div>
          <div className="text-gray-500">Active Campaigns</div>
        </div>
        <div className="card">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-3">👥</div>
          <div className="text-2xl font-bold text-gray-900">{stats.volunteerCount}</div>
          <div className="text-gray-500">Volunteers</div>
        </div>
        <div className="card">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl mb-3">🔔</div>
          <div className="text-2xl font-bold text-gray-900">{alerts.length}</div>
          <div className="text-gray-500">Blood Alerts</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/ngo/create-campaign" className="card hover:border-red-200 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl">➕</div>
            <div>
              <h3 className="font-semibold text-gray-900">Create Campaign</h3>
              <p className="text-gray-500 text-sm">Start a new blood donation campaign</p>
            </div>
          </div>
        </Link>

        <Link to="/ngo/campaigns" className="card hover:border-blue-200 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl">📋</div>
            <div>
              <h3 className="font-semibold text-gray-900">View Campaigns</h3>
              <p className="text-gray-500 text-sm">Manage your existing campaigns</p>
            </div>
          </div>
        </Link>
      </div>

      {alerts.length > 0 && (
        <div className="card mt-6 border-red-200 bg-red-50/50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Recent Blood Requests
          </h2>
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="font-semibold text-red-600">{alert.blood_group}</span>
                  <span className="text-gray-500 ml-2">- {alert.units_needed} unit(s)</span>
                  <p className="text-sm text-gray-400">{alert.address}</p>
                </div>
                <Link to="/ngo/alerts" className="btn-primary text-sm py-2 px-4">View</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Campaigns Section
const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/ngo/campaigns')
      setCampaigns(response.data)
    } catch (error) {
      console.log('Failed to fetch campaigns')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCampaigns() }, [])

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/ngo/campaigns/${id}`, { status })
      setToast({ type: 'success', message: 'Campaign status updated' })
      fetchCampaigns()
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update campaign' })
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Link to="/ngo/create-campaign" className="btn-primary">Create New</Link>
      </div>
      
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {campaigns.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Campaigns Yet</h3>
          <p className="text-gray-500 mb-4">Create your first blood donation campaign</p>
          <Link to="/ngo/create-campaign" className="btn-primary inline-block">Create Campaign</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                  <p className="text-gray-500">{campaign.address}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${campaign.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {campaign.status}
                  </span>
                  <button onClick={() => handleStatusChange(campaign.id, campaign.status === 'active' ? 'ended' : 'active')} className="btn-secondary text-sm py-2">
                    {campaign.status === 'active' ? 'End' : 'Reactivate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Create Campaign Section
const CreateCampaign = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ title: '', address: '', start_date: '', end_date: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/ngo/campaigns', formData)
      setToast({ type: 'success', message: 'Campaign created successfully!' })
      setTimeout(() => navigate('/ngo/campaigns'), 1500)
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to create campaign' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Campaign</h1>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="card max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" placeholder="e.g., Blood Donation Drive 2024" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location / Address</label>
            <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field resize-none" rows="2" placeholder="Enter campaign location" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time</label>
              <input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label>
              <input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="input-field" required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating...' : 'Create Campaign'}</button>
        </form>
      </div>
    </div>
  )
}

// Alerts Section
const NGOAlerts = () => {
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
      setToast({ type: 'success', message: 'Request accepted!' })
      setAllAlerts(prev => prev.filter(a => a.id !== requestId))
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to accept' })
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blood Request Alerts</h1>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {allAlerts.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">✨</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Requests</h3>
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
                    <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-medium">{alert.units_needed} unit(s) needed</span>
                  </div>
                  <p className="text-gray-700 mb-2">{alert.address}</p>
                  <p className="text-sm text-gray-400">Posted {new Date(alert.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => handleAccept(alert.id)} className="btn-primary">Accept & Help</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Request Blood Section
const NGORequestBlood = () => {
  const [formData, setFormData] = useState({ blood_group: '', units_needed: 1, address: '' })
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
            <select value={formData.blood_group} onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })} className="input-field" required>
              <option value="">Select Blood Group</option>
              {bloodGroups.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Units Needed</label>
            <input type="number" min="1" max="20" value={formData.units_needed} onChange={(e) => setFormData({ ...formData, units_needed: parseInt(e.target.value) })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location / Address</label>
            <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field resize-none" rows="3" placeholder="Enter the address where blood is needed" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating Request...' : 'Request Blood'}</button>
        </form>
      </div>
    </div>
  )
}

// Profile Section
const NGOProfile = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({ name: '', owner_name: '', age: '', gender: '', address: '', volunteer_count: '' })
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/ngo/profile')
        setFormData({ name: response.data.name || '', owner_name: response.data.owner_name || '', age: response.data.age || '', gender: response.data.gender || '', address: response.data.address || '', volunteer_count: response.data.volunteer_count || '' })
      } catch (error) { console.log('Failed to fetch profile') }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.put('/ngo/profile', formData)
      setToast({ type: 'success', message: 'Profile updated successfully' })
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to update profile' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) { setToast({ type: 'error', message: 'Passwords do not match' }); return }
    setLoading(true)
    try {
      await api.put('/ngo/change-password', { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
      setToast({ type: 'success', message: 'Password changed successfully' })
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to change password' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">NGO Profile</h1>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="card max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">NGO Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Owner Name</label><input type="text" value={formData.owner_name} onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={user?.email} className="input-field bg-gray-50" disabled /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Age</label><input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-2">Gender</label><select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="input-field"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Volunteer Count</label><input type="number" value={formData.volunteer_count} onChange={(e) => setFormData({ ...formData, volunteer_count: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Address</label><textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field resize-none" rows="2" /></div>
          <div className="flex gap-4 pt-4"><button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Changes'}</button><button type="button" onClick={() => setShowPasswordModal(true)} className="btn-secondary">Change Password</button></div>
        </form>
      </div>
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label><input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">New Password</label><input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label><input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="input-field" required /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Changing...' : 'Change Password'}</button>
        </form>
      </Modal>
    </div>
  )
}

// Main Dashboard Component
const NGODashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 p-8">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="campaigns" element={<Campaigns />} />
          <Route path="create-campaign" element={<CreateCampaign />} />
          <Route path="alerts" element={<NGOAlerts />} />
          <Route path="request-blood" element={<NGORequestBlood />} />
          <Route path="profile" element={<NGOProfile />} />
        </Routes>
      </main>
    </div>
  )
}

export default NGODashboard
