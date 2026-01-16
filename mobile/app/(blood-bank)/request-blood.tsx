import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import api from '@/services/api';

const VIOLET_500 = '#8b5cf6';
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RequestBloodScreen() {
    const [formData, setFormData] = useState({
        blood_group: '',
        units_needed: '1',
        address: '',
        latitude: null as number | null,
        longitude: null as number | null,
    });

    const [loadingInfo, setLoadingInfo] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/blood-bank/profile');
            const { address, lat, lng } = response.data;
            setFormData(prev => ({
                ...prev,
                address: address || '',
                latitude: lat ? parseFloat(lat) : null,
                longitude: lng ? parseFloat(lng) : null,
            }));
        } catch (error) {
            console.log('Error fetching profile:', error);
        } finally {
            setLoadingInfo(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.blood_group || !formData.units_needed || !formData.address) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            Alert.alert('Location Required', 'Please update your profile with location coordinates first.');
            router.push('/(blood-bank)/profile');
            return;
        }

        setSubmitting(true);
        try {
            const data = {
                ...formData,
                units_needed: parseInt(formData.units_needed),
            };
            const response = await api.post('/blood-requests', data);

            Alert.alert(
                'Success',
                `Request broadcasted! ${response.data.alertsSent || 'Donors'} notified.`,
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to create request');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
            <View className="flex-1">
                {/* Header */}
                <View className="pt-14 pb-4 px-6 border-b border-violet-100 bg-white flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Feather name="arrow-left" size={24} color="#64748b" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-bold text-slate-900">Request Blood</Text>
                        <Text className="text-slate-500">Broadcast alert to nearby donors</Text>
                    </View>
                </View>

                <ScrollView className="flex-1 px-6 pt-6">
                    {/* Location Warning */}
                    {!loadingInfo && (!formData.latitude || !formData.longitude) && (
                        <View className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex-row items-start">
                            <Feather name="alert-triangle" size={20} color="#d97706" className="mt-0.5" />
                            <View className="ml-3 flex-1">
                                <Text className="text-amber-800 font-bold mb-1">Profile Location Required</Text>
                                <Text className="text-amber-600 text-xs">
                                    Please update your profile with coordinates before creating requests.
                                </Text>
                                <TouchableOpacity onPress={() => router.push('/(blood-bank)/profile')}>
                                    <Text className="text-amber-700 font-bold text-xs mt-2">Go to Profile →</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {!loadingInfo && formData.latitude && formData.longitude && (
                        <View className="mb-6 p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex-row items-center">
                            <Feather name="map-pin" size={16} color="#059669" />
                            <Text className="text-emerald-700 text-xs ml-2 font-medium">Using your saved blood bank location</Text>
                        </View>
                    )}

                    <View className="space-y-6">
                        {/* Blood Group Selection */}
                        <View>
                            <Text className="text-slate-700 font-bold mb-3">Blood Group Needed</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {BLOOD_GROUPS.map(bg => (
                                    <TouchableOpacity
                                        key={bg}
                                        onPress={() => setFormData({ ...formData, blood_group: bg })}
                                        className={`w-[23%] aspect-square items-center justify-center rounded-xl border ${formData.blood_group === bg ? 'bg-rose-500 border-rose-500' : 'bg-white border-slate-200'}`}
                                    >
                                        <Text className={`text-lg font-bold ${formData.blood_group === bg ? 'text-white' : 'text-slate-600'}`}>{bg}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Units Needed */}
                        <View>
                            <Text className="text-slate-700 font-bold mb-2">Units Needed</Text>
                            <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                <TextInput
                                    className="text-lg font-bold text-slate-800"
                                    keyboardType="numeric"
                                    value={formData.units_needed}
                                    onChangeText={(text) => setFormData({ ...formData, units_needed: text })}
                                    placeholder="1"
                                />
                            </View>
                        </View>

                        {/* Address */}
                        <View>
                            <Text className="text-slate-700 font-bold mb-2">Location Address</Text>
                            <View className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                <TextInput
                                    className="text-base text-slate-800 h-24"
                                    multiline
                                    textAlignVertical="top"
                                    value={formData.address}
                                    onChangeText={(text) => setFormData({ ...formData, address: text })}
                                    placeholder="Enter full address..."
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={submitting || loadingInfo || !formData.latitude}
                            className={`py-4 rounded-xl items-center shadow-lg shadow-rose-200 mt-4 mb-10 ${submitting || !formData.latitude ? 'bg-slate-300' : 'bg-rose-600'}`}
                        >
                            {submitting ? (
                                <View className="flex-row items-center gap-2">
                                    <ActivityIndicator color="white" />
                                    <Text className="text-white font-bold text-lg">Broadcasting...</Text>
                                </View>
                            ) : (
                                <View className="flex-row items-center gap-2">
                                    <Feather name="radio" size={20} color="white" />
                                    <Text className="text-white font-bold text-lg">Broadcast Request</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
