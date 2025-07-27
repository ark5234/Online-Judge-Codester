import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCalendar, FiAward, FiUsers, FiClock } from "react-icons/fi";

const sampleContests = [
  { id: 1, name: "Weekly Coding Challenge", startTime: "2024-01-15 14:00", duration: "2h", participants: 150 },
  { id: 2, name: "Algorithm Master", startTime: "2024-01-20 10:00", duration: "3h", participants: 89 },
];

export default function Contests() {
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
          </div>
        </motion.div>

        {/* Contests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
            <div className="space-y-4">
              {sampleContests.map((contest, index) => (
                <motion.div
                  key={contest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 sm:p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {contest.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
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
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <FiAward className="w-4 h-4 mr-2 inline" />
                        Join
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
