import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import api from '@/services/api';

const VIOLET_500 = '#8b5cf6';

export default function BloodBankDashboard() {
    const { user } = useAuth();
    const { socket } = useSocket(); // Use socket for connection status if needed
    const [stats, setStats] = useState({ totalUnits: 0, pendingRequests: 0 });
    const [stock, setStock] = useState<any[]>([]);
    const [alertsCount, setAlertsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Try fetching specific stats endpoint, fallback to calculation if fails
            let statsData = { totalUnits: 0, pendingRequests: 0 };
            let stockData = [];
            let currentAlertsCount = 0;

            try {
                // Fetch stats, stock, and alerts in parallel
                const [statsRes, stockRes, alertsRes] = await Promise.all([
                    api.get('/blood-bank/stats'),
                    api.get('/blood-bank/stock'),
                    api.get('/blood-requests/alerts')
                ]);
                statsData = statsRes.data || { totalUnits: 0, pendingRequests: 0 };
                stockData = stockRes.data || [];
                currentAlertsCount = (alertsRes.data || []).length;
            } catch (e) {
                // Fallback if stats endpoint is missing
                const stockRes = await api.get('/blood-bank/stock');
                stockData = stockRes.data || [];
                const totalUnits = stockData.reduce((acc: number, item: any) => acc + (item.units_available || 0), 0);

                try {
                    const alertsRes = await api.get('/blood-requests/alerts');
                    currentAlertsCount = (alertsRes.data || []).length;
                } catch (err) {
                    console.log('Error fetching alerts:', err);
                }

                statsData = { totalUnits, pendingRequests: currentAlertsCount };
            }

            setStats(statsData);
            setStock(stockData);
            setAlertsCount(currentAlertsCount);
        } catch (error) {
            console.log('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getStockColor = (units: number) => {
        if (units <= 10) return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' };
        if (units <= 25) return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' };
        return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
    };

    const navTo = (path: any) => router.push(path);

    const statCards = [
        {
            title: 'Total Units',
            value: stats.totalUnits,
            icon: 'droplet',
            color: 'bg-rose-500',
            bgColor: 'bg-rose-50',
            path: '/(blood-bank)/stock'
        },
        {
            title: 'Nearby Requests',
            value: stats.pendingRequests,
            icon: 'list',
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
            path: '/(blood-bank)/requests'
        },
        {
            title: 'Active Alerts',
            value: alertsCount,
            icon: 'bell',
            color: 'bg-amber-500',
            bgColor: 'bg-amber-50',
            path: '/(blood-bank)/requests'
        },
        {
            title: 'Critical Stock',
            value: stock.filter(s => s.units_available <= 10).length,
            icon: 'alert-triangle',
            color: 'bg-red-500',
            bgColor: 'bg-red-50',
            path: '/(blood-bank)/inventory'
        },
    ];

    const quickActions = [
        {
            title: 'Request Blood',
            subtitle: 'Broadcast alert to donors',
            icon: 'radio',
            iconBg: 'bg-rose-100',
            iconColor: '#ef4444',
            onPress: () => navTo('/(blood-bank)/request-blood'),
        },
        {
            title: 'Update Stock',
            subtitle: 'Manage inventory levels',
            icon: 'layers',
            iconBg: 'bg-violet-100',
            iconColor: '#8b5cf6',
            onPress: () => navTo('/(blood-bank)/inventory'),
        },
        {
            title: 'View Requests',
            subtitle: 'Respond to nearby needs',
            icon: 'list',
            iconBg: 'bg-blue-100',
            iconColor: '#3b82f6',
            onPress: () => navTo('/(blood-bank)/requests'),
        },
        {
            title: 'Manage Appointments',
            subtitle: 'Slots and bookings',
            icon: 'calendar',
            iconBg: 'bg-emerald-100',
            iconColor: '#10b981',
            onPress: () => navTo('/(blood-bank)/appointments'),
        },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header - User Dashboard Style */}
            <View className="bg-violet-600 pt-14 pb-6 px-6 rounded-b-3xl">
                <View className="flex-row items-center justify-between mb-4">
                    <View>
                        <Text className="text-violet-200 text-sm">Welcome back,</Text>
                        <Text className="text-white text-2xl font-bold">{user?.name || 'Blood Bank'}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => navTo('/(blood-bank)/requests')}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                    >
                        <Feather name="bell" size={20} color="white" />
                        {alertsCount > 0 && (
                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full items-center justify-center">
                                <Text className="text-violet-600 text-xs font-bold">{alertsCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Location Badge */}
                <View className="bg-white/20 px-4 py-2 rounded-full flex-row items-center self-start">
                    <Feather name="map-pin" size={14} color="white" />
                    <Text className="text-white font-medium ml-2 text-xs">
                        {user?.address ? user.address.split(',')[0] : 'Location not set'}
                    </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[VIOLET_500]} />
                }
            >
                {/* Stats Grid - 4 Cards */}
                <View className="flex-row flex-wrap -mx-2 mb-2">
                    {statCards.map((card, index) => (
                        <View key={index} className="w-1/2 px-2 mb-4">
                            <TouchableOpacity onPress={() => navTo(card.path)} className={`${card.bgColor} p-4 rounded-2xl`}>
                                <View className={`${card.color} w-10 h-10 rounded-full items-center justify-center mb-3`}>
                                    <Feather name={card.icon as any} size={20} color="white" />
                                </View>
                                <Text className="text-2xl font-bold text-gray-900">{card.value}</Text>
                                <Text className="text-gray-600 text-xs font-medium mt-1">{card.title}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Live Inventory */}
                <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Live Inventory</Text>
                <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-slate-100">
                    <View className="flex-row border-b border-slate-100 pb-2 mb-3">
                        <View className="flex-1 flex-row items-center justify-center gap-1">
                            <View className="w-2 h-2 rounded-full bg-emerald-500" />
                            <Text className="text-xs text-slate-500">Good</Text>
                        </View>
                        <View className="flex-1 flex-row items-center justify-center gap-1">
                            <View className="w-2 h-2 rounded-full bg-orange-500" />
                            <Text className="text-xs text-slate-500">Medium</Text>
                        </View>
                        <View className="flex-1 flex-row items-center justify-center gap-1">
                            <View className="w-2 h-2 rounded-full bg-red-500" />
                            <Text className="text-xs text-slate-500">Low</Text>
                        </View>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                        {stock.map((item) => {
                            const style = getStockColor(item.units_available);
                            return (
                                <View key={item.blood_group} className={`w-[22%] aspect-square rounded-xl border items-center justify-center mb-1 ${style.bg} ${style.border}`}>
                                    <Text className="text-lg font-bold text-slate-800">{item.blood_group}</Text>
                                    <Text className={`text-xs font-bold ${style.text}`}>{item.units_available}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Quick Actions */}
                <Text className="text-lg font-bold text-gray-900 mb-4 px-1">Quick Actions</Text>
                <View className="bg-white rounded-2xl p-4 mb-10 shadow-sm border border-slate-100">
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={action.onPress}
                            className={`flex-row items-center py-3 ${index < quickActions.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                            <View className={`w-10 h-10 ${action.iconBg} rounded-full items-center justify-center`}>
                                <Feather name={action.icon as any} size={18} color={action.iconColor} />
                            </View>
                            <View className="flex-1 ml-4">
                                <Text className="font-semibold text-gray-900">{action.title}</Text>
                                <Text className="text-gray-500 text-xs">{action.subtitle}</Text>
                            </View>
                            <Feather name="chevron-right" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}
