import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const VIOLET_500 = '#8b5cf6';

interface BloodRequest {
    id: string;
    blood_group: string;
    units_needed: number;
    status: string;
    address: string;
    created_at: string;
    accepter_name?: string;
    accepter_contact?: string;
    accepter_email?: string;
    requester_name?: string;
    requester_contact?: string;
}

export default function BloodBankProfileScreen() {
    const { user, updateUser, logout } = useAuth();
    const [activeSection, setActiveSection] = useState<'profile' | 'history'>('profile');
    const [historyTab, setHistoryTab] = useState<'myRequests' | 'accepted'>('myRequests');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        contact_info: user?.contact_info || user?.phone || '',
        address: user?.address || '',
        latitude: user?.latitude ? parseFloat(user.latitude) : 20.5937,
        longitude: user?.longitude ? parseFloat(user.longitude) : 78.9629,
        profile_image: user?.profile_image || '',
    });

    const [myRequests, setMyRequests] = useState<BloodRequest[]>([]);
    const [acceptedRequests, setAcceptedRequests] = useState<BloodRequest[]>([]);

    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
    const [searchingLocation, setSearchingLocation] = useState(false);

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        fetchProfile();
        fetchHistory();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/blood-bank/profile');
            const data = response.data;
            setFormData(prev => ({
                ...prev,
                name: data.name || prev.name,
                contact_info: data.contact_info || prev.contact_info,
                address: data.address || prev.address,
                latitude: data.lat ? parseFloat(data.lat) : prev.latitude,
                longitude: data.lng ? parseFloat(data.lng) : prev.longitude,
                profile_image: data.profile_image || prev.profile_image,
            }));
        } catch (error) {
            console.log('Error fetching profile:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            const [requestsRes, acceptedRes] = await Promise.all([
                api.get('/blood-requests/my-requests'),
                api.get('/blood-requests/my-accepted'),
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

        setSearchingLocation(true);
        try {
            const results = await Location.geocodeAsync(query);
            if (results.length > 0) {
                const suggestions = await Promise.all(
                    results.slice(0, 5).map(async (result) => {
                        const address = await Location.reverseGeocodeAsync({
                            latitude: result.latitude,
                            longitude: result.longitude,
                        });
                        return {
                            ...result,
                            address: address[0] || {},
                            displayName: address[0]
                                ? `${address[0].city || address[0].region || ''}, ${address[0].country || ''}`
                                : `${result.latitude.toFixed(4)}, ${result.longitude.toFixed(4)}`,
                        };
                    })
                );
                setLocationSuggestions(suggestions);
            }
        } catch (error) {
            setLocationSuggestions([]);
        } finally {
            setSearchingLocation(false);
        }
    };

    const selectLocation = async (suggestion: any) => {
        const { latitude, longitude, address } = suggestion;
        setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            address: `${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.replace(/^, |, $/g, ''),
        }));
        setLocationSearch('');
        setLocationSuggestions([]);
        mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 1000);
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

            const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (geocode.length > 0) {
                const addr = geocode[0];
                const addressString = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.country || ''}`.replace(/^, |, $/g, '');
                setFormData(prev => ({ ...prev, address: addressString }));
            }
            mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 1000);
        } catch (error) {
            Alert.alert('Error', 'Could not get your location');
        }
    };

    const handleMapPress = async (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setFormData(prev => ({ ...prev, latitude, longitude }));
        try {
            const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (geocode.length > 0) {
                const addr = geocode[0];
                const addressString = `${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''}, ${addr.country || ''}`.replace(/^, |, $/g, '');
                setFormData(prev => ({ ...prev, address: addressString }));
            }
        } catch (error) {
            console.log('Geocoding error:', error);
        }
    };

    const pickProfileImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setFormData(prev => ({ ...prev, profile_image: result.assets[0].uri }));
            }
        } catch (error) {
            Alert.alert('Error', 'Could not pick image');
        }
    };

    const handleUpdateProfile = async () => {
        if (!formData.name || !formData.contact_info) {
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.put('/blood-bank/profile', {
                name: formData.name,
                contact_info: formData.contact_info,
                address: formData.address,
                latitude: formData.latitude,
                longitude: formData.longitude,
            });
            if (response.data.bloodBank) {
                await updateUser(response.data.bloodBank);
            }
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            Alert.alert('Error', 'Please fill in all password fields');
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.put('/blood-bank/change-password', {
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
                onPress: async () => {
                    await logout();
                    router.replace('/(tabs)' as any);
                },
            },
        ]);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'fulfilled': return 'bg-green-100 text-green-700';
            case 'accepted': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-gray-100 text-gray-500';
            default: return 'bg-amber-100 text-amber-700';
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">Profile</Text>
                <Text className="text-gray-500 mt-1">Manage institution details</Text>
            </View>

            {/* Section Tabs */}
            <View className="flex-row mx-6 mt-4 bg-gray-100 rounded-xl p-1">
                <TouchableOpacity
                    onPress={() => setActiveSection('profile')}
                    className={`flex-1 py-3 rounded-lg ${activeSection === 'profile' ? 'bg-white' : ''}`}
                >
                    <Text className={`text-center font-medium ${activeSection === 'profile' ? 'text-gray-900' : 'text-gray-500'}`}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveSection('history')}
                    className={`flex-1 py-3 rounded-lg ${activeSection === 'history' ? 'bg-white' : ''}`}
                >
                    <Text className={`text-center font-medium ${activeSection === 'history' ? 'text-gray-900' : 'text-gray-500'}`}>History</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-4" keyboardShouldPersistTaps="handled">
                {activeSection === 'profile' ? (
                    <>
                        {/* Personal Information Structure from User Dashboard */}
                        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                            <Text className="text-lg font-bold text-gray-900 mb-4">Institution Information</Text>

                            {/* Name */}
                            <View className="mb-4">
                                <Text className="text-gray-700 font-medium mb-2">Blood Bank Name</Text>
                                <View className="bg-gray-50 rounded-xl px-4 border border-gray-200">
                                    <TextInput
                                        className="py-4 text-gray-900"
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    />
                                </View>
                            </View>

                            {/* Email */}
                            <View className="mb-4">
                                <Text className="text-gray-700 font-medium mb-2">Email Address</Text>
                                <View className="bg-gray-100 rounded-xl px-4 border border-gray-200">
                                    <TextInput
                                        className="py-4 text-gray-500"
                                        value={formData.email}
                                        editable={false}
                                    />
                                </View>
                            </View>

                            {/* Contact Info */}
                            <View className="mb-4">
                                <Text className="text-gray-700 font-medium mb-2">Contact Info</Text>
                                <View className="bg-gray-50 rounded-xl px-4 border border-gray-200">
                                    <TextInput
                                        className="py-4 text-gray-900"
                                        value={formData.contact_info}
                                        onChangeText={(text) => setFormData({ ...formData, contact_info: text })}
                                    />
                                </View>
                            </View>

                            {/* Address */}
                            <View className="mb-4">
                                <Text className="text-gray-700 font-medium mb-2">Address</Text>
                                <View className="bg-gray-50 rounded-xl px-4 border border-gray-200">
                                    <TextInput
                                        className="py-4 text-gray-900"
                                        value={formData.address}
                                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                                        multiline
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Location Section */}
                        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                            <Text className="text-lg font-bold text-gray-900 mb-1">Location</Text>
                            <Text className="text-gray-400 text-sm mb-4">Click on map or search to set location</Text>

                            {/* Search */}
                            <View className="relative z-50 mb-3">
                                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 border border-gray-200">
                                    <Feather name="search" size={18} color="#9ca3af" />
                                    <TextInput
                                        className="flex-1 py-3 px-3 text-gray-900"
                                        placeholder="Search location..."
                                        placeholderTextColor="#9ca3af"
                                        value={locationSearch}
                                        onChangeText={searchLocation}
                                    />
                                    {searchingLocation && <ActivityIndicator size="small" color="#3b82f6" />}
                                </View>
                                {locationSuggestions.length > 0 && (
                                    <View className="absolute top-12 left-0 right-0 bg-white rounded-xl border border-gray-200 z-50 max-h-40">
                                        <ScrollView>
                                            {locationSuggestions.map((suggestion, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    className="flex-row items-center px-4 py-3 border-b border-gray-100"
                                                    onPress={() => selectLocation(suggestion)}
                                                >
                                                    <Feather name="map-pin" size={16} color="#64748b" />
                                                    <Text className="text-gray-900 ml-3 flex-1">{suggestion.displayName}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity onPress={getCurrentLocation} className="flex-row items-center px-4 py-2 border border-gray-200 rounded-full bg-white mb-3 self-start">
                                <Feather name="navigation" size={14} color="#3b82f6" />
                                <Text className="text-blue-600 font-medium ml-2 text-sm">Use My Location</Text>
                            </TouchableOpacity>

                            <View className="h-48 rounded-xl overflow-hidden border border-gray-200 mb-3">
                                <MapView
                                    ref={mapRef}
                                    style={{ flex: 1 }}
                                    initialRegion={{
                                        latitude: formData.latitude,
                                        longitude: formData.longitude,
                                        latitudeDelta: 0.1,
                                        longitudeDelta: 0.1,
                                    }}
                                    onPress={handleMapPress}
                                >
                                    <Marker coordinate={{ latitude: formData.latitude, longitude: formData.longitude }} />
                                </MapView>
                            </View>
                        </View>

                        {/* Profile Picture */}
                        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 items-center">
                            <Text className="text-lg font-bold text-gray-900 mb-4">Profile Picture</Text>
                            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center overflow-hidden mb-3">
                                {formData.profile_image ? (
                                    <Image source={{ uri: formData.profile_image }} className="w-full h-full" />
                                ) : (
                                    <Feather name="user" size={40} color="#9ca3af" />
                                )}
                            </View>
                            <TouchableOpacity onPress={pickProfileImage}>
                                <Text className="text-rose-500 font-medium">Change Photo</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Account Actions */}
                        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                            <Text className="text-lg font-bold text-gray-900 mb-4">Account Actions</Text>

                            <TouchableOpacity onPress={handleUpdateProfile} disabled={loading} className="mb-3">
                                <View className={`py-4 rounded-xl items-center ${loading ? 'bg-gray-300' : 'bg-gray-900'}`}>
                                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Save Changes</Text>}
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setShowPasswordSection(!showPasswordSection)}
                                className="py-4 rounded-xl items-center border border-gray-200"
                            >
                                <Text className="text-gray-700 font-medium">Change Password</Text>
                            </TouchableOpacity>

                            {showPasswordSection && (
                                <View className="mt-4">
                                    <View className="mb-3">
                                        <TextInput
                                            className="bg-gray-50 rounded-xl px-4 py-4 border border-gray-200"
                                            placeholder="Current Password"
                                            placeholderTextColor="#9ca3af"
                                            secureTextEntry
                                            value={passwordData.currentPassword}
                                            onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                                        />
                                    </View>
                                    <View className="mb-3">
                                        <TextInput
                                            className="bg-gray-50 rounded-xl px-4 py-4 border border-gray-200"
                                            placeholder="New Password"
                                            placeholderTextColor="#9ca3af"
                                            secureTextEntry
                                            value={passwordData.newPassword}
                                            onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                                        />
                                    </View>
                                    <View className="mb-3">
                                        <TextInput
                                            className="bg-gray-50 rounded-xl px-4 py-4 border border-gray-200"
                                            placeholder="Confirm New Password"
                                            placeholderTextColor="#9ca3af"
                                            secureTextEntry
                                            value={passwordData.confirmPassword}
                                            onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                                        />
                                    </View>
                                    <TouchableOpacity onPress={handleChangePassword} className="bg-gray-800 py-4 rounded-xl items-center">
                                        <Text className="text-white font-bold">Update Password</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Logout */}
                        <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center py-4 mb-8 bg-white rounded-2xl border border-red-200">
                            <Feather name="log-out" size={20} color="#ef4444" />
                            <Text className="text-rose-500 font-bold ml-2">Logout</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    /* History Section */
                    <>
                        <View className="flex-row mb-4 gap-2">
                            <TouchableOpacity
                                onPress={() => setHistoryTab('myRequests')}
                                className={`px-4 py-2 rounded-lg ${historyTab === 'myRequests' ? 'bg-rose-100' : 'bg-gray-100'}`}
                            >
                                <Text className={historyTab === 'myRequests' ? 'text-rose-700 font-medium' : 'text-gray-500'}>
                                    Generated ({myRequests.length})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setHistoryTab('accepted')}
                                className={`px-4 py-2 rounded-lg ${historyTab === 'accepted' ? 'bg-rose-100' : 'bg-gray-100'}`}
                            >
                                <Text className={historyTab === 'accepted' ? 'text-rose-700 font-medium' : 'text-gray-500'}>
                                    Fulfilled ({acceptedRequests.length})
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {historyLoading ? (
                            <ActivityIndicator size="large" color="#ef4444" className="mt-8" />
                        ) : historyTab === 'myRequests' ? (
                            myRequests.length === 0 ? (
                                <View className="items-center py-12">
                                    <Text className="text-gray-400">No requests created yet</Text>
                                </View>
                            ) : (
                                myRequests.map((request) => (
                                    <View key={request.id} className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
                                        <View className="flex-row items-center justify-between mb-3">
                                            <View className="flex-row items-center">
                                                <View className="w-10 h-10 rounded-xl bg-violet-100 items-center justify-center">
                                                    <Text className="text-violet-700 font-bold">{request.blood_group}</Text>
                                                </View>
                                                <View className="ml-3">
                                                    <Text className="font-bold text-gray-900">{request.units_needed} Unit(s)</Text>
                                                    <View className={`px-2 py-0.5 rounded-full self-start mt-0.5 ${getStatusColor(request.status)}`}>
                                                        <Text className="text-xs font-medium capitalize">{request.status}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            <Text className="text-gray-400 text-xs">{new Date(request.created_at).toLocaleDateString()}</Text>
                                        </View>
                                        <Text className="text-gray-500 text-sm mb-2">{request.address}</Text>

                                        {request.status === 'accepted' && request.accepter_name && (
                                            <View className="bg-blue-50 rounded-xl p-3 border border-blue-100 mt-2">
                                                <Text className="text-blue-800 font-medium text-xs">Accepted by: {request.accepter_name}</Text>
                                                {request.accepter_contact && <Text className="text-blue-600 text-xs">Ph: {request.accepter_contact}</Text>}
                                            </View>
                                        )}
                                    </View>
                                ))
                            )
                        ) : acceptedRequests.length === 0 ? (
                            <View className="items-center py-12">
                                <Text className="text-gray-400">No requests fulfilled yet</Text>
                            </View>
                        ) : (
                            acceptedRequests.map((request) => (
                                <View key={request.id} className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center">
                                            <Text className="text-green-700 font-bold">{request.blood_group}</Text>
                                        </View>
                                        <View className="ml-3 flex-1">
                                            <Text className="font-bold text-gray-900">{request.units_needed} Unit(s)</Text>
                                            <Text className="text-gray-500 text-xs">Requested by: {request.requester_name}</Text>
                                        </View>
                                        <View className={`px-2 py-0.5 rounded-full ${getStatusColor(request.status)}`}>
                                            <Text className="text-xs font-medium capitalize">{request.status}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                        <View className="h-8" />
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
