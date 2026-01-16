import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, FlatList, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '@/services/api';

const VIOLET_500 = '#8b5cf6';
const VIOLET_50 = '#f5f3ff';

interface BloodStockItem {
    blood_group: string;
    units_available: number;
}

export default function InventoryScreen() {
    const [stock, setStock] = useState<BloodStockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchStock();
    }, []);

    const fetchStock = async () => {
        try {
            const response = await api.get('/blood-bank/stock');
            setStock(response.data || []);
        } catch (error) {
            console.log('Error fetching stock:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleUpdate = async (bloodGroup: string, newUnits: string) => {
        const units = parseInt(newUnits);
        if (isNaN(units) || units < 0) return;

        try {
            await api.put('/blood-bank/stock', { blood_group: bloodGroup, units_available: units });
            // Optimistic update
            setStock(prev => prev.map(item =>
                item.blood_group === bloodGroup ? { ...item, units_available: units } : item
            ));
        } catch (error) {
            Alert.alert('Error', 'Failed to update stock');
            fetchStock(); // Revert on error
        }
    };

    const getStockColor = (units: number) => {
        if (units <= 10) return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-500', iconBg: 'bg-red-100' };
        if (units <= 25) return { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-500', iconBg: 'bg-orange-100' };
        return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-500', iconBg: 'bg-emerald-100' };
    };

    const renderItem = ({ item }: { item: BloodStockItem }) => {
        const style = getStockColor(item.units_available);

        return (
            <View className={`flex-1 m-2 p-4 rounded-2xl border ${style.bg} ${style.border}`}>
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-slate-800">{item.blood_group}</Text>
                    <View className={`w-8 h-8 rounded-lg items-center justify-center ${style.iconBg}`}>
                        <Feather name="droplet" size={16} className={style.text} color={style.text.replace('text-', '').replace('-500', '') === 'red' ? '#ef4444' : style.text.replace('text-', '').replace('-500', '') === 'orange' ? '#f97316' : '#10b981'} />
                    </View>
                </View>

                <View>
                    <Text className="text-xs font-bold text-slate-500 mb-2 uppercase">Available Units</Text>
                    <View className="flex-row items-center bg-white rounded-xl border border-slate-200 px-3">
                        <TextInput
                            className="flex-1 py-2 text-xl font-bold text-slate-800 text-center"
                            keyboardType="numeric"
                            defaultValue={item.units_available.toString()}
                            onEndEditing={(e) => handleUpdate(item.blood_group, e.nativeEvent.text)}
                        />
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <View className="pt-14 pb-4 px-6 border-b border-violet-100 bg-white">
                <Text className="text-2xl font-bold text-slate-900">Blood Stock</Text>
                <Text className="text-slate-500 mt-1">Manage inventory levels</Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={VIOLET_500} />
                </View>
            ) : (
                <FlatList
                    data={stock}
                    renderItem={renderItem}
                    keyExtractor={item => item.blood_group}
                    numColumns={2}
                    contentContainerStyle={{ padding: 12 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStock(); }} colors={[VIOLET_500]} />
                    }
                />
            )}
        </View>
    );
}
