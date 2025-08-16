import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiClock, FiBarChart2 } from "react-icons/fi";

export default function Status() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
  const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://online-judge-codester.onrender.com/api'}/submissions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Normalize submission structure (API returns submissions array)
          const subs = data.submissions || [];
          const normalized = subs.map(s => ({
            _id: s._id || s.id,
            problemTitle: s.problemTitle || s.problem?.title || s.problem,
            verdict: s.status || s.verdict || s.result?.status || 'Unknown',
            executionTime: s.executionTime || s.time || null,
            createdAt: s.createdAt || s.date || Date.now()
          }));
          setSubmissions(normalized);
        } else {
          setSubmissions([]);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const getVerdictIcon = (verdict) => {
    if (verdict === 'Accepted') return <FiCheckCircle className="w-4 h-4 text-green-600" />;
    if (verdict === 'Wrong Answer') return <FiXCircle className="w-4 h-4 text-red-600" />;
    return <FiClock className="w-4 h-4 text-yellow-600" />;
  };

  const getVerdictColor = (verdict) => {
    if (verdict === 'Accepted') return 'text-green-600 dark:text-green-400';
    if (verdict === 'Wrong Answer') return 'text-red-600 dark:text-red-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading submissions...</p>
        </div>
      </div>
    );
  }

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
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white mr-3 sm:mr-4 shadow-lg">
                <FiBarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Submission Status
              </h1>
            </div>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              Track your coding progress and submission history
            </p>
          </div>
        </motion.div>

        {/* Status Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-4 sm:p-6 lg:p-8">
            {submissions.length === 0 ? (
              <div className="text-center py-8">
                <FiBarChart2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No submissions yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start solving problems to see your submission history here!
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-600">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">#</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Problem</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Verdict</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Time</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((submission, index) => (
                        <motion.tr
                          key={submission._id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                          className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                        >
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400 font-medium">{index + 1}</td>
                          <td className="py-4 px-4 text-gray-900 dark:text-white font-medium">{submission.problemTitle || submission.problem}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {getVerdictIcon(submission.verdict)}
                              <span className={`font-semibold ${getVerdictColor(submission.verdict)}`}>
                                {submission.verdict}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400 font-medium">{submission.executionTime || 'N/A'}</td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400 font-medium">
                            {new Date(submission.createdAt || submission.date).toLocaleDateString()}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {submissions.map((submission, index) => (
                    <motion.div
                      key={submission._id || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">#{index + 1}</span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{submission.executionTime || 'N/A'}</span>
                      </div>
                      <div className="mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base">{submission.problemTitle || submission.problem}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getVerdictIcon(submission.verdict)}
                        <span className={`font-semibold text-sm ${getVerdictColor(submission.verdict)}`}>
                          {submission.verdict}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(submission.createdAt || submission.date).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 