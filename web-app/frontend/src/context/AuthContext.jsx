import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

// Ensure axios points to backend API during development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
axios.defaults.baseURL = API_BASE_URL;

// Set axios timeout and performance settings
axios.defaults.timeout = 10000; // 10 seconds timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verify token on app load with timeout
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await axios.get('/api/auth/verify', {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          if (error.name === 'AbortError') {
            console.log('Token verification timed out');
          }
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/auth/login', credentials);
      
      const { token: newToken, user: userData } = response.data;
      
      // Store token
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      // Set user data
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${userData.name}!`);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login failed:', error);
      let message = 'Login failed. Please try again.';
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        message = 'Cannot connect to server. Please make sure the server is running.';
      } else if (error.response?.status === 401) {
        message = error.response?.data?.message || 'Invalid credentials. Please check your username and password.';
      } else if (error.response?.status === 500) {
        message = 'Server error. Please try again later.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint if we have a token
      if (token) {
        await axios.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear token
      localStorage.removeItem('token');
      setToken(null);
      
      // Clear user data
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear axios headers
      delete axios.defaults.headers.common['Authorization'];
      
      toast.info('You have been logged out successfully.');
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axios.put('/api/auth/profile', userData);
      setUser(response.data.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      const message = error.response?.data?.message || 'Profile update failed.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await axios.put('/api/auth/change-password', passwordData);
      toast.success('Password changed successfully!');
      return { success: true };
    } catch (error) {
      console.error('Password change failed:', error);
      const message = error.response?.data?.message || 'Password change failed.';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Role and permission helpers
  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Teacher permissions
    if (user.role === 'teacher') {
      const teacherPermissions = [
        'view_students',
        'view_attendance',
        'mark_attendance',
        'view_grades',
        'update_grades',
        'view_reports'
      ];
      return teacherPermissions.includes(permission);
    }
    
    return false;
  };

  const getAssignedClasses = () => {
    return user?.assignedClasses || [];
  };

  const canAccessClass = (classId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.assignedClasses?.includes(classId) || false;
  };

  const canAccessStudent = (studentClassId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return canAccessClass(studentClassId);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    token,
    login,
    logout,
    updateProfile,
    changePassword,
    hasRole,
    hasAnyRole,
    hasPermission,
    getAssignedClasses,
    canAccessClass,
    canAccessStudent,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};