import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Modal from '../components/common/Modal'
import Toast from '../components/common/Toast'

// Sidebar Component
const Sidebar = () => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { path: '/admin', label: 'Overview', icon: '📊' },
    { path: '/admin/generate-token', label: 'Generate Token', icon: '🔗' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/ngos', label: 'NGOs', icon: '🤝' },
    { path: '/admin/blood-banks', label: 'Blood Banks', icon: '🏥' },
    { path: '/admin/request-blood', label: 'Request Blood', icon: '🩸' },
    { path: '/admin/profile', label: 'Profile', icon: '👤' },
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
            <path d="M12 2c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-900">BloodLink</span>
      </Link>

      <div className="mb-6 px-2">
        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-lg font-medium">Admin</span>
        <p className="font-semibold text-gray-900 mt-2 truncate">{user?.name}</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === item.path
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
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
  const [stats, setStats] = useState({
    approvedUsers: 0,
    approvedNgos: 0,
    approvedBloodBanks: 0,
    totalDonations: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats')
        setStats(response.data)
      } catch (error) {
        console.log('Failed to fetch stats')
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Approved Users', value: stats.approvedUsers, icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: 'Approved NGOs', value: stats.approvedNgos, icon: '🤝', color: 'bg-green-50 text-green-600' },
    { label: 'Approved Blood Banks', value: stats.approvedBloodBanks, icon: '🏥', color: 'bg-purple-50 text-purple-600' },
    { label: 'Total Donations', value: stats.totalDonations, icon: '❤️', color: 'bg-red-50 text-red-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="card">
            <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-xl mb-4`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

    </div>
  )
}

// Generate Token Section
const GenerateToken = () => {
  const [type, setType] = useState('ngo')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedData, setGeneratedData] = useState(null)
  const [toast, setToast] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/admin/generate-token', { type, email: email || undefined })
      setGeneratedData(response.data)
      setToast({ type: 'success', message: 'Token generated successfully!' })
      setEmail('')
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to generate token' })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setToast({ type: 'success', message: 'Copied to clipboard!' })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Generate Signup Token</h1>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="card max-w-lg">
        <p className="text-gray-600 mb-6">
          Generate a one-time signup link for NGOs or Blood Banks to register on the platform.
        </p>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('ngo')}
                className={`py-3 px-4 rounded-xl border text-center transition-all ${type === 'ngo'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <span className="text-2xl block mb-1">🤝</span>
                NGO
              </button>
              <button
                type="button"
                onClick={() => setType('blood_bank')}
                className={`py-3 px-4 rounded-xl border text-center transition-all ${type === 'blood_bank'
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
              >
                <span className="text-2xl block mb-1">🏥</span>
                Blood Bank
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter email to send link directly"
            />
            <p className="text-sm text-gray-400 mt-1">
              Leave empty to only generate the link
            </p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Generating...' : 'Generate Token'}
          </button>
        </form>

        {generatedData && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Generated Link</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between gap-4">
                <code className="text-sm text-red-600 break-all">
                  {generatedData.signupUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(generatedData.signupUrl)}
                  className="btn-secondary text-sm py-2 px-3 flex-shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Expires: {new Date(generatedData.expiresAt).toLocaleString()}
            </p>
            {email && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Link sent to {email}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Users List Section
const UsersList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', id: null, name: '' })

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      setUsers(response.data)
    } catch (error) {
      console.log('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSuspend = async (id) => {
    try {
      await api.put(`/admin/suspend/user/${id}`)
      setToast({ type: 'success', message: 'User suspended successfully' })
      fetchUsers()
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to suspend user' })
    }
  }

  const handleActivate = async (id) => {
    try {
      await api.put(`/admin/activate/user/${id}`)
      setToast({ type: 'success', message: 'User activated successfully' })
      fetchUsers()
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to activate user' })
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/delete/user/${id}`)
      setToast({ type: 'success', message: 'User deleted successfully' })
      setConfirmModal({ open: false, type: '', id: null, name: '' })
      fetchUsers()
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to delete user' })
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users ({users.length})</h1>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Blood Group</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Joined</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-50">
                <td className="py-3 px-4 text-gray-900">{user.name}</td>
                <td className="py-3 px-4 text-gray-500">{user.email}</td>
                <td className="py-3 px-4">
                  <span className="text-red-600 font-semibold">{user.blood_group || '-'}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${user.is_verified ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                      {user.is_verified ? 'Verified' : 'Not Verified'}
                    </span>
                    {user.status === 'suspended' && (
                      <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-600">
                        Suspended
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-400 text-sm">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {user.status === 'suspended' ? (
                      <button
                        onClick={() => handleActivate(user.id)}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSuspend(user.id)}
                        className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => setConfirmModal({ open: true, type: 'user', id: user.id, name: user.name })}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={confirmModal.open} onClose={() => setConfirmModal({ open: false, type: '', id: null, name: '' })}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-semibold">{confirmModal.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmModal({ open: false, type: '', id: null, name: '' })}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(confirmModal.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// NGOs List Section
const NgosList = () => {
  const [ngos, setNgos] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', id: null, name: '' })

  const fetchNgos = async () => {
    try {
      const response = await api.get('/admin/ngos')
      setNgos(response.data)
    } catch (error) {
      console.log('Failed to fetch NGOs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNgos()
  }, [])

  const handleSuspend = async (id) => {
    try {
      await api.put(`/admin/suspend/ngo/${id}`)
      setToast({ type: 'success', message: 'NGO suspended successfully' })
      fetchNgos()
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to suspend NGO' })
    }
  }

  const handleActivate = async (id) => {
    try {
      await api.put(`/admin/activate/ngo/${id}`)
      setToast({ type: 'success', message: 'NGO activated successfully' })
      fetchNgos()
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to activate NGO' })
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/delete/ngo/${id}`)
      setToast({ type: 'success', message: 'NGO deleted successfully' })
      setConfirmModal({ open: false, type: '', id: null, name: '' })
      fetchNgos()
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to delete NGO' })
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">NGOs ({ngos.length})</h1>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="space-y-4">
        {ngos.map((ngo) => (
          <div key={ngo.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{ngo.name}</h3>
                <p className="text-gray-500">Owner: {ngo.owner_name}</p>
                <p className="text-gray-400 text-sm">{ngo.email}</p>
                <p className="text-gray-400 text-sm mt-2">
                  Volunteers: {ngo.volunteer_count}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${ngo.is_verified ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                    {ngo.is_verified ? 'Verified' : 'Not Verified'}
                  </span>
                  {ngo.status === 'suspended' && (
                    <span className="px-3 py-1 rounded-lg text-sm font-medium bg-red-50 text-red-600">
                      Suspended
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {ngo.status === 'suspended' ? (
                    <button
                      onClick={() => handleActivate(ngo.id)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspend(ngo.id)}
                      className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                    >
                      Suspend
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmModal({ open: true, type: 'ngo', id: ngo.id, name: ngo.name })}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={confirmModal.open} onClose={() => setConfirmModal({ open: false, type: '', id: null, name: '' })}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-semibold">{confirmModal.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmModal({ open: false, type: '', id: null, name: '' })}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(confirmModal.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Blood Banks List Section
const BloodBanksList = () => {
  const [bloodBanks, setBloodBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', id: null, name: '' })

  const fetchBloodBanks = async () => {
    try {
      const response = await api.get('/admin/blood-banks')
      setBloodBanks(response.data)
    } catch (error) {
      console.log('Failed to fetch blood banks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBloodBanks()
  }, [])

  const handleSuspend = async (id) => {
    try {
      await api.put(`/admin/suspend/blood_bank/${id}`)
      setToast({ type: 'success', message: 'Blood Bank suspended successfully' })
      fetchBloodBanks()
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to suspend Blood Bank' })
    }
  }

  const handleActivate = async (id) => {
    try {
      await api.put(`/admin/activate/blood_bank/${id}`)
      setToast({ type: 'success', message: 'Blood Bank activated successfully' })
      fetchBloodBanks()
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to activate Blood Bank' })
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/delete/blood_bank/${id}`)
      setToast({ type: 'success', message: 'Blood Bank deleted successfully' })
      setConfirmModal({ open: false, type: '', id: null, name: '' })
      fetchBloodBanks()
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to delete Blood Bank' })
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blood Banks ({bloodBanks.length})</h1>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="space-y-4">
        {bloodBanks.map((bank) => (
          <div key={bank.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{bank.name}</h3>
                <p className="text-gray-500">{bank.contact_info}</p>
                <p className="text-gray-400 text-sm">{bank.email}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-lg text-sm font-medium ${bank.is_verified ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                    }`}>
                    {bank.is_verified ? 'Verified' : 'Not Verified'}
                  </span>
                  {bank.status === 'suspended' && (
                    <span className="px-3 py-1 rounded-lg text-sm font-medium bg-red-50 text-red-600">
                      Suspended
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {bank.status === 'suspended' ? (
                    <button
                      onClick={() => handleActivate(bank.id)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspend(bank.id)}
                      className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                    >
                      Suspend
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmModal({ open: true, type: 'blood_bank', id: bank.id, name: bank.name })}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={confirmModal.open} onClose={() => setConfirmModal({ open: false, type: '', id: null, name: '' })}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h2>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete <span className="font-semibold">{confirmModal.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmModal({ open: false, type: '', id: null, name: '' })}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDelete(confirmModal.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// Request Blood Section
const AdminRequestBlood = () => {
  const [formData, setFormData] = useState({
    blood_group: '',
    units_needed: 1,
    address: '',
    latitude: '',
    longitude: ''
  })
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
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toFixed(15),
          longitude: position.coords.longitude.toFixed(15)
        })
        setLoadingLocation(false)
        setToast({ type: 'success', message: 'Location updated successfully' })
      },
      (error) => {
        setLoadingLocation(false)
        let errorMessage = 'Failed to get location'
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable location access.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable.'
        }
        setToast({ type: 'error', message: errorMessage })
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

    // Validate coordinates are provided
    if (!formData.latitude || !formData.longitude) {
      setToast({ type: 'error', message: 'Please provide location coordinates' })
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/blood-requests', {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      })
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
          </div>

          {/* Location Coordinates Section */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Location Coordinates <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loadingLocation}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                {loadingLocation ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting...
                  </>
                ) : (
                  <>
                    📍 Get Current Location
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g., 12.971592847362951"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g., 77.594623847362847"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Precise coordinates are required to notify nearby donors within 35km radius.
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

// Profile Section
const AdminProfile = () => {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    address: '',
    latitude: '',
    longitude: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [toast, setToast] = useState(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/admin/profile')
        setFormData({
          name: response.data.name || '',
          age: response.data.age || '',
          gender: response.data.gender || '',
          address: response.data.address || '',
          latitude: response.data.lat || '',
          longitude: response.data.lng || ''
        })
      } catch (error) {
        console.log('Failed to fetch profile')
      }
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
        setFormData({
          ...formData,
          latitude: position.coords.latitude.toFixed(15),
          longitude: position.coords.longitude.toFixed(15)
        })
        setLoadingLocation(false)
        setToast({ type: 'success', message: 'Location updated successfully' })
      },
      (error) => {
        setLoadingLocation(false)
        let errorMessage = 'Failed to get location'
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable location access.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable.'
        }
        setToast({ type: 'error', message: errorMessage })
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
    setLoading(true)

    try {
      const response = await api.put('/admin/profile', {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      })

      // Update user context with new data
      if (response.data.admin) {
        updateUser(response.data.admin)
      }

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
      await api.put('/admin/change-password', {
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Profile</h1>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="card max-w-2xl">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="input-field"
              />
            </div>
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

          {/* Location Section */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Location Coordinates</label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loadingLocation}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                {loadingLocation ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting...
                  </>
                ) : (
                  <>
                    📍 Get Current Location
                  </>
                )}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g., 12.9716"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  className="input-field text-sm"
                  placeholder="e.g., 77.5946"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Location is used to calculate distances for blood requests and campaigns.
            </p>
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
const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 p-8">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="generate-token" element={<GenerateToken />} />
          <Route path="users" element={<UsersList />} />
          <Route path="ngos" element={<NgosList />} />
          <Route path="blood-banks" element={<BloodBanksList />} />
          <Route path="request-blood" element={<AdminRequestBlood />} />
          <Route path="profile" element={<AdminProfile />} />
        </Routes>
      </main>
    </div>
  )
}

export default AdminDashboard
