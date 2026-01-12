import { useState, useEffect } from 'react'
import { X, Calendar, Clock, Loader2, CheckCircle2, MapPin, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'
import api from '../../services/api'

const BookAppointmentModal = ({ isOpen, onClose, bloodBank, onBookingComplete }) => {
    const [selectedDate, setSelectedDate] = useState('')
    const [availableSlots, setAvailableSlots] = useState([])
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [slotsLoading, setSlotsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const [bookingDetails, setBookingDetails] = useState(null)

    // Generate next 14 days for date selection
    const getAvailableDates = () => {
        const dates = []
        const today = new Date()
        for (let i = 1; i <= 14; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            dates.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
            })
        }
        return dates
    }

    const availableDates = getAvailableDates()

    useEffect(() => {
        if (selectedDate && bloodBank?.id) {
            fetchSlots()
        }
    }, [selectedDate, bloodBank?.id])

    const fetchSlots = async () => {
        setSlotsLoading(true)
        setError(null)
        setSelectedSlot(null)
        try {
            const response = await api.get(`/appointments/slots/${bloodBank.id}?date=${selectedDate}`)
            setAvailableSlots(response.data.slots || [])
        } catch (err) {
            setError('Failed to load available slots')
            setAvailableSlots([])
        } finally {
            setSlotsLoading(false)
        }
    }

    const handleBook = async () => {
        if (!selectedSlot) return

        setLoading(true)
        setError(null)
        try {
            const response = await api.post('/appointments/book', {
                slotId: selectedSlot.id,
                notes: notes.trim() || null
            })

            setSuccess(true)
            setBookingDetails(response.data.bankDetails)
            onBookingComplete?.()
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to book appointment')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setSelectedDate('')
        setAvailableSlots([])
        setSelectedSlot(null)
        setNotes('')
        setError(null)
        setSuccess(false)
        setBookingDetails(null)
        onClose()
    }

    const formatTime = (time) => {
        if (!time) return ''
        const [hours, minutes] = time.split(':')
        const h = parseInt(hours)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const hour = h % 12 || 12
        return `${hour}:${minutes} ${ampm}`
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Book Appointment</h2>
                        <p className="text-sm text-slate-500">{bloodBank?.name}</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {success ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Booking Confirmed!</h3>
                            <p className="text-slate-500 mb-6">Your appointment has been scheduled.</p>

                            {bookingDetails && (
                                <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-600">{bookingDetails.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-600">{new Date(bookingDetails.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-600">{formatTime(bookingDetails.time)}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleClose}
                                className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Bank Info */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <h3 className="font-semibold text-slate-800 mb-1">{bloodBank?.name}</h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    {bloodBank?.address || 'Address not available'}
                                </p>
                            </div>

                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Select Date
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1">
                                    {availableDates.map((date) => (
                                        <button
                                            key={date.value}
                                            onClick={() => setSelectedDate(date.value)}
                                            className={cn(
                                                "px-3 py-2 text-xs font-medium rounded-lg border transition-all",
                                                selectedDate === date.value
                                                    ? "bg-rose-600 text-white border-rose-600"
                                                    : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:bg-rose-50"
                                            )}
                                        >
                                            {date.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Slots */}
                            {selectedDate && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Clock className="w-4 h-4 inline mr-1" />
                                        Select Time Slot
                                    </label>

                                    {slotsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
                                        </div>
                                    ) : availableSlots.length === 0 ? (
                                        <div className="text-center py-6 bg-slate-50 rounded-xl">
                                            <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500">No slots available for this date</p>
                                            <p className="text-xs text-slate-400 mt-1">Try selecting another date</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {availableSlots.map((slot) => (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => setSelectedSlot(slot)}
                                                    className={cn(
                                                        "px-3 py-3 text-sm font-medium rounded-lg border transition-all",
                                                        selectedSlot?.id === slot.id
                                                            ? "bg-rose-600 text-white border-rose-600"
                                                            : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:bg-rose-50"
                                                    )}
                                                >
                                                    <span className="block">{formatTime(slot.start_time)}</span>
                                                    <span className="block text-xs opacity-70 mt-0.5">
                                                        {slot.available_slots} spot{slot.available_slots > 1 ? 's' : ''} left
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notes */}
                            {selectedSlot && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Any additional information..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none h-20 text-sm"
                                    />
                                </div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!success && (
                    <div className="p-6 border-t border-slate-200 shrink-0">
                        <button
                            onClick={handleBook}
                            disabled={!selectedSlot || loading}
                            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-lg shadow-rose-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Booking...
                                </>
                            ) : (
                                'Confirm Booking'
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default BookAppointmentModal
