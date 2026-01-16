import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Clipboard } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '@/services/api';

interface GeneratedToken {
    token: string;
    signupUrl: string;
    expiresAt: string;
}

export default function GenerateTokenScreen() {
    const router = useRouter();
    const [type, setType] = useState<'ngo' | 'blood_bank'>('ngo');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedData, setGeneratedData] = useState<GeneratedToken | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setCopied(false);
        try {
            const response = await api.post('/admin/generate-token', {
                type,
                email: email.trim() || undefined
            });
            setGeneratedData(response.data);
            Alert.alert('Success', 'Token generated successfully!');
            setEmail('');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.error || 'Failed to generate token');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedData?.signupUrl) {
            Clipboard.setString(generatedData.signupUrl);
            setCopied(true);
            Alert.alert('Copied!', 'Link copied to clipboard');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="bg-white pt-14 pb-4 px-6 flex-row items-center border-b border-slate-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Feather name="arrow-left" size={24} color="#1e293b" />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-bold text-slate-900">Generate Token</Text>
                    <Text className="text-slate-500 mt-1">Create signup links for organizations</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Type Selection */}
                <View className="bg-white rounded-2xl p-5 mb-4 border border-slate-100">
                    <Text className="text-slate-700 font-medium mb-4">Registration Type</Text>
                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={() => setType('ngo')}
                            className={`flex-1 py-5 rounded-xl items-center border ${type === 'ngo'
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-slate-50 border-slate-200'
                                }`}
                        >
                            <View className={`w-14 h-14 rounded-xl items-center justify-center mb-2 ${type === 'ngo' ? 'bg-blue-100' : 'bg-slate-100'
                                }`}>
                                <Feather name="heart" size={28} color={type === 'ngo' ? '#3b82f6' : '#94a3b8'} />
                            </View>
                            <Text className={`font-bold ${type === 'ngo' ? 'text-blue-700' : 'text-slate-500'}`}>
                                NGO
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setType('blood_bank')}
                            className={`flex-1 py-5 rounded-xl items-center border ${type === 'blood_bank'
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-slate-50 border-slate-200'
                                }`}
                        >
                            <View className={`w-14 h-14 rounded-xl items-center justify-center mb-2 ${type === 'blood_bank' ? 'bg-blue-100' : 'bg-slate-100'
                                }`}>
                                <Feather name="database" size={28} color={type === 'blood_bank' ? '#3b82f6' : '#94a3b8'} />
                            </View>
                            <Text className={`font-bold ${type === 'blood_bank' ? 'text-blue-700' : 'text-slate-500'}`}>
                                Blood Bank
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Email Input */}
                <View className="bg-white rounded-2xl p-5 mb-4 border border-slate-100">
                    <Text className="text-slate-700 font-medium mb-2">Email (optional)</Text>
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                        placeholder="Enter email to send link directly"
                        placeholderTextColor="#94a3b8"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <Text className="text-slate-400 text-xs mt-2">
                        Leave empty to only generate the link
                    </Text>
                </View>

                {/* Generate Button */}
                <TouchableOpacity
                    onPress={handleGenerate}
                    disabled={loading}
                    className="mb-6"
                >
                    <LinearGradient
                        colors={['#3b82f6', '#2563eb']}
                        style={{ paddingVertical: 16, borderRadius: 16, alignItems: 'center' }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Generate Token</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Generated Link Display */}
                {generatedData && (
                    <View className="bg-white rounded-2xl p-5 mb-8 border border-slate-100">
                        <Text className="text-slate-900 font-bold mb-4">Generated Link</Text>

                        <View className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                            <Text
                                className="text-blue-600 text-sm font-mono mb-3"
                                numberOfLines={3}
                            >
                                {generatedData.signupUrl}
                            </Text>
                            <TouchableOpacity
                                onPress={copyToClipboard}
                                className={`flex-row items-center justify-center py-2 rounded-lg ${copied ? 'bg-green-100' : 'bg-blue-100'
                                    }`}
                            >
                                <Feather
                                    name={copied ? 'check' : 'copy'}
                                    size={16}
                                    color={copied ? '#22c55e' : '#3b82f6'}
                                />
                                <Text className={`font-medium ml-2 ${copied ? 'text-green-700' : 'text-blue-700'
                                    }`}>
                                    {copied ? 'Copied!' : 'Copy Link'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-slate-400 text-xs mt-3">
                            Expires: {formatDate(generatedData.expiresAt)}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
