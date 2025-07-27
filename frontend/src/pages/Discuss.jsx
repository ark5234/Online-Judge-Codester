import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMessageSquare, FiUsers, FiClock, FiThumbsUp } from "react-icons/fi";

const sampleDiscussions = [
  { 
    id: 1, 
    title: "How to optimize Two Sum solution?", 
    author: "Alice Johnson", 
    replies: 12, 
    views: 156,
    time: "2 hours ago",
    tags: ["algorithms", "optimization"]
  },
  { 
    id: 2, 
    title: "Best approach for Dynamic Programming problems", 
    author: "Bob Smith", 
    replies: 8, 
    views: 89,
    time: "5 hours ago",
    tags: ["dynamic-programming", "algorithms"]
  },
];

export default function Discuss() {
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
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg">
                <FiMessageSquare className="w-6 h-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Discussion Forum
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Share knowledge and learn from the community
            </p>
          </div>
        </motion.div>

        {/* Discussions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
            <div className="space-y-4">
              {sampleDiscussions.map((discussion, index) => (
                <motion.div
                  key={discussion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 sm:p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
                        {discussion.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div className="flex items-center space-x-1">
                          <FiUsers className="w-4 h-4" />
                          <span>{discussion.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiClock className="w-4 h-4" />
                          <span>{discussion.time}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {discussion.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <FiMessageSquare className="w-4 h-4" />
                        <span>{discussion.replies}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiThumbsUp className="w-4 h-4" />
                        <span>{discussion.views}</span>
                      </div>
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