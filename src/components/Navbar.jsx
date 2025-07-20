import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const { auth, setAuth } = useContext(AuthContext);

  const handleLogout = () => {
    setAuth(null);
    localStorage.removeItem('token');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow mb-8">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-300">OJ Codester</Link>
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          {auth ? (
            <>
              <Link to="/dashboard" className="hover:underline">Dashboard</Link>
              <button onClick={handleLogout} className="text-red-500 hover:underline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="hover:underline">Register</Link>
            </>
          )}
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
} 