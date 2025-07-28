import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { 
  FiBarChart2, 
  FiTrendingUp, 
  FiUsers, 
  FiAward,
  FiCode,
  FiCalendar,
  FiMessageSquare,
  FiBookOpen,
  FiTarget,
  FiZap,
  FiArrowRight
} from "react-icons/fi";

const quickActions = [
  {
    icon: FiCode,
    title: "Practice Problems",
    description: "Solve coding challenges",
    link: "/problems",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: FiCalendar,
    title: "Join Contest",
    description: "Compete with others",
    link: "/contests",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: FiMessageSquare,
    title: "Discuss",
    description: "Share solutions",
    link: "/discuss",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: FiBookOpen,
    title: "Learn",
    description: "Study algorithms",
    link: "/problems",
    color: "from-orange-500 to-red-500"
  }
];

const stats = [
  { label: "Problems Solved", value: "127", icon: FiTarget, color: "text-green-600" },
  { label: "Current Streak", value: "15 days", icon: FiZap, color: "text-orange-600" },
  { label: "Rank", value: "#1,234", icon: FiAward, color: "text-purple-600" },
  { label: "Accuracy", value: "87%", icon: FiTrendingUp, color: "text-blue-600" }
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.name || user?.email}</span>! 👋
            </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                Ready to tackle today's coding challenges?
            </p>
            </div>
            <Link to="/problems" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <FiArrowRight className="w-4 h-4 mr-2" />
              Start Practicing
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div key={stat.label} className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className={`w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 ${stat.color}`}>
                  <stat.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
        </div>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Recent Submissions */}
          <motion.div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white mr-3 sm:mr-4 shadow-lg">
                <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Recent Submissions</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">Two Sum</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</span>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Accepted</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">Valid Parentheses</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">1 day ago</span>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Wrong Answer</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">Merge Sorted Array</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">3 days ago</span>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Accepted</span>
                </div>
              </div>
              <Link to="/status" className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <FiArrowRight className="w-4 h-4 mr-2" />
                View All
              </Link>
            </div>
          </motion.div>

          {/* Active Contests */}
          <motion.div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white mr-3 sm:mr-4 shadow-lg">
                <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Active Contests</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">Weekly Challenge #42</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Ends in 2 days</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">1.2K participants</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white">Algorithm Masters</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Ends in 5 days</span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">856 participants</span>
                </div>
              </div>
              <Link to="/contests" className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <FiArrowRight className="w-4 h-4 mr-2" />
                View All
              </Link>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6 sm:p-8 h-fit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white mr-3 sm:mr-4 shadow-lg">
                <FiZap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.title}
                    to={action.link}
                    className="flex items-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 group border border-gray-200/50 dark:border-gray-600/50"
                  >
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center text-white mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                      <action.icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {action.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        {action.description}
            </p>
          </div>
                  </Link>
                ))}
        </div>
          </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
