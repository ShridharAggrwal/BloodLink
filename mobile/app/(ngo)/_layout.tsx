import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function NgoLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#10b981',
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
                    fontSize: 10,
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
                name="campaigns"
                options={{
                    title: 'Campaigns',
                    tabBarIcon: ({ color, size }) => <Feather name="calendar" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="create-campaign"
                options={{
                    title: 'Create',
                    tabBarIcon: ({ color, size }) => <Feather name="plus-circle" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="request"
                options={{
                    title: 'Request',
                    tabBarIcon: ({ color, size }) => <Feather name="droplet" size={size} color={color} />,
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
        </Tabs>
    );
}
