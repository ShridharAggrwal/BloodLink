import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

interface Stats {
    approvedUsers: number;
    approvedNgos: number;
    approvedBloodBanks: number;
    totalDonations: number;
}

export default function AdminOverviewScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({
        approvedUsers: 0,
        approvedNgos: 0,
        approvedBloodBanks: 0,
        totalDonations: 0,
    });
    const [alertCount, setAlertCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [statsRes, alertsRes] = await Promise.all([
                api.get('/admin/stats').catch(() => ({ data: {} })),
                api.get('/blood-requests/alerts').catch(() => ({ data: [] })),
            ]);

            if (statsRes.data) {
                setStats({
                    approvedUsers: statsRes.data.approvedUsers || 0,
                    approvedNgos: statsRes.data.approvedNgos || 0,
                    approvedBloodBanks: statsRes.data.approvedBloodBanks || 0,
                    totalDonations: statsRes.data.totalDonations || 0,
                });
            }
            setAlertCount(alertsRes.data?.length || 0);
        } catch (error) {
            console.log('Error fetching admin data:', error);
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
        { label: 'Approved Users', value: stats.approvedUsers, icon: 'users', color: '#3b82f6', bg: '#eff6ff' },
        { label: 'Approved NGOs', value: stats.approvedNgos, icon: 'heart', color: '#10b981', bg: '#ecfdf5' },
        { label: 'Blood Banks', value: stats.approvedBloodBanks, icon: 'database', color: '#8b5cf6', bg: '#f5f3ff' },
        { label: 'Total Donations', value: stats.totalDonations, icon: 'droplet', color: '#ef4444', bg: '#fef2f2' },
    ];

    const quickActions = [
        { label: 'Generate Token', sublabel: 'Invitations', icon: 'link', route: '/(admin)/generate-token', color: '#3b82f6' },
        { label: 'Request Blood', sublabel: 'Emergency', icon: 'droplet', route: '/(admin)/request', color: '#ef4444' },
        { label: 'View Alerts', sublabel: `${alertCount} active`, icon: 'bell', route: '/(admin)/alerts', color: '#f59e0b' },
    ];

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header - Blue theme like user dashboard */}
            <View className="bg-blue-500 pt-14 pb-6 px-6 rounded-b-3xl">
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className="text-white/80 text-sm">Welcome back,</Text>
                        <Text className="text-white text-2xl font-bold">{user?.name || 'Admin'}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(admin)/alerts')}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                    >
                        <Feather name="bell" size={20} color="white" />
                        {alertCount > 0 && (
                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full items-center justify-center">
                                <Text className="text-blue-500 text-xs font-bold">{alertCount > 9 ? '9+' : alertCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Admin Badge */}
                <View className="flex-row items-center">
                    <View className="bg-white/20 px-4 py-2 rounded-full flex-row items-center">
                        <Feather name="shield" size={16} color="white" />
                        <Text className="text-white font-bold ml-2">Administrator</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}
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
