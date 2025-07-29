import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCalendar, FiAward, FiUsers, FiClock, FiLogIn } from "react-icons/fi";

const sampleContests = [
  { 
    id: 1, 
    name: "Weekly Coding Challenge", 
          startTime: "2025-01-15 14:00", 
    duration: "2h", 
    participants: 150,
    description: "A weekly challenge featuring algorithmic problems of varying difficulty levels.",
    prizes: "Top 3 winners get premium features"
  },
  { 
    id: 2, 
    name: "Algorithm Master", 
          startTime: "2025-01-20 10:00", 
    duration: "3h", 
    participants: 89,
    description: "Advanced algorithmic problems for experienced programmers.",
    prizes: "Cash prizes for top performers"
  },
  { 
    id: 3, 
    name: "Data Structures Contest", 
          startTime: "2025-01-25 16:00", 
    duration: "1.5h", 
    participants: 234,
    description: "Focus on data structure implementation and optimization.",
    prizes: "Exclusive badges and recognition"
  },
  { 
    id: 4, 
    name: "Dynamic Programming Challenge", 
          startTime: "2025-01-30 12:00", 
    duration: "2.5h", 
    participants: 67,
    description: "Master the art of dynamic programming with challenging problems.",
    prizes: "Special DP Master certificate"
  }
];

export default function Contests() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleJoinContest = () => {
    if (!user) {
      navigate("/login");
    } else {
      // Handle joining contest for authenticated users
      console.log("Joining contest...");
    }
  };

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
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg">
                <FiCalendar className="w-6 h-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Coding Contests
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Compete with others and climb the leaderboard
            </p>
            {!user && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 Sign in to join contests and compete for prizes!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Contests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
            <div className="space-y-6">
              {sampleContests.map((contest, index) => (
                <motion.div
                  key={contest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 sm:p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                          {contest.name}
                        </h3>
                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                          Active
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                        {contest.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <FiCalendar className="w-4 h-4" />
                          <span>{contest.startTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiClock className="w-4 h-4" />
                          <span>{contest.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{contest.participants} participants</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-purple-600 dark:text-purple-400">
                        <FiAward className="w-4 h-4" />
                        <span>{contest.prizes}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleJoinContest}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center"
                      >
                        <FiAward className="w-4 h-4 mr-2" />
                        {user ? 'Join' : 'Sign In to Join'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Login Prompt for Non-Authenticated Users */}
            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white text-center"
              >
                <div className="flex items-center justify-center mb-3">
                  <FiLogIn className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold">Ready to Compete?</h3>
                </div>
                <p className="text-purple-100 mb-4">
                  Join our contests to test your skills, win prizes, and climb the leaderboard!
                </p>
                <button
                  onClick={handleJoinContest}
                  className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Sign In to Join Contests
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
