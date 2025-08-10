import { createContext, useContext, useEffect, useState } from "react";
import { account, restoreJwtFromStorage, setJwt } from "../services/appwrite";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Local token helpers for backend-auth fallback
  const TOKEN_KEY = 'authToken';
  const getLocalToken = () => {
    try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; }
  };
  const clearLocalToken = () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
  // Ensure JWT is applied if available (fallback when cookies are blocked)
  restoreJwtFromStorage();
      const userData = await account.get();
      let mergedUser = userData;
      // Try to enrich with backend role/isAdmin using existing JWT (if any)
      try {
        const me = await authService.getCurrentUser();
        if (me && (me.user || me.role || me.isAdmin)) {
          const beUser = me.user || me;
          mergedUser = {
            ...userData,
            // preserve Appwrite identifiers but add backend fields
            email: beUser.email || userData.email,
            name: beUser.name || userData.name,
            role: beUser.role,
            isAdmin: beUser.isAdmin === true || beUser.role === 'admin'
          };
        }
      } catch (_) {
        // ignore, fallback to Appwrite-only user
      }
      setUser(mergedUser);
    } catch (error) {
      // No Appwrite session (likely third-party cookies blocked). Try backend token fallback
      try {
        const me = await authService.getCurrentUser();
        const beUser = me.user || me;
        setUser({
          // Normalize to Appwrite-like shape for the rest of the app
          $id: beUser._id || 'local',
          name: beUser.name || beUser.username || beUser.email,
          email: beUser.email,
          role: beUser.role,
          isAdmin: beUser.isAdmin === true || beUser.role === 'admin',
          provider: 'backend-token',
        });
      } catch (e) {
        console.log('No active session');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      // Try Appwrite first
      try {
        await account.createEmailPasswordSession(email, password);
        const { jwt } = await account.createJWT();
        setJwt(jwt);
        await fetchUser();
        return { success: true };
      } catch (appwriteErr) {
        // Fallback to backend auth (no third-party cookies required)
        const res = await authService.loginUser(email, password);
        if (res?.token) {
          await fetchUser();
          return { success: true };
        }
        throw appwriteErr;
      }
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
      try {
        await account.create('unique()', email, password, name);
        await account.createEmailPasswordSession(email, password);
        const { jwt } = await account.createJWT();
        setJwt(jwt);
        await fetchUser();
        return { success: true };
      } catch (appwriteErr) {
        // Backend fallback registration
        await authService.registerUser({ email, password, name });
        // Immediately login via backend
        await authService.loginUser(email, password);
        await fetchUser();
        return { success: true };
      }
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
  clearLocalToken();
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
  isAdmin: !!(user?.isAdmin || user?.role === 'admin'),
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
