import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { initSocket, disconnectSocket, getSocket } from '../services/socket';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      const newSocket = initSocket(token);
      
      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setConnected(false);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        disconnectSocket();
      };
    }
  }, [isAuthenticated]);

  const joinRoom = (loungeId) => {
    if (socket) {
      socket.emit('joinRoom', { loungeId });
    }
  };

  const leaveRoom = (loungeId) => {
    if (socket) {
      socket.emit('leaveRoom', { loungeId });
    }
  };

  const sendMessage = (loungeId, message) => {
    if (socket) {
      socket.emit('sendMessage', { loungeId, message });
    }
  };

  const sendTyping = (loungeId, isTyping) => {
    if (socket) {
      socket.emit('typing', { loungeId, isTyping });
    }
  };

  const value = {
    socket,
    connected,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};