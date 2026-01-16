import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '@/services/api';

interface BloodBank {
    id: string;
    name: string;
    email: string;
    contact_info?: string;
    address?: string;
    city?: string;
    is_verified: boolean;
    status: string;
}

export default function BloodBankScreen() {
    const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; bank: BloodBank | null }>({ open: false, bank: null });

    const fetchBloodBanks = async () => {
        try {
            const response = await api.get('/admin/blood-banks');
            setBloodBanks(response.data || []);
        } catch (error) {
            console.log('Failed to fetch blood banks:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBloodBanks();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchBloodBanks();
    };

    const handleAction = async (action: 'suspend' | 'activate' | 'delete', bankId: string) => {
        setActionLoading(bankId);
        try {
            if (action === 'suspend') {
                await api.put(`/admin/suspend/blood_bank/${bankId}`);
                Alert.alert('Success', 'Blood Bank suspended successfully');
            } else if (action === 'activate') {
                await api.put(`/admin/activate/blood_bank/${bankId}`);
                Alert.alert('Success', 'Blood Bank activated successfully');
            } else if (action === 'delete') {
                await api.delete(`/admin/delete/blood_bank/${bankId}`);
                Alert.alert('Success', 'Blood Bank deleted successfully');
                setDeleteModal({ open: false, bank: null });
            }
            fetchBloodBanks();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || `Failed to ${action} Blood Bank`);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredBanks = bloodBanks.filter(bank =>
        bank.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.contact_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bank.city?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Text className="text-2xl font-bold text-slate-900">Blood Banks ({filteredBanks.length})</Text>
                <Text className="text-slate-500 mt-1">Manage blood bank facilities</Text>
            </View>

            {/* Search */}
            <View className="px-6 py-4 bg-white border-b border-slate-100">
                <View className="flex-row items-center bg-slate-100 rounded-xl px-4">
                    <Feather name="search" size={18} color="#94a3b8" />
                    <TextInput
                        className="flex-1 py-3 ml-3 text-slate-900"
                        placeholder="Search blood banks..."
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
                {filteredBanks.length === 0 ? (
                    <View className="items-center py-12">
                        <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                            <Feather name="database" size={28} color="#94a3b8" />
                        </View>
                        <Text className="text-slate-500 font-medium">
                            {searchTerm ? `No blood banks matching "${searchTerm}"` : 'No blood banks found'}
                        </Text>
                    </View>
                ) : (
                    filteredBanks.map((bank) => (
                        <View key={bank.id} className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
                            <View className="flex-row items-start mb-3">
                                <View className="w-12 h-12 rounded-xl bg-purple-100 items-center justify-center">
                                    <Feather name="database" size={24} color="#8b5cf6" />
                                </View>
                                <View className="flex-1 ml-3">
                                    <View className="flex-row items-center">
                                        <Text className="text-slate-900 font-bold text-lg">{bank.name}</Text>
                                        {bank.is_verified && (
                                            <View className="ml-2">
                                                <Feather name="check-circle" size={16} color="#3b82f6" />
                                            </View>
                                        )}
                                    </View>
                                    {bank.contact_info && (
                                        <Text className="text-slate-500 text-sm">{bank.contact_info}</Text>
                                    )}
                                    <Text className="text-slate-400 text-sm">{bank.email}</Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center pt-3 border-t border-slate-100">
                                <View className={`px-3 py-1 rounded ${bank.status === 'suspended'
                                        ? 'bg-amber-50 border border-amber-200'
                                        : 'bg-green-50 border border-green-200'
                                    }`}>
                                    <Text className={`text-xs font-medium ${bank.status === 'suspended' ? 'text-amber-700' : 'text-green-700'
                                        }`}>
                                        {bank.status === 'suspended' ? 'Suspended' : 'Active'}
                                    </Text>
                                </View>

                                <View className="flex-row">
                                    {bank.status === 'suspended' ? (
                                        <TouchableOpacity
                                            onPress={() => handleAction('activate', bank.id)}
                                            disabled={actionLoading === bank.id}
                                            className="flex-row items-center px-3 py-2 bg-green-50 rounded-lg mr-2 border border-green-200"
                                        >
                                            {actionLoading === bank.id ? (
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
                                            onPress={() => handleAction('suspend', bank.id)}
                                            disabled={actionLoading === bank.id}
                                            className="flex-row items-center px-3 py-2 bg-amber-50 rounded-lg mr-2 border border-amber-200"
                                        >
                                            {actionLoading === bank.id ? (
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
                                        onPress={() => setDeleteModal({ open: true, bank })}
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
                            Are you sure you want to delete <Text className="font-bold">{deleteModal.bank?.name}</Text>?
                            This action cannot be undone.
                        </Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setDeleteModal({ open: false, bank: null })}
                                className="flex-1 py-3 bg-slate-100 rounded-xl items-center"
                            >
                                <Text className="text-slate-700 font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => deleteModal.bank && handleAction('delete', deleteModal.bank.id)}
                                disabled={actionLoading === deleteModal.bank?.id}
                                className="flex-1 py-3 bg-red-500 rounded-xl items-center"
                            >
                                {actionLoading === deleteModal.bank?.id ? (
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
