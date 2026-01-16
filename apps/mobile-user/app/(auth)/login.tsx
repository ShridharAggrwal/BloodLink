import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, StyleSheet, StatusBar, ImageBackground, Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');
const backgroundImage = require('@/assets/images/background.png');

export default function LoginScreen() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'user' as const,
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!formData.email || !formData.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const userData = await login(formData.email, formData.password, formData.role);

            // User app always navigates to user dashboard
            router.replace('/(user)');
        } catch (error: any) {
            Alert.alert(
                'Login Failed',
                error.response?.data?.error || 'Invalid email or password'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* Background Image with Opacity */}
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
                            {/* Back to Home - Top */}
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
                                <Text style={styles.title}>Welcome Back</Text>
                                <Text style={styles.subtitle}>Sign in to continue your journey</Text>
                            </View>



                            {/* Email Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Email Address</Text>
                                <View style={styles.inputContainer}>
                                    <Feather name="mail" size={20} color="#94a3b8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your email"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={formData.email}
                                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                                    />
                                </View>
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Password</Text>
                                <View style={styles.inputContainer}>
                                    <Feather name="lock" size={20} color="#94a3b8" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter your password"
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

                            {/* Forgot Password */}
                            <Link href="/(auth)/forgot-password" asChild>
                                <TouchableOpacity style={styles.forgotBtn}>
                                    <Text style={styles.forgotBtnText}>Forgot password?</Text>
                                </TouchableOpacity>
                            </Link>

                            {/* Login Button */}
                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={loading}
                                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                )}
                            </TouchableOpacity>

                            {/* Register Link */}
                            <View style={styles.registerContainer}>
                                <Text style={styles.registerText}>Don't have an account? </Text>
                                <Link href="/(auth)/register" asChild>
                                    <TouchableOpacity>
                                        <Text style={styles.registerLink}>Create Account</Text>
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
        marginBottom: 32,
    },
    backBtnText: {
        color: '#1e293b',
        marginLeft: 8,
        fontSize: 15,
        fontFamily: 'DMSans_500Medium',
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoIcon: {
        width: 72,
        height: 72,
        backgroundColor: '#ef4444',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
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
    roleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
        gap: 12,
    },
    roleButton: {
        width: '47%',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    roleButtonActive: {
        backgroundColor: '#ef4444',
        borderColor: '#ef4444',
    },
    roleButtonText: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#64748b',
    },
    roleButtonTextActive: {
        color: 'white',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: 'DMSans_500Medium',
        color: '#374151',
        marginBottom: 8,
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
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotBtnText: {
        color: '#64748b',
        fontFamily: 'DMSans_500Medium',
        fontSize: 14,
    },
    loginButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 18,
        borderRadius: 28,
        alignItems: 'center',
        marginBottom: 24,
    },
    loginButtonDisabled: {
        backgroundColor: '#fca5a5',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'DMSans_600SemiBold',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    registerText: {
        color: '#64748b',
        fontSize: 15,
        fontFamily: 'DMSans_400Regular',
    },
    registerLink: {
        color: '#ef4444',
        fontFamily: 'DMSans_600SemiBold',
        fontSize: 15,
    },
});
