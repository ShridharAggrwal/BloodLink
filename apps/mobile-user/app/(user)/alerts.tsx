import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';
import { useSocket } from '@/context/SocketContext';

interface BloodRequest {
    id: string;
    blood_type: string;
    units: number;
    urgency: string;
    hospital: string;
    distance: number;
    created_at: string;
    requester: {
        name: string;
    };
}

interface Campaign {
    id: string;
    name: string;
    ngo_name: string;
    address: string;
    distance?: number;
    start_date: string;
    end_date: string;
    latitude?: number;
    longitude?: number;
}

export default function AlertsScreen() {
    const { socket } = useSocket();
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [requestsRes, nearbyRes] = await Promise.all([
                api.get('/blood-requests/alerts'),
                api.get('/users/nearby'),
            ]);
            setRequests(requestsRes.data || []);

            // Filter out past campaigns - only show ongoing or future campaigns
            const allCampaigns = nearbyRes.data?.campaigns || [];
            const now = new Date();
            const upcomingCampaigns = allCampaigns.filter((campaign: Campaign) => {
                const endDate = new Date(campaign.end_date);
                return endDate >= now;
            });
            setCampaigns(upcomingCampaigns);
        } catch (error) {
            console.log('Error fetching alerts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();

        if (socket) {
            socket.on('new_request', (request: BloodRequest) => {
                setRequests(prev => [request, ...prev]);
            });
        }

        return () => {
            if (socket) {
                socket.off('new_request');
            }
        };
    }, [socket]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleAccept = async (requestId: string) => {
        setAcceptingId(requestId);
        try {
            await api.post(`/requests/${requestId}/accept`);
            Alert.alert('Success', 'You have accepted this blood request. The requester will be notified.');
            setRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to accept request');
        } finally {
            setAcceptingId(null);
        }
    };

    const formatDistance = (meters: number) => {
        if (meters < 1000) return `${Math.round(meters)}m away`;
        return `${(meters / 1000).toFixed(1)}km away`;
    };

    const getUrgencyStyle = (urgency: string) => {
        switch (urgency) {
            case 'critical': return { bg: 'bg-red-100', text: 'text-red-600', label: 'Critical' };
            case 'urgent': return { bg: 'bg-amber-100', text: 'text-amber-600', label: 'Urgent' };
            default: return { bg: 'bg-green-100', text: 'text-green-600', label: 'Normal' };
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const openDirections = (lat?: number, lng?: number) => {
        if (lat && lng) {
            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">Alerts & Campaigns</Text>
                <Text className="text-gray-500 mt-1">Respond to urgent requests and upcoming events</Text>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ef4444']} />}
            >
                {/* Emergency Requests Section */}
                <View className="flex-row items-center mb-4">
                    <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
                        <Feather name="alert-triangle" size={20} color="#ef4444" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 ml-3">Emergency Requests</Text>
                </View>

                {requests.length === 0 ? (
                    <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 items-center">
                        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                            <Feather name="check-circle" size={28} color="#22c55e" />
                        </View>
                        <Text className="text-gray-900 font-medium">No Emergency Requests</Text>
                        <Text className="text-gray-500 text-sm text-center mt-1">
                            There are no urgent blood requests nearby right now
                        </Text>
                    </View>
                ) : (
                    requests.map((request) => {
                        const urgency = getUrgencyStyle(request.urgency);
                        return (
                            <View key={request.id} className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                                <View className="flex-row items-start justify-between">
                                    <View className="flex-row items-center">
                                        <View className="w-14 h-14 bg-rose-500 rounded-xl items-center justify-center">
                                            <Text className="text-white font-bold text-lg">{request.blood_type}</Text>
                                        </View>
                                        <View className="ml-3">
                                            <Text className="text-lg font-bold text-gray-900">
                                                {request.units} unit{request.units > 1 ? 's' : ''} needed
                                            </Text>
                                            <Text className="text-gray-500 text-sm">{request.hospital}</Text>
                                        </View>
                                    </View>
                                    <View className={`${urgency.bg} px-2 py-1 rounded`}>
                                        <Text className={`${urgency.text} text-xs font-bold`}>{urgency.label}</Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
                                    <Feather name="user" size={14} color="#9ca3af" />
                                    <Text className="text-gray-500 text-sm ml-1">{request.requester?.name || 'Anonymous'}</Text>
                                    <View className="mx-3 w-1 h-1 bg-gray-300 rounded-full" />
                                    <Feather name="navigation" size={14} color="#9ca3af" />
                                    <Text className="text-gray-500 text-sm ml-1">{formatDistance(request.distance)}</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => handleAccept(request.id)}
                                    disabled={acceptingId === request.id}
                                    className="mt-4"
                                >
                                    <LinearGradient
                                        colors={acceptingId === request.id ? ['#fda4af', '#fda4af'] : ['#f43f5e', '#e11d48']}
                                        className="py-3 rounded-xl items-center flex-row justify-center"
                                    >
                                        {acceptingId === request.id ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <>
                                                <Feather name="heart" size={18} color="white" />
                                                <Text className="text-white font-bold ml-2">Accept & Help</Text>
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        );
                    })
                )}

                {/* Upcoming Campaigns Section */}
                <View className="flex-row items-center mb-4 mt-4">
                    <View className="w-10 h-10 bg-teal-100 rounded-full items-center justify-center">
                        <Feather name="calendar" size={20} color="#14b8a6" />
                    </View>
                    <Text className="text-lg font-bold text-gray-900 ml-3">Upcoming Campaigns</Text>
                </View>

                {campaigns.length === 0 ? (
                    <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100 items-center">
                        <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                            <Feather name="calendar" size={28} color="#9ca3af" />
                        </View>
                        <Text className="text-gray-900 font-medium">No Upcoming Campaigns</Text>
                        <Text className="text-gray-500 text-sm text-center mt-1">
                            Check back later for donation campaigns near you
                        </Text>
                    </View>
                ) : (
                    campaigns.map((campaign) => (
                        <View key={campaign.id} className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                            <View className="flex-row items-start">
                                <View className="w-12 h-12 bg-teal-100 rounded-xl items-center justify-center">
                                    <Feather name="calendar" size={24} color="#14b8a6" />
                                </View>
                                <View className="flex-1 ml-3">
                                    <Text className="text-lg font-bold text-gray-900">{campaign.name}</Text>
                                    <Text className="text-gray-500 text-sm">by {campaign.ngo_name}</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mt-3">
                                <Feather name="map-pin" size={14} color="#9ca3af" />
                                <Text className="text-gray-500 text-sm ml-1 flex-1">{campaign.address}</Text>
                            </View>

                            <View className="flex-row items-center mt-2">
                                <Feather name="clock" size={14} color="#9ca3af" />
                                <Text className="text-gray-500 text-sm ml-1">
                                    {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                                </Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => openDirections(campaign.latitude, campaign.longitude)}
                                className="mt-4 flex-row items-center justify-center py-3 bg-gray-100 rounded-xl"
                            >
                                <Feather name="navigation" size={16} color="#4b5563" />
                                <Text className="text-gray-700 font-medium ml-2">Get Directions</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
                <View className="h-8" />
            </ScrollView>
        </View>
    );
}
