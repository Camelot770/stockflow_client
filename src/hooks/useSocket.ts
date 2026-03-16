import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { toast } from 'sonner';
import type { Notification } from '@/types';

function getSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  try {
    const url = new URL(apiUrl);
    return url.origin;
  } catch {
    // If it's a relative path, use current origin
    return window.location.origin;
  }
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { tokens, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = getSocketUrl();

    const socket = io(socketUrl, {
      auth: {
        token: tokens.accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('notification', (notification: Notification) => {
      addNotification(notification);
      toast(notification.title, {
        description: notification.message,
      });
    });

    socket.on('deal:created', (data: { notification: Notification }) => {
      if (data.notification) {
        addNotification(data.notification);
        toast.success(data.notification.title, {
          description: data.notification.message,
        });
      }
    });

    socket.on('deal:updated', (data: { notification: Notification }) => {
      if (data.notification) {
        addNotification(data.notification);
      }
    });

    socket.on('order:created', (data: { notification: Notification }) => {
      if (data.notification) {
        addNotification(data.notification);
        toast.success(data.notification.title, {
          description: data.notification.message,
        });
      }
    });

    socket.on('task:assigned', (data: { notification: Notification }) => {
      if (data.notification) {
        addNotification(data.notification);
        toast.info(data.notification.title, {
          description: data.notification.message,
        });
      }
    });

    socket.on('stock:low', (data: { notification: Notification }) => {
      if (data.notification) {
        addNotification(data.notification);
        toast.warning(data.notification.title, {
          description: data.notification.message,
        });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, tokens?.accessToken, addNotification]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}
