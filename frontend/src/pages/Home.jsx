import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiCode, 
  FiUsers, 
  FiAward, 
  FiTrendingUp, 
  FiZap, 
  FiShield,
  FiArrowRight,
  FiPlay,
  FiBarChart2
} from "react-icons/fi";

const features = [
  {
    icon: FiCode,
    title: "Practice Problems",
    description: "Access a vast collection of coding problems with instant feedback and detailed solutions."
  },
  {
    icon: FiUsers,
    title: "Community",
    description: "Join discussions, share solutions, and learn from fellow developers worldwide."
  },
  {
    icon: FiAward,
    title: "Contests",
    description: "Participate in regular coding contests and climb the leaderboard."
  },
  {
    icon: FiTrendingUp,
    title: "Track Progress",
    description: "Monitor your improvement with detailed analytics and performance insights."
  },
  {
    icon: FiZap,
    title: "Instant Results",
    description: "Get immediate feedback on your code with our powerful execution engine."
  },
  {
    icon: FiShield,
    title: "Secure Platform",
    description: "Your code and data are protected with enterprise-grade security measures."
  }
];

const stats = [
  { number: "1000+", label: "Problems" },
  { number: "50K+", label: "Users" },
  { number: "100K+", label: "Submissions" },
  { number: "24/7", label: "Support" }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden mb-8 sm:mb-12">
          <motion.div 
            className="pt-8 sm:pt-12 pb-8 sm:pb-16 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-6 text-gray-900 dark:text-white">
              Master Coding with{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Codester
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
              The ultimate platform for competitive programming, algorithm practice, and coding challenges. 
              Join thousands of developers improving their skills every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/problems" className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base sm:text-lg font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <FiPlay className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Start Practicing
                <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-white border-2 border-gray-300 dark:border-gray-600 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Join Community
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <span className="text-blue-400">function</span>{" "}
                  <span className="text-yellow-400">solve</span>
                  <span className="text-gray-300">(</span>
                  <span className="text-green-400">nums</span>
                  <span className="text-gray-300">)</span>{" "}
                  <span className="text-gray-300">{`{`}</span>
                  <br />
                  <span className="text-green-400">{"  "}// Your solution here</span>
                  <br />
                  <span className="text-blue-400">{"  "}return</span>{" "}
                  <span className="text-orange-400">0</span>
                  <span className="text-gray-300">;</span>
                  <br />
                  <span className="text-gray-300">{`}`}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="mb-8 sm:mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white">
                    <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-8 sm:mb-12">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Why Choose Codester?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              Everything you need to excel in competitive programming and technical interviews.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mx-auto mb-4 sm:mb-6 shadow-lg">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
