import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useGetUnreadCountQuery } from '../redux/api/notificationApi';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Refetch unread count when notifications change
  const { refetch: refetchUnreadCount } = useGetUnreadCountQuery();

  const connect = useCallback(() => {
    if (!isAuthenticated || !user?.token || socketRef.current?.connected) {
      return;
    }

    try {
      // Disconnect existing socket if any
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Create new socket connection
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token: user.token,
        },
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      socket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Handle new notifications
      socket.on('new_notification', (data) => {
        console.log('New notification received:', data);
        
        // Show toast notification
        if (data.notification) {
          // You can integrate with your preferred toast library here
          // For now, we'll use console.log
          console.log('New notification:', data.notification.title);
        }
        
        // Refetch unread count
        refetchUnreadCount();
      });

      socketRef.current = socket;
    } catch (error) {
      console.error('Error connecting to socket:', error);
      setIsConnected(false);
    }
  }, [isAuthenticated, user?.token, refetchUnreadCount]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Connect when user authenticates
  useEffect(() => {
    if (isAuthenticated && user?.token) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, user?.token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
  };
}; 