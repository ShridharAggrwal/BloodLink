import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Modal, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '@/services/api';

interface Campaign {
    id: string;
    title: string;
    address: string;
    start_date: string;
    end_date: string;
    status: string;
    health_checkup_available: boolean;
    blood_units_collected?: number;
    ended_at?: string;
}

export default function CampaignsScreen() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [showEndModal, setShowEndModal] = useState(false);
    const [bloodUnitsCollected, setBloodUnitsCollected] = useState('');
    const [endLoading, setEndLoading] = useState(false);

    // Expired campaign modal state
    const [expiredModal, setExpiredModal] = useState({
        show: false,
        campaign: null as Campaign | null,
        bloodUnits: '',
        extensionDays: '7',
    });

    const fetchCampaigns = async () => {
        try {
            const response = await api.get('/ngo/campaigns');
            const fetchedCampaigns = response.data || [];
            setCampaigns(fetchedCampaigns);

            // Check for expired active campaigns
            const expired = fetchedCampaigns.find((c: Campaign) =>
                new Date(c.end_date) < new Date() && c.status === 'active'
            );

            if (expired) {
                setExpiredModal({
                    show: true,
                    campaign: expired,
                    bloodUnits: '',
                    extensionDays: '7',
                });
            }
        } catch (error) {
            console.log('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCampaigns();
    };

    const handleOpenEndModal = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setBloodUnitsCollected('');
        setShowEndModal(true);
    };

    const handleEndCampaign = async () => {
        if (!bloodUnitsCollected || parseInt(bloodUnitsCollected) < 0) {
            Alert.alert('Error', 'Please enter a valid number of blood units collected');
            return;
        }

        setEndLoading(true);
        try {
            await api.put(`/ngo/campaigns/${selectedCampaign?.id}/end`, {
                blood_units_collected: parseInt(bloodUnitsCollected)
            });
            Alert.alert('Success', `Campaign ended successfully! ${bloodUnitsCollected} units collected.`);
            setShowEndModal(false);
            setSelectedCampaign(null);
            fetchCampaigns();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to end campaign');
        } finally {
            setEndLoading(false);
        }
    };

    const handleExpiredEnd = async () => {
        if (!expiredModal.bloodUnits || parseInt(expiredModal.bloodUnits) < 0) {
            Alert.alert('Error', 'Please enter a valid number of blood units collected');
            return;
        }

        try {
            await api.put(`/ngo/campaigns/${expiredModal.campaign?.id}/end`, {
                blood_units_collected: parseInt(expiredModal.bloodUnits)
            });
            Alert.alert('Success', `Campaign ended! ${expiredModal.bloodUnits} units collected.`);
            setExpiredModal({ show: false, campaign: null, bloodUnits: '', extensionDays: '7' });
            fetchCampaigns();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to end campaign');
        }
    };

    const handleExpiredExtend = async () => {
        const days = parseInt(expiredModal.extensionDays) || 7;

        try {
            const newEndDate = new Date();
            newEndDate.setDate(newEndDate.getDate() + days);

            await api.put(`/ngo/campaigns/${expiredModal.campaign?.id}`, {
                ...expiredModal.campaign,
                end_date: newEndDate.toISOString()
            });

            Alert.alert('Success', `Campaign extended by ${days} days`);
            setExpiredModal({ show: false, campaign: null, bloodUnits: '', extensionDays: '7' });
            fetchCampaigns();
        } catch (error: any) {
            Alert.alert('Error', 'Failed to extend campaign');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        });
    };

    const getCampaignStatus = (campaign: Campaign) => {
        if (campaign.status === 'ended') return { label: 'Ended', color: '#64748b' };

        const now = new Date();
        const start = new Date(campaign.start_date);
        const end = new Date(campaign.end_date);

        if (now < start) return { label: 'Upcoming', color: '#3b82f6' };
        if (now > end) return { label: 'Completed', color: '#22c55e' };
        return { label: 'Active', color: '#10b981' };
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#10b981" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-slate-100">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold text-slate-900">Campaigns</Text>
                        <Text className="text-slate-500 mt-1">Manage your blood drives</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(ngo)/create-campaign')}
                        className="bg-emerald-500 px-4 py-2 rounded-xl flex-row items-center"
                    >
                        <Feather name="plus" size={18} color="white" />
                        <Text className="text-white font-bold ml-1">New</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
            >
                {campaigns.length === 0 ? (
                    <View className="items-center py-12">
                        <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                            <Feather name="calendar" size={28} color="#94a3b8" />
                        </View>
                        <Text className="text-slate-900 font-bold text-lg mb-1">No Campaigns</Text>
                        <Text className="text-slate-500 text-center">Create your first campaign to organize a blood drive.</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(ngo)/create-campaign')}
                            className="mt-4 bg-emerald-500 px-6 py-3 rounded-xl"
                        >
                            <Text className="text-white font-bold">Create Campaign</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    campaigns.map((campaign) => {
                        const status = getCampaignStatus(campaign);
                        return (
                            <View key={campaign.id} className="bg-white rounded-2xl p-5 mb-4 border border-slate-100">
                                {/* Campaign Title and Badge */}
                                <View className="flex-row items-start justify-between mb-3">
                                    <Text className="text-slate-900 font-bold text-lg flex-1">{campaign.title}</Text>
                                    {campaign.health_checkup_available && (
                                        <View className="bg-blue-50 px-3 py-1 rounded-full flex-row items-center ml-2">
                                            <Feather name="activity" size={12} color="#3b82f6" />
                                            <Text className="text-blue-600 text-xs font-medium ml-1">Health Checkup</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Location */}
                                <View className="flex-row items-center mb-2">
                                    <Feather name="map-pin" size={14} color="#64748b" />
                                    <Text className="text-slate-500 text-sm ml-2">{campaign.address}</Text>
                                </View>

                                {/* Date Range */}
                                <View className="flex-row items-center mb-3">
                                    <Feather name="calendar" size={14} color="#64748b" />
                                    <Text className="text-slate-500 text-sm ml-2">
                                        {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                                    </Text>
                                </View>

                                {/* Blood Units Collected (if ended) */}
                                {campaign.status === 'ended' && campaign.blood_units_collected !== undefined && (
                                    <View className="flex-row items-center mb-3">
                                        <Feather name="droplet" size={14} color="#10b981" />
                                        <Text className="text-emerald-600 text-sm font-medium ml-2">
                                            {campaign.blood_units_collected} units collected
                                        </Text>
                                        {campaign.ended_at && (
                                            <Text className="text-slate-400 text-xs ml-2">
                                                • Ended on {formatDate(campaign.ended_at)}
                                            </Text>
                                        )}
                                    </View>
                                )}

                                {/* Status Badge and Action Button */}
                                <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
                                    <View className="bg-slate-100 px-3 py-1 rounded-lg">
                                        <Text style={{ color: status.color }} className="text-xs font-medium">
                                            {status.label}
                                        </Text>
                                    </View>

                                    {status.label === 'Active' && (
                                        <TouchableOpacity
                                            onPress={() => handleOpenEndModal(campaign)}
                                            className="flex-row items-center"
                                        >
                                            <Feather name="flag" size={14} color="#ef4444" />
                                            <Text className="text-red-500 text-sm font-medium ml-1">End Campaign</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })
                )}
                <View className="h-8" />
            </ScrollView>

            {/* End Campaign Modal */}
            <Modal visible={showEndModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold text-slate-900">End Campaign</Text>
                            <TouchableOpacity onPress={() => setShowEndModal(false)}>
                                <Feather name="x" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {selectedCampaign && (
                            <>
                                <Text className="text-slate-700 font-medium mb-4">
                                    {selectedCampaign.title}
                                </Text>

                                <View className="mb-6">
                                    <Text className="text-slate-700 font-medium mb-2">Blood Units Collected *</Text>
                                    <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4">
                                        <Feather name="droplet" size={20} color="#10b981" />
                                        <TextInput
                                            className="flex-1 py-4 ml-3 text-slate-900"
                                            placeholder="Enter number of units"
                                            placeholderTextColor="#94a3b8"
                                            keyboardType="numeric"
                                            value={bloodUnitsCollected}
                                            onChangeText={setBloodUnitsCollected}
                                        />
                                    </View>
                                    <Text className="text-slate-400 text-xs mt-2">
                                        How many blood units were collected during this campaign?
                                    </Text>
                                </View>

                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        onPress={() => setShowEndModal(false)}
                                        className="flex-1 py-4 bg-slate-100 rounded-xl items-center"
                                    >
                                        <Text className="text-slate-700 font-bold">Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleEndCampaign}
                                        disabled={endLoading}
                                        className="flex-1"
                                    >
                                        <LinearGradient
                                            colors={['#ef4444', '#dc2626']}
                                            style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
                                        >
                                            {endLoading ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <Text className="text-white font-bold">End Campaign</Text>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Expired Campaign Modal */}
            <Modal visible={expiredModal.show} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 max-h-[85%]">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-slate-900">Campaign Expired</Text>
                            <TouchableOpacity onPress={() => setExpiredModal({ show: false, campaign: null, bloodUnits: '', extensionDays: '7' })}>
                                <Feather name="x" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Warning Banner */}
                            <View className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex-row items-start">
                                <Feather name="alert-triangle" size={20} color="#d97706" className="mt-0.5" />
                                <View className="flex-1 ml-3">
                                    <Text className="text-amber-800 font-bold mb-1">Deadline Passed</Text>
                                    <Text className="text-amber-600 text-sm">
                                        This campaign's end date has passed. Please choose to end it or extend the duration.
                                    </Text>
                                </View>
                            </View>

                            {/* Campaign Title */}
                            <Text className="text-lg font-medium text-slate-800 mb-4">
                                Manage: {expiredModal.campaign?.title}
                            </Text>

                            {/* Option 1: End Campaign */}
                            <View className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                                <Text className="text-sm font-bold text-slate-700 mb-2">Option 1: End Campaign</Text>
                                <Text className="text-xs text-slate-500 mb-3">Finalize the campaign and record donations.</Text>

                                <Text className="text-xs font-bold text-slate-600 mb-2 uppercase">Blood Units Collected</Text>
                                <TextInput
                                    className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-3"
                                    keyboardType="numeric"
                                    placeholder="Enter units..."
                                    placeholderTextColor="#94a3b8"
                                    value={expiredModal.bloodUnits}
                                    onChangeText={(text) => setExpiredModal({ ...expiredModal, bloodUnits: text })}
                                />

                                <TouchableOpacity onPress={handleExpiredEnd}>
                                    <LinearGradient
                                        colors={['#ef4444', '#dc2626']}
                                        style={{ paddingVertical: 12, borderRadius: 12, alignItems: 'center' }}
                                    >
                                        <Text className="text-white font-bold">Confirm & End Campaign</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            {/* Divider */}
                            <View className="relative my-4">
                                <View className="absolute inset-0 flex items-center justify-center">
                                    <View className="w-full border-t border-slate-200" />
                                </View>
                                <View className="relative flex items-center justify-center">
                                    <Text className="bg-white px-2 text-xs text-slate-400 font-medium">OR</Text>
                                </View>
                            </View>

                            {/* Option 2: Extend Campaign */}
                            <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <Text className="text-sm font-bold text-blue-800 mb-1">Option 2: Extend Campaign</Text>
                                <Text className="text-xs text-blue-600 mb-3">Extend the deadline to continue receiving donors.</Text>

                                <Text className="text-xs font-bold text-blue-700 mb-2">Extend By (Days)</Text>
                                <TextInput
                                    className="bg-white border border-blue-200 rounded-xl px-4 py-3 text-slate-900 mb-3"
                                    keyboardType="numeric"
                                    placeholder="7"
                                    placeholderTextColor="#94a3b8"
                                    value={expiredModal.extensionDays}
                                    onChangeText={(text) => setExpiredModal({ ...expiredModal, extensionDays: text })}
                                />

                                <TouchableOpacity
                                    onPress={handleExpiredExtend}
                                    className="bg-white border border-blue-200 rounded-xl py-3 items-center"
                                >
                                    <Text className="text-blue-600 font-bold">Extend by {expiredModal.extensionDays || 7} Days</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
