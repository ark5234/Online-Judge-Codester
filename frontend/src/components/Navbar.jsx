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
    <nav className="w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 py-2 px-4 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl text-blue-700 dark:text-white">
          <span className="bg-blue-600 text-white rounded-md px-2 py-1 text-lg font-bold">S</span>
          <span className="tracking-wide">phere online judge</span>
        </Link>
        {/* Nav Links */}
        <div className="flex items-center gap-10 text-gray-700 dark:text-gray-200 font-medium text-base">
          {navLinks.map(link => (
            <Link key={link.name} to={link.to} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              {link.name}
            </Link>
          ))}
          {!user && (
            <>
              <Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Login</Link>
              <Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Register</Link>
            </>
          )}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-700 transition cursor-pointer border border-gray-200 dark:border-gray-700"
                aria-label="Profile menu"
              >
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  {user.name ? user.name.split(" ")[0] : user.email.split("@")[0]}
                </span>
                <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                </span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 animate-fade-in">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-800 rounded transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition"
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
