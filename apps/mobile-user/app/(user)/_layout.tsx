import { Redirect, Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function UserLayout() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    if (user.role !== 'user') {
        return <Redirect href="/" />;
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#ef4444',
                tabBarInactiveTintColor: '#9ca3af',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f3f4f6',
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 65,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Overview',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="request"
                options={{
                    title: 'Request',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="plus-circle" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="donate"
                options={{
                    title: 'Donate',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="heart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="nearby"
                options={{
                    title: 'Nearby',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="map-pin" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="user" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="alerts"
                options={{
                    href: null, // Hide from tab bar, accessible via navigation
                }}
            />
        </Tabs>
    );
}
