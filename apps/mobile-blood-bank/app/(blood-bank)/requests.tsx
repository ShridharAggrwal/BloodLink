import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Alert, Linking, Modal, ScrollView, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '@/services/api';
import { useSocket } from '@/context/SocketContext';

const VIOLET_500 = '#8b5cf6';
const VIOLET_600 = '#7c3aed';

interface BloodRequest {
    id: string;
    blood_group: string;
    units_needed: number;
    description?: string;
    status: string;
    address: string;
    latitude?: number;
    longitude?: number;
    distance?: number;
    is_accepted?: boolean;
    requester?: {
        name: string;
        phone: string;
    };
    created_at: string;
}

export default function RequestsScreen() {
    const { alerts } = useSocket();
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [alerts]); // Refresh when socket alerts come in

    const fetchRequests = async () => {
        try {
            const response = await api.get('/blood-requests/alerts');
            setRequests(response.data || []);
        } catch (error) {
            console.log('Error fetching requests:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAccept = async (requestId: string) => {
        setAccepting(true);
        try {
            await api.put(`/blood-requests/${requestId}/accept`);
            Alert.alert('Success', 'Request accepted!');
            setSelectedRequest(null);
            fetchRequests();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to accept request');
        } finally {
            setAccepting(false);
        }
    };

    const openDirections = (lat?: number, lng?: number) => {
        if (lat && lng) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
            Linking.openURL(url);
        }
    };

    const formatDistance = (meters?: number) => {
        if (!meters) return '';
        if (meters < 1000) return `${Math.round(meters)}m`;
        return `${(meters / 1000).toFixed(1)}km`;
    };

    const renderItem = ({ item }: { item: BloodRequest }) => (
        <View className={`bg-white rounded-2xl p-4 mb-4 border shadow-sm ${item.is_accepted ? 'border-amber-200' : 'border-slate-200'}`}>
            <View className="flex-row items-start">
                <View className={`w-14 h-14 rounded-xl items-center justify-center shadow-sm ${item.is_accepted ? 'bg-amber-400' : 'bg-rose-500'}`}>
                    <Text className="text-xl font-bold text-white">{item.blood_group}</Text>
                </View>

                <View className="flex-1 ml-4">
                    <View className="flex-row items-center flex-wrap gap-2 mb-1">
                        <Text className="text-lg font-bold text-slate-800">{item.units_needed} Unit(s)</Text>
                        {item.distance && (
                            <View className="bg-blue-50 px-2 py-0.5 rounded-full">
                                <Text className="text-xs font-medium text-blue-600">{formatDistance(item.distance)}</Text>
                            </View>
                        )}
                        {item.is_accepted && (
                            <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                                <Text className="text-xs font-medium text-amber-700">Pending Fulfillment</Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-slate-600 text-sm mb-2" numberOfLines={2}>{item.address}</Text>

                    {item.requester && (
                        <View className="flex-row items-center gap-3">
                            <View className="flex-row items-center">
                                <Feather name="user" size={12} color="#64748b" />
                                <Text className="text-xs text-slate-500 ml-1">{item.requester.name}</Text>
                            </View>
                            {item.requester.phone && (
                                <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.requester!.phone}`)} className="flex-row items-center">
                                    <Feather name="phone" size={12} color="#3b82f6" />
                                    <Text className="text-xs text-blue-600 ml-1">Call</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>

            <View className="flex-row gap-2 mt-4">
                <TouchableOpacity
                    onPress={() => openDirections(item.latitude, item.longitude)}
                    className="flex-1 py-2.5 bg-slate-100 rounded-xl flex-row items-center justify-center"
                >
                    <Feather name="map-pin" size={16} color="#475569" />
                    <Text className="ml-2 font-medium text-slate-700">Directions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setSelectedRequest(item)}
                    className="flex-1 py-2.5 bg-white border border-slate-200 rounded-xl flex-row items-center justify-center"
                >
                    <Text className="font-medium text-slate-700">Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleAccept(item.id)}
                    disabled={item.is_accepted || accepting}
                    className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center ${item.is_accepted ? 'bg-slate-200' : 'bg-violet-600'}`}
                >
                    <Text className={`font-bold ${item.is_accepted ? 'text-slate-500' : 'text-white'}`}>
                        {item.is_accepted ? 'Accepted' : 'Fulfill'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <View className="pt-14 pb-4 px-6 bg-white border-b border-violet-100">
                <Text className="text-2xl font-bold text-slate-900">Blood Requests</Text>
                <Text className="text-slate-500 mt-1">Nearby requests needing help</Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={VIOLET_500} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchRequests(); }} colors={[VIOLET_500]} />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Feather name="check-circle" size={48} color="#cbd5e1" />
                            <Text className="text-slate-500 mt-4 text-center">No active requests nearby.</Text>
                        </View>
                    }
                />
            )}

            {/* Details Modal */}
            <Modal visible={!!selectedRequest} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 h-[80%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-slate-900">Request Details</Text>
                            <TouchableOpacity onPress={() => setSelectedRequest(null)} className="p-2 bg-slate-100 rounded-full">
                                <Feather name="x" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedRequest && (
                                <>
                                    <View className="flex-row items-center mb-6">
                                        <View className="w-20 h-20 rounded-2xl bg-rose-500 items-center justify-center shadow-md">
                                            <Text className="text-3xl font-bold text-white">{selectedRequest.blood_group}</Text>
                                        </View>
                                        <View className="ml-5 flex-1">
                                            <Text className="text-2xl font-bold text-slate-800">{selectedRequest.units_needed} Units</Text>
                                            <View className="bg-rose-50 self-start px-3 py-1 rounded-full mt-2">
                                                <Text className="text-rose-600 font-medium text-sm">Urgent Request</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View className="space-y-6">
                                        <View>
                                            <Text className="text-sm font-bold text-slate-500 uppercase mb-2">Location</Text>
                                            <View className="flex-row items-start">
                                                <Feather name="map-pin" size={18} color="#64748b" className="mt-0.5" />
                                                <Text className="ml-3 text-slate-700 text-base flex-1">{selectedRequest.address}</Text>
                                            </View>
                                        </View>

                                        {selectedRequest.requester && (
                                            <View>
                                                <Text className="text-sm font-bold text-slate-500 uppercase mb-2">Contact</Text>
                                                <View className="bg-slate-50 p-4 rounded-xl">
                                                    <View className="flex-row items-center mb-3">
                                                        <Feather name="user" size={18} color="#64748b" />
                                                        <Text className="ml-3 text-slate-700 font-medium">{selectedRequest.requester.name}</Text>
                                                    </View>
                                                    {selectedRequest.requester.phone && (
                                                        <TouchableOpacity
                                                            onPress={() => Linking.openURL(`tel:${selectedRequest.requester!.phone}`)}
                                                            className="flex-row items-center"
                                                        >
                                                            <Feather name="phone" size={18} color="#3b82f6" />
                                                            <Text className="ml-3 text-blue-600 font-medium">{selectedRequest.requester.phone}</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>
                                        )}

                                        <View>
                                            <Text className="text-sm font-bold text-slate-500 uppercase mb-2">Additional Info</Text>
                                            <Text className="text-slate-600 leading-6">
                                                {selectedRequest.description || 'No additional details provided. Please contact the requester for more information.'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="h-24" />
                                </>
                            )}
                        </ScrollView>

                        <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100">
                            <TouchableOpacity
                                onPress={() => handleAccept(selectedRequest!.id)}
                                disabled={selectedRequest?.is_accepted || accepting}
                                className={`w-full py-4 rounded-xl items-center ${selectedRequest?.is_accepted ? 'bg-slate-200' : 'bg-violet-600'}`}
                            >
                                {accepting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className={`font-bold text-lg ${selectedRequest?.is_accepted ? 'text-slate-500' : 'text-white'}`}>
                                        {selectedRequest?.is_accepted ? 'Request Already Accepted' : 'Fulfill Request'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
