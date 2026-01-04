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
  const [showQuickActions, setShowQuickActions] = useState(false)

  const navItems = [
    { path: '/ngo', label: 'Overview', icon: '📊' },
    { path: '/ngo/campaigns', label: 'Campaigns', icon: '📅' },
    { path: '/ngo/create-campaign', label: 'Create Campaign', icon: '➕' },
    { path: '/ngo/alerts', label: 'Alerts', icon: '🔔', badge: alerts.length },
    { path: '/ngo/request-blood', label: 'Request Blood', icon: '🩸' },
    { path: '/ngo/profile', label: 'Profile', icon: '👤' },
  ]

  const quickActions = [
    { path: '/ngo/create-campaign', label: 'Create Campaign', icon: '➕', description: 'Start new campaign' },
    { path: '/ngo/campaigns', label: 'Campaigns', icon: '📅', description: 'Manage campaigns' },
    { path: '/ngo/alerts', label: 'Alerts', icon: '🔔', description: 'Blood requests', badge: alerts.length },
    { path: '/ngo/request-blood', label: 'Request Blood', icon: '🩸', description: 'Request donations' },
    { path: 'logout', label: 'Logout', icon: '🚪', description: 'Sign out from account' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleQuickAction = (path) => {
    setShowQuickActions(false)
    if (path === 'logout') {
      logout()
      navigate('/')
    } else {
      navigate(path)
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-gradient-to-br from-white to-rose-50/30 border-r border-gray-100 min-h-screen p-4 fixed left-0 top-0 shadow-lg">
        <Link to="/" className="flex items-center gap-2 mb-8 px-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12z" />
            </svg>
          </div>
          <span className="text-xl font-bold gradient-text">BloodLink</span>
        </Link>

        <div className="mb-6 px-2 py-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
          <p className="text-rose-600 text-sm font-medium">NGO Portal</p>
          <p className="font-bold text-gray-900 truncate">{user?.name}</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === item.path
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-pink-500/30 scale-105'
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-700'
                }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className={`ml-auto ${location.pathname === item.path ? 'bg-white text-rose-600' : 'bg-red-500 text-white'} text-xs px-2 py-1 rounded-full font-semibold animate-pulse`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 mt-8 text-gray-500 hover:text-gray-700 hover:bg-red-50 rounded-xl transition-all duration-300 w-full group"
        >
          <span>🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center">
          <Link to="/ngo" className={`flex flex-col items-center gap-1 px-4 py-3 transition-all duration-300 ${location.pathname === '/ngo' ? 'text-rose-600' : 'text-gray-600'}`}>
            <span className="text-2xl">📊</span>
            <span className="text-xs font-medium">Overview</span>
          </Link>
          <button onClick={() => setShowQuickActions(true)} className="flex flex-col items-center gap-1 px-4 py-3 -mt-6 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30 hover:scale-110 transition-transform">
              <span className="text-white text-2xl font-bold">+</span>
            </div>
          </button>
          <Link to="/ngo/profile" className={`flex flex-col items-center gap-1 px-4 py-3 transition-all duration-300 ${location.pathname === '/ngo/profile' ? 'text-rose-600' : 'text-gray-600'}`}>
            <span className="text-2xl">👤</span>
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Quick Actions Modal */}
      {showQuickActions && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowQuickActions(false)}>
          <div className="bg-white rounded-t-3xl w-full p-6 pb-8 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6"></div>
            <h3 className="text-xl font-bold gradient-text mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button key={action.path} onClick={() => handleQuickAction(action.path)} className="relative p-4 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100 hover:shadow-lg transition-all duration-300 text-left">
                  {action.badge > 0 && <span className="absolute top-2 right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold animate-pulse">{action.badge}</span>}
                  <div className="text-3xl mb-2">{action.icon}</div>
                  <div className="font-semibold text-gray-900 text-sm">{action.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowQuickActions(false)} className="w-full mt-4 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </>
  )
}

// Overview Section
const Overview = () => {
  const { alerts } = useSocket()
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalCampaigns: 0,
    volunteerCount: 0,
    campaignsCount: 0,
    bloodRequestsAccepted: 0
  })

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
      <h1 className="text-3xl font-bold gradient-text mb-2">NGO Dashboard</h1>
      <p className="text-gray-600 mb-8">Manage your campaigns and help save lives</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="dashboard-card group hover:scale-105">
          <div className="stat-card-icon bg-gradient-to-br from-green-100 to-emerald-100 text-green-600 group-hover:scale-110 transition-transform">📅</div>
          <div className="text-3xl font-bold gradient-text mb-1">{stats.activeCampaigns}</div>
          <div className="text-gray-600 font-medium">Active Campaigns</div>
          <div className="mt-3 text-xs text-green-600 font-semibold">Ongoing Events</div>
        </div>
        <div className="dashboard-card group hover:scale-105">
          <div className="stat-card-icon bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 group-hover:scale-110 transition-transform">🎯</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.campaignsCount}</div>
          <div className="text-gray-600 font-medium">Campaigns Created</div>
          <div className="mt-3 text-xs text-rose-600 font-semibold">Total Events</div>
        </div>
        <div className="dashboard-card group hover:scale-105">
          <div className="stat-card-icon bg-gradient-to-br from-purple-100 to-violet-100 text-purple-600 group-hover:scale-110 transition-transform">🩸</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.bloodRequestsAccepted}</div>
          <div className="text-gray-600 font-medium">Requests Fulfilled</div>
          <div className="mt-3 text-xs text-purple-600 font-semibold">Lives Saved</div>
        </div>
        <div className="dashboard-card group hover:scale-105">
          <div className="stat-card-icon bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-600 group-hover:scale-110 transition-transform">👥</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.volunteerCount}</div>
          <div className="text-gray-600 font-medium">Volunteers</div>
          <div className="mt-3 text-xs text-sky-600 font-semibold">Team Members</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link to="/ngo/create-campaign" className="dashboard-card hover:border-rose-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 rounded-xl flex items-center justify-center text-2xl shadow-md">➕</div>
            <div>
              <h3 className="font-bold text-gray-900">Create Campaign</h3>
              <p className="text-gray-500 text-sm">Start a new blood donation campaign</p>
            </div>
          </div>
        </Link>

        <Link to="/ngo/campaigns" className="dashboard-card hover:border-sky-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-600 rounded-xl flex items-center justify-center text-2xl shadow-md">📋</div>
            <div>
              <h3 className="font-bold text-gray-900">View Campaigns</h3>
              <p className="text-gray-500 text-sm">Manage your existing campaigns</p>
            </div>
          </div>
        </Link>
      </div>

      {alerts.length > 0 && (
        <div className="dashboard-card mt-6 border-rose-200 bg-gradient-to-br from-red-50 to-rose-50">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            <span className="gradient-text">Recent Blood Requests</span>
          </h2>
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-rose-100 hover:shadow-lg transition-shadow">
                <div>
                  <span className="text-2xl font-bold gradient-text">{alert.blood_group}</span>
                  <span className="text-gray-500 ml-2 font-medium">- {alert.units_needed} unit(s)</span>
                  <p className="text-sm text-gray-500 mt-1">📍 {alert.address}</p>
                </div>
                <Link to="/ngo/alerts" className="btn-action text-sm py-2 px-5">View Details</Link>
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
  const [endModal, setEndModal] = useState({ open: false, campaign: null, bloodUnits: '' })

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

  const handleEndCampaign = async () => {
    if (!endModal.bloodUnits || endModal.bloodUnits < 0) {
      setToast({ type: 'error', message: 'Please enter valid blood units collected' })
      return
    }

    try {
      await api.put(`/ngo/campaigns/${endModal.campaign.id}/end`, {
        blood_units_collected: parseInt(endModal.bloodUnits)
      })
      setToast({ type: 'success', message: `Campaign ended! ${endModal.bloodUnits} units collected.` })
      setEndModal({ open: false, campaign: null, bloodUnits: '' })
      fetchCampaigns()
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to end campaign' })
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
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.title}</h3>
                    {campaign.health_checkup_available && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-lg flex items-center gap-1">
                        ⚕️ Health Checkup
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500">📍 {campaign.address}</p>
                  <p className="text-sm text-gray-400 mt-2">
                    🗓 {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                  </p>
                  {campaign.status === 'ended' && campaign.blood_units_collected !== null && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-sm font-semibold rounded-lg">
                        🩸 {campaign.blood_units_collected} units collected
                      </span>
                      <span className="text-xs text-gray-500">
                        Ended on {new Date(campaign.ended_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${campaign.status === 'active'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                    }`}>
                    {campaign.status === 'active' ? '✓ Active' : '⏹ Ended'}
                  </span>
                  {campaign.status === 'active' && (
                    <button
                      onClick={() => setEndModal({ open: true, campaign, bloodUnits: '' })}
                      className="bg-rose-50 text-rose-600 hover:bg-rose-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      End Campaign
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* End Campaign Modal */}
      {endModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEndModal({ open: false, campaign: null, bloodUnits: '' })}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">End Campaign</h2>
            <p className="text-gray-600 mb-6">How many blood units were collected during <span className="font-semibold">{endModal.campaign?.title}</span>?</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Blood Units Collected *</label>
              <input
                type="number"
                min="0"
                value={endModal.bloodUnits}
                onChange={(e) => setEndModal({ ...endModal, bloodUnits: e.target.value })}
                className="input-field"
                placeholder="Enter number of units"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">This information is mandatory to complete the campaign</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEndModal({ open: false, campaign: null, bloodUnits: '' })}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleEndCampaign}
                className="flex-1 btn-primary"
              >
                End Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Create Campaign Section
const CreateCampaign = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    start_date: '',
    end_date: '',
    latitude: '',
    longitude: '',
    health_checkup_available: false
  })
  const [loading, setLoading] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [toast, setToast] = useState(null)

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setToast({ type: 'error', message: 'Geolocation is not supported by your browser' })
      return
    }

    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(15),
          longitude: position.coords.longitude.toFixed(15)
        }))
        setGettingLocation(false)
        setToast({ type: 'success', message: 'Location captured successfully' })
      },
      (error) => {
        setGettingLocation(false)
        setToast({ type: 'error', message: 'Unable to get location. Please enter manually.' })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.latitude || !formData.longitude) {
      setToast({ type: 'error', message: 'Location is required. Please allow location access or enter manually.' })
      return
    }

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

          {/* Campaign Location Coordinates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Coordinates</label>

            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gettingLocation}
              className="w-full mb-3 py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {gettingLocation ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Getting location...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Get Campaign Location
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g., 12.9716"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g., 77.5946"
                  required
                />
              </div>
            </div>

            {formData.latitude && formData.longitude && (
              <div className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Location set: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
              </div>
            )}
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

          {/* Health Checkup */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.health_checkup_available}
                onChange={(e) => setFormData({ ...formData, health_checkup_available: e.target.checked })}
                className="w-5 h-5 text-rose-600 border-gray-300 rounded focus:ring-rose-500 cursor-pointer"
              />
              <div className="ml-3">
                <span className="text-sm font-semibold text-gray-900">⚕️ Free Health Checkup Available</span>
                <p className="text-xs text-gray-600 mt-1">Offer free health checkups to donors at this campaign</p>
              </div>
            </label>
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
  const [formData, setFormData] = useState({ blood_group: '', units_needed: 1, address: '', latitude: '', longitude: '' })
  const [loading, setLoading] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [toast, setToast] = useState(null)
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setToast({ type: 'error', message: 'Geolocation is not supported by your browser' })
      return
    }
    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({ ...formData, latitude: position.coords.latitude.toFixed(15), longitude: position.coords.longitude.toFixed(15) })
        setLoadingLocation(false)
        setToast({ type: 'success', message: 'Location updated successfully' })
      },
      (error) => {
        setLoadingLocation(false)
        let errorMessage = 'Failed to get location'
        if (error.code === error.PERMISSION_DENIED) errorMessage = 'Location permission denied. Please enable location access.'
        else if (error.code === error.POSITION_UNAVAILABLE) errorMessage = 'Location information unavailable.'
        setToast({ type: 'error', message: errorMessage })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.latitude || !formData.longitude) {
      setToast({ type: 'error', message: 'Please provide location coordinates' })
      return
    }
    setLoading(true)
    try {
      const response = await api.post('/blood-requests', { ...formData, latitude: parseFloat(formData.latitude), longitude: parseFloat(formData.longitude) })
      setToast({ type: 'success', message: `Request created! ${response.data.alertsSent} donors notified.` })
      setFormData({ blood_group: '', units_needed: 1, address: '', latitude: '', longitude: '' })
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
      <div className="card max-w-2xl">
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
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Location Coordinates <span className="text-red-500">*</span></label>
              <button type="button" onClick={handleGetLocation} disabled={loadingLocation} className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                {loadingLocation ? (<><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Getting...</>) : (<>📍 Get Current Location</>)}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">Latitude</label><input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className="input-field text-sm" placeholder="e.g., 12.971592847362951" required /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Longitude</label><input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className="input-field text-sm" placeholder="e.g., 77.594623847362847" required /></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Precise coordinates are required to notify nearby donors within 35km radius.</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating Request...' : 'Request Blood'}</button>
        </form>
      </div>
    </div>
  )
}

// Profile Section
const NGOProfile = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({ name: '', owner_name: '', age: '', gender: '', address: '', volunteer_count: '', latitude: '', longitude: '' })
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [toast, setToast] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/ngo/profile')
        setFormData({ name: response.data.name || '', owner_name: response.data.owner_name || '', age: response.data.age || '', gender: response.data.gender || '', address: response.data.address || '', volunteer_count: response.data.volunteer_count || '', latitude: response.data.lat || '', longitude: response.data.lng || '' })
      } catch (error) { console.log('Failed to fetch profile') }
    }
    fetchProfile()
  }, [])

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setToast({ type: 'error', message: 'Geolocation is not supported by your browser' })
      return
    }
    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData({ ...formData, latitude: position.coords.latitude.toFixed(15), longitude: position.coords.longitude.toFixed(15) })
        setLoadingLocation(false)
        setToast({ type: 'success', message: 'Location updated successfully' })
      },
      (error) => {
        setLoadingLocation(false)
        let errorMessage = 'Failed to get location'
        if (error.code === error.PERMISSION_DENIED) errorMessage = 'Location permission denied. Please enable location access.'
        else if (error.code === error.POSITION_UNAVAILABLE) errorMessage = 'Location information unavailable.'
        setToast({ type: 'error', message: errorMessage })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.put('/ngo/profile', { ...formData, latitude: formData.latitude ? parseFloat(formData.latitude) : null, longitude: formData.longitude ? parseFloat(formData.longitude) : null })
      if (response.data.ngo) updateUser(response.data.ngo)
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
      <div className="card max-w-2xl">
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
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Location Coordinates</label>
              <button type="button" onClick={handleGetLocation} disabled={loadingLocation} className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                {loadingLocation ? (<><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Getting...</>) : (<>📍 Get Current Location</>)}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">Latitude</label><input type="number" step="any" value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: e.target.value })} className="input-field text-sm" placeholder="e.g., 12.971592847362951" /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Longitude</label><input type="number" step="any" value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: e.target.value })} className="input-field text-sm" placeholder="e.g., 77.594623847362847" /></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Location is used to calculate distances for blood requests and campaigns.</p>
          </div>
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
      <main className="md:ml-64 p-4 md:p-8 pb-20 md:pb-8">
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
