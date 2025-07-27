import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { FiUserPlus, FiArrowRight, FiShield } from "react-icons/fi";

export default function Register() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 space-y-6 text-center"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
              <FiUserPlus className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
              Join OJ Codester
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Start your coding journey today
            </p>
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-start space-x-3">
              <FiShield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Quick & Secure Registration
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Registration is handled via Google. Click below to login and create your account instantly!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Register Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link 
              to="/login" 
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
            >
              <span>Continue with Google</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>7,000+ coding problems</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Instant code execution</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Weekly contests</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
