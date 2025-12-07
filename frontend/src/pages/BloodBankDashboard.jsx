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
    { path: '/blood-bank', label: 'Overview', icon: '📊' },
    { path: '/blood-bank/stock', label: 'Blood Stock', icon: '🩸' },
    { path: '/blood-bank/requests', label: 'View Requests', icon: '📋', badge: alerts.length },
    { path: '/blood-bank/request-blood', label: 'Request Blood', icon: '📣' },
    { path: '/blood-bank/profile', label: 'Profile', icon: '👤' },
  ]

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen p-4 fixed left-0 top-0 shadow-sm">
      <Link to="/" className="flex items-center gap-2 mb-8 px-2">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12z" /></svg>
        </div>
        <span className="text-xl font-bold text-gray-900">BloodLink</span>
      </Link>

      <div className="mb-6 px-2">
        <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-lg font-medium">Blood Bank</span>
        <p className="font-semibold text-gray-900 mt-2 truncate">{user?.name}</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-600 hover:bg-gray-50'}`}>
            <span>{item.icon}</span><span>{item.label}</span>
            {item.badge > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">{item.badge}</span>}
          </Link>
        ))}
      </nav>

      <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 mt-8 text-gray-500 hover:text-gray-700 transition-colors w-full">
        <span>🚪</span><span>Logout</span>
      </button>
    </aside>
  )
}

// Overview Section
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blood Bank Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card"><div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-2xl mb-3">🩸</div><div className="text-2xl font-bold text-gray-900">{stats.totalUnits}</div><div className="text-gray-500">Total Units in Stock</div></div>
        <div className="card"><div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl mb-3">📋</div><div className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</div><div className="text-gray-500">Nearby Requests</div></div>
        <div className="card"><div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center text-2xl mb-3">🔔</div><div className="text-2xl font-bold text-gray-900">{alerts.length}</div><div className="text-gray-500">New Alerts</div></div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Blood Stock Overview</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {stock.map((item) => (
            <div key={item.blood_group} className={`text-center p-4 rounded-xl border ${item.units_available < 5 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
              <div className="text-lg font-bold text-red-600">{item.blood_group}</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{item.units_available}</div>
              <div className="text-xs text-gray-400">units</div>
            </div>
          ))}
        </div>
        {stock.some(s => s.units_available < 5) && <p className="text-yellow-600 text-sm mt-4">⚠️ Some blood types are running low. Consider requesting donations.</p>}
      </div>

      {alerts.length > 0 && (
        <div className="card mt-6 border-red-200 bg-red-50/50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Recent Blood Requests</h2>
          <div className="space-y-3">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                <div><span className="font-semibold text-red-600">{alert.blood_group}</span><span className="text-gray-500 ml-2">- {alert.units_needed} unit(s)</span><p className="text-sm text-gray-400">{alert.address}</p></div>
                <Link to="/blood-bank/requests" className="btn-primary text-sm py-2 px-4">View</Link>
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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div></div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blood Stock Management</h1>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="card">
        <p className="text-gray-600 mb-6">Manage your blood inventory. Click on a blood type to update its stock.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stock.map((item) => (
            <div key={item.blood_group} className={`p-6 rounded-xl border ${item.units_available < 5 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
              {editingGroup === item.blood_group ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><span className="text-2xl font-bold text-red-600">{item.blood_group}</span><button onClick={() => setEditingGroup(null)} className="text-gray-400 hover:text-gray-600">✕</button></div>
                  <div><label className="block text-sm text-gray-500 mb-2">Units Available</label><input type="number" min="0" value={newUnits} onChange={(e) => setNewUnits(parseInt(e.target.value) || 0)} className="input-field" /></div>
                  <button onClick={() => handleUpdate(item.blood_group)} className="btn-primary w-full">Save</button>
                </div>
              ) : (
                <div className="cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setEditingGroup(item.blood_group); setNewUnits(item.units_available) }}>
                  <div className="flex items-center justify-between mb-2"><span className="text-2xl font-bold text-red-600">{item.blood_group}</span><span className="text-gray-400 text-sm">Click to edit</span></div>
                  <div className="text-4xl font-bold text-gray-900">{item.units_available}</div>
                  <div className="text-gray-400">units available</div>
                  {item.units_available < 5 && <p className="text-yellow-600 text-sm mt-2">⚠️ Low stock</p>}
                </div>
              )}
            </div>
          ))}
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
      <main className="ml-64 p-8">
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
