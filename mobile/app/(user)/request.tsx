import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RequestBloodScreen() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        blood_group: '',
        units_needed: '1',
        address: '',
        latitude: user?.latitude || 20.5937,
        longitude: user?.longitude || 78.9629,
        prescription_image_url: '',
    });
    const [loading, setLoading] = useState(false);
    const [showBloodTypeSelector, setShowBloodTypeSelector] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
    const [searchingLocation, setSearchingLocation] = useState(false);
    const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const mapRef = useRef<MapView>(null);

    // Search for location suggestions
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
            } else {
                setLocationSuggestions([]);
            }
        } catch (error) {
            console.log('Location search error:', error);
            setLocationSuggestions([]);
        } finally {
            setSearchingLocation(false);
        }
    };

    // Select a location from suggestions
    const selectLocation = async (suggestion: any) => {
        const { latitude, longitude, address } = suggestion;

        setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            address: `${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.country || ''}`.replace(/^, |, $/g, '').replace(/, ,/g, ','),
        }));

        setLocationSearch('');
        setLocationSuggestions([]);

        mapRef.current?.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        }, 1000);
    };

    // Get user's current location
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

            mapRef.current?.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        } catch (error) {
            Alert.alert('Error', 'Could not get your location');
        }
    };

    // Use profile location
    const useProfileLocation = () => {
        if (user?.latitude && user?.longitude) {
            setFormData(prev => ({
                ...prev,
                latitude: parseFloat(user.latitude),
                longitude: parseFloat(user.longitude),
                address: user.address || '',
            }));

            mapRef.current?.animateToRegion({
                latitude: parseFloat(user.latitude),
                longitude: parseFloat(user.longitude),
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            }, 1000);
        } else {
            Alert.alert('No Profile Location', 'Please set your location in your profile first');
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

    // Pick prescription image
    const pickPrescriptionImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera roll permissions are required');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setPrescriptionImage(result.assets[0].uri);
                setUploadingImage(true);

                // Upload to backend
                try {
                    const formDataUpload = new FormData();
                    formDataUpload.append('image', {
                        uri: result.assets[0].uri,
                        type: 'image/jpeg',
                        name: 'prescription.jpg',
                    } as any);

                    const uploadResponse = await api.post('/upload/prescription', formDataUpload, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });

                    setFormData(prev => ({ ...prev, prescription_image_url: uploadResponse.data.url }));
                } catch (uploadError) {
                    console.log('Upload error:', uploadError);
                    // For now, use local URI as fallback
                    setFormData(prev => ({ ...prev, prescription_image_url: result.assets[0].uri }));
                } finally {
                    setUploadingImage(false);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Could not pick image');
        }
    };

    const handleSubmit = async () => {
        if (!formData.blood_group) {
            Alert.alert('Error', 'Please select a blood group');
            return;
        }

        if (!formData.address) {
            Alert.alert('Error', 'Please enter the address');
            return;
        }

        if (!formData.prescription_image_url && !prescriptionImage) {
            Alert.alert('Error', 'Please upload a prescription image');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/blood-requests', {
                blood_group: formData.blood_group,
                units_needed: parseInt(formData.units_needed),
                address: formData.address,
                latitude: formData.latitude.toString(),
                longitude: formData.longitude.toString(),
                prescription_image_url: formData.prescription_image_url || prescriptionImage,
            });

            Alert.alert(
                'Request Submitted',
                `Your blood request has been broadcast! ${response.data.alertsSent || 0} donors notified.`,
                [{
                    text: 'OK',
                    onPress: () => {
                        setFormData({
                            blood_group: '',
                            units_needed: '1',
                            address: '',
                            latitude: user?.latitude || 20.5937,
                            longitude: user?.longitude || 78.9629,
                            prescription_image_url: '',
                        });
                        setPrescriptionImage(null);
                    }
                }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-gray-50"
        >
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">Request Blood</Text>
                <Text className="text-gray-500 mt-1">Create a blood request to notify nearby donors</Text>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                keyboardShouldPersistTaps="handled"
            >
                {/* Blood Group Selector */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Blood Group</Text>
                    <TouchableOpacity
                        onPress={() => setShowBloodTypeSelector(!showBloodTypeSelector)}
                        className="flex-row items-center bg-white rounded-xl px-4 py-4 border border-gray-200"
                    >
                        <Feather name="droplet" size={20} color="#ef4444" />
                        <Text className={`flex-1 px-3 ${formData.blood_group ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                            {formData.blood_group || 'Select Type'}
                        </Text>
                        <Feather name="chevron-down" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    {showBloodTypeSelector && (
                        <View className="flex-row flex-wrap mt-2 bg-white rounded-xl p-2 border border-gray-200">
                            {BLOOD_TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => {
                                        setFormData({ ...formData, blood_group: type });
                                        setShowBloodTypeSelector(false);
                                    }}
                                    className={`w-1/4 p-3 items-center ${formData.blood_group === type ? 'bg-rose-500 rounded-lg' : ''}`}
                                >
                                    <Text className={`font-bold ${formData.blood_group === type ? 'text-white' : 'text-gray-700'}`}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Units Needed */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Units Needed</Text>
                    <View className="flex-row items-center bg-white rounded-xl px-4 border border-gray-200">
                        <Feather name="layers" size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 py-4 px-3 text-gray-900"
                            placeholder="1"
                            placeholderTextColor="#9ca3af"
                            keyboardType="number-pad"
                            value={formData.units_needed}
                            onChangeText={(text) => setFormData({ ...formData, units_needed: text })}
                        />
                    </View>
                </View>

                {/* Prescription Image Upload */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">
                        <Feather name="image" size={14} color="#374151" /> Prescription Image <Text className="text-rose-500">*</Text>
                    </Text>
                    <TouchableOpacity
                        onPress={pickPrescriptionImage}
                        disabled={uploadingImage}
                        className="bg-white rounded-xl border border-gray-200 border-dashed p-6 items-center"
                    >
                        {uploadingImage ? (
                            <ActivityIndicator size="large" color="#ef4444" />
                        ) : prescriptionImage ? (
                            <View className="items-center">
                                <Image source={{ uri: prescriptionImage }} className="w-24 h-24 rounded-lg mb-2" />
                                <Text className="text-green-600 font-medium">Prescription uploaded</Text>
                                <Text className="text-gray-400 text-sm">Tap to change</Text>
                            </View>
                        ) : (
                            <>
                                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                                    <Feather name="upload" size={24} color="#9ca3af" />
                                </View>
                                <Text className="text-gray-800 font-medium">Upload Prescription Image</Text>
                                <Text className="text-gray-400 text-sm">Click to select a file</Text>
                            </>
                        )}
                    </TouchableOpacity>
                    <Text className="text-gray-400 text-xs mt-2">
                        Upload a clear image of your blood request prescription. The image will be verified by AI to ensure it's a valid medical document.
                    </Text>
                </View>

                {/* Location / Address */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Location / Address</Text>
                    <View className="flex-row items-center bg-white rounded-xl px-4 border border-gray-200">
                        <TextInput
                            className="flex-1 py-4 text-gray-900"
                            placeholder="Enter the address where blood is needed"
                            placeholderTextColor="#9ca3af"
                            value={formData.address}
                            onChangeText={(text) => setFormData({ ...formData, address: text })}
                            multiline
                        />
                    </View>
                </View>

                {/* Request Location with Map */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-1">Request Location</Text>
                    <Text className="text-gray-400 text-xs mb-3">Donors within 35km will be notified. Click on map or search to select location.</Text>

                    {/* Location Search */}
                    <View className="relative z-50 mb-3">
                        <View className="flex-row items-center bg-white rounded-xl px-4 border border-gray-200">
                            <Feather name="search" size={18} color="#9ca3af" />
                            <TextInput
                                className="flex-1 py-3 px-3 text-gray-900"
                                placeholder="Search for location..."
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

                    {/* Location Buttons */}
                    <View className="flex-row gap-3 mb-3">
                        <TouchableOpacity
                            onPress={getCurrentLocation}
                            className="flex-row items-center px-4 py-2 border border-gray-200 rounded-full bg-white"
                        >
                            <Feather name="navigation" size={14} color="#3b82f6" />
                            <Text className="text-blue-600 font-medium ml-2 text-sm">Use My Location</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={useProfileLocation}
                            className="flex-row items-center px-4 py-2 border border-gray-200 rounded-full bg-white"
                        >
                            <Feather name="user" size={14} color="#3b82f6" />
                            <Text className="text-blue-600 font-medium ml-2 text-sm">Use Profile Location</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Map */}
                    <View className="h-48 rounded-xl overflow-hidden border border-gray-200">
                        <MapView
                            ref={mapRef}
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: formData.latitude,
                                longitude: formData.longitude,
                                latitudeDelta: 0.5,
                                longitudeDelta: 0.5,
                            }}
                            onPress={handleMapPress}
                        >
                            <Marker
                                coordinate={{
                                    latitude: formData.latitude,
                                    longitude: formData.longitude,
                                }}
                                title="Request Location"
                            />
                        </MapView>
                        <View className="absolute bottom-3 left-3 right-3 bg-white/90 rounded-lg px-3 py-2 flex-row items-center">
                            <Feather name="map-pin" size={14} color="#22c55e" />
                            <Text className="text-green-600 text-sm ml-2">{formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}</Text>
                        </View>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    style={{ marginBottom: 32 }}
                >
                    <LinearGradient
                        colors={loading ? ['#fda4af', '#fda4af'] : ['#f43f5e', '#e11d48']}
                        style={{ paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Broadcast Request</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
