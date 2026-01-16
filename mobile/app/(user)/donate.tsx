import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Linking, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';

interface BloodBank {
    id: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
    distance?: number;
    latitude?: number;
    longitude?: number;
}

export default function DonateScreen() {
    const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedBank, setSelectedBank] = useState<BloodBank | null>(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    const fetchNearbyBanks = async () => {
        try {
            const response = await api.get('/users/nearby');
            setBloodBanks(response.data.bloodBanks || []);
        } catch (error) {
            console.log('Error fetching blood banks:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNearbyBanks();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNearbyBanks();
    };

    const formatDistance = (meters?: number) => {
        if (!meters) return '';
        if (meters < 1000) return `${Math.round(meters)}m away`;
        return `${(meters / 1000).toFixed(1)}km away`;
    };

    const openDirections = (lat?: number, lng?: number) => {
        if (lat && lng) {
            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        }
    };

    const getNextDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 9; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push({
                key: date.toISOString().split('T')[0],
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            });
        }
        return days;
    };

    const handleBookAppointment = async () => {
        if (!selectedDate || !selectedBank) return;

        setBookingLoading(true);
        try {
            await api.post('/appointments', {
                blood_bank_id: selectedBank.id,
                appointment_date: selectedDate,
            });
            setShowBookingModal(false);
            setSelectedDate(null);
            setSelectedBank(null);
            // Show success
            alert('Appointment booked successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to book appointment');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#ef4444" />
                <Text className="text-gray-500 mt-4">Finding nearby blood banks...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">Donate Blood</Text>
                <Text className="text-gray-500 mt-1">Book an appointment at a nearby blood bank or respond to urgent requests</Text>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ef4444']} />}
            >
                <TouchableOpacity onPress={() => router.push('/(user)/alerts')}>
                    <LinearGradient
                        colors={['#ef4444', '#dc2626']}
                        style={{ borderRadius: 24, padding: 20, marginBottom: 16 }}
                    >
                        <View className="flex-row items-center mb-2">
                            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                                <Feather name="bell" size={20} color="white" />
                            </View>
                            <Text className="text-white text-lg font-bold ml-3">View Alerts</Text>
                        </View>
                        <Text className="text-white/80">
                            Respond to urgent blood requests and join donation campaigns near you
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Explore Nearby Card */}
                <TouchableOpacity
                    onPress={() => router.push('/(user)/nearby')}
                    style={{ backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#e5e7eb' }}
                >
                    <View className="flex-row items-center mb-2">
                        <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                            <Feather name="map-pin" size={20} color="#374151" />
                        </View>
                        <Text className="text-gray-900 text-lg font-bold ml-3">Explore Nearby</Text>
                    </View>
                    <Text className="text-gray-500">
                        Find donation campaigns and blood banks in your area
                    </Text>
                </TouchableOpacity>

                {/* Nearby Blood Banks */}
                <Text className="text-lg font-bold text-gray-900 mb-4">Nearby Blood Banks</Text>

                {bloodBanks.length === 0 ? (
                    <View className="bg-white rounded-2xl p-8 items-center border border-gray-100">
                        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                            <Feather name="home" size={28} color="#9ca3af" />
                        </View>
                        <Text className="text-gray-900 font-semibold mb-1">No Blood Banks Nearby</Text>
                        <Text className="text-gray-500 text-center text-sm">
                            Please update your location in your profile to find blood banks near you.
                        </Text>
                    </View>
                ) : (
                    bloodBanks.map((bank) => (
                        <View key={bank.id} className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                            <View className="flex-row items-start">
                                <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
                                    <Feather name="home" size={24} color="#6b7280" />
                                </View>
                                <View className="flex-1 ml-3">
                                    <View className="flex-row items-center flex-wrap">
                                        <Text className="text-lg font-bold text-gray-900">{bank.name}</Text>
                                        {bank.distance && (
                                            <View className="bg-gray-100 px-2 py-0.5 rounded-full ml-2">
                                                <Text className="text-gray-500 text-xs">{formatDistance(bank.distance)}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-gray-500 text-sm mt-1">{bank.address}</Text>
                                </View>
                            </View>

                            <View className="flex-row mt-4 gap-3">
                                <TouchableOpacity
                                    onPress={() => openDirections(bank.latitude, bank.longitude)}
                                    className="flex-row items-center px-4 py-2 bg-gray-100 rounded-xl"
                                >
                                    <Feather name="navigation" size={16} color="#4b5563" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedBank(bank);
                                        setShowBookingModal(true);
                                    }}
                                    className="flex-1 flex-row items-center justify-center py-3 bg-rose-500 rounded-xl"
                                >
                                    <Feather name="calendar" size={16} color="white" />
                                    <Text className="text-white font-bold ml-2">Book Appointment</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
                <View className="h-8" />
            </ScrollView>

            {/* Book Appointment Modal */}
            <Modal visible={showBookingModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <TouchableOpacity
                            onPress={() => {
                                setShowBookingModal(false);
                                setSelectedDate(null);
                            }}
                            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                        >
                            <Feather name="x" size={20} color="#6b7280" />
                        </TouchableOpacity>

                        <Text className="text-xl font-bold text-gray-900 mb-1">Book Appointment</Text>
                        <Text className="text-gray-500 mb-6">Blood Bank</Text>

                        {/* Bank Info */}
                        <View className="bg-gray-50 rounded-xl p-4 mb-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-gray-200 rounded-lg items-center justify-center">
                                    <Feather name="home" size={20} color="#6b7280" />
                                </View>
                                <View className="ml-3">
                                    <Text className="text-gray-900 font-bold">Blood Bank</Text>
                                    <View className="flex-row items-center">
                                        <Feather name="map-pin" size={12} color="#9ca3af" />
                                        <Text className="text-gray-500 text-sm ml-1">{selectedBank?.address}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Date Selector */}
                        <View className="flex-row items-center mb-3">
                            <Feather name="calendar" size={16} color="#6b7280" />
                            <Text className="text-gray-700 font-medium ml-2">Select Date</Text>
                        </View>

                        <View className="flex-row flex-wrap gap-2 mb-6">
                            {getNextDays().map((day) => (
                                <TouchableOpacity
                                    key={day.key}
                                    onPress={() => setSelectedDate(day.key)}
                                    className={`px-4 py-2 rounded-full border ${selectedDate === day.key
                                        ? 'bg-gray-900 border-gray-900'
                                        : 'bg-white border-gray-200'
                                        }`}
                                >
                                    <Text className={`text-sm ${selectedDate === day.key ? 'text-white' : 'text-gray-700'}`}>
                                        {day.day}, {day.date}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Confirm Button */}
                        <TouchableOpacity
                            onPress={handleBookAppointment}
                            disabled={!selectedDate || bookingLoading}
                        >
                            <LinearGradient
                                colors={selectedDate ? ['#f43f5e', '#e11d48'] : ['#fda4af', '#fda4af']}
                                className="py-4 rounded-xl items-center"
                            >
                                {bookingLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-lg">Confirm Booking</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
