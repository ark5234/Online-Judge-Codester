import React, { useEffect, useState } from "react";
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
import adminService from "../services/adminService";

export default function Home() {
  const { user, loading } = useAuth();
  const [topUsers, setTopUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const data = await adminService.getUsers();
        // Sort users by score/points and take top 5
        const sorted = (data.users || []).sort((a, b) => (b.score || b.points || 0) - (a.score || a.points || 0));
        setTopUsers(sorted.slice(0, 5));
      } catch (err) {
        setTopUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchTopUsers();
  }, []);

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
        {/* Hero Section */}
        <section className="pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                Welcome back, <span className="text-blue-600 dark:text-blue-500">{user.name || user.email}</span>
                </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Ready to tackle today's coding challenges? Let's keep pushing your limits!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/problems"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center text-sm"
                >
                  <FiCode className="w-4 h-4 mr-2" />
                  Start Coding
                </Link>
                <Link
                  to="/contests"
                  className="px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center text-sm"
                >
                  <FiAward className="w-4 h-4 mr-2" />
                  Join Contest
                </Link>
              </div>
              </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mr-4">
                    <FiUsers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Users</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mr-4">
                    <FiCode className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Problems</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalProblems}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mr-4">
                    <FiBarChart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submissions</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalSubmissions.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mr-4">
                    <FiAward className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contests</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeContests}</p>
                  </div>
                </div>
                    </div>
                </motion.div>
          </div>
        </section>

        {/* Top Users Section */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Top Coders</h2>
                  <Link
                    to="/ranks"
                    className="text-sm text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {loadingUsers ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600 dark:text-gray-300">Loading top users...</p>
                    </div>
                  ) : topUsers.length > 0 ? (
                    topUsers.map((user, index) => (
              <motion.div
                        key={user._id || user.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                        className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {user.name || user.username || user.email}
                </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {user.problemsSolved || user.solved || 0} problems solved
                              </p>
                            </div>
                      </div>
                      <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {user.score || user.points || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              points
                            </div>
                          </div>
                      </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No users found</p>
                    </div>
                  )}
                </div>
                <Link to="/ranks" className="block mt-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                  View Full Leaderboard →
                </Link>
              </div>
              </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Ready to Level Up Your Coding Skills?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of developers who are already improving their problem-solving abilities with our curated collection of algorithmic challenges.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/problems"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm"
                >
                  Start Solving Problems
                </Link>
                <Link
                  to="/contests"
                  className="px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm text-sm"
                >
                  Join a Contest
                </Link>
              </div>
              </motion.div>
          </div>
        </section>
      </div>
    );
  }

  // Guest user - Show landing page
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      {/* Hero Section */}
      <section className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
              Master the Art of
              <span className="text-blue-600 dark:text-blue-500"> Problem Solving</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of developers improving their algorithmic thinking with our curated collection of coding challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm"
              >
                Get Started Free
              </Link>
              <Link
                to="/problems"
                className="px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm text-sm"
              >
                Browse Problems
              </Link>
                </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mb-4">
                <FiCode className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Practice Problems</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access hundreds of carefully curated algorithmic problems with detailed solutions and explanations.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mb-4">
                <FiAward className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Compete & Win</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                Participate in coding contests, climb the leaderboard, and earn recognition for your skills.
                </p>
          </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mb-4">
                <FiUsers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Learn Together</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Join discussions, share solutions, and learn from the community of passionate coders.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 text-center">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Users</p>
                  </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 text-center">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mx-auto mb-4">
                <FiCode className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalProblems}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Problems</p>
                  </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 text-center">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mx-auto mb-4">
                <FiBarChart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalSubmissions.toLocaleString()}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submissions</p>
                        </div>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 text-center">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center mx-auto mb-4">
                <FiAward className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeContests}</p>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Contests</p>
            </div>
            </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
              Ready to Start Your Coding Journey?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are already improving their problem-solving abilities with our curated collection of algorithmic challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm text-sm"
              >
                Get Started Free
              </Link>
              <Link
                to="/problems"
                className="px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm text-sm"
              >
                Browse Problems
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
