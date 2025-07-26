import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-6 py-10 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-all duration-300 ease-in-out">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto max-w-screen-md flex flex-col items-center space-y-4 mt-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 mb-8 text-center"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 dark:from-indigo-200 dark:to-purple-300 drop-shadow-lg">
          OJ Codester
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
          Build skills. Solve challenges. Win contests. Your journey to becoming a coding master starts here.
        </p>
        {user ? (
          <>
            <div className="mb-6 text-xl font-semibold text-indigo-700 dark:text-indigo-300">
              Welcome back, <span className="underline decoration-wavy">{user.name || user.email}</span>!
            </div>
            <Link
              to="/dashboard"
              className="inline-block text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-xl transition-transform transform hover:scale-105 cursor-pointer hover:underline"
            >
              🚀 Go to Dashboard
            </Link>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard value="3.4M+" label="Submissions" />
              <StatCard value="1.2M+" label="Registered Users" />
              <StatCard value="7,000+" label="Public Problems" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="text-lg font-semibold bg-indigo-600 text-white px-8 py-3 rounded-xl shadow-md hover:bg-indigo-700 transform hover:scale-105 transition cursor-pointer hover:underline"
              >
                ✨ Sign up & Start Coding!
              </Link>
              <Link
                to="/login"
                className="text-lg font-semibold bg-white text-indigo-700 border border-indigo-600 px-8 py-3 rounded-xl shadow-md hover:bg-indigo-100 dark:bg-gray-800 dark:text-white dark:border-white dark:hover:bg-gray-700 transform hover:scale-105 transition cursor-pointer hover:underline"
              >
                🔐 Login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition duration-300">
      <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
    </div>
  );
}
