import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, Alert, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '@/services/api';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    blood_group?: string;
    is_verified: boolean;
    status: string;
    profile_image_url?: string;
}

export default function UsersScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data || []);
        } catch (error) {
            console.log('Failed to fetch users:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchUsers();
    };

    const handleAction = async (action: 'suspend' | 'activate' | 'delete', userId: string) => {
        setActionLoading(userId);
        try {
            if (action === 'suspend') {
                await api.put(`/admin/suspend/user/${userId}`);
                Alert.alert('Success', 'User suspended successfully');
            } else if (action === 'activate') {
                await api.put(`/admin/activate/user/${userId}`);
                Alert.alert('Success', 'User activated successfully');
            } else if (action === 'delete') {
                await api.delete(`/admin/delete/user/${userId}`);
                Alert.alert('Success', 'User deleted successfully');
                setDeleteModal({ open: false, user: null });
            }
            fetchUsers();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || `Failed to ${action} user`);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.blood_group?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <Text className="text-2xl font-bold text-slate-900">Users ({filteredUsers.length})</Text>
                <Text className="text-slate-500 mt-1">Manage registered users</Text>
            </View>

            {/* Search */}
            <View className="px-6 py-4 bg-white border-b border-slate-100">
                <View className="flex-row items-center bg-slate-100 rounded-xl px-4">
                    <Feather name="search" size={18} color="#94a3b8" />
                    <TextInput
                        className="flex-1 py-3 ml-3 text-slate-900"
                        placeholder="Search users..."
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
                {filteredUsers.length === 0 ? (
                    <View className="items-center py-12">
                        <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                            <Feather name="users" size={28} color="#94a3b8" />
                        </View>
                        <Text className="text-slate-500 font-medium">
                            {searchTerm ? `No users matching "${searchTerm}"` : 'No users found'}
                        </Text>
                    </View>
                ) : (
                    filteredUsers.map((user) => (
                        <View key={user.id} className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
                            <View className="flex-row items-center mb-3">
                                <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center">
                                    <Text className="text-white font-bold text-lg">
                                        {user.name?.charAt(0).toUpperCase() || 'U'}
                                    </Text>
                                </View>
                                <View className="flex-1 ml-3">
                                    <Text className="text-slate-900 font-bold">{user.name}</Text>
                                    <Text className="text-slate-500 text-sm">{user.email}</Text>
                                </View>
                            </View>

                            <View className="flex-row justify-between items-center pt-3 border-t border-slate-100">
                                <View className="flex-row">
                                    <View className="bg-slate-100 px-2 py-1 rounded mr-2">
                                        <Text className="text-slate-700 text-xs font-bold">
                                            {user.blood_group || 'N/A'}
                                        </Text>
                                    </View>
                                    <View className={`px-2 py-1 rounded ${user.status === 'suspended'
                                            ? 'bg-amber-50 border border-amber-200'
                                            : user.is_verified
                                                ? 'bg-green-50 border border-green-200'
                                                : 'bg-blue-50 border border-blue-200'
                                        }`}>
                                        <Text className={`text-xs font-medium ${user.status === 'suspended'
                                                ? 'text-amber-700'
                                                : user.is_verified
                                                    ? 'text-green-700'
                                                    : 'text-blue-700'
                                            }`}>
                                            {user.status === 'suspended' ? 'Suspended' : user.is_verified ? 'Verified' : 'Active'}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row">
                                    {user.status === 'suspended' ? (
                                        <TouchableOpacity
                                            onPress={() => handleAction('activate', user.id)}
                                            disabled={actionLoading === user.id}
                                            className="p-2 bg-green-50 rounded-lg mr-2"
                                        >
                                            {actionLoading === user.id ? (
                                                <ActivityIndicator size="small" color="#22c55e" />
                                            ) : (
                                                <Feather name="check-circle" size={18} color="#22c55e" />
                                            )}
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => handleAction('suspend', user.id)}
                                            disabled={actionLoading === user.id}
                                            className="p-2 bg-amber-50 rounded-lg mr-2"
                                        >
                                            {actionLoading === user.id ? (
                                                <ActivityIndicator size="small" color="#f59e0b" />
                                            ) : (
                                                <Feather name="slash" size={18} color="#f59e0b" />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => setDeleteModal({ open: true, user })}
                                        className="p-2 bg-red-50 rounded-lg"
                                    >
                                        <Feather name="trash-2" size={18} color="#ef4444" />
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
                            Are you sure you want to delete <Text className="font-bold">{deleteModal.user?.name}</Text>?
                            This action cannot be undone.
                        </Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setDeleteModal({ open: false, user: null })}
                                className="flex-1 py-3 bg-slate-100 rounded-xl items-center"
                            >
                                <Text className="text-slate-700 font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => deleteModal.user && handleAction('delete', deleteModal.user.id)}
                                disabled={actionLoading === deleteModal.user?.id}
                                className="flex-1 py-3 bg-red-500 rounded-xl items-center"
                            >
                                {actionLoading === deleteModal.user?.id ? (
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
