import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];

interface BloodRequest {
    id: string;
    blood_group: string;
    units_needed: number;
    status: string;
    address: string;
    created_at: string;
    accepter_name?: string;
    accepter_contact?: string;
    requester_name?: string;
    requester_contact?: string;
}

export default function AdminProfileScreen() {
    const router = useRouter();
    const { user, updateUser, logout } = useAuth();
    const [activeSection, setActiveSection] = useState<'profile' | 'history'>('profile');
    const [historyTab, setHistoryTab] = useState<'myRequests' | 'accepted'>('myRequests');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        gender: user?.gender || '',
        blood_group: user?.blood_type || user?.blood_group || '',
        address: user?.address || '',
        latitude: user?.latitude ? parseFloat(user.latitude) : 20.5937,
        longitude: user?.longitude ? parseFloat(user.longitude) : 78.9629,
    });

    const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
    const [acceptedRequests, setAcceptedRequests] = useState<BloodRequest[]>([]);

    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [showGenderSelector, setShowGenderSelector] = useState(false);
    const [showBloodTypeSelector, setShowBloodTypeSelector] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const [requestsRes, acceptedRes] = await Promise.all([
                api.get('/blood-requests/my-requests').catch(() => ({ data: [] })),
                api.get('/blood-requests/my-accepted').catch(() => ({ data: [] })),
            ]);
            setMyRequests(requestsRes.data || []);
            setAcceptedRequests(acceptedRes.data || []);
        } catch (error) {
            console.log('Error fetching history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const searchLocation = async (query: string) => {
        setLocationSearch(query);
        if (query.length < 3) {
            setLocationSuggestions([]);
            return;
        }

        try {
            const results = await Location.geocodeAsync(query);
            if (results.length > 0) {
                const suggestions = await Promise.all(
                    results.slice(0, 5).map(async (result) => {
                        const [address] = await Location.reverseGeocodeAsync({
                            latitude: result.latitude,
                            longitude: result.longitude,
                        });
                        return {
                            ...result,
                            displayName: address ?
                                `${address.name || ''}, ${address.city || ''}, ${address.region || ''}` :
                                `${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`,
                        };
                    })
                );
                setLocationSuggestions(suggestions);
            }
        } catch (error) {
            console.log('Error searching location:', error);
        }
    };

    const selectLocation = (suggestion: any) => {
        setFormData({
            ...formData,
            latitude: suggestion.latitude,
            longitude: suggestion.longitude,
            address: suggestion.displayName,
        });
        setLocationSuggestions([]);
        setLocationSearch('');
        mapRef.current?.animateToRegion({
            latitude: suggestion.latitude,
            longitude: suggestion.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

    const handleMapPress = async (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setFormData({ ...formData, latitude, longitude });

        try {
            const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (address) {
                const addressText = [address.name, address.street, address.city, address.region]
                    .filter(Boolean)
                    .join(', ');
                setFormData(prev => ({ ...prev, address: addressText }));
            }
        } catch (error) {
            console.log('Error reverse geocoding:', error);
        }
    };

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            setFormData(prev => ({ ...prev, latitude, longitude }));
            mapRef.current?.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });

            const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (address) {
                const addressText = [address.name, address.street, address.city, address.region]
                    .filter(Boolean)
                    .join(', ');
                setFormData(prev => ({ ...prev, address: addressText }));
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to get current location');
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            await api.put('/users/profile', formData);
            updateUser({ ...user, ...formData });
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            Alert.alert('Error', 'Please fill in all password fields');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await api.put('/users/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            Alert.alert('Success', 'Password changed successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordSection(false);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    logout();
                    router.replace('/(tabs)' as any);
                }
            },
        ]);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'fulfilled': return { bg: 'bg-green-100', text: 'text-green-700' };
            case 'pending': return { bg: 'bg-amber-100', text: 'text-amber-700' };
            case 'accepted': return { bg: 'bg-blue-100', text: 'text-blue-700' };
            case 'cancelled': return { bg: 'bg-red-100', text: 'text-red-700' };
            default: return { bg: 'bg-slate-100', text: 'text-slate-700' };
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View className="bg-blue-500 pt-14 pb-6 px-6 rounded-b-3xl">
                <View className="items-center">
                    <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-3">
                        <Text className="text-white text-3xl font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </Text>
                    </View>
                    <Text className="text-white text-xl font-bold">{user?.name}</Text>
                    <View className="flex-row items-center mt-1">
                        <Feather name="shield" size={14} color="rgba(255,255,255,0.8)" />
                        <Text className="text-white/80 text-sm ml-1">Administrator</Text>
                    </View>
                </View>
            </View>

            {/* Section Tabs */}
            <View className="flex-row bg-white mx-6 mt-4 p-1 rounded-xl border border-slate-200">
                <TouchableOpacity
                    onPress={() => setActiveSection('profile')}
                    className={`flex-1 py-3 rounded-lg items-center ${activeSection === 'profile' ? 'bg-blue-500' : ''}`}
                >
                    <Text className={`font-medium ${activeSection === 'profile' ? 'text-white' : 'text-slate-600'}`}>
                        Profile
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveSection('history')}
                    className={`flex-1 py-3 rounded-lg items-center ${activeSection === 'history' ? 'bg-blue-500' : ''}`}
                >
                    <Text className={`font-medium ${activeSection === 'history' ? 'text-white' : 'text-slate-600'}`}>
                        History
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-4">
                {activeSection === 'profile' ? (
                    <>
                        {/* Personal Info */}
                        <View className="bg-white rounded-2xl p-5 mb-4 border border-slate-100">
                            <Text className="text-slate-900 font-bold mb-4">Personal Information</Text>

                            {/* Name */}
                            <View className="mb-4">
                                <Text className="text-slate-700 text-sm font-medium mb-2">Full Name</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    placeholder="Your name"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            {/* Email */}
                            <View className="mb-4">
                                <Text className="text-slate-700 text-sm font-medium mb-2">Email</Text>
                                <TextInput
                                    className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500"
                                    value={formData.email}
                                    editable={false}
                                />
                            </View>

                            {/* Phone */}
                            <View className="mb-4">
                                <Text className="text-slate-700 text-sm font-medium mb-2">Phone Number</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                    placeholder="Phone number"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            {/* Gender Selector */}
                            <View className="mb-4">
                                <Text className="text-slate-700 text-sm font-medium mb-2">Gender</Text>
                                <TouchableOpacity
                                    onPress={() => setShowGenderSelector(!showGenderSelector)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                                >
                                    <Text className={formData.gender ? 'text-slate-900' : 'text-slate-400'}>
                                        {formData.gender || 'Select gender'}
                                    </Text>
                                    <Feather name={showGenderSelector ? 'chevron-up' : 'chevron-down'} size={20} color="#94a3b8" />
                                </TouchableOpacity>
                                {showGenderSelector && (
                                    <View className="bg-white border border-slate-200 rounded-xl mt-2 overflow-hidden">
                                        {GENDERS.map((g) => (
                                            <TouchableOpacity
                                                key={g}
                                                onPress={() => {
                                                    setFormData({ ...formData, gender: g });
                                                    setShowGenderSelector(false);
                                                }}
                                                className={`px-4 py-3 border-b border-slate-100 ${formData.gender === g ? 'bg-blue-50' : ''}`}
                                            >
                                                <Text className={formData.gender === g ? 'text-blue-600 font-medium' : 'text-slate-700'}>
                                                    {g}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Blood Type Selector */}
                            <View className="mb-4">
                                <Text className="text-slate-700 text-sm font-medium mb-2">Blood Type</Text>
                                <TouchableOpacity
                                    onPress={() => setShowBloodTypeSelector(!showBloodTypeSelector)}
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex-row justify-between items-center"
                                >
                                    <Text className={formData.blood_group ? 'text-slate-900' : 'text-slate-400'}>
                                        {formData.blood_group || 'Select blood type'}
                                    </Text>
                                    <Feather name={showBloodTypeSelector ? 'chevron-up' : 'chevron-down'} size={20} color="#94a3b8" />
                                </TouchableOpacity>
                                {showBloodTypeSelector && (
                                    <View className="flex-row flex-wrap gap-2 mt-2">
                                        {BLOOD_TYPES.map((bt) => (
                                            <TouchableOpacity
                                                key={bt}
                                                onPress={() => {
                                                    setFormData({ ...formData, blood_group: bt });
                                                    setShowBloodTypeSelector(false);
                                                }}
                                                className={`px-4 py-2 rounded-lg border ${formData.blood_group === bt
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'bg-white border-slate-200'
                                                    }`}
                                            >
                                                <Text className={formData.blood_group === bt ? 'text-white font-bold' : 'text-slate-700'}>
                                                    {bt}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {/* Address */}
                            <View className="mb-4">
                                <Text className="text-slate-700 text-sm font-medium mb-2">Address</Text>
                                <TextInput
                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                                    value={formData.address}
                                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                                    placeholder="Your address"
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                />
                            </View>
                        </View>

                        {/* Location Section */}
                        <View className="bg-white rounded-2xl p-5 mb-4 border border-slate-100">
                            <Text className="text-slate-900 font-bold mb-4">Location</Text>

                            {/* Location Search */}
                            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 mb-3">
                                <Feather name="search" size={18} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 py-3 ml-3 text-slate-900"
                                    placeholder="Search location..."
                                    placeholderTextColor="#94a3b8"
                                    value={locationSearch}
                                    onChangeText={searchLocation}
                                />
                            </View>

                            {locationSuggestions.length > 0 && (
                                <View className="bg-white border border-slate-200 rounded-xl mb-3">
                                    {locationSuggestions.map((s, i) => (
                                        <TouchableOpacity
                                            key={i}
                                            onPress={() => selectLocation(s)}
                                            className="px-4 py-3 border-b border-slate-100"
                                        >
                                            <Text className="text-slate-900">{s.displayName}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={getCurrentLocation}
                                className="flex-row items-center justify-center py-2 bg-blue-50 rounded-xl mb-3"
                            >
                                <Feather name="navigation" size={16} color="#3b82f6" />
                                <Text className="text-blue-600 font-medium ml-2">Use Current Location</Text>
                            </TouchableOpacity>

                            {/* Map */}
                            <View className="h-48 rounded-2xl overflow-hidden border border-slate-200">
                                <MapView
                                    ref={mapRef}
                                    style={{ flex: 1 }}
                                    initialRegion={{
                                        latitude: formData.latitude,
                                        longitude: formData.longitude,
                                        latitudeDelta: 0.02,
                                        longitudeDelta: 0.02,
                                    }}
                                    onPress={handleMapPress}
                                >
                                    <Marker
                                        coordinate={{
                                            latitude: formData.latitude,
                                            longitude: formData.longitude,
                                        }}
                                        pinColor="#3b82f6"
                                    />
                                </MapView>
                            </View>
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity onPress={handleSaveProfile} disabled={loading} className="mb-4">
                            <LinearGradient
                                colors={['#3b82f6', '#2563eb']}
                                style={{ paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Save Profile</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Change Password */}
                        <View className="bg-white rounded-2xl p-5 mb-4 border border-slate-100">
                            <TouchableOpacity
                                onPress={() => setShowPasswordSection(!showPasswordSection)}
                                className="flex-row items-center justify-between"
                            >
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-amber-100 rounded-xl items-center justify-center mr-3">
                                        <Feather name="lock" size={20} color="#f59e0b" />
                                    </View>
                                    <Text className="text-slate-900 font-medium">Change Password</Text>
                                </View>
                                <Feather name={showPasswordSection ? 'chevron-up' : 'chevron-down'} size={20} color="#94a3b8" />
                            </TouchableOpacity>

                            {showPasswordSection && (
                                <View className="mt-4 pt-4 border-t border-slate-100">
                                    <TextInput
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-3"
                                        placeholder="Current Password"
                                        placeholderTextColor="#94a3b8"
                                        secureTextEntry
                                        value={passwordData.currentPassword}
                                        onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                                    />
                                    <TextInput
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-3"
                                        placeholder="New Password"
                                        placeholderTextColor="#94a3b8"
                                        secureTextEntry
                                        value={passwordData.newPassword}
                                        onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                                    />
                                    <TextInput
                                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-4"
                                        placeholder="Confirm New Password"
                                        placeholderTextColor="#94a3b8"
                                        secureTextEntry
                                        value={passwordData.confirmPassword}
                                        onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                                    />
                                    <TouchableOpacity
                                        onPress={handleChangePassword}
                                        disabled={loading}
                                        className="bg-amber-500 py-3 rounded-xl items-center"
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="white" />
                                        ) : (
                                            <Text className="text-white font-bold">Update Password</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Logout */}
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="bg-white rounded-2xl p-4 mb-8 border border-red-100 flex-row items-center justify-center"
                        >
                            <Feather name="log-out" size={20} color="#ef4444" />
                            <Text className="text-red-500 font-bold ml-2">Logout</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        {/* History Tabs */}
                        <View className="flex-row bg-slate-100 p-1 rounded-xl mb-4">
                            <TouchableOpacity
                                onPress={() => setHistoryTab('myRequests')}
                                className={`flex-1 py-2 rounded-lg items-center ${historyTab === 'myRequests' ? 'bg-white' : ''}`}
                            >
                                <Text className={`font-medium ${historyTab === 'myRequests' ? 'text-blue-600' : 'text-slate-500'}`}>
                                    My Requests
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setHistoryTab('accepted')}
                                className={`flex-1 py-2 rounded-lg items-center ${historyTab === 'accepted' ? 'bg-white' : ''}`}
                            >
                                <Text className={`font-medium ${historyTab === 'accepted' ? 'text-blue-600' : 'text-slate-500'}`}>
                                    Accepted
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {historyLoading ? (
                            <View className="items-center py-12">
                                <ActivityIndicator size="large" color="#3b82f6" />
                            </View>
                        ) : historyTab === 'myRequests' ? (
                            myRequests.length === 0 ? (
                                <View className="items-center py-12">
                                    <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                                        <Feather name="file-text" size={28} color="#94a3b8" />
                                    </View>
                                    <Text className="text-slate-500 font-medium">No requests yet</Text>
                                </View>
                            ) : (
                                myRequests.map((request) => {
                                    const statusStyle = getStatusColor(request.status);
                                    return (
                                        <View key={request.id} className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
                                            <View className="flex-row items-center justify-between mb-2">
                                                <View className="flex-row items-center">
                                                    <View className="w-10 h-10 rounded-xl bg-red-500 items-center justify-center">
                                                        <Text className="text-white font-bold">{request.blood_group}</Text>
                                                    </View>
                                                    <View className="ml-3">
                                                        <Text className="text-slate-900 font-bold">{request.units_needed} unit(s)</Text>
                                                        <Text className="text-slate-400 text-xs">{formatDate(request.created_at)}</Text>
                                                    </View>
                                                </View>
                                                <View className={`px-2 py-1 rounded ${statusStyle.bg}`}>
                                                    <Text className={`text-xs font-medium capitalize ${statusStyle.text}`}>
                                                        {request.status}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text className="text-slate-500 text-sm">{request.address}</Text>
                                            {request.accepter_name && (
                                                <View className="flex-row items-center mt-2 pt-2 border-t border-slate-100">
                                                    <Feather name="user" size={14} color="#3b82f6" />
                                                    <Text className="text-blue-600 text-sm ml-1">
                                                        Accepted by: {request.accepter_name}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })
                            )
                        ) : (
                            acceptedRequests.length === 0 ? (
                                <View className="items-center py-12">
                                    <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                                        <Feather name="heart" size={28} color="#94a3b8" />
                                    </View>
                                    <Text className="text-slate-500 font-medium">No accepted requests</Text>
                                </View>
                            ) : (
                                acceptedRequests.map((request) => {
                                    const statusStyle = getStatusColor(request.status);
                                    return (
                                        <View key={request.id} className="bg-white rounded-2xl p-4 mb-3 border border-slate-100">
                                            <View className="flex-row items-center justify-between mb-2">
                                                <View className="flex-row items-center">
                                                    <View className="w-10 h-10 rounded-xl bg-emerald-500 items-center justify-center">
                                                        <Feather name="heart" size={20} color="white" />
                                                    </View>
                                                    <View className="ml-3">
                                                        <Text className="text-slate-900 font-bold">
                                                            {request.blood_group} - {request.units_needed} unit(s)
                                                        </Text>
                                                        <Text className="text-slate-400 text-xs">{formatDate(request.created_at)}</Text>
                                                    </View>
                                                </View>
                                                <View className={`px-2 py-1 rounded ${statusStyle.bg}`}>
                                                    <Text className={`text-xs font-medium capitalize ${statusStyle.text}`}>
                                                        {request.status}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text className="text-slate-500 text-sm">{request.address}</Text>
                                            {request.requester_name && (
                                                <View className="flex-row items-center mt-2 pt-2 border-t border-slate-100">
                                                    <Feather name="user" size={14} color="#10b981" />
                                                    <Text className="text-emerald-600 text-sm ml-1">
                                                        Requested by: {request.requester_name}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })
                            )
                        )}
                    </>
                )}
                <View className="h-8" />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
