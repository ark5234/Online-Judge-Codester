import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../services/appwrite";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await account.get();
      setUser(userData);
    } catch (error) {
      console.log("User not authenticated:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Force clear user state even if session deletion fails
      setUser(null);
    }
  };

  // Listen for URL changes to handle OAuth redirects
  useEffect(() => {
    const handleUrlChange = () => {
      // Check if we're returning from OAuth
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') || urlParams.get('failure')) {
        fetchUser();
      }
    };

    // Check user on mount and URL changes
    fetchUser();
    window.addEventListener('popstate', handleUrlChange);
    
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 