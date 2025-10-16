import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { requestNotificationPermission, onMessageListener } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      // Request notification permission after login
      setupNotifications();
    }
    setLoading(false);
  }, []);

  // Setup FCM notifications
  const setupNotifications = async () => {
    try {
      const fcmToken = await requestNotificationPermission();
      
      if (fcmToken) {
        console.log('✅ FCM Token obtained:', fcmToken);
        
        // Save token to backend
        await api.post('/auth/fcm-token', { fcmToken });
        
        // Listen for foreground messages
        onMessageListener()
          .then((payload) => {
            console.log('🔔 Foreground notification:', payload);
            
            // Show browser notification
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: '/emergency-icon.png',
              tag: payload.data?.emergencyId,
            });
          })
          .catch((err) => console.error('Error listening to messages:', err));
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const login = async (email, password, userType) => {
    try {
      const { data } = await api.post('/auth/login', {
        email,
        password,
        userType,
      });
      
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      
      // Setup notifications after login
      setupNotifications();
      
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const googleLogin = async (credential, userType = 'user') => {
    try {
      const { data } = await api.post('/auth/google', {
        credential,
        userType,
      });
      
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      
      // Setup notifications after login
      setupNotifications();
      
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Google login failed');
    }
  };

  const register = async (name, email, password, userType, contactNumber) => {
    try {
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        userType,
        contactNumber,
      });
      
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      
      // Setup notifications after registration
      setupNotifications();
      
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    googleLogin,
    register,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};