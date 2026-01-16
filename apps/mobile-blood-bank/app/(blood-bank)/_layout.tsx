import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';

export default function BloodBankLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#8b5cf6', // Violet-500 for active
                tabBarInactiveTintColor: '#94a3b8', // Slate-400 for inactive
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9', // Slate-100
                    backgroundColor: '#ffffff', // Explicitly white
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    elevation: 0, // Remove shadow on Android for cleaner look
                    shadowOpacity: 0, // Remove shadow on iOS
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '500',
                    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Overview',
                    tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="inventory"
                options={{
                    title: 'Stock',
                    tabBarIcon: ({ color }) => <Feather name="droplet" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="requests"
                options={{
                    title: 'Requests',
                    tabBarIcon: ({ color }) => <Feather name="list" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="appointments"
                options={{
                    title: 'Appointments',
                    tabBarIcon: ({ color }) => <Feather name="calendar" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="request-blood"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
