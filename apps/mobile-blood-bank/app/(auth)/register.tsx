import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StyleSheet, StatusBar, ImageBackground, Dimensions, Modal } from 'react-native';
import { Link, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const backgroundImage = require('@/assets/images/background.png');

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['Male', 'Female', 'Other'];

export default function RegisterScreen() {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        blood_type: '',
        address: '',
        password: '',
        confirmPassword: '',
        latitude: 20.5937,
        longitude: 78.9629,
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showGenderSelector, setShowGenderSelector] = useState(false);
    const [showBloodTypeSelector, setShowBloodTypeSelector] = useState(false);
    const [locationSearch, setLocationSearch] = useState('');
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
    const [searchingLocation, setSearchingLocation] = useState(false);
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
                // Get detailed address for each result
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
                Alert.alert('Permission Denied', 'Location permission is required to use this feature');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            setFormData(prev => ({ ...prev, latitude, longitude }));

            // Get address from coordinates
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

    const handleMapPress = async (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setFormData(prev => ({ ...prev, latitude, longitude }));

        // Get address from coordinates
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

    const handleRegister = async () => {
        if (!formData.name || !formData.email || !formData.phone || !formData.blood_type || !formData.password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                blood_type: formData.blood_type,
                password: formData.password,
                gender: formData.gender,
                address: formData.address,
                latitude: formData.latitude,
                longitude: formData.longitude,
            });

            Alert.alert(
                'Registration Successful',
                'Please check your email to verify your account.',
                [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
            );
        } catch (error: any) {
            Alert.alert(
                'Registration Failed',
                error.response?.data?.error || 'Something went wrong'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <ImageBackground
                source={backgroundImage}
                style={styles.backgroundImage}
                imageStyle={styles.backgroundImageStyle}
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0.95)']}
                    style={styles.gradient}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.keyboardView}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Back to Home */}
                            <Link href="/" asChild>
                                <TouchableOpacity style={styles.backBtn}>
                                    <Feather name="arrow-left" size={18} color="#1e293b" />
                                    <Text style={styles.backBtnText}>Back to Home</Text>
                                </TouchableOpacity>
                            </Link>

                            {/* Header */}
                            <View style={styles.header}>
                                <View style={styles.logoIcon}>
                                    <Feather name="droplet" size={32} color="white" />
                                </View>
                                <Text style={styles.title}>Join Bharakt</Text>
                                <Text style={styles.subtitle}>Create an account to save lives</Text>
                            </View>

                            {/* Full Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Full Name</Text>
                                <View style={styles.inputContainer}>
                                    <Feather name="user" size={20} color="#94a3b8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter full name"
                                        placeholderTextColor="#94a3b8"
                                        value={formData.name}
                                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    />
                                </View>
                            </View>

                            {/* Email */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={styles.inputContainer}>
                                    <Feather name="mail" size={20} color="#94a3b8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter email address"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={formData.email}
                                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    />
                                </View>
                            </View>

                            {/* Phone */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Phone Number</Text>
                                <View style={styles.inputContainer}>
                                    <Feather name="phone" size={20} color="#94a3b8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter phone number"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="phone-pad"
                                        value={formData.phone}
                                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                    />
                                </View>
                            </View>

                            {/* Gender & Blood Type Row */}
                            <View style={styles.row}>
                                {/* Gender */}
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                    <Text style={styles.label}>Gender</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowGenderSelector(!showGenderSelector)}
                                        style={styles.selectContainer}
                                    >
                                        <Text style={[styles.selectText, !formData.gender && styles.placeholder]}>
                                            {formData.gender || 'Select'}
                                        </Text>
                                        <Feather name="chevron-down" size={18} color="#64748b" />
                                    </TouchableOpacity>
                                    {showGenderSelector && (
                                        <View style={styles.dropdownMenu}>
                                            {GENDERS.map((gender) => (
                                                <TouchableOpacity
                                                    key={gender}
                                                    onPress={() => {
                                                        setFormData({ ...formData, gender });
                                                        setShowGenderSelector(false);
                                                    }}
                                                    style={styles.dropdownItem}
                                                >
                                                    <Text style={styles.dropdownItemText}>{gender}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                {/* Blood Group */}
                                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                                    <Text style={styles.label}>Blood Group</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowBloodTypeSelector(!showBloodTypeSelector)}
                                        style={styles.selectContainer}
                                    >
                                        <Text style={[styles.selectText, !formData.blood_type && styles.placeholder]}>
                                            {formData.blood_type || 'Select'}
                                        </Text>
                                        <Feather name="chevron-down" size={18} color="#64748b" />
                                    </TouchableOpacity>
                                    {showBloodTypeSelector && (
                                        <View style={styles.dropdownMenu}>
                                            {BLOOD_TYPES.map((type) => (
                                                <TouchableOpacity
                                                    key={type}
                                                    onPress={() => {
                                                        setFormData({ ...formData, blood_type: type });
                                                        setShowBloodTypeSelector(false);
                                                    }}
                                                    style={styles.dropdownItem}
                                                >
                                                    <Text style={styles.dropdownItemText}>{type}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Address */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Address</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={[styles.input, { paddingLeft: 0 }]}
                                        placeholder="Enter your full address"
                                        placeholderTextColor="#94a3b8"
                                        value={formData.address}
                                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                                    />
                                </View>
                            </View>

                            {/* Location Section */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Location</Text>
                                <Text style={styles.labelSubtext}>Required for blood matching - click on map or search</Text>

                                <View style={styles.locationSearchWrapper}>
                                    <View style={styles.locationSearchContainer}>
                                        <Feather name="search" size={18} color="#94a3b8" />
                                        <TextInput
                                            style={styles.locationSearchInput}
                                            placeholder="Search for your location..."
                                            placeholderTextColor="#94a3b8"
                                            value={locationSearch}
                                            onChangeText={searchLocation}
                                        />
                                        {searchingLocation && (
                                            <ActivityIndicator size="small" color="#3b82f6" />
                                        )}
                                    </View>

                                    {/* Location Suggestions */}
                                    {locationSuggestions.length > 0 && (
                                        <View style={styles.suggestionsContainer}>
                                            {locationSuggestions.map((suggestion, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.suggestionItem}
                                                    onPress={() => selectLocation(suggestion)}
                                                >
                                                    <Feather name="map-pin" size={16} color="#64748b" />
                                                    <View style={styles.suggestionTextContainer}>
                                                        <Text style={styles.suggestionText}>{suggestion.displayName}</Text>
                                                        {suggestion.address?.street && (
                                                            <Text style={styles.suggestionSubtext}>{suggestion.address.street}</Text>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity style={styles.useLocationBtn} onPress={getCurrentLocation}>
                                    <Feather name="navigation" size={16} color="#3b82f6" />
                                    <Text style={styles.useLocationBtnText}>Use My Location</Text>
                                </TouchableOpacity>

                                {/* Map */}
                                <View style={styles.mapContainer}>
                                    <MapView
                                        ref={mapRef}
                                        style={styles.map}
                                        initialRegion={{
                                            latitude: formData.latitude,
                                            longitude: formData.longitude,
                                            latitudeDelta: 5,
                                            longitudeDelta: 5,
                                        }}
                                        onPress={handleMapPress}
                                    >
                                        <Marker
                                            coordinate={{
                                                latitude: formData.latitude,
                                                longitude: formData.longitude,
                                            }}
                                            title="Your Location"
                                        />
                                    </MapView>
                                    <View style={styles.mapOverlay}>
                                        <Text style={styles.mapOverlayText}>Click on the map to select location</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Password */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.inputContainer}>
                                    <Feather name="lock" size={20} color="#94a3b8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Min 6 chars"
                                        placeholderTextColor="#94a3b8"
                                        secureTextEntry={!showPassword}
                                        value={formData.password}
                                        onChangeText={(text) => setFormData({ ...formData, password: text })}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#94a3b8" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Confirm Password */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Confirm Password</Text>
                                <View style={styles.inputContainer}>
                                    <Feather name="lock" size={20} color="#94a3b8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm password"
                                        placeholderTextColor="#94a3b8"
                                        secureTextEntry={!showPassword}
                                        value={formData.confirmPassword}
                                        onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                                    />
                                </View>
                            </View>

                            {/* Register Button */}
                            <TouchableOpacity
                                onPress={handleRegister}
                                disabled={loading}
                                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.registerButtonText}>Create Account</Text>
                                )}
                            </TouchableOpacity>

                            {/* Login Link */}
                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>Already have an account? </Text>
                                <Link href="/(auth)/login" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.loginLink}>Sign In</Text>
                                    </TouchableOpacity>
                                </Link>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </LinearGradient>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
    },
    backgroundImageStyle: {
        opacity: 0.15,
    },
    gradient: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 50,
        paddingBottom: 30,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backBtnText: {
        color: '#1e293b',
        marginLeft: 8,
        fontSize: 15,
        fontFamily: 'DMSans_500Medium',
    },
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    logoIcon: {
        width: 72,
        height: 72,
        backgroundColor: '#ef4444',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontFamily: 'PlayfairDisplay_600SemiBold',
        color: '#1e293b',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#64748b',
        fontFamily: 'DMSans_400Regular',
    },
    inputGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    label: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#374151',
        marginBottom: 8,
    },
    labelSubtext: {
        fontSize: 12,
        color: '#94a3b8',
        fontFamily: 'DMSans_400Regular',
        marginBottom: 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 12,
        fontSize: 15,
        color: '#1e293b',
        fontFamily: 'DMSans_400Regular',
    },
    selectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    selectText: {
        fontSize: 14,
        color: '#1e293b',
        fontFamily: 'DMSans_500Medium',
    },
    placeholder: {
        color: '#94a3b8',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 80,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        zIndex: 100,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    dropdownItem: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#374151',
        fontFamily: 'DMSans_400Regular',
    },
    locationSearchWrapper: {
        position: 'relative',
        zIndex: 50,
        marginBottom: 12,
    },
    locationSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 52,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        zIndex: 100,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        maxHeight: 200,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    suggestionTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    suggestionText: {
        fontSize: 14,
        color: '#1e293b',
        fontFamily: 'DMSans_500Medium',
    },
    suggestionSubtext: {
        fontSize: 12,
        color: '#64748b',
        fontFamily: 'DMSans_400Regular',
        marginTop: 2,
    },
    locationSearchInput: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#1e293b',
        fontFamily: 'DMSans_400Regular',
    },
    useLocationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 12,
        backgroundColor: 'white',
    },
    useLocationBtnText: {
        color: '#3b82f6',
        fontSize: 13,
        fontFamily: 'DMSans_500Medium',
        marginLeft: 8,
    },
    mapContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    map: {
        flex: 1,
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        backgroundColor: 'rgba(30,41,59,0.85)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    mapOverlayText: {
        color: 'white',
        fontSize: 12,
        fontFamily: 'DMSans_500Medium',
        textAlign: 'center',
    },
    registerButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 18,
        borderRadius: 28,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    registerButtonDisabled: {
        backgroundColor: '#fca5a5',
    },
    registerButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'DMSans_600SemiBold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginText: {
        color: '#64748b',
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
    },
    loginLink: {
        color: '#ef4444',
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 15,
    },
});
