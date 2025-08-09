import { createContext, useContext, useEffect, useState } from "react";
import { account, restoreJwtFromStorage, setJwt } from "../services/appwrite";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
  // Ensure JWT is applied if available (fallback when cookies are blocked)
  restoreJwtFromStorage();
      const userData = await account.get();
      setUser(userData);
    } catch (error) {
      console.log('No active session');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      await account.createEmailPasswordSession(email, password);
      // Use JWT for cookie-less auth
      try {
        const { jwt } = await account.createJWT();
        setJwt(jwt);
      } catch {}
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
      // Use JWT for cookie-less auth
      try {
        const { jwt } = await account.createJWT();
        setJwt(jwt);
      } catch {}
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
      localStorage.removeItem('user');
  setJwt(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
  // try restore JWT first, then fetch
  restoreJwtFromStorage();
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
