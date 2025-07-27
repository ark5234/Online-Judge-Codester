import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiCalendar, FiAward, FiSettings } from "react-icons/fi";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg">
                <FiUser className="w-6 h-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Profile
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Manage your account and preferences
            </p>
          </div>
        </motion.div>

        {/* Profile Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Profile Info */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Personal Information</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <FiUser className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.name || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <FiMail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <FiCalendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                      <p className="font-semibold text-gray-900 dark:text-white">January 2024</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Statistics</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-4 text-white text-center">
                    <FiAward className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-sm opacity-90">Problems Solved</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-4 text-white text-center">
                    <FiAward className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm opacity-90">Current Streak</p>
                  </div>
                </div>
                
                <button className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300">
                  <FiSettings className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 