import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiLogOut, FiSettings, FiUser, FiSun, FiMoon } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeProvider";

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
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const userDropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }

    // Close mobile menu when route changes
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [location]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700 shadow-lg w-full fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20 w-full">
          {/* Logo/Brand - Left Side */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-white font-bold text-sm sm:text-lg">OJ</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Codester
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-2">
              {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.to}
                  className={`px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 border-2 whitespace-nowrap ${
                    location.pathname === link.to
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  }`}
            >
              {link.name}
            </Link>
          ))}
            </div>
          </div>

          {/* Right side - Theme toggle and user menu */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FiSun className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <FiMoon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 sm:py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.name?.split(" ")[0] || user.email?.split("@")[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border-2 border-gray-200 dark:border-gray-700 py-2 z-50">
            <Link
              to="/profile"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <FiUser className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <FiSettings className="w-4 h-4 mr-3" />
                      Dashboard
                    </Link>
                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                    >
                      <FiLogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
          )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 border-2 border-blue-600 hover:border-blue-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 sm:p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <FiMenu className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden border-t-2 border-gray-200 dark:border-gray-700 py-4 bg-gray-50 dark:bg-gray-800 max-h-96 overflow-y-auto"
          >
            <div className="space-y-2 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 border-2 ${
                    location.pathname === link.to
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              
              {/* Mobile user menu */}
              {user && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3 px-4 py-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.name?.split(" ")[0] || user.email?.split("@")[0]}
                    </span>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser className="w-4 h-4 inline mr-3" />
                    Profile
                  </Link>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiSettings className="w-4 h-4 inline mr-3" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                  >
                    <FiLogOut className="w-4 h-4 inline mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}