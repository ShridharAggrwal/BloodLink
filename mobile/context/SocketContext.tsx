import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const initSocket = async () => {
            try {
                const token = await SecureStore.getItemAsync('token');

                if (token) {
                    const newSocket = io(SOCKET_URL, {
                        auth: { token },
                        transports: ['websocket'],
                    });

                    newSocket.on('connect', () => {
                        console.log('Socket connected');
                        setConnected(true);
                    });

                    newSocket.on('disconnect', () => {
                        console.log('Socket disconnected');
                        setConnected(false);
                    });

                    setSocket(newSocket);
                }
            } catch (error) {
                console.log('Error initializing socket:', error);
            }
        };

        initSocket();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
};
