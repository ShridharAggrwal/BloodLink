import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import api from '../services/api'
import Modal from '../components/common/Modal'
import Toast from '../components/common/Toast'
import LocationPicker from '../components/common/LocationPicker'
import DetailsModal from '../components/common/DetailsModal'
import DashboardLayout from '../components/layout/DashboardLayout'
import ImageUpload from '../components/common/ImageUpload'
import PrescriptionUpload from '../components/common/PrescriptionUpload'
import BookAppointmentModal from '../components/common/BookAppointmentModal'
import {
  BarChart3,
  Droplets,
  Syringe,
  ClipboardList,
  Bell,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Calendar,
  Building2,
  Heart,
  CalendarPlus,
  Image as ImageIcon,
  Eye
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'


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

  const statCards = [
    { label: "Donations Made", value: stats.donations, icon: Droplets, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100", link: "/dashboard/history" },
    { label: "Blood Requests", value: stats.requests, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", link: "/dashboard/history" },
    { label: "Active Alerts", value: alerts.length, icon: Bell, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", link: "/dashboard/alerts" },
    { label: "Lives Impacted", value: stats.donations * 3, icon: Heart, color: "text-red-600", bg: "bg-red-50", border: "border-red-100", link: "/dashboard/history" },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="text-center shrink-0">
        <h1 className="text-3xl font-bold font-serif text-slate-900 mb-2">Dashboard Overview</h1>
        <p className="text-slate-500">Track your blood donation journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        {statCards.map((stat) => (
          <Link to={stat.link} key={stat.label} className="block group">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between group-hover:-translate-y-1">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-xl transition-colors", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
              </div>
              <div className="mt-auto">
                <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Section: Quick Actions & Profile Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-center">
          <h2 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 grow">
            <Link to="/dashboard/donate" className="group">
              <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-8 hover:border-rose-200 hover:bg-rose-50/30 transition-all flex items-center gap-5 h-full">
                <div className="p-4 bg-white text-rose-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  <Droplets className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-800 text-sm block mb-0.5">Donate Blood</span>
                  <span className="text-xs text-slate-500 font-medium">Register Donation</span>
                </div>
              </div>
            </Link>
            <Link to="/dashboard/nearby" className="group">
              <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-8 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center gap-5 h-full">
                <div className="p-4 bg-white text-blue-600 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-800 text-sm block mb-0.5">Find Nearby</span>
                  <span className="text-xs text-slate-500 font-medium">Banks & Drives</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Profile/Health Status */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">My Health Pulse</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 rounded-full border border-rose-100">
              <User className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-rose-700">Active</span>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500 tracking-wider">
                <span>Blood Group</span>
                <span className="text-slate-900">{user?.blood_group || 'N/A'}</span>
              </div>
              <div className="w-full bg-slate-100 h-3 overflow-hidden rounded-full">
                <div className="h-full bg-rose-500 w-full" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500 tracking-wider">
                <span>Location Status</span>
                <span className="text-slate-900">{user?.latitude ? 'Active' : 'Missing'}</span>
              </div>
              <div className="w-full bg-slate-100 h-3 overflow-hidden rounded-full">
                <div className={cn("h-full w-full", user?.latitude ? "bg-emerald-500" : "bg-slate-300")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Request Blood Section
const RequestBlood = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    blood_group: '',
    units_needed: 1,
    address: '',
    latitude: '',
    longitude: '',
    prescription_image_url: ''
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [prescriptionVerified, setPrescriptionVerified] = useState(false)

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  // Profile coordinates for "Use Profile Location" button
  const profileCoords = user?.latitude && user?.longitude ? {
    lat: parseFloat(user.latitude),
    lng: parseFloat(user.longitude)
  } : null

  const handleLocationChange = (coords) => {
    setFormData(prev => ({
      ...prev,
      latitude: coords.lat.toString(),
      longitude: coords.lng.toString()
    }))
  }

  const handlePrescriptionChange = (url) => {
    setFormData(prev => ({ ...prev, prescription_image_url: url }))
  }

  const handlePrescriptionVerification = (isValid, url) => {
    setPrescriptionVerified(isValid)
    if (!isValid) {
      setFormData(prev => ({ ...prev, prescription_image_url: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.latitude || !formData.longitude) {
      setToast({ type: 'error', message: 'Location is required. Please select a location on the map.' })
      return
    }

    if (!formData.prescription_image_url) {
      setToast({ type: 'error', message: 'Please upload a verified prescription image.' })
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/blood-requests', formData)
      setToast({ type: 'success', message: `Request created! ${response.data.alertsSent} donors notified.` })
      setFormData({ blood_group: '', units_needed: 1, address: '', latitude: '', longitude: '', prescription_image_url: '' })
      setPrescriptionVerified(false)
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to create request' })
    } finally {
      setLoading(false)
    }
  }

  const currentCoords = formData.latitude && formData.longitude ? {
    lat: parseFloat(formData.latitude),
    lng: parseFloat(formData.longitude)
  } : null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Request Blood</h1>
        <p className="text-slate-500">Create a blood request to notify nearby donors</p>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Blood Group</label>
              <select
                value={formData.blood_group}
                onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all appearance-none"
                required
              >
                <option value="">Select Type</option>
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Units Needed</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.units_needed}
                onChange={(e) => setFormData({ ...formData, units_needed: parseInt(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                required
              />
            </div>
          </div>

          {/* Prescription Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Prescription Image <span className="text-red-500">*</span>
            </label>
            <PrescriptionUpload
              value={formData.prescription_image_url}
              onChange={handlePrescriptionChange}
              onVerificationComplete={handlePrescriptionVerification}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Location / Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none h-20"
              placeholder="Enter the address where blood is needed"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Request Location</label>
            <p className="text-xs text-slate-500 mb-3">Donors within 35km will be notified. Click on map or search to select location.</p>
            <LocationPicker
              value={currentCoords}
              onChange={handleLocationChange}
              profileCoordinates={profileCoords}
              showProfileButton={!!profileCoords}
              placeholder="Search for location..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !prescriptionVerified}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Request...' : 'Broadcast Request'}
          </button>
        </form>
      </div>
    </div>
  )
}


// Donate Blood Section - Now features nearby blood banks for appointment booking
const DonateBlood = () => {
  const navigate = useNavigate()
  const [bloodBanks, setBloodBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState(null)

  const formatDistance = (meters) => {
    if (!meters) return ''
    if (meters < 1000) return `${Math.round(meters)}m`
    return `${(meters / 1000).toFixed(1)}km`
  }

  useEffect(() => {
    const fetchNearbyBanks = async () => {
      try {
        const response = await api.get('/users/nearby')
        setBloodBanks(response.data.bloodBanks || [])
      } catch (error) {
        setToast({ type: 'error', message: error.response?.data?.error || 'Failed to load nearby blood banks' })
      } finally {
        setLoading(false)
      }
    }
    fetchNearbyBanks()
  }, [])

  const openDirections = (bank) => {
    if (bank.latitude && bank.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${bank.latitude},${bank.longitude}`, '_blank')
    }
  }

  const openBooking = (bank) => {
    setSelectedBank(bank)
    setShowBookingModal(true)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Donate Blood</h1>
        <p className="text-slate-500">Book an appointment at a nearby blood bank or respond to urgent requests</p>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/dashboard/alerts')}
          className="bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-2xl p-6 text-left hover:from-rose-600 hover:to-red-700 transition-all shadow-lg shadow-red-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-6 h-6" />
            <span className="text-lg font-bold">View Alerts</span>
          </div>
          <p className="text-sm text-white/80">Respond to urgent blood requests and join donation campaigns near you</p>
        </button>

        <button
          onClick={() => navigate('/dashboard/nearby')}
          className="bg-white border border-slate-200 rounded-2xl p-6 text-left hover:shadow-lg hover:border-rose-200 transition-all"
        >
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-6 h-6 text-slate-700" />
            <span className="text-lg font-bold text-slate-800">Explore Nearby</span>
          </div>
          <p className="text-sm text-slate-500">Find donation campaigns and blood banks in your area</p>
        </button>
      </div>

      {/* Nearby Blood Banks */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Nearby Blood Banks</h2>

        {bloodBanks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">No Blood Banks Nearby</h3>
            <p className="text-slate-500 text-sm">Please update your location in your profile to find blood banks near you.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bloodBanks.map((bank) => (
              <div key={bank.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800">{bank.name}</span>
                        {bank.distance && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                            {formatDistance(bank.distance)} away
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm line-clamp-1">{bank.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openDirections(bank)}
                      className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 border border-slate-200"
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="hidden sm:inline">Directions</span>
                    </button>
                    <button
                      onClick={() => openBooking(bank)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <BookAppointmentModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        bloodBank={selectedBank}
        onBookingComplete={() => setToast({ type: 'success', message: 'Appointment booked successfully!' })}
        onError={(message) => setToast({ type: 'error', message })}
      />
    </div>
  )
}


// History Section
const History = () => {
  const [history, setHistory] = useState({ donations: [], requests: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('donations')
  const [toast, setToast] = useState(null)


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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">History</h1>
        <p className="text-slate-500">View your donation and request history</p>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex gap-4 p-1 bg-white border border-slate-200 rounded-xl w-fit shadow-sm">
        <button
          onClick={() => setActiveTab('donations')}
          className={`px-6 py-2 rounded-lg transition-all duration-300 font-medium text-sm ${activeTab === 'donations' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          Donations ({history.donations.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-2 rounded-lg transition-all duration-300 font-medium text-sm ${activeTab === 'requests' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          Requests ({history.requests.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'donations' ? (
          history.donations.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No donations yet</div>
          ) : (
            history.donations.map((donation) => (
              <div key={donation.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold text-rose-600">{donation.blood_group}</span>
                    <span className="text-slate-500 text-sm">• {donation.units} unit(s)</span>
                  </div>
                  <p className="text-sm text-slate-500">{new Date(donation.donated_at).toLocaleDateString()}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </div>
              </div>
            ))
          )
        ) : (
          history.requests.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No requests yet</div>
          ) : (
            history.requests.map((request) => (
              <div key={request.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-red-200">
                      {request.blood_group}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{request.units_needed} Unit(s) Needed</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${request.status === 'active' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          request.status === 'accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            request.status === 'fulfilled' ? 'bg-green-50 text-green-700 border-green-200' :
                              'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{request.address}</p>
                      <p className="text-xs text-slate-400">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Accepted status - show accepter info and actions */}
                {request.status === 'accepted' && request.accepter_name && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-sm font-medium text-blue-800 mb-1">
                      Accepted by: {request.accepter_name}
                    </p>
                    {request.accepter_contact && (
                      <p className="text-xs text-blue-600">Contact: {request.accepter_contact}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={async () => {
                          try {
                            await api.put(`/blood-requests/${request.id}/confirm-fulfilled`)
                            setToast({ type: 'success', message: 'Request marked as fulfilled!' })
                            // Refresh
                            const response = await api.get('/users/history')
                            setHistory(response.data)
                          } catch (error) {
                            setToast({ type: 'error', message: error.response?.data?.error || 'Failed to confirm' })
                          }
                        }}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        ✓ Blood Received
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await api.put(`/blood-requests/${request.id}/report-unresponsive`)
                            setToast({ type: 'success', message: 'Request is now available to others' })
                            const response = await api.get('/users/history')
                            setHistory(response.data)
                          } catch (error) {
                            setToast({ type: 'error', message: error.response?.data?.error || 'Failed to report' })
                          }
                        }}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Not Responding
                      </button>
                    </div>
                  </div>
                )}

                {/* Show last cancellation reason if request was cancelled by accepter */}
                {request.status === 'active' && request.last_cancel_reason && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <p className="text-sm font-medium text-amber-800 mb-1">
                      ⚠️ {request.last_cancelled_by_name || 'Previous accepter'} cancelled their acceptance
                    </p>
                    <p className="text-xs text-amber-600">Reason: {request.last_cancel_reason}</p>
                    <p className="text-xs text-amber-500 mt-1">Your request is now available to others again.</p>
                  </div>
                )}
              </div>
            ))
          )
        )}

      </div>
    </div>
  )
}

// Alerts Section
const Alerts = () => {
  const { alerts } = useSocket()
  const [data, setData] = useState({ requests: [], campaigns: [] })
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, nearbyRes] = await Promise.all([
          api.get('/blood-requests/alerts'),
          api.get('/users/nearby')
        ])
        setData({
          requests: requestsRes.data,
          campaigns: nearbyRes.data.campaigns
        })
      } catch (error) {
        console.log('Failed to fetch alerts')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [alerts])

  const handleAccept = async (requestId) => {
    try {
      await api.put(`/blood-requests/${requestId}/accept`)
      setToast({ type: 'success', message: 'Request accepted! Please contact the requester.' })
      setData(prev => ({ ...prev, requests: prev.requests.filter(a => a.id !== requestId) }))
      setSelectedRequest(null)
    } catch (error) {
      setToast({ type: 'error', message: error.response?.data?.error || 'Failed to accept' })
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div></div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Alerts & Campaigns</h1>
        <p className="text-slate-500">Stay updated with emergency requests and donation drives nearby</p>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="grid lg:grid-cols-2 gap-8">

        {/* Emergency Requests Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Emergency Requests</h2>
          </div>

          {data.requests.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm h-64 flex flex-col items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No emergency requests nearby</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.requests.map((alert) => (
                <div key={alert.id} className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${alert.is_accepted ? 'border-amber-200' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${alert.is_accepted ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {alert.blood_group}
                      </div>
                      <div>
                        <span className="block font-bold text-slate-800 text-sm">Blood Request</span>
                        <span className="text-xs text-slate-500 block">{new Date(alert.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold border border-red-100">
                        {alert.units_needed} Unit(s)
                      </span>
                      {alert.is_accepted && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Availability message for accepted requests */}
                  {alert.is_accepted && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-3 text-xs text-amber-700">
                      ⏳ {alert.availability_message || 'This request has been accepted but not yet fulfilled. It may become available again.'}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-slate-400" />
                    <span className="truncate">{alert.address}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedRequest(alert)}
                      className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${alert.latitude},${alert.longitude}`, '_blank')}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MapPin className="w-4 h-4" />
                      Directions
                    </button>
                    <button
                      onClick={() => handleAccept(alert.id)}
                      disabled={alert.is_accepted}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm ${alert.is_accepted
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
                        }`}
                    >
                      {alert.is_accepted ? 'Accepted' : 'Accept'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaigns Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Upcoming Campaigns</h2>
          </div>

          {data.campaigns.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm h-64 flex flex-col items-center justify-center">
              <Calendar className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No active campaigns nearby</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-800">{campaign.title}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                      Campaign
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{campaign.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'Date TBD'}
                        {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-500">
                      Organizer: <span className="text-slate-700">{campaign.ngo_name || 'NGO'}</span>
                    </div>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${campaign.latitude},${campaign.longitude}`, '_blank')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" /> Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Blood Request Details Modal */}
      {selectedRequest && (
        <Modal isOpen={true} onClose={() => setSelectedRequest(null)} title="Blood Request Details">
          <div className="space-y-6">
            {/* Requester Info */}
            <div className="flex items-center gap-4">
              {selectedRequest.requester?.profile_image_url ? (
                <img
                  src={selectedRequest.requester.profile_image_url}
                  alt="Requester"
                  className="w-16 h-16 rounded-full object-cover border-2 border-rose-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedRequest.requester?.name?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg text-slate-800">{selectedRequest.requester?.name || 'Unknown'}</h3>
                {selectedRequest.requester?.phone && (
                  <a href={`tel:${selectedRequest.requester.phone}`} className="text-sm text-blue-600 hover:underline">
                    {selectedRequest.requester.phone}
                  </a>
                )}
                {selectedRequest.requester?.email && (
                  <p className="text-sm text-slate-500">{selectedRequest.requester.email}</p>
                )}
              </div>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-50 rounded-xl p-4 text-center border border-rose-100">
                <p className="text-3xl font-bold text-rose-600">{selectedRequest.blood_group}</p>
                <p className="text-xs text-rose-500 font-medium">Blood Group</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                <p className="text-3xl font-bold text-slate-700">{selectedRequest.units_needed}</p>
                <p className="text-xs text-slate-500 font-medium">Units Needed</p>
              </div>
            </div>

            {/* Address */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600 flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0" />
                {selectedRequest.address}
              </p>
            </div>

            {/* Prescription Image */}
            {selectedRequest.prescription_image_url && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Prescription</p>
                <img
                  src={selectedRequest.prescription_image_url}
                  alt="Prescription"
                  className="w-full max-h-64 object-contain rounded-xl border border-slate-200 bg-white p-2"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedRequest.latitude},${selectedRequest.longitude}`, '_blank')}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" /> Get Directions
              </button>
              <button
                onClick={() => handleAccept(selectedRequest.id)}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-red-200"
              >
                Accept & Donate
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// Nearby Section - Explore Campaigns & Blood Banks
const Nearby = () => {
  const [data, setData] = useState({ campaigns: [], bloodBanks: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('campaigns')
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedBank, setSelectedBank] = useState(null)

  const formatDistance = (meters) => {
    if (!meters) return ''
    if (meters < 1000) return `${Math.round(meters)}m`
    return `${(meters / 1000).toFixed(1)}km`
  }

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        const response = await api.get('/users/nearby')
        setData(response.data)
      } catch (error) {
        setToast({ type: 'error', message: error.response?.data?.error || 'Failed to load nearby locations' })
      } finally {
        setLoading(false)
      }
    }
    fetchNearby()
  }, [])

  const openDetails = (item, type) => {
    setSelectedItem(item)
    setModalType(type)
    setShowModal(true)
  }

  const openDirections = (item) => {
    if (item.latitude && item.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`, '_blank')
    }
  }

  const openBooking = (bank) => {
    setSelectedBank(bank)
    setShowBookingModal(true)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Explore Nearby</h1>
        <p className="text-slate-500">Discover blood donation campaigns and blood banks in your area</p>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Tabs */}
      <div className="flex gap-2 sm:gap-4 p-1 bg-white border border-slate-200 rounded-xl w-fit shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 sm:px-6 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 'campaigns' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          <Calendar className="w-4 h-4" />
          <span className="hidden sm:inline">Campaigns</span> ({data.campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('bloodbanks')}
          className={`px-4 sm:px-6 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === 'bloodbanks' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
        >
          <Building2 className="w-4 h-4" />
          <span className="hidden sm:inline">Blood Banks</span> ({data.bloodBanks.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'campaigns' ? (
        data.campaigns.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Campaigns Nearby</h3>
            <p className="text-slate-500">There are no active blood donation campaigns in your area.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {data.campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-7 h-7 text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-slate-800">{campaign.title}</span>
                        {campaign.distance && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                            {formatDistance(campaign.distance)} away
                          </span>
                        )}
                        {campaign.health_checkup_available && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1 border border-slate-200">
                            <Heart className="w-3 h-3" /> Health Checkup
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm mb-1">by {campaign.ngo_name}</p>
                      <p className="text-slate-500 text-xs">{campaign.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openDirections(campaign)}
                      className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 border border-slate-200"
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="hidden sm:inline">Directions</span>
                    </button>
                    <button
                      onClick={() => openDetails(campaign, 'campaign')}
                      className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        data.bloodBanks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No Blood Banks Nearby</h3>
            <p className="text-slate-500">There are no blood banks in your area.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {data.bloodBanks.map((bank) => (
              <div key={bank.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-7 h-7 text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-slate-800">{bank.name}</span>
                        {bank.distance && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                            {formatDistance(bank.distance)} away
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-sm mb-2">{bank.address}</p>
                      {/* Stock Preview */}
                      {bank.stock && Object.keys(bank.stock).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(bank.stock).slice(0, 4).map(([group, units]) => (
                            <span key={group} className={`px-2 py-0.5 rounded text-xs font-medium border ${units > 0 ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              {group}: {units}
                            </span>
                          ))}
                          {Object.keys(bank.stock).length > 4 && (
                            <span className="px-2 py-0.5 rounded text-xs text-slate-400">+{Object.keys(bank.stock).length - 4} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openDirections(bank)}
                      className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 border border-slate-200"
                    >
                      <MapPin className="w-4 h-4" />
                      <span className="hidden sm:inline">Directions</span>
                    </button>
                    <button
                      onClick={() => openDetails(bank, 'bloodbank')}
                      className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-medium transition-all"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => openBooking(bank)}
                      className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-medium transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      <span className="hidden sm:inline">Book Appointment</span>
                      <span className="sm:hidden">Book</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Details Modal */}
      <DetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={modalType}
        data={selectedItem}
      />

      {/* Booking Modal */}
      <BookAppointmentModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        bloodBank={selectedBank}
        onBookingComplete={() => setToast({ type: 'success', message: 'Appointment booked successfully!' })}
        onError={(message) => setToast({ type: 'error', message })}
      />
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
    address: '',
    latitude: '',
    longitude: '',
    profile_image_url: ''
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
          address: response.data.address || '',
          latitude: response.data.lat || '',
          longitude: response.data.lng || '',
          profile_image_url: response.data.profile_image_url || ''
        })
      } catch (error) {
        console.log('Failed to fetch profile')
      }
    }
    fetchProfile()
  }, [])


  const handleLocationChange = (coords) => {
    setFormData(prev => ({
      ...prev,
      latitude: coords.lat.toString(),
      longitude: coords.lng.toString()
    }))
  }

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

  const InputField = ({ label, ...props }) => (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium placeholder:text-slate-400" {...props} />
    </div>
  )

  const currentCoords = formData.latitude && formData.longitude ? {
    lat: parseFloat(formData.latitude),
    lng: parseFloat(formData.longitude)
  } : null

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Profile</h1>
        <p className="text-slate-500">Manage your personal information</p>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Personal Information</h2>
            <form id="profileForm" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <InputField label="Full Name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <InputField label="Email Address" type="email" value={user?.email} disabled className="bg-slate-100 text-slate-500 cursor-not-allowed" />
                <InputField label="Phone Number" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Blood Group</label>
                  <select
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-medium"
                  >
                    <option value="">Select Type</option>
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none h-24 font-medium"
                />
              </div>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-800">Location</h2>
              <p className="text-sm text-slate-500">Click on the map or search to set your location</p>
            </div>
            <LocationPicker
              value={currentCoords}
              onChange={handleLocationChange}
              showProfileButton={false}
              placeholder="Search for your location..."
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 text-center">Profile Picture</h3>
            <div className="flex justify-center">
              <ImageUpload
                value={formData.profile_image_url}
                onChange={(url) => setFormData({ ...formData, profile_image_url: url })}
                folder="profiles"
                size="lg"
                shape="circle"
              />
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
            <h3 className="font-bold text-slate-800 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button
                type="submit"
                form="profileForm"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-slate-200"
              >
                {loading ? 'Saving Changes...' : 'Save Profile'}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="w-full bg-white border border-slate-200 text-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 transition-all"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>


      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <InputField label="Current Password" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
          <InputField label="New Password" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />
          <InputField label="Confirm New Password" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required />
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-200"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

const UserDashboard = () => {
  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: BarChart3 },
    { path: '/dashboard/donate', label: 'Donate Blood', icon: Droplets },
    { path: '/dashboard/request', label: 'Request Blood', icon: Syringe },
    { path: '/dashboard/history', label: 'History', icon: ClipboardList },
    { path: '/dashboard/alerts', label: 'Alerts', icon: Bell },
    { path: '/dashboard/nearby', label: 'Nearby', icon: MapPin },
    { path: '/dashboard/profile', label: 'Profile', icon: User },
  ]

  return (
    <DashboardLayout navItems={navItems} portalName="User Portal">
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/donate" element={<DonateBlood />} />
        <Route path="/request" element={<RequestBlood />} />
        <Route path="/history" element={<History />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/nearby" element={<Nearby />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </DashboardLayout>
  )
}

export default UserDashboard
