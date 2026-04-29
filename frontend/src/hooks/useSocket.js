import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (room, isTable = false) => {
  const socketRef = useRef(null);
  const { token } = useAuthStore();

  useEffect(() => {
    // If no token, it might be a customer, so we allow it but without auth object
    const socket = io(SOCKET_URL, {
      auth: token ? { token } : {},
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      if (room) {
        if (isTable) {
          socket.emit('join:table', room);
        } else {
          socket.emit(`join:${room}`);
        }
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, room, isTable]);

  return socketRef.current;
};
