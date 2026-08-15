import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { auth } from '../config/firebase';

interface RealtimeContextType {
  connected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType>({ connected: false });

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://gotogether-backend-zceg.onrender.com';

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let socket: Socket | null = null;

    async function initSocket() {
      if (!auth.currentUser) return;
      try {
        const token = await auth.currentUser.getIdToken();
        socket = io(API_BASE_URL, {
          auth: { token },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 2000,
        });

        socket.on('connect', () => {
          setConnected(true);
          console.log('⚡ Connected to Socket.IO real-time server');
        });

        socket.on('disconnect', () => {
          setConnected(false);
          console.log('⚡ Disconnected from Socket.IO server');
        });

        socket.on('booking:updated', () => {
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
          queryClient.invalidateQueries({ queryKey: ['rides'] });
        });

        socket.on('chat:message_created', (data) => {
          if (data?.bookingId) {
            queryClient.invalidateQueries({ queryKey: ['messages', data.bookingId] });
          }
        });

        socket.on('notification:created', () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });
      } catch (err) {
        console.warn('Real-time socket initialization error:', err);
      }
    }

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [queryClient]);

  return (
    <RealtimeContext.Provider value={{ connected }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);
