import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../config/api';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, token } = useAuth();

    useEffect(() => {
        let newSocket;

        if (user && token) {
            // Get base URL from api config (remove /api)
            const baseURL = api.defaults.baseURL.replace('/api', '');

            newSocket = io(baseURL, {
                auth: {
                    token: token,
                },
            });

            newSocket.on('connect', () => {
                console.log('Socket connected');
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
            });

            setSocket(newSocket);
        }

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user, token]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
