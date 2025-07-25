import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

const navLinks = [
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
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const handleProfileClick = () => {
    setDropdownOpen((open) => !open);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 shadow-md sticky top-0 z-50 h-20 flex items-center transition-all">
  <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-6">
    
    {/* Logo */}
    <Link to="/" className="flex items-center gap-3 font-extrabold text-2xl text-blue-700 dark:text-white">
      <span className="bg-gradient-to-br from-blue-600 to-purple-500 text-white rounded-lg px-3 py-2 text-2xl shadow-md flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="currentColor" className="text-blue-500"/>
          <text x="50%" y="55%" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">OJ</text>
        </svg>
      </span>
      <span className="tracking-wider text-lg md:text-2xl">OJ Codester</span>
    </Link>

    {/* Nav Links */}
    <div className="flex-1 flex justify-center items-center">
      <div className="flex gap-10 text-gray-800 dark:text-gray-200 font-medium text-[1.05rem]">
        {navLinks.map(link => (
          <Link
            key={link.name}
            to={link.to}
            className="relative px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>

    {/* Right Side (Auth + Theme) */}
    <div className="flex items-center gap-4">
      {!user ? (
        <>
          <Link to="/login" className="px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition">Login</Link>
          <Link to="/register" className="px-4 py-2 rounded-lg font-semibold bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition">Register</Link>
        </>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleProfileClick}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all hover:scale-105"
          >
            <span className="font-semibold text-blue-700 dark:text-blue-300 text-base">
              {user.name?.split(" ")[0] ?? user.email.split("@")[0]}
            </span>
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </span>
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fade-in">
              <Link
                to="/profile"
                className="block px-5 py-3 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 rounded transition"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition"
              >
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
