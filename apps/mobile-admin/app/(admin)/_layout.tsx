import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function AdminLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#3b82f6',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopColor: '#e2e8f0',
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Overview',
                    tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="users"
                options={{
                    title: 'Users',
                    tabBarIcon: ({ color, size }) => <Feather name="users" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="ngo"
                options={{
                    title: 'NGO',
                    tabBarIcon: ({ color, size }) => <Feather name="heart" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="bloodbank"
                options={{
                    title: 'BloodBank',
                    tabBarIcon: ({ color, size }) => <Feather name="database" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
                }}
            />
            {/* Hidden screens accessible via navigation */}
            <Tabs.Screen
                name="alerts"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="generate-token"
                options={{
                    href: null,
                }}
            />
            <Tabs.Screen
                name="request"
                options={{
                    href: null,
                }}
            />
        </Tabs>
    );
}
