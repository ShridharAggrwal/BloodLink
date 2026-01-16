import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function NGORequestBloodScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        blood_group: '',
        units_needed: 1,
        address: '',
        latitude: 20.5937,
        longitude: 78.9629,
    });
    const [region, setRegion] = useState({
        latitude: 20.5937,
        longitude: 78.9629,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
    });

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            setRegion({ ...region, latitude, longitude });
            setFormData({ ...formData, latitude, longitude });
        } catch (error) {
            console.log('Error getting location:', error);
        }
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

    const useProfileLocation = () => {
        if (user?.latitude && user?.longitude) {
            setFormData({
                ...formData,
                latitude: parseFloat(user.latitude),
                longitude: parseFloat(user.longitude),
                address: user.address || '',
            });
            setRegion({
                ...region,
                latitude: parseFloat(user.latitude),
                longitude: parseFloat(user.longitude),
            });
        } else {
            Alert.alert('Error', 'No location saved in your profile');
        }
    };

    const handleSubmit = async () => {
        if (!formData.blood_group) {
            Alert.alert('Error', 'Please select a blood group');
            return;
        }
        if (!formData.address) {
            Alert.alert('Error', 'Please enter an address');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/blood-requests', formData);
            Alert.alert(
                'Success',
                `Blood request created! ${response.data.alertsSent || 0} nearby donors notified.`,
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-slate-50"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Feather name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-bold text-slate-900">Request Blood</Text>
                    <Text className="text-slate-500 mt-1">Alert nearby donors</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Blood Group Selection */}
                <View className="mb-4">
                    <Text className="text-slate-700 font-medium mb-3">Blood Group *</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {BLOOD_GROUPS.map((bg) => (
                            <TouchableOpacity
                                key={bg}
                                onPress={() => setFormData({ ...formData, blood_group: bg })}
                                className={`px-4 py-3 rounded-xl border ${formData.blood_group === bg
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'bg-white border-slate-200'
                                    }`}
                            >
                                <Text className={`font-bold ${formData.blood_group === bg ? 'text-white' : 'text-slate-700'
                                    }`}>
                                    {bg}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Units Needed */}
                <View className="mb-4">
                    <Text className="text-slate-700 font-medium mb-2">Units Needed</Text>
                    <View className="flex-row items-center bg-white rounded-xl px-4 border border-slate-200">
                        <Feather name="layers" size={20} color="#94a3b8" />
                        <TextInput
                            className="flex-1 py-4 ml-3 text-slate-900"
                            keyboardType="numeric"
                            value={formData.units_needed.toString()}
                            onChangeText={(text) => setFormData({ ...formData, units_needed: parseInt(text) || 1 })}
                        />
                    </View>
                </View>

                {/* Address */}
                <View className="mb-4">
                    <Text className="text-slate-700 font-medium mb-2">Delivery Address *</Text>
                    <View className="flex-row items-center bg-white rounded-xl px-4 border border-slate-200">
                        <Feather name="map-pin" size={20} color="#94a3b8" />
                        <TextInput
                            className="flex-1 py-4 ml-3 text-slate-900"
                            placeholder="Enter address"
                            placeholderTextColor="#94a3b8"
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            multiline
                        />
                    </View>
                </View>

                {/* Location Buttons */}
                <View className="flex-row gap-2 mb-3">
                    <TouchableOpacity
                        onPress={getCurrentLocation}
                        className="flex-row items-center px-4 py-2 bg-emerald-50 rounded-full border border-emerald-200"
                    >
                        <Feather name="navigation" size={16} color="#10b981" />
                        <Text className="text-emerald-700 font-medium ml-2">Current Location</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={useProfileLocation}
                        className="flex-row items-center px-4 py-2 bg-slate-50 rounded-full border border-slate-200"
                    >
                        <Feather name="user" size={16} color="#64748b" />
                        <Text className="text-slate-700 font-medium ml-2">Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Map */}
                <View className="mb-4">
                    <Text className="text-slate-700 font-medium mb-2">Pin Location</Text>
                    <Text className="text-slate-400 text-xs mb-3">Donors within 35km will be notified</Text>
                    <View className="h-48 rounded-2xl overflow-hidden border border-slate-200">
                        <MapView
                            style={{ flex: 1 }}
                            region={region}
                            onPress={handleMapPress}
                        >
                            <Marker
                                coordinate={{
                                    latitude: formData.latitude,
                                    longitude: formData.longitude,
                                }}
                                pinColor="#10b981"
                            />
                        </MapView>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity onPress={handleSubmit} disabled={loading} className="mb-8">
                    <LinearGradient
                        colors={['#ef4444', '#dc2626']}
                        style={{ paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Send Blood Request</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
