import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Linking, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';

interface Campaign {
    id: string;
    name: string;
    ngo_name: string;
    ngo_email?: string;
    address: string;
    distance?: number;
    start_date: string;
    end_date: string;
    health_checkup?: boolean;
    latitude?: number;
    longitude?: number;
}

interface BloodBank {
    id: string;
    name: string;
    address: string;
    phone?: string;
    email?: string;
    distance?: number;
    latitude?: number;
    longitude?: number;
    inventory?: { [key: string]: number };
}

export default function NearbyScreen() {
    const [activeTab, setActiveTab] = useState<'campaigns' | 'bloodBanks'>('campaigns');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [selectedBank, setSelectedBank] = useState<BloodBank | null>(null);

    const fetchData = async () => {
        try {
            const response = await api.get('/users/nearby');

            // Filter out past campaigns - only show ongoing or future campaigns
            const allCampaigns = response.data.campaigns || [];
            const now = new Date();
            const upcomingCampaigns = allCampaigns.filter((campaign: Campaign) => {
                const endDate = new Date(campaign.end_date);
                return endDate >= now;
            });
            setCampaigns(upcomingCampaigns);
            setBloodBanks(response.data.bloodBanks || []);
        } catch (error) {
            console.log('Error fetching nearby data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const formatDistance = (meters?: number) => {
        if (!meters) return '';
        if (meters < 1000) return `${Math.round(meters)}m away`;
        return `${(meters / 1000).toFixed(1)}km away`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const openDirections = (lat?: number, lng?: number) => {
        if (lat && lng) {
            Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 border-b border-gray-100">
                <Text className="text-2xl font-bold text-gray-900">Explore Nearby</Text>
                <Text className="text-gray-500 mt-1">Discover blood donation campaigns and blood banks in your area</Text>
            </View>

            {/* Tab Switcher */}
            <View className="flex-row mx-6 mt-4 bg-gray-100 rounded-xl p-1">
                <TouchableOpacity
                    onPress={() => setActiveTab('campaigns')}
                    className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${activeTab === 'campaigns' ? 'bg-gray-900' : ''}`}
                >
                    <Feather name="calendar" size={16} color={activeTab === 'campaigns' ? 'white' : '#6b7280'} />
                    <Text className={`ml-2 font-medium ${activeTab === 'campaigns' ? 'text-white' : 'text-gray-600'}`}>
                        Campaigns ({campaigns.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('bloodBanks')}
                    className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${activeTab === 'bloodBanks' ? 'bg-gray-900' : ''}`}
                >
                    <Feather name="home" size={16} color={activeTab === 'bloodBanks' ? 'white' : '#6b7280'} />
                    <Text className={`ml-2 font-medium ${activeTab === 'bloodBanks' ? 'text-white' : 'text-gray-600'}`}>
                        Blood Banks ({bloodBanks.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#ef4444']} />}
            >
                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                    <>
                        {campaigns.length === 0 ? (
                            <View className="items-center py-12">
                                <Feather name="calendar" size={48} color="#9ca3af" />
                                <Text className="text-gray-500 mt-4 text-center">No campaigns found nearby</Text>
                            </View>
                        ) : (
                            campaigns.map((campaign) => (
                                <View key={campaign.id} className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                                    <View className="flex-row items-start">
                                        <View className="w-12 h-12 bg-teal-100 rounded-xl items-center justify-center">
                                            <Feather name="calendar" size={24} color="#14b8a6" />
                                        </View>
                                        <View className="flex-1 ml-3">
                                            <Text className="text-lg font-bold text-gray-900">{campaign.name}</Text>
                                            <Text className="text-gray-500 text-sm">by {campaign.ngo_name}</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row flex-wrap mt-3 gap-2">
                                        {campaign.distance && (
                                            <View className="bg-gray-100 px-3 py-1 rounded-full">
                                                <Text className="text-gray-600 text-xs">{formatDistance(campaign.distance)}</Text>
                                            </View>
                                        )}
                                        {campaign.health_checkup && (
                                            <View className="bg-teal-50 px-3 py-1 rounded-full flex-row items-center">
                                                <Feather name="heart" size={12} color="#14b8a6" />
                                                <Text className="text-teal-600 text-xs ml-1">Health Checkup</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text className="text-gray-500 text-sm mt-3">{campaign.address}</Text>

                                    <View className="flex-row mt-4 gap-3">
                                        <TouchableOpacity
                                            onPress={() => openDirections(campaign.latitude, campaign.longitude)}
                                            className="flex-1 flex-row items-center justify-center py-3 bg-gray-100 rounded-xl"
                                        >
                                            <Feather name="navigation" size={16} color="#4b5563" />
                                            <Text className="text-gray-700 font-medium ml-2">Directions</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setSelectedCampaign(campaign)}
                                            className="flex-1 flex-row items-center justify-center py-3 border border-gray-200 rounded-xl"
                                        >
                                            <Text className="text-gray-700 font-medium">View Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}

                {/* Blood Banks Tab */}
                {activeTab === 'bloodBanks' && (
                    <>
                        {bloodBanks.length === 0 ? (
                            <View className="items-center py-12">
                                <Feather name="home" size={48} color="#9ca3af" />
                                <Text className="text-gray-500 mt-4 text-center">No blood banks found nearby</Text>
                            </View>
                        ) : (
                            bloodBanks.map((bank) => (
                                <View key={bank.id} className="bg-white rounded-2xl p-4 mb-4 border border-gray-100">
                                    <View className="flex-row items-start">
                                        <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
                                            <Feather name="home" size={24} color="#6b7280" />
                                        </View>
                                        <View className="flex-1 ml-3">
                                            <View className="flex-row items-center">
                                                <Text className="text-lg font-bold text-gray-900">{bank.name}</Text>
                                                {bank.distance && (
                                                    <View className="bg-gray-100 px-2 py-0.5 rounded-full ml-2">
                                                        <Text className="text-gray-500 text-xs">{formatDistance(bank.distance)}</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text className="text-gray-500 text-sm mt-1">{bank.address}</Text>
                                        </View>
                                    </View>

                                    {/* Inventory Badges */}
                                    {bank.inventory && Object.keys(bank.inventory).length > 0 && (
                                        <View className="flex-row flex-wrap mt-3 gap-2">
                                            {Object.entries(bank.inventory).slice(0, 4).map(([type, count]) => (
                                                <View key={type} className="bg-gray-100 px-2 py-1 rounded">
                                                    <Text className="text-gray-600 text-xs font-medium">{type}: {count}</Text>
                                                </View>
                                            ))}
                                            {Object.keys(bank.inventory).length > 4 && (
                                                <View className="bg-gray-100 px-2 py-1 rounded">
                                                    <Text className="text-gray-400 text-xs">+{Object.keys(bank.inventory).length - 4} more</Text>
                                                </View>
                                            )}
                                        </View>
                                    )}

                                    <View className="flex-row mt-4 gap-3">
                                        <TouchableOpacity
                                            onPress={() => openDirections(bank.latitude, bank.longitude)}
                                            className="flex-1 flex-row items-center justify-center py-3 bg-gray-100 rounded-xl"
                                        >
                                            <Feather name="navigation" size={16} color="#4b5563" />
                                            <Text className="text-gray-700 font-medium ml-2">Directions</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setSelectedBank(bank)}
                                            className="flex-1 flex-row items-center justify-center py-3 border border-gray-200 rounded-xl"
                                        >
                                            <Text className="text-gray-700 font-medium">Details</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity className="mt-3 py-3 bg-rose-500 rounded-xl items-center flex-row justify-center">
                                        <Feather name="calendar" size={16} color="white" />
                                        <Text className="text-white font-bold ml-2">Book Appointment</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </>
                )}
                <View className="h-8" />
            </ScrollView>

            {/* Campaign Details Modal */}
            <Modal visible={!!selectedCampaign} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">
                        <TouchableOpacity
                            onPress={() => setSelectedCampaign(null)}
                            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                        >
                            <Feather name="x" size={20} color="#6b7280" />
                        </TouchableOpacity>

                        <View className="flex-row items-center mb-4">
                            <View className="w-14 h-14 bg-teal-100 rounded-xl items-center justify-center">
                                <Feather name="calendar" size={28} color="#14b8a6" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-xl font-bold text-gray-900">{selectedCampaign?.name}</Text>
                                <Text className="text-gray-500">by {selectedCampaign?.ngo_name} • {formatDistance(selectedCampaign?.distance)}</Text>
                            </View>
                        </View>

                        {selectedCampaign?.health_checkup && (
                            <View className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-4 flex-row items-center">
                                <Feather name="heart" size={18} color="#14b8a6" />
                                <Text className="text-teal-700 font-medium ml-2">Free Health Checkup Available</Text>
                            </View>
                        )}

                        <View className="bg-gray-50 rounded-xl p-4 mb-4">
                            <Text className="text-gray-500 text-sm font-medium mb-2">Campaign Schedule</Text>
                            <View className="flex-row">
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs">Starts</Text>
                                    <Text className="text-gray-900 font-medium">{selectedCampaign && formatDate(selectedCampaign.start_date)}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs">Ends</Text>
                                    <Text className="text-gray-900 font-medium">{selectedCampaign && formatDate(selectedCampaign.end_date)}</Text>
                                </View>
                            </View>
                        </View>

                        <View className="bg-gray-50 rounded-xl p-4 mb-4">
                            <Text className="text-gray-500 text-sm font-medium mb-2">Organizer</Text>
                            <View className="flex-row items-center mb-2">
                                <Feather name="user" size={16} color="#6b7280" />
                                <Text className="text-gray-900 ml-2">{selectedCampaign?.ngo_name}</Text>
                            </View>
                            {selectedCampaign?.ngo_email && (
                                <View className="flex-row items-center">
                                    <Feather name="mail" size={16} color="#6b7280" />
                                    <Text className="text-blue-600 ml-2">{selectedCampaign.ngo_email}</Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row items-center mb-6">
                            <Feather name="map-pin" size={16} color="#6b7280" />
                            <Text className="text-gray-600 ml-2 flex-1">{selectedCampaign?.address}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                openDirections(selectedCampaign?.latitude, selectedCampaign?.longitude);
                                setSelectedCampaign(null);
                            }}
                        >
                            <LinearGradient
                                colors={['#14b8a6', '#0d9488']}
                                className="py-4 rounded-xl items-center flex-row justify-center"
                            >
                                <Feather name="navigation" size={18} color="white" />
                                <Text className="text-white font-bold text-lg ml-2">Get Directions</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Blood Bank Details Modal */}
            <Modal visible={!!selectedBank} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6">
                        <TouchableOpacity
                            onPress={() => setSelectedBank(null)}
                            className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                        >
                            <Feather name="x" size={20} color="#6b7280" />
                        </TouchableOpacity>

                        <View className="flex-row items-center mb-6">
                            <View className="w-14 h-14 bg-indigo-100 rounded-xl items-center justify-center">
                                <Feather name="home" size={28} color="#6366f1" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-xl font-bold text-gray-900">{selectedBank?.name}</Text>
                                <Text className="text-gray-500">{formatDistance(selectedBank?.distance)}</Text>
                            </View>
                        </View>

                        <View className="bg-gray-50 rounded-xl p-4 mb-4">
                            <Text className="text-gray-500 text-sm font-medium mb-3">Contact</Text>
                            {selectedBank?.phone && (
                                <TouchableOpacity
                                    onPress={() => Linking.openURL(`tel:${selectedBank.phone}`)}
                                    className="flex-row items-center mb-2"
                                >
                                    <Feather name="phone" size={16} color="#6b7280" />
                                    <Text className="text-blue-600 ml-2">{selectedBank.phone}</Text>
                                </TouchableOpacity>
                            )}
                            {selectedBank?.email && (
                                <View className="flex-row items-center">
                                    <Feather name="mail" size={16} color="#6b7280" />
                                    <Text className="text-blue-600 ml-2">{selectedBank.email}</Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row items-center mb-6">
                            <Feather name="map-pin" size={16} color="#6b7280" />
                            <Text className="text-gray-600 ml-2 flex-1">{selectedBank?.address}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => {
                                openDirections(selectedBank?.latitude, selectedBank?.longitude);
                                setSelectedBank(null);
                            }}
                        >
                            <LinearGradient
                                colors={['#8b5cf6', '#7c3aed']}
                                className="py-4 rounded-xl items-center flex-row justify-center"
                            >
                                <Feather name="navigation" size={18} color="white" />
                                <Text className="text-white font-bold text-lg ml-2">Get Directions</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
