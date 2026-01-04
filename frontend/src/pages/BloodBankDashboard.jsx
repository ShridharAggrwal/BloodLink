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
    { path: '/blood-bank', label: 'Overview', icon: '📊' },
    { path: '/blood-bank/stock', label: 'Blood Stock', icon: '🩸' },
    { path: '/blood-bank/requests', label: 'View Requests', icon: '📋', badge: alerts.length },
    { path: '/blood-bank/request-blood', label: 'Request Blood', icon: '📣' },
    { path: '/blood-bank/profile', label: 'Profile', icon: '👤' },
  ]

  const quickActions = [
    { path: '/blood-bank/stock', label: 'Blood Stock', icon: '🩸', description: 'Manage inventory' },
    { path: '/blood-bank/requests', label: 'View Requests', icon: '📋', description: 'Nearby requests', badge: alerts.length },
    { path: '/blood-bank/request-blood', label: 'Request Blood', icon: '📣', description: 'Request donations' },
    { path: 'logout', label: 'Logout', icon: '🚪', description: 'Sign out from account' },
  ]

  const handleLogout = () => { logout(); navigate('/') }

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
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12z" /></svg>
          </div>
          <span className="text-xl font-bold gradient-text">BloodLink</span>
        </Link>

        <div className="mb-6 px-2 py-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-100">
          <p className="text-rose-600 text-sm font-medium">Blood Bank Portal</p>
          <p className="font-bold text-gray-900 truncate">{user?.name}</p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${location.pathname === item.path ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-pink-500/30 scale-105' : 'text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-700'}`}>
              <span>{item.icon}</span><span className="font-medium">{item.label}</span>
              {item.badge > 0 && <span className={`ml-auto ${location.pathname === item.path ? 'bg-white text-rose-600' : 'bg-red-500 text-white'} text-xs px-2 py-1 rounded-full font-semibold animate-pulse`}>{item.badge}</span>}
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 mt-8 text-gray-500 hover:text-gray-700 hover:bg-red-50 rounded-xl transition-all duration-300 w-full group">
          <span>🚪</span><span className="font-medium">Logout</span>
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around items-center">
          <Link to="/blood-bank" className={`flex flex-col items-center gap-1 px-4 py-3 transition-all duration-300 ${location.pathname === '/blood-bank' ? 'text-rose-600' : 'text-gray-600'}`}>
            <span className="text-2xl">📊</span>
            <span className="text-xs font-medium">Overview</span>
          </Link>
          <button onClick={() => setShowQuickActions(true)} className="flex flex-col items-center gap-1 px-4 py-3 -mt-6 transition-all duration-300">
            <div className="w-14 h-14 bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30 hover:scale-110 transition-transform">
              <span className="text-white text-2xl font-bold">+</span>
            </div>
          </button>
          <Link to="/blood-bank/profile" className={`flex flex-col items-center gap-1 px-4 py-3 transition-all duration-300 ${location.pathname === '/blood-bank/profile' ? 'text-rose-600' : 'text-gray-600'}`}>
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

// Overview Section with color-coded blood stock
const Overview = () => {
  const { alerts } = useSocket()
  const [stats, setStats] = useState({ totalUnits: 0, pendingRequests: 0 })
  const [stock, setStock] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, stockRes] = await Promise.all([api.get('/blood-bank/stats'), api.get('/blood-bank/stock')])
        setStats(statsRes.data)
        setStock(stockRes.data)
      } catch (error) { console.log('Failed to fetch data') }
    }
    fetchData()
  }, [])

  // Helper function to get color based on blood units
  // Low: 0-10 units (RED), Medium: 11-25 units (ORANGE), Sufficient: 26+ units (GREEN)
  const getStockColor = (units) => {
    if (units <= 10) return { bg: 'bg-gradient-to-br from-red-50 to-rose-100', border: 'border-red-300', text: 'text-red-700', label: 'Low' }
    if (units <= 25) return { bg: 'bg-gradient-to-br from-orange-50 to-amber-100', border: 'border-orange-300', text: 'text-orange-700', label: 'Medium' }
    return { bg: 'bg-gradient-to-br from-green-50 to-emerald-100', border: 'border-green-300', text: 'text-green-700', label: 'Sufficient' }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold gradient-text mb-2">Blood Bank Dashboard</h1>
      <p className="text-gray-600 mb-8">Manage your blood inventory and requests</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="dashboard-card group hover:scale-105">
          <div className="stat-card-icon bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600 group-hover:scale-110 transition-transform">🩸</div>
          <div className="text-3xl font-bold gradient-text mb-1">{stats.totalUnits}</div>
          <div className="text-gray-600 font-medium">Total Units in Stock</div>
          <div className="mt-3 text-xs text-rose-600 font-semibold">Blood Inventory</div>
        </div>
        <div className="dashboard-card group hover:scale-105">
          <div className="stat-card-icon bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-600 group-hover:scale-110 transition-transform">📋</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingRequests}</div>
          <div className="text-gray-600 font-medium">Nearby Requests</div>
          <div className="mt-3 text-xs text-sky-600 font-semibold">Pending Fulfillment</div>
        </div>
        <div className="dashboard-card group hover:scale-105">
          <div className="stat-card-icon bg-gradient-to-br from-amber-100 to-orange-100 text-amber-600 group-hover:scale-110 transition-transform">🔔</div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{alerts.length}</div>
          <div className="text-gray-600 font-medium">Active Alerts</div>
          <div className="mt-3 text-xs text-amber-600 font-semibold">New Notifications</div>
        </div>
      </div>

      <div className="dashboard-card gradient-bg-card border-purple-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🩸</span> Blood Stock Overview
        </h2>
        <p className="text-gray-500 text-sm mb-6">Color-coded based on availability: <span className="text-red-600 font-semibold">Low (0-10)</span>, <span className="text-orange-600 font-semibold">Medium (11-25)</span>, <span className="text-green-600 font-semibold">Sufficient (26+)</span></p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {stock.map((item) => {
            const colorStyle = getStockColor(item.units_available)
            return (
              <div key={item.blood_group} className={`text-center p-4 rounded-xl border-2 ${colorStyle.bg} ${colorStyle.border} transition-all duration-300 hover:scale-110 hover:shadow-lg`}>
                <div className="text-lg font-bold text-red-600">{item.blood_group}</div>
                <div className={`text-2xl font-bold ${colorStyle.text} mt-1`}>{item.units_available}</div>
                <div className="text-xs text-gray-500 mt-1">units</div>
                <div className={`text-xs font-semibold ${colorStyle.text} mt-1`}>{colorStyle.label}</div>
              </div>
            )
          })}
        </div>
        {stock.some(s => s.units_available <= 10) && (
          <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
            <p className="text-red-700 font-semibold flex items-center gap-2">
              <span className="text-xl">⚠️</span> Critical Alert: Some blood types are running low. Consider requesting donations immediately.
            </p>
          </div>
        )}
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
                <Link to="/blood-bank/requests" className="btn-action text-sm py-2 px-5">View Details</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Blood Stock Management Section
const BloodStock = () => {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [editingGroup, setEditingGroup] = useState(null)
  const [newUnits, setNewUnits] = useState(0)

  // Helper function to get color based on blood units
  const getStockColor = (units) => {
    if (units <= 10) return { bg: 'bg-gradient-to-br from-red-50 to-rose-100', border: 'border-red-300', text: 'text-red-700', label: 'Low', badge: 'bg-red-100 text-red-700' }
    if (units <= 25) return { bg: 'bg-gradient-to-br from-orange-50 to-amber-100', border: 'border-orange-300', text: 'text-orange-700', label: 'Medium', badge: 'bg-orange-100 text-orange-700' }
    return { bg: 'bg-gradient-to-br from-green-50 to-emerald-100', border: 'border-green-300', text: 'text-green-700', label: 'Sufficient', badge: 'bg-green-100 text-green-700' }
  }

  const fetchStock = async () => { try { const response = await api.get('/blood-bank/stock'); setStock(response.data) } catch (error) { console.log('Failed to fetch stock') } finally { setLoading(false) } }
  useEffect(() => { fetchStock() }, [])

  const handleUpdate = async (bloodGroup) => {
    try {
      await api.put('/blood-bank/stock', { blood_group: bloodGroup, units_available: newUnits })
      setToast({ type: 'success', message: 'Stock updated successfully' })
      setEditingGroup(null)
      fetchStock()
    } catch (error) { setToast({ type: 'error', message: 'Failed to update stock' }) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div></div>

  return (
    <div>
      <h1 className="text-3xl font-bold gradient-text mb-2">Blood Stock Management</h1>
      <p className="text-gray-600 mb-8">Manage your blood inventory levels</p>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="dashboard-card gradient-bg-card border-purple-100">
        <p className="text-gray-600 mb-6 font-medium">Click on a blood type to update its stock. Color codes: <span className="text-red-600 font-semibold">Low (0-10)</span>, <span className="text-orange-600 font-semibold">Medium (11-25)</span>, <span className="text-green-600 font-semibold">Sufficient (26+)</span></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stock.map((item) => {
            const colorStyle = getStockColor(item.units_available)
            return (
              <div key={item.blood_group} className={`p-6 rounded-xl border-2 ${colorStyle.bg} ${colorStyle.border} transition-all duration-300 hover:shadow-lg`}>
                {editingGroup === item.blood_group ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold gradient-text">{item.blood_group}</span>
                      <button onClick={() => setEditingGroup(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Units Available</label>
                      <input type="number" min="0" value={newUnits} onChange={(e) => setNewUnits(parseInt(e.target.value) || 0)} className="input-field" />
                    </div>
                    <button onClick={() => handleUpdate(item.blood_group)} className="btn-primary w-full">Save Changes</button>
                  </div>
                ) : (
                  <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setEditingGroup(item.blood_group); setNewUnits(item.units_available) }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-red-600">{item.blood_group}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorStyle.badge}`}>{colorStyle.label}</span>
                    </div>
                    <div className={`text-4xl font-bold ${colorStyle.text}`}>{item.units_available}</div>
                    <div className="text-gray-500 font-medium mt-1">units available</div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-gray-400 text-sm">Click to edit</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// View Requests Section
const ViewRequests = () => {
  const { alerts } = useSocket()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const fetchRequests = async () => { try { const response = await api.get('/blood-bank/requests'); setRequests(response.data) } catch (error) { console.log('Failed to fetch requests') } finally { setLoading(false) } }
  useEffect(() => { fetchRequests() }, [alerts])

  const handleAccept = async (requestId) => {
    try { await api.put(`/blood-requests/${requestId}/accept`); setToast({ type: 'success', message: 'Request accepted!' }); fetchRequests() }
    catch (error) { setToast({ type: 'error', message: error.response?.data?.error || 'Failed to accept' }) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blood Requests</h1>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <p className="text-gray-600 mb-6">Blood requests within 35km of your location.</p>
      {requests.length === 0 ? (
        <div className="card text-center py-12"><div className="text-4xl mb-4">✨</div><h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Requests</h3><p className="text-gray-500">No blood requests in your area right now.</p></div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2"><span className="text-3xl font-bold text-red-600">{request.blood_group}</span><span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-medium">{request.units_needed} unit(s) needed</span></div>
                  <p className="text-gray-700 mb-2">{request.address}</p>
                  <p className="text-sm text-gray-400">Posted {new Date(request.created_at).toLocaleString()}</p>
                  {request.distance && <p className="text-sm text-gray-400">{(request.distance / 1000).toFixed(1)} km away</p>}
                </div>
                <button onClick={() => handleAccept(request.id)} className="btn-primary">Fulfill Request</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Request Blood Section
const RequestBlood = () => {
  const [formData, setFormData] = useState({ blood_group: '', units_needed: 1, address: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const response = await api.post('/blood-requests', formData)
      setToast({ type: 'success', message: `Request created! ${response.data.alertsSent} donors notified.` })
      setFormData({ blood_group: '', units_needed: 1, address: '' })
    } catch (error) { setToast({ type: 'error', message: error.response?.data?.error || 'Failed to create request' }) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Request Blood (Shortage)</h1>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="card max-w-lg">
        <p className="text-gray-600 mb-6">Running low on blood? Create a request to notify donors in your area.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Blood Group Needed</label><select value={formData.blood_group} onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })} className="input-field" required><option value="">Select Blood Group</option>{bloodGroups.map((bg) => <option key={bg} value={bg}>{bg}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Units Needed</label><input type="number" min="1" max="50" value={formData.units_needed} onChange={(e) => setFormData({ ...formData, units_needed: parseInt(e.target.value) })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Blood Bank Address</label><textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field resize-none" rows="3" placeholder="Enter your blood bank address" required /></div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Creating Request...' : 'Request Blood'}</button>
        </form>
      </div>
    </div>
  )
}

// Profile Section
const BloodBankProfile = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({ name: '', contact_info: '', address: '', latitude: '', longitude: '' })
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [toast, setToast] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/blood-bank/profile')
        setFormData({ name: response.data.name || '', contact_info: response.data.contact_info || '', address: response.data.address || '', latitude: response.data.lat || '', longitude: response.data.lng || '' })
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
      const response = await api.put('/blood-bank/profile', { ...formData, latitude: formData.latitude ? parseFloat(formData.latitude) : null, longitude: formData.longitude ? parseFloat(formData.longitude) : null })
      if (response.data.bloodBank) updateUser(response.data.bloodBank)
      setToast({ type: 'success', message: 'Profile updated successfully' })
    }
    catch (error) { setToast({ type: 'error', message: 'Failed to update profile' }) }
    finally { setLoading(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) { setToast({ type: 'error', message: 'Passwords do not match' }); return }
    setLoading(true)
    try {
      await api.put('/blood-bank/change-password', { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })
      setToast({ type: 'success', message: 'Password changed successfully' })
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) { setToast({ type: 'error', message: error.response?.data?.error || 'Failed to change password' }) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blood Bank Profile</h1>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Blood Bank Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={user?.email} className="input-field bg-gray-50" disabled /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Contact Info</label><input type="text" value={formData.contact_info} onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })} className="input-field" placeholder="Phone number" /></div>
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
            <p className="text-xs text-gray-400 mt-2">Location is used to calculate distances for blood requests.</p>
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
const BloodBankDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-8 pb-20 md:pb-8">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="stock" element={<BloodStock />} />
          <Route path="requests" element={<ViewRequests />} />
          <Route path="request-blood" element={<RequestBlood />} />
          <Route path="profile" element={<BloodBankProfile />} />
        </Routes>
      </main>
    </div>
  )
}

export default BloodBankDashboard
