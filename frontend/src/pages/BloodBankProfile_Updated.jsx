// Updated Blood Bank Profile Component with Location Support
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Modal from '../components/common/Modal'
import Toast from '../components/common/Toast'

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
                setFormData({
                    name: response.data.name || '',
                    contact_info: response.data.contact_info || '',
                    address: response.data.address || '',
                    latitude: response.data.lat || '',
                    longitude: response.data.lng || ''
                })
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
            const response = await api.put('/blood-bank/profile', {
                ...formData,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null
            })
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

                    {/* Location Section */}
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

export default BloodBankProfile
