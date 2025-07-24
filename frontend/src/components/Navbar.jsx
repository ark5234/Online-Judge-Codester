import React from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { name: "Problems", to: "/problems" },
  { name: "Status", to: "/status" },
  { name: "Ranks", to: "/ranks" },
  { name: "Discuss", to: "/discuss" },
  { name: "Contests", to: "/contests" },
];

export default function Navbar({ children }) {
  return (
    <nav className="w-full bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 py-2 px-4 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl text-blue-700 dark:text-white">
          <span className="bg-blue-600 text-white rounded-md px-2 py-1 text-lg font-bold">S</span>
          <span className="tracking-wide">phere online judge</span>
        </Link>
        {/* Nav Links */}
        <div className="flex items-center gap-6 text-gray-700 dark:text-gray-200 font-medium text-base">
          {navLinks.map(link => (
            <Link key={link.name} to={link.to} className="hover:text-blue-600 dark:hover:text-blue-400 transition">
              {link.name}
            </Link>
          ))}
          <Link to="/login" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition">
            <span className="material-icons text-base">login</span>
            <span>sign in</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
