// Auth Context for managing authentication state
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          
          // Connect socket if authenticated
          socketService.connect(parsedUser.id, token);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, userType = 'passenger') => {
    try {
      const response = await authService.login(email, password, userType);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Connect socket after successful login
        socketService.connect(response.data.user.id, response.data.token);
        
        return { success: true };
      }
      
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Connect socket after successful registration
        socketService.connect(response.data.user.id, response.data.token);
        
        return { success: true };
      }
      
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      // Disconnect socket before logout
      socketService.disconnect();
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);
      
      if (response.success) {
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      }
      
      return { success: false, message: 'Profile update failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Profile update failed' };
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isPassenger = () => {
    return user?.role === 'passenger';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    isAdmin,
    isPassenger
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
