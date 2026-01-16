import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

interface Stats {
    activeCampaigns: number;
    totalVolunteers: number;
    bloodRequestsSent: number;
    donationsCollected: number;
}

export default function NGOOverviewScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({
        activeCampaigns: 0,
        totalVolunteers: 0,
        bloodRequestsSent: 0,
        donationsCollected: 0,
    });
    const [alertCount, setAlertCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [statsRes, alertsRes] = await Promise.all([
                api.get('/ngo/stats').catch(() => ({ data: {} })),
                api.get('/blood-requests/alerts').catch(() => ({ data: [] })),
            ]);

            if (statsRes.data) {
                setStats({
                    activeCampaigns: statsRes.data.activeCampaigns || 0,
                    totalVolunteers: statsRes.data.totalVolunteers || 0,
                    bloodRequestsSent: statsRes.data.bloodRequestsSent || 0,
                    donationsCollected: statsRes.data.donationsCollected || 0,
                });
            }
            setAlertCount(alertsRes.data?.length || 0);
        } catch (error) {
            console.log('Error fetching NGO data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const statCards = [
        { label: 'Active Campaigns', value: stats.activeCampaigns, icon: 'calendar', color: '#10b981', bg: '#ecfdf5' },
        { label: 'Total Volunteers', value: stats.totalVolunteers, icon: 'users', color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Blood Requests', value: stats.bloodRequestsSent, icon: 'droplet', color: '#ef4444', bg: '#fef2f2' },
        { label: 'Donations', value: stats.donationsCollected, icon: 'heart', color: '#8b5cf6', bg: '#f5f3ff' },
    ];

    const quickActions = [
        { label: 'Create Campaign', sublabel: 'Organize blood drive', icon: 'plus-circle', route: '/(ngo)/create-campaign', color: '#10b981' },
        { label: 'Request Blood', sublabel: 'Emergency request', icon: 'droplet', route: '/(ngo)/request', color: '#ef4444' },
        { label: 'View Alerts', sublabel: `${alertCount} active`, icon: 'bell', route: '/(ngo)/alerts', color: '#f59e0b' },
        { label: 'View Campaigns', sublabel: 'Manage campaigns', icon: 'calendar', route: '/(ngo)/campaigns', color: '#3b82f6' },
    ];

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header - Green theme */}
            <View className="bg-emerald-500 pt-14 pb-6 px-6 rounded-b-3xl">
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className="text-white/80 text-sm">Welcome back,</Text>
                        <Text className="text-white text-2xl font-bold">{user?.name || 'NGO'}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(ngo)/alerts')}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                    >
                        <Feather name="bell" size={20} color="white" />
                        {alertCount > 0 && (
                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full items-center justify-center">
                                <Text className="text-emerald-500 text-xs font-bold">{alertCount > 9 ? '9+' : alertCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* NGO Badge */}
                <View className="flex-row items-center">
                    <View className="bg-white/20 px-4 py-2 rounded-full flex-row items-center">
                        <Feather name="heart" size={16} color="white" />
                        <Text className="text-white font-bold ml-2">NGO Partner</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
            >
                {/* Stats Grid */}
                <View className="flex-row flex-wrap -mx-2 mb-6">
                    {statCards.map((stat) => (
                        <View key={stat.label} className="w-1/2 px-2 mb-4">
                            <View className="bg-white rounded-2xl p-4 border border-slate-100">
                                <View
                                    style={{ backgroundColor: stat.bg }}
                                    className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                                >
                                    <Feather name={stat.icon as any} size={20} color={stat.color} />
                                </View>
                                <Text className="text-2xl font-bold text-slate-900">{stat.value.toLocaleString()}</Text>
                                <Text className="text-slate-500 text-sm">{stat.label}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Quick Actions */}
                <Text className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Quick Actions</Text>
                <View className="mb-8">
                    {quickActions.map((action) => (
                        <TouchableOpacity
                            key={action.label}
                            onPress={() => router.push(action.route as any)}
                            className="bg-white rounded-2xl p-4 mb-3 border border-slate-100 flex-row items-center"
                        >
                            <View
                                style={{ backgroundColor: `${action.color}15` }}
                                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                            >
                                <Feather name={action.icon as any} size={24} color={action.color} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold">{action.label}</Text>
                                <Text className="text-slate-500 text-sm">{action.sublabel}</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
