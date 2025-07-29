import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiAward, FiTrendingUp, FiUser, FiLogIn } from "react-icons/fi";

const sampleRanks = [
  { rank: 1, name: "Alice Johnson", score: 2840, problems: 156 },
  { rank: 2, name: "Bob Smith", score: 2750, problems: 142 },
  { rank: 3, name: "Charlie Brown", score: 2680, problems: 138 },
  { rank: 4, name: "David Wilson", score: 2650, problems: 135 },
  { rank: 5, name: "Emma Davis", score: 2620, problems: 132 },
  { rank: 6, name: "Frank Miller", score: 2580, problems: 128 },
  { rank: 7, name: "Grace Lee", score: 2550, problems: 125 },
  { rank: 8, name: "Henry Taylor", score: 2520, problems: 122 },
  { rank: 9, name: "Ivy Chen", score: 2490, problems: 120 },
  { rank: 10, name: "Jack Anderson", score: 2460, problems: 118 },
];

export default function Ranks() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleInteraction = () => {
    if (!user) {
      navigate("/login");
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <FiAward className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <FiAward className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <FiAward className="w-5 h-5 text-orange-600" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 lg:p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white mr-3 sm:mr-4 shadow-lg">
                <FiAward className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Leaderboard
              </h1>
            </div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Top performers and rankings
            </p>
            {!user && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 Sign in to see your ranking and compete with others!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Rankings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 lg:p-8">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Problems</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleRanks.map((rank, index) => (
                    <motion.tr
                      key={rank.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(rank.rank)}
                          <span className="font-bold text-gray-900 dark:text-white">#{rank.rank}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {rank.name[0]}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{rank.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <FiTrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-900 dark:text-white">{rank.score}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <FiUser className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-600 dark:text-gray-400">{rank.problems}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {sampleRanks.map((rank, index) => (
                <motion.div
                  key={rank.rank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getRankIcon(rank.rank)}
                      <span className="font-bold text-gray-900 dark:text-white text-lg">#{rank.rank}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiTrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-gray-900 dark:text-white">{rank.score}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {rank.name[0]}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{rank.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{rank.problems} problems</span>
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
                className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white text-center"
              >
                <div className="flex items-center justify-center mb-3">
                  <FiLogIn className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold">Join the Competition!</h3>
                </div>
                <p className="text-blue-100 mb-4">
                  Sign in to see your ranking, track your progress, and compete with other coders!
                </p>
                <button
                  onClick={handleInteraction}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Sign In to Compete
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 