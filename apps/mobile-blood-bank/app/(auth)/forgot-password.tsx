import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import api from '@/services/api';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.response?.data?.error || 'Failed to send reset email'
            );
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <View className="flex-1 bg-white px-6 justify-center items-center">
                <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-6">
                    <Feather name="check" size={40} color="white" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
                    Check Your Email
                </Text>
                <Text className="text-gray-500 text-center mb-8">
                    We've sent a password reset link to {email}
                </Text>
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity className="bg-blood-500 py-4 px-8 rounded-xl">
                        <Text className="text-white font-bold text-lg">Back to Login</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <View className="flex-1 px-6 justify-center">
                {/* Header */}
                <View className="items-center mb-10">
                    <View className="w-20 h-20 bg-blood-500 rounded-full items-center justify-center mb-4">
                        <Feather name="key" size={40} color="white" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">Forgot Password?</Text>
                    <Text className="text-gray-500 mt-2 text-center">
                        Enter your email and we'll send you a reset link
                    </Text>
                </View>

                {/* Email Input */}
                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">Email</Text>
                    <View className="flex-row items-center bg-gray-100 rounded-xl px-4">
                        <Feather name="mail" size={20} color="#9ca3af" />
                        <TextInput
                            className="flex-1 py-4 px-3 text-gray-900"
                            placeholder="Enter your email"
                            placeholderTextColor="#9ca3af"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`py-4 rounded-xl items-center ${loading ? 'bg-blood-300' : 'bg-blood-500'
                        }`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Send Reset Link</Text>
                    )}
                </TouchableOpacity>

                {/* Back to Login */}
                <Link href="/(auth)/login" asChild>
                    <TouchableOpacity className="flex-row items-center justify-center mt-6">
                        <Feather name="arrow-left" size={16} color="#6b7280" />
                        <Text className="text-gray-500 ml-2">Back to Login</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </KeyboardAvoidingView>
    );
}
