import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { 
  FiCode, 
  FiUsers, 
  FiTrendingUp, 
  FiAward, 
  FiCalendar,
  FiMessageSquare,
  FiStar,
  FiZap,
  FiTarget,
  FiBarChart,
  FiBookOpen,
  FiPlay,
  FiShield,
  FiGift,
  FiClock,
  FiEye,
  FiHeart,
  FiUser
} from "react-icons/fi";

export default function Home() {
  const { user, loading } = useAuth();

  // Mock data for demonstration
  const recentProblems = [
    { id: 1, title: "Two Sum", difficulty: "Easy", submissions: 1247, solved: 892 },
    { id: 2, title: "Valid Parentheses", difficulty: "Easy", submissions: 987, solved: 756 },
    { id: 3, title: "Merge Two Sorted Lists", difficulty: "Medium", submissions: 654, solved: 432 },
    { id: 4, title: "Binary Tree Inorder Traversal", difficulty: "Medium", submissions: 543, solved: 321 },
    { id: 5, title: "Longest Palindromic Substring", difficulty: "Hard", submissions: 234, solved: 89 }
  ];

  const upcomingContests = [
            { id: 1, title: "Weekly Coding Challenge", date: "Jan 15, 2025", duration: "2 hours", participants: 156 },
        { id: 2, title: "Algorithm Masterclass", date: "Jan 20, 2025", duration: "3 hours", participants: 89 },
        { id: 3, title: "Data Structures Contest", date: "Jan 25, 2025", duration: "1.5 hours", participants: 234 }
  ];

  const recentDiscussions = [
    { id: 1, title: "Best approach for Dynamic Programming problems", author: "CodeMaster", replies: 12, views: 156 },
    { id: 2, title: "Understanding Time Complexity", author: "AlgoGuru", replies: 8, views: 98 },
    { id: 3, title: "Tips for competitive programming", author: "SpeedCoder", replies: 15, views: 203 }
  ];

  const topUsers = [
    { name: "CodeMaster", rank: 1, points: 2847, solved: 156 },
    { name: "AlgoGuru", rank: 2, points: 2654, solved: 142 },
    { name: "SpeedCoder", rank: 3, points: 2432, solved: 128 },
    { name: "DataStruct", rank: 4, points: 2219, solved: 115 },
    { name: "ProblemSolver", rank: 5, points: 1987, solved: 103 }
  ];

  const stats = {
    totalUsers: 15420,
    totalProblems: 847,
    totalSubmissions: 89234,
    activeContests: 3
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Signed in user - Show personalized dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
        {/* Welcome Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUser className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {user.name || user.email?.split('@')[0]}!
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Ready to continue your coding journey?
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  to="/problems"
                  className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Continue Coding
                </Link>
                <Link
                  to="/dashboard"
                  className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300"
                >
                  View Dashboard
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="py-12 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center"
            >
              Quick Actions
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: FiCode, title: "Practice Problems", link: "/problems", color: "from-blue-500 to-purple-500" },
                { icon: FiPlay, title: "Code Runner", link: "/code-runner", color: "from-green-500 to-blue-500" },
                { icon: FiCalendar, title: "Contests", link: "/contests", color: "from-orange-500 to-red-500" },
                { icon: FiBarChart, title: "Leaderboard", link: "/ranks", color: "from-purple-500 to-pink-500" }
              ].map((action, index) => (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                >
                  <Link
                    to={action.link}
                    className="block p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {action.title}
                    </h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center"
            >
              Recent Activity
            </motion.h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Problems */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FiCode className="w-5 h-5 mr-2 text-blue-600" />
                  Recent Problems
                </h3>
                <div className="space-y-3">
                  {recentProblems.slice(0, 3).map((problem) => (
                    <div key={problem.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{problem.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{problem.difficulty}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{problem.solved} solved</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{problem.submissions} submissions</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/problems" className="block text-center mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  View All Problems →
                </Link>
              </motion.div>

              {/* Upcoming Contests */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FiCalendar className="w-5 h-5 mr-2 text-orange-600" />
                  Upcoming Contests
                </h3>
                <div className="space-y-3">
                  {upcomingContests.slice(0, 3).map((contest) => (
                    <div key={contest.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{contest.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{contest.date} • {contest.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{contest.participants} participants</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/contests" className="block text-center mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  View All Contests →
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Non-authenticated user - Show comprehensive landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6"
            >
              Master Coding with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}Codester
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Practice coding problems, compete with others, and improve your skills with our comprehensive online judge platform. Join thousands of developers worldwide.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/register"
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started Free
              </Link>
              <Link
                to="/problems"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300"
              >
                Explore Problems
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { icon: FiUsers, value: stats.totalUsers.toLocaleString(), label: "Active Users" },
              { icon: FiCode, value: stats.totalProblems.toLocaleString(), label: "Problems" },
              { icon: FiTrendingUp, value: stats.totalSubmissions.toLocaleString(), label: "Submissions" },
              { icon: FiAward, value: stats.activeContests.toString(), label: "Active Contests" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive tools and features to accelerate your coding journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FiCode,
                title: "Practice Problems",
                description: "Access hundreds of carefully curated coding problems with detailed solutions and explanations.",
                color: "from-blue-500 to-purple-500"
              },
              {
                icon: FiUsers,
                title: "Community",
                description: "Connect with fellow programmers, share solutions, and learn together in our vibrant community.",
                color: "from-green-500 to-blue-500"
              },
              {
                icon: FiTrendingUp,
                title: "Track Progress",
                description: "Monitor your improvement with detailed analytics, progress tracking, and performance insights.",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: FiAward,
                title: "Compete",
                description: "Participate in contests and climb the leaderboard to prove your skills and win prizes.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: FiBookOpen,
                title: "Learn",
                description: "Access comprehensive tutorials, articles, and resources to master new concepts.",
                color: "from-indigo-500 to-purple-500"
              },
              {
                icon: FiZap,
                title: "Code Runner",
                description: "Test your code instantly with our powerful online compiler supporting multiple languages.",
                color: "from-yellow-500 to-orange-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                className="text-center p-6 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Problems Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Problems
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Start with these popular problems
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProblems.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {problem.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span>{problem.solved} solved</span>
                  <span>{problem.submissions} submissions</span>
                </div>
                <Link
                  to={`/problems/${problem.id}`}
                  className="block mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Solve Problem →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Contests Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Upcoming Contests
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join exciting competitions and win prizes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingContests.map((contest, index) => (
              <motion.div
                key={contest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {contest.title}
                  </h3>
                  <FiGift className="w-5 h-5 text-orange-500" />
                </div>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    {contest.date}
                  </div>
                  <div className="flex items-center">
                    <FiClock className="w-4 h-4 mr-2" />
                    {contest.duration}
                  </div>
                  <div className="flex items-center">
                    <FiUsers className="w-4 h-4 mr-2" />
                    {contest.participants} participants
                  </div>
                </div>
                <Link
                  to="/contests"
                  className="block mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Register Now →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Recent Discussions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Community Discussions
              </h2>
              <div className="space-y-4">
                {recentDiscussions.map((discussion, index) => (
                  <motion.div
                    key={discussion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 * index }}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {discussion.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                      <span>by {discussion.author}</span>
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <FiMessageSquare className="w-4 h-4 mr-1" />
                          {discussion.replies}
                        </span>
                        <span className="flex items-center">
                          <FiEye className="w-4 h-4 mr-1" />
                          {discussion.views}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link to="/discuss" className="block mt-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                Join the Discussion →
              </Link>
            </motion.div>

            {/* Top Users */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Top Performers
              </h2>
              <div className="space-y-4">
                {topUsers.map((user, index) => (
                  <motion.div
                    key={user.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 * index }}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                          {user.rank}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {user.solved} problems solved
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {user.points}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          points
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link to="/ranks" className="block mt-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                View Full Leaderboard →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Start Your Coding Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already improving their skills on Codester. Start practicing today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started Free
              </Link>
              <Link
                to="/problems"
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-300"
              >
                Explore Problems
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
