import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-200 dark:border-gray-800 card-hover text-center">
        <div className="flex flex-col items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-4xl mx-auto">
            {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-extrabold text-blue-700 dark:text-white">{user.name || user.email}</h1>
          <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
        </div>
        <button
          onClick={() => { logout(); navigate("/"); }}
          className="btn-primary bg-red-500 hover:bg-red-600 text-white w-full"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 