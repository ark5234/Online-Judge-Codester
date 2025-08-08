import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../services/appwrite";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await account.get();
      setUser(userData);
      
      // Exchange Appwrite token for JWT
      await exchangeAppwriteForJWT(userData);
    } catch (error) {
      console.log('No active session');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const exchangeAppwriteForJWT = async (userData) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${apiUrl}/auth/exchange-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appwriteToken: userData.$id,
          userEmail: userData.email,
          userName: userData.name,
          userAvatar: userData.avatar || '',
        }),
      });

      if (response.ok) {
        const { token, user } = await response.json();
        localStorage.setItem('authToken', token);
        console.log('✅ JWT token obtained successfully');
        
        // Update user data with backend user info
        if (user) {
          setUser(prev => ({ ...prev, ...user }));
          localStorage.setItem('user', JSON.stringify({ ...userData, ...user }));
        }
      } else {
        console.warn('⚠️ Failed to exchange Appwrite token for JWT');
        // Continue without JWT - some features may be limited
      }
    } catch (error) {
      console.error('❌ Error exchanging Appwrite token:', error);
      // Continue without JWT - some features may be limited
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      await account.createEmailPasswordSession(email, password);
      await fetchUser();
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, name) => {
    try {
      setLoading(true);
      await account.create('unique()', email, password, name);
      await account.createEmailPasswordSession(email, password);
      await fetchUser();
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
