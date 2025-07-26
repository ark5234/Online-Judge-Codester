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
    <nav className="w-full border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-50 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center items-center py-4 space-x-4 text-sm font-medium">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.to}
              className={`cursor-pointer px-2 py-1 rounded hover:underline transition ${location.pathname === link.to ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-foreground'}`}
              style={{ textDecoration: 'none' }}
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <Link
              to="/profile"
              className="cursor-pointer px-2 py-1 rounded hover:underline transition ml-4 text-blue-700 dark:text-blue-300 font-semibold"
              style={{ textDecoration: 'none' }}
            >
              {user.name?.split(" ")[0] || user.email.split("@")[0]}
            </Link>
          )}
          {!user && (
            <>
              <Link to="/login" className="cursor-pointer px-2 py-1 rounded hover:underline transition text-blue-600 font-semibold">Login</Link>
              <Link to="/register" className="cursor-pointer px-2 py-1 rounded hover:underline transition text-gray-700 dark:text-white font-semibold">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}