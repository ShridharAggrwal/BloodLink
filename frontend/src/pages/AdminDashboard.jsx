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
    { path: '/admin/pending', label: 'Pending Approvals', icon: '⏳' },
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
            <path d="M12 2c0 0-6 7.5-6 12a6 6 0 0 0 12 0c0-4.5-6-12-6-12z"/>
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
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              location.pathname === item.path
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
    pendingNgos: 0,
    pendingBloodBanks: 0,
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
    { label: 'Pending NGOs', value: stats.pendingNgos, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Pending Blood Banks', value: stats.pendingBloodBanks, icon: '⏳', color: 'bg-orange-50 text-orange-600' },
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

      {(stats.pendingNgos > 0 || stats.pendingBloodBanks > 0) && (
        <div className="card mt-6 border-yellow-200 bg-yellow-50/50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>⚠️</span> Action Required
          </h2>
          <p className="text-gray-600 mb-4">
            You have pending approvals that need your attention.
          </p>
          <Link to="/admin/pending" className="btn-primary inline-block">
            Review Approvals
          </Link>
        </div>
      )}
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
                className={`py-3 px-4 rounded-xl border text-center transition-all ${
                  type === 'ngo'
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
                className={`py-3 px-4 rounded-xl border text-center transition-all ${
                  type === 'blood_bank'
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

// Pending Approvals Section
const PendingApprovals = () => {
  const [pending, setPending] = useState({ ngos: [], bloodBanks: [] })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const fetchPending = async () => {
    try {
      const response = await api.get('/admin/pending-approvals')
      setPending(response.data)
    } catch (error) {
      console.log('Failed to fetch pending')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleApprove = async (type, id) => {
    try {
      await api.put(`/admin/approve/${type}/${id}`)
      setToast({ type: 'success', message: 'Approved successfully!' })
      fetchPending()
    } catch (error) {
      setToast({ type: 'error', message: 'Failed to approve' })
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pending Approvals</h1>
      
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <h2 className="text-lg font-semibold text-gray-900 mb-4">NGOs ({pending.ngos.length})</h2>
      {pending.ngos.length === 0 ? (
        <div className="card text-center py-8 mb-8">
          <p className="text-gray-500">No pending NGO approvals</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {pending.ngos.map((ngo) => (
            <div key={ngo.id} className="card flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{ngo.name}</h3>
                <p className="text-gray-500 text-sm">Owner: {ngo.owner_name}</p>
                <p className="text-gray-400 text-sm">{ngo.email}</p>
                <p className="text-gray-400 text-sm">{ngo.address}</p>
              </div>
              <button
                onClick={() => handleApprove('ngo', ngo.id)}
                className="btn-primary"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Blood Banks ({pending.bloodBanks.length})</h2>
      {pending.bloodBanks.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No pending Blood Bank approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.bloodBanks.map((bank) => (
            <div key={bank.id} className="card flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{bank.name}</h3>
                <p className="text-gray-500 text-sm">{bank.contact_info}</p>
                <p className="text-gray-400 text-sm">{bank.email}</p>
                <p className="text-gray-400 text-sm">{bank.address}</p>
              </div>
              <button
                onClick={() => handleApprove('blood_bank', bank.id)}
                className="btn-primary"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Users List Section
const UsersList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    fetchUsers()
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Users ({users.length})</h1>
      
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Blood Group</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Joined</th>
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
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    user.is_verified ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                  }`}>
                    {user.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-400 text-sm">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// NGOs List Section
const NgosList = () => {
  const [ngos, setNgos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    fetchNgos()
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">NGOs ({ngos.length})</h1>
      
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
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                ngo.is_approved ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
              }`}>
                {ngo.is_approved ? 'Approved' : 'Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Blood Banks List Section
const BloodBanksList = () => {
  const [bloodBanks, setBloodBanks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
    fetchBloodBanks()
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Blood Banks ({bloodBanks.length})</h1>
      
      <div className="space-y-4">
        {bloodBanks.map((bank) => (
          <div key={bank.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{bank.name}</h3>
                <p className="text-gray-500">{bank.contact_info}</p>
                <p className="text-gray-400 text-sm">{bank.email}</p>
              </div>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                bank.is_approved ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
              }`}>
                {bank.is_approved ? 'Approved' : 'Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Request Blood Section
const AdminRequestBlood = () => {
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
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
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
        const response = await api.get('/admin/profile')
        setFormData({
          name: response.data.name || '',
          age: response.data.age || '',
          gender: response.data.gender || '',
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
      await api.put('/admin/profile', formData)
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
          <Route path="pending" element={<PendingApprovals />} />
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
