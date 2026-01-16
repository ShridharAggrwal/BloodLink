import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '@/services/api';

interface BloodRequest {
    id: string;
    blood_group: string;
    units_needed: number;
    address: string;
    status: string;
    distance?: number;
    latitude?: number;
    longitude?: number;
    requester_name?: string;
    created_at: string;
    is_accepted?: boolean;
}

export default function AdminAlertsScreen() {
    const router = useRouter();
    const [alerts, setAlerts] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);

    const fetchAlerts = async () => {
        try {
            const response = await api.get('/blood-requests/alerts');
            setAlerts(response.data || []);
        } catch (error) {
            console.log('Failed to fetch alerts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAlerts();
    };

    const handleAccept = async (requestId: string) => {
        setAcceptingId(requestId);
        try {
            await api.put(`/blood-requests/${requestId}/accept`);
            Alert.alert('Success', 'Request accepted! The requester has been notified.');
            fetchAlerts();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to accept request');
        } finally {
            setAcceptingId(null);
        }
    };

    const openDirections = (lat?: number, lng?: number) => {
        if (lat && lng) {
            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        }
    };

    const formatDistance = (meters?: number) => {
        if (!meters) return '';
        if (meters < 1000) return `${Math.round(meters)}m`;
        return `${(meters / 1000).toFixed(1)}km`;
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Feather name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-bold text-slate-900">Blood Alerts</Text>
                    <Text className="text-slate-500 mt-1">Active requests within 35km</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}
            >
                {alerts.length === 0 ? (
                    <View className="items-center py-12">
                        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                            <Feather name="check-circle" size={40} color="#22c55e" />
                        </View>
                        <Text className="text-slate-900 font-bold text-lg mb-1">All Clear!</Text>
                        <Text className="text-slate-500 text-center">
                            No blood requests in your area right now.
                        </Text>
                    </View>
                ) : (
                    alerts.map((alert) => (
                        <View key={alert.id} className="bg-white rounded-2xl p-5 mb-4 border border-slate-100">
                            <View className="flex-row items-start mb-4">
                                <LinearGradient
                                    colors={alert.is_accepted ? ['#f59e0b', '#d97706'] : ['#ef4444', '#dc2626']}
                                    style={{ width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <Text className="text-white font-bold text-xl">{alert.blood_group}</Text>
                                </LinearGradient>
                                <View className="flex-1 ml-4">
                                    <View className="flex-row items-center flex-wrap gap-2 mb-1">
                                        <Text className="text-lg font-bold text-slate-900">Blood Request</Text>
                                        <View className="bg-red-100 px-2 py-0.5 rounded">
                                            <Text className="text-red-600 text-xs font-bold">{alert.units_needed} unit(s)</Text>
                                        </View>
                                        {alert.distance && (
                                            <View className="bg-blue-100 px-2 py-0.5 rounded">
                                                <Text className="text-blue-600 text-xs font-medium">
                                                    {formatDistance(alert.distance)} away
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-slate-500 text-sm" numberOfLines={2}>{alert.address}</Text>
                                </View>
                            </View>

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => openDirections(alert.latitude, alert.longitude)}
                                    className="flex-1 flex-row items-center justify-center py-3 bg-slate-100 rounded-xl"
                                >
                                    <Feather name="navigation" size={18} color="#64748b" />
                                    <Text className="text-slate-700 font-medium ml-2">Directions</Text>
                                </TouchableOpacity>
                                {!alert.is_accepted && (
                                    <TouchableOpacity
                                        onPress={() => handleAccept(alert.id)}
                                        disabled={acceptingId === alert.id}
                                        className="flex-1"
                                    >
                                        <LinearGradient
                                            colors={['#3b82f6', '#2563eb']}
                                            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12 }}
                                        >
                                            {acceptingId === alert.id ? (
                                                <ActivityIndicator size="small" color="white" />
                                            ) : (
                                                <>
                                                    <Feather name="heart" size={18} color="white" />
                                                    <Text className="text-white font-bold ml-2">Accept</Text>
                                                </>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
                <View className="h-8" />
            </ScrollView>
        </View>
    );
}
