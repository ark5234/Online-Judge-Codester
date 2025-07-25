import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { name: "Home", to: "/" },
  { name: "Problems", to: "/problems" },
  { name: "Status", to: "/status" },
  { name: "Ranks", to: "/ranks" },
  { name: "Discuss", to: "/discuss" },
  { name: "Contests", to: "/contests" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Prepare for future Appwrite avatar support
  const getAvatar = () => {
    // return user?.prefs?.avatar || null;
    return null;
  };
  const avatarUrl = getAvatar();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50 h-28 flex items-center font-sans text-[16px] md:text-[17px]">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-3 font-bold text-xl text-blue-700 dark:text-white">
          <div className="bg-gradient-to-br from-blue-600 to-purple-500 text-white rounded-lg px-3 py-2 text-xl shadow flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="currentColor" className="text-blue-500" />
              <text x="50%" y="55%" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" dy=".3em">OJ</text>
            </svg>
          </div>
          <span>OJ Codester</span>
        </div>
        {/* Centered Nav Links */}
        <div className="flex gap-12 mx-auto text-base font-medium">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.to}
              className={`relative px-3 py-1 rounded-lg transition duration-200 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 no-underline
                after:content-[''] after:block after:h-[2px] after:w-0 hover:after:w-full after:bg-blue-500 after:transition-all
                ${location.pathname === link.to ? 'text-blue-600 dark:text-blue-400 font-semibold after:w-full after:bg-blue-500' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              {link.name}
            </Link>
          ))}
        </div>
        {/* User & Theme */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link to="/login" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Login</Link>
              <Link to="/register" className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition">Register</Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 transition cursor-pointer border border-gray-200 dark:border-gray-700 shadow-sm"
              >
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  {user.name?.split(" ")[0] || user.email.split("@")[0]}
                </span>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-blue-400" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow">
                    {user.name?.[0]?.toUpperCase() || user.email[0]?.toUpperCase()}
                  </span>
                )}
                <svg className="w-4 h-4 ml-1 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-slide-down transition-all">
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} className="block px-5 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 rounded transition">
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition">
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
