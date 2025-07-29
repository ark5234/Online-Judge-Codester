import { createContext, useContext, useEffect, useState } from "react";
import { account } from "../services/appwrite";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUser = async () => {
    try {
      const userData = await account.get();
      setUser(userData);
      
      // Check if user is admin (you can customize this logic based on your needs)
      // For now, we'll check if the email contains 'admin' or if there's a custom attribute
      const isAdminUser = userData.email?.includes('admin') || 
                         userData.$id === 'admin' || 
                         userData.labels?.includes('admin') ||
                         userData.email === 'vikrantkawadkar2099@gmail.com';
      setIsAdmin(isAdminUser);
    } catch (error) {
      console.log("User not authenticated:", error);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout error:", error);
      // Force clear user state even if session deletion fails
      setUser(null);
      setIsAdmin(false);
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
    <AuthContext.Provider value={{ user, loading, logout, fetchUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 