import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

interface Stats {
    totalRequests: number;
    activeRequests: number;
    totalDonations: number;
    pendingAlerts: number;
}

export default function UserHomeScreen() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalRequests: 0,
        activeRequests: 0,
        totalDonations: 0,
        pendingAlerts: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            // Fetch history data (may fail if user has no history yet)
            let requests: any[] = [];
            let donations: any[] = [];
            let alerts: any[] = [];

            try {
                const historyRes = await api.get('/users/history');
                requests = historyRes.data?.requests || [];
                donations = historyRes.data?.donations || [];
            } catch (historyError) {
                console.log('History not available:', historyError);
            }

            try {
                const alertsRes = await api.get('/blood-requests/alerts');
                alerts = alertsRes.data || [];
            } catch (alertsError) {
                console.log('Alerts not available:', alertsError);
            }

            setStats({
                totalRequests: requests.length,
                activeRequests: requests.filter((r: any) => r.status === 'active' || r.status === 'accepted').length,
                totalDonations: donations.length,
                pendingAlerts: alerts.length,
            });
        } catch (error) {
            console.log('Error fetching stats:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const statCards = [
        {
            title: 'Total Requests',
            value: stats.totalRequests,
            icon: 'file-text',
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Active Requests',
            value: stats.activeRequests,
            icon: 'clock',
            color: 'bg-amber-500',
            bgColor: 'bg-amber-50'
        },
        {
            title: 'Donations',
            value: stats.totalDonations,
            icon: 'heart',
            color: 'bg-rose-500',
            bgColor: 'bg-rose-50'
        },
        {
            title: 'Lives Impacted',
            value: stats.totalDonations * 3,
            icon: 'users',
            color: 'bg-green-500',
            bgColor: 'bg-green-50'
        },
    ];

    const quickActions = [
        {
            title: 'Request Blood',
            subtitle: 'Create a blood request',
            icon: 'plus-circle',
            iconBg: 'bg-rose-100',
            iconColor: '#ef4444',
            onPress: () => router.push('/(user)/request'),
        },
        {
            title: 'Book Appointment',
            subtitle: 'Schedule a donation',
            icon: 'calendar',
            iconBg: 'bg-blue-100',
            iconColor: '#3b82f6',
            onPress: () => router.push('/(user)/donate'),
        },
        {
            title: 'View Alerts',
            subtitle: 'Emergency blood requests',
            icon: 'bell',
            iconBg: 'bg-amber-100',
            iconColor: '#f59e0b',
            onPress: () => router.push('/(user)/alerts'),
        },
        {
            title: 'Explore Nearby',
            subtitle: 'Blood banks & campaigns',
            icon: 'map-pin',
            iconBg: 'bg-green-100',
            iconColor: '#22c55e',
            onPress: () => router.push('/(user)/nearby'),
        },
        {
            title: 'View History',
            subtitle: 'Your requests & donations',
            icon: 'clock',
            iconBg: 'bg-purple-100',
            iconColor: '#8b5cf6',
            onPress: () => router.push('/(user)/profile'),
        },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-rose-500 pt-14 pb-6 px-6 rounded-b-3xl">
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className="text-white/80 text-sm">Welcome back,</Text>
                        <Text className="text-white text-2xl font-bold">{user?.name}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(user)/alerts')}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                    >
                        <Feather name="bell" size={20} color="white" />
                        {stats.pendingAlerts > 0 && (
                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full items-center justify-center">
                                <Text className="text-rose-500 text-xs font-bold">{stats.pendingAlerts}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Blood Type Badge */}
                <View className="flex-row items-center">
                    <View className="bg-white/20 px-4 py-2 rounded-full flex-row items-center">
                        <Feather name="droplet" size={16} color="white" />
                        <Text className="text-white font-bold ml-2">Blood Type: {user?.blood_type || 'Not set'}</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ef4444']} />
                }
            >
                {/* Stats Grid */}
                <View className="flex-row flex-wrap -mx-2">
                    {statCards.map((card, index) => (
                        <View key={index} className="w-1/2 px-2 mb-4">
                            <View className={`${card.bgColor} p-4 rounded-2xl`}>
                                <View className={`${card.color} w-10 h-10 rounded-full items-center justify-center mb-3`}>
                                    <Feather name={card.icon as any} size={20} color="white" />
                                </View>
                                <Text className="text-2xl font-bold text-gray-900">{card.value}</Text>
                                <Text className="text-gray-600 text-sm">{card.title}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <Text className="text-lg font-bold text-gray-900 mb-4 mt-2">Quick Actions</Text>
                <View className="bg-white rounded-2xl p-4 mb-6">
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={action.onPress}
                            className={`flex-row items-center py-3 ${index < quickActions.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                            <View className={`w-10 h-10 ${action.iconBg} rounded-full items-center justify-center`}>
                                <Feather name={action.icon as any} size={20} color={action.iconColor} />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="font-semibold text-gray-900">{action.title}</Text>
                                <Text className="text-gray-500 text-sm">{action.subtitle}</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
