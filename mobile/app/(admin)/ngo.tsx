import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '@/services/api';

interface NGO {
    id: string;
    name: string;
    email: string;
    owner_name: string;
    contact_info?: string;
    volunteer_count?: number;
    is_verified: boolean;
    status: string;
}

export default function NGOScreen() {
    const [ngos, setNgos] = useState<NGO[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; ngo: NGO | null }>({ open: false, ngo: null });

    const fetchNgos = async () => {
        try {
            const response = await api.get('/admin/ngos');
            setNgos(response.data || []);
        } catch (error) {
            console.log('Failed to fetch NGOs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNgos();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNgos();
    };

    const handleAction = async (action: 'suspend' | 'activate' | 'delete', ngoId: string) => {
        setActionLoading(ngoId);
        try {
            if (action === 'suspend') {
                await api.put(`/admin/suspend/ngo/${ngoId}`);
                Alert.alert('Success', 'NGO suspended successfully');
            } else if (action === 'activate') {
                await api.put(`/admin/activate/ngo/${ngoId}`);
                Alert.alert('Success', 'NGO activated successfully');
            } else if (action === 'delete') {
                await api.delete(`/admin/delete/ngo/${ngoId}`);
                Alert.alert('Success', 'NGO deleted successfully');
                setDeleteModal({ open: false, ngo: null });
            }
            fetchNgos();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || `Failed to ${action} NGO`);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredNgos = ngos.filter(ngo =>
        ngo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ngo.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ngo.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <View className="bg-white pt-14 pb-4 px-6 border-b border-slate-100">
                <Text className="text-2xl font-bold text-slate-900">NGOs ({filteredNgos.length})</Text>
                <Text className="text-slate-500 mt-1">Manage partner organizations</Text>
            </View>

            {/* Search */}
            <View className="px-6 py-4 bg-white border-b border-slate-100">
                <View className="flex-row items-center bg-slate-100 rounded-xl px-4">
                    <Feather name="search" size={18} color="#94a3b8" />
                    <TextInput
                        className="flex-1 py-3 ml-3 text-slate-900"
                        placeholder="Search NGOs..."
                        placeholderTextColor="#94a3b8"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <Feather name="x" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3b82f6']} />}
            >
                {filteredNgos.length === 0 ? (
                    <View className="items-center py-12">
                        <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                            <Feather name="heart" size={28} color="#94a3b8" />
                        </View>
                        <Text className="text-slate-500 font-medium">
                            {searchTerm ? `No NGOs matching "${searchTerm}"` : 'No NGOs found'}
                        </Text>
                    </View>
                ) : (
                    filteredNgos.map((ngo) => (
                        <View key={ngo.id} className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
                            <View className="flex-row items-start mb-3">
                                <View className="w-12 h-12 rounded-xl bg-emerald-100 items-center justify-center">
                                    <Feather name="heart" size={24} color="#10b981" />
                                </View>
                                <View className="flex-1 ml-3">
                                    <View className="flex-row items-center">
                                        <Text className="text-slate-900 font-bold text-lg">{ngo.name}</Text>
                                        {ngo.is_verified && (
                                            <View className="ml-2">
                                                <Feather name="check-circle" size={16} color="#3b82f6" />
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-slate-500 text-sm">Owner: {ngo.owner_name}</Text>
                                    <Text className="text-slate-400 text-sm">{ngo.email}</Text>
                                    {ngo.volunteer_count !== undefined && (
                                        <View className="flex-row items-center mt-1">
                                            <Feather name="users" size={12} color="#94a3b8" />
                                            <Text className="text-slate-400 text-xs ml-1">
                                                {ngo.volunteer_count} Volunteers
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center pt-3 border-t border-slate-100">
                                <View className={`px-3 py-1 rounded ${ngo.status === 'suspended'
                                        ? 'bg-amber-50 border border-amber-200'
                                        : 'bg-green-50 border border-green-200'
                                    }`}>
                                    <Text className={`text-xs font-medium ${ngo.status === 'suspended' ? 'text-amber-700' : 'text-green-700'
                                        }`}>
                                        {ngo.status === 'suspended' ? 'Suspended' : 'Active'}
                                    </Text>
                                </View>

                                <View className="flex-row">
                                    {ngo.status === 'suspended' ? (
                                        <TouchableOpacity
                                            onPress={() => handleAction('activate', ngo.id)}
                                            disabled={actionLoading === ngo.id}
                                            className="flex-row items-center px-3 py-2 bg-green-50 rounded-lg mr-2 border border-green-200"
                                        >
                                            {actionLoading === ngo.id ? (
                                                <ActivityIndicator size="small" color="#22c55e" />
                                            ) : (
                                                <>
                                                    <Feather name="check-circle" size={16} color="#22c55e" />
                                                    <Text className="text-green-700 font-medium text-sm ml-1">Activate</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => handleAction('suspend', ngo.id)}
                                            disabled={actionLoading === ngo.id}
                                            className="flex-row items-center px-3 py-2 bg-amber-50 rounded-lg mr-2 border border-amber-200"
                                        >
                                            {actionLoading === ngo.id ? (
                                                <ActivityIndicator size="small" color="#f59e0b" />
                                            ) : (
                                                <>
                                                    <Feather name="slash" size={16} color="#f59e0b" />
                                                    <Text className="text-amber-700 font-medium text-sm ml-1">Suspend</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => setDeleteModal({ open: true, ngo })}
                                        className="flex-row items-center px-3 py-2 bg-red-50 rounded-lg border border-red-200"
                                    >
                                        <Feather name="trash-2" size={16} color="#ef4444" />
                                        <Text className="text-red-600 font-medium text-sm ml-1">Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
                <View className="h-8" />
            </ScrollView>

            {/* Delete Confirmation Modal */}
            <Modal visible={deleteModal.open} transparent animationType="fade">
                <View className="flex-1 bg-black/50 items-center justify-center px-6">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <Text className="text-lg font-bold text-slate-900 mb-2">Confirm Delete</Text>
                        <Text className="text-slate-600 mb-6">
                            Are you sure you want to delete <Text className="font-bold">{deleteModal.ngo?.name}</Text>?
                            This action cannot be undone.
                        </Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setDeleteModal({ open: false, ngo: null })}
                                className="flex-1 py-3 bg-slate-100 rounded-xl items-center"
                            >
                                <Text className="text-slate-700 font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => deleteModal.ngo && handleAction('delete', deleteModal.ngo.id)}
                                disabled={actionLoading === deleteModal.ngo?.id}
                                className="flex-1 py-3 bg-red-500 rounded-xl items-center"
                            >
                                {actionLoading === deleteModal.ngo?.id ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Delete</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
