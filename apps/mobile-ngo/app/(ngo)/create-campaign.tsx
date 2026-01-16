import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '@/services/api';

interface BloodBank {
    id: string;
    name: string;
    address: string;
    distance?: number;
    contact_info?: string;
    email?: string;
    stock?: {
        [key: string]: number;
    };
}

export default function CreateCampaignScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 8);
    nextWeek.setHours(17, 0, 0, 0);

    const [formData, setFormData] = useState({
        title: '',
        address: '',
        latitude: 20.5937,
        longitude: 78.9629,
        start_date: tomorrow,
        end_date: nextWeek,
        health_checkup_available: false,
        partner_bank_ids: [] as string[],
    });

    const [nearbyBanks, setNearbyBanks] = useState<BloodBank[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [showBanksModal, setShowBanksModal] = useState(false);
    const [selectedBankDetails, setSelectedBankDetails] = useState<BloodBank | null>(null);

    const [datePickerState, setDatePickerState] = useState({
        show: false,
        isStart: true,
        mode: 'date' as 'date' | 'time',
        tempDate: new Date(),
    });

    // Local input states for free typing
    const [inputValues, setInputValues] = useState({
        year: '',
        month: '',
        day: '',
        hour: '',
        minute: ''
    });

    const fetchNearbyBanks = async () => {
        try {
            setLoadingBanks(true);
            const response = await api.get('/users/nearby');
            const banks = response.data.bloodBanks || [];
            setNearbyBanks(banks);
        } catch (error) {
            console.log('Error fetching nearby banks:', error);
            setNearbyBanks([]);
        } finally {
            setLoadingBanks(false);
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

            const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (address) {
                const addressText = [address.name, address.street, address.city, address.region]
                    .filter(Boolean)
                    .join(', ');
                setFormData(prev => ({ ...prev, address: addressText }));
            }

            fetchNearbyBanks();
        } catch (error) {
            Alert.alert('Error', 'Failed to get current location');
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

        fetchNearbyBanks();
    };

    const toggleBankSelection = (bankId: string) => {
        setFormData(prev => ({
            ...prev,
            partner_bank_ids: prev.partner_bank_ids.includes(bankId)
                ? prev.partner_bank_ids.filter(id => id !== bankId)
                : [...prev.partner_bank_ids, bankId]
        }));
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter a campaign title');
            return;
        }
        if (!formData.address.trim()) {
            Alert.alert('Error', 'Please enter the campaign address');
            return;
        }

        setLoading(true);
        try {
            await api.post('/ngo/campaigns', {
                ...formData,
                start_date: formData.start_date.toISOString(),
                end_date: formData.end_date.toISOString(),
            });
            Alert.alert('Success', 'Campaign created successfully!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to create campaign');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const openDatePicker = (isStart: boolean, mode: 'date' | 'time') => {
        const date = isStart ? formData.start_date : formData.end_date;
        setInputValues({
            year: date.getFullYear().toString(),
            month: (date.getMonth() + 1).toString().padStart(2, '0'),
            day: date.getDate().toString().padStart(2, '0'),
            hour: date.getHours().toString().padStart(2, '0'),
            minute: date.getMinutes().toString().padStart(2, '0'),
        });
        setDatePickerState({
            show: true,
            isStart,
            mode,
            tempDate: new Date(date),
        });
    };

    const updateDateTime = (field: 'year' | 'month' | 'day' | 'hour' | 'minute', value: string) => {
        // Update input value for display
        setInputValues(prev => ({ ...prev, [field]: value }));

        // Allow empty string while typing
        if (value === '') {
            return;
        }

        const numValue = parseInt(value);

        // Skip invalid numbers
        if (isNaN(numValue)) {
            return;
        }

        const newDate = new Date(datePickerState.tempDate);

        switch (field) {
            case 'year':
                if (numValue >= 1900 && numValue <= 2100) {
                    newDate.setFullYear(numValue);
                }
                break;
            case 'month':
                if (numValue >= 1 && numValue <= 12) {
                    newDate.setMonth(numValue - 1);
                }
                break;
            case 'day':
                if (numValue >= 1 && numValue <= 31) {
                    newDate.setDate(numValue);
                }
                break;
            case 'hour':
                if (numValue >= 0 && numValue <= 23) {
                    newDate.setHours(numValue);
                }
                break;
            case 'minute':
                if (numValue >= 0 && numValue <= 59) {
                    newDate.setMinutes(numValue);
                }
                break;
        }

        setDatePickerState(prev => ({ ...prev, tempDate: newDate }));
    };

    const saveDatePicker = () => {
        setFormData(prev => ({
            ...prev,
            [datePickerState.isStart ? 'start_date' : 'end_date']: datePickerState.tempDate
        }));
        setDatePickerState(prev => ({ ...prev, show: false }));
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-slate-50"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View className="bg-white pt-14 pb-4 px-6 border-b border-slate-100">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Feather name="arrow-left" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-bold text-slate-900">Create Campaign</Text>
                        <Text className="text-slate-500 mt-1">Organize a blood drive</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-4">
                <View className="mb-4">
                    <Text className="text-slate-700 font-medium mb-2">Campaign Title *</Text>
                    <TextInput
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                        placeholder="e.g., Blood Donation Drive 2024"
                        placeholderTextColor="#94a3b8"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-slate-700 font-medium mb-2">Start Date & Time *</Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => openDatePicker(true, 'date')}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3"
                        >
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-slate-400 text-xs mb-1">Date</Text>
                                    <Text className="text-slate-900 font-medium">{formatDate(formData.start_date)}</Text>
                                </View>
                                <Feather name="calendar" size={18} color="#10b981" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => openDatePicker(true, 'time')}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3"
                        >
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-slate-400 text-xs mb-1">Time</Text>
                                    <Text className="text-slate-900 font-medium">{formatTime(formData.start_date)}</Text>
                                </View>
                                <Feather name="clock" size={18} color="#10b981" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-slate-700 font-medium mb-2">End Date & Time *</Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => openDatePicker(false, 'date')}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3"
                        >
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-slate-400 text-xs mb-1">Date</Text>
                                    <Text className="text-slate-900 font-medium">{formatDate(formData.end_date)}</Text>
                                </View>
                                <Feather name="calendar" size={18} color="#10b981" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => openDatePicker(false, 'time')}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3"
                        >
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-slate-400 text-xs mb-1">Time</Text>
                                    <Text className="text-slate-900 font-medium">{formatTime(formData.end_date)}</Text>
                                </View>
                                <Feather name="clock" size={18} color="#10b981" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mb-4">
                    <Text className="text-slate-700 font-medium mb-2">Address *</Text>
                    <TextInput
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                        value={formData.address}
                        onChangeText={(text) => setFormData({ ...formData, address: text })}
                        placeholder="Campaign venue address"
                        placeholderTextColor="#94a3b8"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-slate-700 font-medium mb-2">Location on Map *</Text>
                    <TouchableOpacity
                        onPress={getCurrentLocation}
                        className="mb-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex-row items-center justify-center"
                    >
                        <Feather name="navigation" size={18} color="#10b981" />
                        <Text className="text-emerald-700 font-medium ml-2">Use My Current Location</Text>
                    </TouchableOpacity>

                    <View className="h-48 rounded-2xl overflow-hidden border border-slate-200">
                        <MapView
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
                                pinColor="#10b981"
                            />
                        </MapView>
                    </View>
                    <Text className="text-slate-400 text-xs mt-2">Tap on map to set location</Text>
                </View>

                <View className="mb-4">
                    <Text className="text-slate-700 font-medium mb-2">Partner Blood Banks (Optional)</Text>
                    <TouchableOpacity
                        onPress={() => {
                            fetchNearbyBanks();
                            setShowBanksModal(true);
                        }}
                        className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center">
                            <Feather name="database" size={18} color="#9333ea" />
                            <Text className="text-purple-700 font-medium ml-2">
                                {formData.partner_bank_ids.length > 0
                                    ? `${formData.partner_bank_ids.length} Banks Selected`
                                    : 'Find Nearby Blood Banks'}
                            </Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9333ea" />
                    </TouchableOpacity>
                </View>

                <View className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="text-blue-900 font-medium">Free Health Checkup</Text>
                            <Text className="text-blue-600 text-xs mt-1">Offer health checkups to donors</Text>
                        </View>
                        <Switch
                            value={formData.health_checkup_available}
                            onValueChange={(value) => setFormData({ ...formData, health_checkup_available: value })}
                            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                            thumbColor={formData.health_checkup_available ? '#3b82f6' : '#f1f5f9'}
                        />
                    </View>
                </View>

                <TouchableOpacity onPress={handleSubmit} disabled={loading} className="mb-8">
                    <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Create Campaign</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>

            {/* Custom Date/Time Picker Modal */}
            <Modal visible={datePickerState.show} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-slate-900">
                                {datePickerState.mode === 'date' ? 'Select Date' : 'Select Time'}
                            </Text>
                            <TouchableOpacity onPress={() => setDatePickerState(prev => ({ ...prev, show: false }))}>
                                <Feather name="x" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {datePickerState.mode === 'date' ? (
                            <View className="space-y-4">
                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Text className="text-slate-600 text-sm mb-2">Year</Text>
                                        <TextInput
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-center text-lg font-bold"
                                            keyboardType="numeric"
                                            maxLength={4}
                                            value={inputValues.year}
                                            onChangeText={(text) => updateDateTime('year', text)}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-600 text-sm mb-2">Month</Text>
                                        <TextInput
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-center text-lg font-bold"
                                            keyboardType="numeric"
                                            maxLength={2}
                                            value={inputValues.month}
                                            onChangeText={(text) => updateDateTime('month', text)}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-600 text-sm mb-2">Day</Text>
                                        <TextInput
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-center text-lg font-bold"
                                            keyboardType="numeric"
                                            maxLength={2}
                                            value={inputValues.day}
                                            onChangeText={(text) => updateDateTime('day', text)}
                                        />
                                    </View>
                                </View>
                                <Text className="text-slate-400 text-xs text-center">Format: YYYY-MM-DD</Text>
                            </View>
                        ) : (
                            <View className="space-y-4">
                                <View className="flex-row gap-4 items-center justify-center">
                                    <View className="flex-1">
                                        <Text className="text-slate-600 text-sm mb-2 text-center">Hour</Text>
                                        <TextInput
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 text-center text-2xl font-bold"
                                            keyboardType="numeric"
                                            maxLength={2}
                                            value={inputValues.hour}
                                            onChangeText={(text) => updateDateTime('hour', text)}
                                        />
                                    </View>
                                    <Text className="text-3xl font-bold text-slate-400 mt-6">:</Text>
                                    <View className="flex-1">
                                        <Text className="text-slate-600 text-sm mb-2 text-center">Minute</Text>
                                        <TextInput
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 text-center text-2xl font-bold"
                                            keyboardType="numeric"
                                            maxLength={2}
                                            value={inputValues.minute}
                                            onChangeText={(text) => updateDateTime('minute', text)}
                                        />
                                    </View>
                                </View>
                                <Text className="text-slate-400 text-xs text-center">24-hour format (00-23)</Text>
                            </View>
                        )}

                        <View className="flex-row gap-3 mt-6">
                            <TouchableOpacity
                                onPress={() => setDatePickerState(prev => ({ ...prev, show: false }))}
                                className="flex-1 bg-slate-100 rounded-xl py-4"
                            >
                                <Text className="text-slate-700 font-bold text-center">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={saveDatePicker}
                                className="flex-1 bg-emerald-500 rounded-xl py-4"
                            >
                                <Text className="text-white font-bold text-center">Done</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Blood Banks Modal */}
            <Modal visible={showBanksModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
                        <View className="flex-row items-center justify-between mb-4">
                            {selectedBankDetails && (
                                <TouchableOpacity onPress={() => setSelectedBankDetails(null)} className="mr-3">
                                    <Feather name="chevron-left" size={24} color="#64748b" />
                                </TouchableOpacity>
                            )}
                            <Text className="text-xl font-bold text-slate-900 flex-1">
                                {selectedBankDetails ? selectedBankDetails.name : 'Nearby Blood Banks'}
                            </Text>
                            <TouchableOpacity onPress={() => {
                                setShowBanksModal(false);
                                setSelectedBankDetails(null);
                            }}>
                                <Feather name="x" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {loadingBanks ? (
                            <View className="py-12 items-center">
                                <ActivityIndicator size="large" color="#9333ea" />
                                <Text className="text-slate-500 mt-4">Finding nearby blood banks...</Text>
                            </View>
                        ) : selectedBankDetails ? (
                            /* Details View */
                            <ScrollView className="flex-1">
                                {/* Bank Info Card */}
                                <View className="bg-purple-50 border border-purple-100 rounded-2xl p-4 mb-4">
                                    <View className="flex-row items-center mb-3">
                                        <View className="w-12 h-12 bg-purple-100 rounded-xl items-center justify-center mr-3">
                                            <Feather name="database" size={24} color="#9333ea" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-slate-900 font-bold text-lg">{selectedBankDetails.name}</Text>
                                            {selectedBankDetails.distance && (
                                                <Text className="text-purple-600 text-sm">
                                                    {(selectedBankDetails.distance / 1000).toFixed(1)} km away
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    {/* Contact Details */}
                                    {selectedBankDetails.address && (
                                        <View className="flex-row items-start mb-2">
                                            <Feather name="map-pin" size={16} color="#64748b" className="mt-1" />
                                            <Text className="text-slate-600 text-sm ml-2 flex-1">{selectedBankDetails.address}</Text>
                                        </View>
                                    )}
                                    {selectedBankDetails.contact_info && (
                                        <View className="flex-row items-center mb-2">
                                            <Feather name="phone" size={16} color="#64748b" />
                                            <Text className="text-slate-600 text-sm ml-2">{selectedBankDetails.contact_info}</Text>
                                        </View>
                                    )}
                                    {selectedBankDetails.email && (
                                        <View className="flex-row items-center">
                                            <Feather name="mail" size={16} color="#64748b" />
                                            <Text className="text-slate-600 text-sm ml-2">{selectedBankDetails.email}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Blood Stock */}
                                {selectedBankDetails.stock && Object.keys(selectedBankDetails.stock).length > 0 && (
                                    <View className="mb-4">
                                        <Text className="text-slate-900 font-bold mb-3">Available Blood Units</Text>
                                        <View className="flex-row flex-wrap gap-3">
                                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bloodType) => {
                                                const units = selectedBankDetails.stock?.[bloodType] || 0;
                                                return (
                                                    <View
                                                        key={bloodType}
                                                        className="bg-slate-50 border border-slate-200 rounded-xl p-3 items-center"
                                                        style={{ width: '22%' }}
                                                    >
                                                        <Text className="text-slate-500 text-xs font-medium mb-1">{bloodType}</Text>
                                                        <Text className={`text-2xl font-bold ${units > 0 ? 'text-green-600' : 'text-slate-300'}`}>
                                                            {units}
                                                        </Text>
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    </View>
                                )}

                                {/* Select Button */}
                                <TouchableOpacity
                                    onPress={() => {
                                        toggleBankSelection(selectedBankDetails.id);
                                        setSelectedBankDetails(null);
                                    }}
                                    className="mt-4"
                                >
                                    <LinearGradient
                                        colors={formData.partner_bank_ids.includes(selectedBankDetails.id)
                                            ? ['#ef4444', '#dc2626']
                                            : ['#9333ea', '#7e22ce']}
                                        style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
                                    >
                                        <Text className="text-white font-bold">
                                            {formData.partner_bank_ids.includes(selectedBankDetails.id)
                                                ? 'Remove from Selection'
                                                : 'Select as Partner'}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </ScrollView>
                        ) : nearbyBanks.length === 0 ? (
                            /* Empty State */
                            <View className="py-12 items-center">
                                <Feather name="database" size={48} color="#cbd5e1" />
                                <Text className="text-slate-500 mt-4">No blood banks found nearby</Text>
                                <Text className="text-slate-400 text-sm mt-2">Try selecting a different location</Text>
                            </View>
                        ) : (
                            /* List View */
                            <ScrollView className="flex-1">
                                {nearbyBanks.map((bank) => (
                                    <TouchableOpacity
                                        key={bank.id}
                                        onPress={() => setSelectedBankDetails(bank)}
                                        className={`p-4 rounded-xl mb-3 border ${formData.partner_bank_ids.includes(bank.id)
                                            ? 'bg-purple-50 border-purple-300'
                                            : 'bg-white border-slate-200'
                                            }`}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center flex-1">
                                                <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-3">
                                                    <Feather name="database" size={20} color="#9333ea" />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-slate-900 font-bold">{bank.name}</Text>
                                                    {bank.distance && (
                                                        <Text className="text-purple-600 text-xs mt-1">
                                                            {(bank.distance / 1000).toFixed(1)} km away
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                            <View className="flex-row items-center">
                                                {formData.partner_bank_ids.includes(bank.id) && (
                                                    <View className="bg-purple-100 px-2 py-1 rounded-full mr-2">
                                                        <Text className="text-purple-700 text-xs font-bold">Selected</Text>
                                                    </View>
                                                )}
                                                <Feather name="chevron-right" size={20} color="#94a3b8" />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {!selectedBankDetails && formData.partner_bank_ids.length > 0 && !loadingBanks && (
                            <TouchableOpacity
                                onPress={() => setShowBanksModal(false)}
                                className="mt-4 bg-purple-500 rounded-xl py-4"
                            >
                                <Text className="text-white font-bold text-center">
                                    Done ({formData.partner_bank_ids.length} selected)
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}
