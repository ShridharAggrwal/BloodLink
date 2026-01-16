import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';

// API base URL - dynamically select based on platform and environment
// For physical device with Expo Go: Uses the host URI from Expo
// For Android Emulator: 10.0.2.2 maps to localhost on host machine
// For iOS Simulator: localhost works
const getBaseUrl = () => {
    if (__DEV__) {
        // Development mode - get the host IP from Expo
        const hostUri = Constants.expoConfig?.hostUri;
        if (hostUri) {
            // hostUri is like "192.168.x.x:8081" - we need the IP part with port 5000
            const hostIp = hostUri.split(':')[0];
            return `http://${hostIp}:5000/api`;
        }

        // Fallback for emulators
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:5000/api';
        }
        return 'http://localhost:5000/api';
    }
    // Production - update this to your production API URL
    return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
};

const API_URL = getBaseUrl();
console.log('API URL:', API_URL); // Log for debugging

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 15000, // 15 second timeout
});

// Add token to requests
api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (error) {
        console.log('Error reading token:', error);
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle 401 errors (unauthorized/token expired)
        if (
            error.response?.status === 401 &&
            !error.config.url.includes('/auth/login')
        ) {
            try {
                const token = await SecureStore.getItemAsync('token');
                if (token) {
                    await SecureStore.deleteItemAsync('token');
                    await SecureStore.deleteItemAsync('user');
                    router.replace('/login');
                }
            } catch (e) {
                console.log('Error clearing auth:', e);
            }
        }

        // Handle 403 errors (account suspended)
        if (error.response?.status === 403) {
            try {
                await SecureStore.deleteItemAsync('token');
                await SecureStore.deleteItemAsync('user');
                Alert.alert(
                    'Account Suspended',
                    error.response?.data?.error || 'Your account has been suspended.'
                );
                router.replace('/login');
            } catch (e) {
                console.log('Error clearing auth:', e);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
