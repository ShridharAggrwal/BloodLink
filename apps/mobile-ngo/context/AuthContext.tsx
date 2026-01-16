import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin' | 'ngo' | 'blood_bank';
    blood_type?: string;
    phone?: string;
    location?: {
        lat: number;
        lng: number;
    };
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string, role?: string) => Promise<User>;
    register: (formData: any) => Promise<any>;
    registerWithToken: (type: string, token: string, formData: any) => Promise<User>;
    logout: () => Promise<void>;
    updateUser: (updatedData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token and user on mount
        const loadStoredAuth = async () => {
            try {
                const token = await SecureStore.getItemAsync('token');
                const storedUser = await SecureStore.getItemAsync('user');

                if (token && storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.log('Error loading stored auth:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStoredAuth();
    }, []);

    const login = async (email: string, password: string, role: string = 'user') => {
        const response = await api.post('/auth/login', { email, password, role });
        const { token, user: userData } = response.data;

        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        setUser(userData);

        return userData;
    };

    const register = async (formData: any) => {
        const response = await api.post('/auth/register', formData);
        return response.data;
    };

    const registerWithToken = async (type: string, token: string, formData: any) => {
        const endpoint = type === 'ngo'
            ? `/auth/register/ngo/${token}`
            : `/auth/register/blood-bank/${token}`;

        const response = await api.post(endpoint, formData);
        const { token: jwtToken, user: userData } = response.data;

        await SecureStore.setItemAsync('token', jwtToken);
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        setUser(userData);

        return userData;
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        setUser(null);
    };

    const updateUser = async (updatedData: Partial<User>) => {
        const newUser = { ...user, ...updatedData } as User;
        await SecureStore.setItemAsync('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            register,
            registerWithToken,
            logout,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};
