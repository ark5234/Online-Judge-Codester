import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCode, FiFilter, FiSearch } from "react-icons/fi";

const sampleProblems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    acceptance: "85%",
    submissions: 1250000
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stack",
    acceptance: "78%",
    submissions: 980000
  },
  {
    id: 3,
    title: "Merge Sorted Array",
    difficulty: "Medium",
    category: "Array",
    acceptance: "72%",
    submissions: 750000
  },
  {
    id: 4,
    title: "Binary Tree Inorder Traversal",
    difficulty: "Medium",
    category: "Tree",
    acceptance: "68%",
    submissions: 650000
  },
  {
    id: 5,
    title: "Longest Palindromic Substring",
    difficulty: "Hard",
    category: "String",
    acceptance: "45%",
    submissions: 450000
  },
  {
    id: 6,
    title: "Regular Expression Matching",
    difficulty: "Hard",
    category: "Dynamic Programming",
    acceptance: "38%",
    submissions: 320000
  }
];

const getDifficultyTag = (difficulty) => {
  const colors = {
    Easy: "flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400",
    Medium: "flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400",
    Hard: "flex items-center gap-1 text-xs px-2 py-1 rounded-full font-semibold bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
  };
  return colors[difficulty] || colors.Easy;
};

export default function Problems() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const filteredProblems = sampleProblems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mr-4 shadow-lg">
                <FiCode className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  Coding Problems
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Practice with our curated collection of algorithmic challenges
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search problems..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FiFilter className="text-gray-400 w-5 h-5" />
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Problems List */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Problems</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">{filteredProblems.length} problems</span>
            </div>
            <div className="space-y-4">
              {filteredProblems.map((problem, index) => (
                <motion.div
                  key={problem.id}
                  className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 sm:p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <Link to={`/problem/${problem.id}`} className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 mb-2 block">
                        {problem.title}
                      </Link>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{problem.category}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">{problem.acceptance} acceptance</span>
                      <span className="font-medium">{problem.submissions.toLocaleString()} submissions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span className={getDifficultyTag(problem.difficulty)}>
                      {problem.difficulty}
                    </span>
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                      →
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
