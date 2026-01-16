import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, FlatList, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '@/services/api';

const VIOLET_500 = '#8b5cf6';
const VIOLET_100 = '#ede9fe';

interface TimeSlot {
    day_of_week: number;
    start_time: string;
    end_time: string;
    max_bookings: number;
}

interface Booking {
    id: string;
    appointment_date: string;
    status: string;
    slot: {
        start_time: string;
        end_time: string;
    };
    user: {
        name: string;
        email: string;
    };
}

export default function AppointmentsScreen() {
    const [activeTab, setActiveTab] = useState<'slots' | 'bookings'>('slots');
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Default template from website
    const defaultTimeSlots = [
        { start_time: '09:00', end_time: '10:00' },
        { start_time: '10:00', end_time: '11:00' },
        { start_time: '11:00', end_time: '12:00' },
        { start_time: '14:00', end_time: '15:00' },
        { start_time: '15:00', end_time: '16:00' },
        { start_time: '16:00', end_time: '17:00' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [slotsRes, bookingsRes] = await Promise.all([
                api.get('/appointments/bank-defaults'),
                api.get('/appointments/bank-bookings')
            ]);
            setSlots(slotsRes.data || []);
            setBookings(bookingsRes.data || []);
        } catch (error) {
            console.log('Error fetching appointments data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const toggleDayActive = async (dayIndex: number) => {
        setSaving(true);
        try {
            // Check if day has slots
            const currentDaySlots = slots.filter(s => s.day_of_week === dayIndex);

            let newSlots = [];
            if (currentDaySlots.length > 0) {
                // Remove slots for this day
                newSlots = slots.filter(s => s.day_of_week !== dayIndex);
            } else {
                // Add default slots for this day
                const slotsToAdd = defaultTimeSlots.map(time => ({
                    day_of_week: dayIndex,
                    start_time: time.start_time,
                    end_time: time.end_time,
                    max_bookings: 5
                }));
                newSlots = [...slots, ...slotsToAdd];
            }

            await api.post('/appointments/bank-defaults', { slots: newSlots });
            setSlots(newSlots); // Optimistic update
        } catch (error) {
            Alert.alert('Error', 'Failed to update schedule');
            fetchData(); // Revert
        } finally {
            setSaving(false);
        }
    };

    const isDayActive = (dayIndex: number) => {
        return slots.some(s => s.day_of_week === dayIndex);
    };

    const formatTime = (time: string) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = h % 12 || 12;
        return `${hour}:${minutes} ${ampm}`;
    };

    const renderBooking = ({ item }: { item: Booking }) => (
        <View className="bg-white rounded-2xl p-4 mb-3 border border-violet-100 shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className="text-lg font-bold text-slate-800">{new Date(item.appointment_date).toLocaleDateString()}</Text>
                    <Text className="text-violet-600 font-medium">
                        {item.slot.start_time} - {item.slot.end_time}
                    </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${item.status === 'confirmed' ? 'bg-green-100' : 'bg-amber-100'}`}>
                    <Text className={`text-xs font-bold ${item.status === 'confirmed' ? 'text-green-700' : 'text-amber-700'}`}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
            <View className="flex-row items-center mt-2">
                <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center">
                    <Feather name="user" size={14} color="#64748b" />
                </View>
                <View className="ml-3">
                    <Text className="text-sm font-medium text-slate-900">{item.user.name}</Text>
                    <Text className="text-xs text-slate-500">{item.user.email}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-14 pb-4 px-6 bg-white border-b border-violet-100">
                <Text className="text-2xl font-bold text-slate-900">Appointments</Text>
                <Text className="text-slate-500 mt-1">Manage slots and bookings</Text>
            </View>

            <View className="flex-row mx-6 mt-4 bg-white rounded-xl p-1 border border-violet-100 shadow-sm">
                <TouchableOpacity
                    onPress={() => setActiveTab('slots')}
                    className={`flex-1 py-3 rounded-lg ${activeTab === 'slots' ? 'bg-violet-500' : ''}`}
                >
                    <Text className={`text-center font-medium ${activeTab === 'slots' ? 'text-white' : 'text-slate-500'}`}>Schedule</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('bookings')}
                    className={`flex-1 py-3 rounded-lg ${activeTab === 'bookings' ? 'bg-violet-500' : ''}`}
                >
                    <Text className={`text-center font-medium ${activeTab === 'bookings' ? 'text-white' : 'text-slate-500'}`}>Bookings</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={VIOLET_500} />
                </View>
            ) : activeTab === 'bookings' ? (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 24 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[VIOLET_500]} />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Feather name="calendar" size={48} color="#cbd5e1" />
                            <Text className="text-slate-500 mt-4">No upcoming bookings</Text>
                        </View>
                    }
                />
            ) : (
                <ScrollView
                    className="flex-1 px-6 pt-6"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[VIOLET_500]} />
                    }
                >
                    <Text className="text-lg font-bold text-slate-800 mb-4">Availability Management</Text>
                    <Text className="text-slate-500 text-sm mb-6">Toggle days to open appointmnent slots. Active days will have standard slots (9AM-5PM).</Text>

                    {daysOfWeek.map((day, index) => {
                        const active = isDayActive(index);
                        return (
                            <TouchableOpacity
                                key={day}
                                onPress={() => !saving && toggleDayActive(index)}
                                className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl border ${active ? 'bg-white border-violet-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-70'}`}
                            >
                                <View className="flex-row items-center">
                                    <View className={`w-10 h-10 rounded-full items-center justify-center ${active ? 'bg-violet-100' : 'bg-slate-200'}`}>
                                        <Text className={`font-bold ${active ? 'text-violet-700' : 'text-slate-500'}`}>{day.substring(0, 3)}</Text>
                                    </View>
                                    <View className="ml-4">
                                        <Text className={`text-lg font-bold ${active ? 'text-slate-900' : 'text-slate-500'}`}>{day}</Text>
                                        <Text className="text-xs text-slate-400">{active ? 'Slots Active' : 'Closed'}</Text>
                                    </View>
                                </View>

                                <View className={`w-6 h-6 rounded-full border items-center justify-center ${active ? 'bg-violet-500 border-violet-500' : 'border-slate-300 bg-white'}`}>
                                    {active && <Feather name="check" size={14} color="white" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                    <View className="mt-6 bg-white border border-violet-100 rounded-2xl p-4 shadow-sm">
                        <Text className="text-lg font-bold text-slate-800 mb-3">Active Time Slots</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {defaultTimeSlots.map((slot, idx) => (
                                <View key={idx} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-[48%] items-center">
                                    <Text className="text-sm font-medium text-slate-700">{formatTime(slot.start_time)}</Text>
                                    <Text className="text-xs text-slate-400">to {formatTime(slot.end_time)}</Text>
                                </View>
                            ))}
                        </View>
                        <Text className="text-xs text-slate-500 mt-3 text-center">These slots apply to all active days.</Text>
                    </View>
                    <View className="h-20" />
                </ScrollView>
            )}
        </View>
    );
}
