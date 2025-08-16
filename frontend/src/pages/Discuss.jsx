import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiMessageSquare, FiUsers, FiClock, FiThumbsUp, FiLogIn, FiPlus, FiHeart, FiEye } from "react-icons/fi";
import { API_ENDPOINTS } from "../services/appwrite";

export default function Discuss() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    tags: ''
  });

  // Fetch discussions from API
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
  const response = await fetch(API_ENDPOINTS.DISCUSSIONS);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch discussions: ${response.status}`);
        }
        
  const data = await response.json();
  setDiscussions(data.discussions || []);
      } catch (error) {
        console.error('Error fetching discussions:', error);
  // If backend returns 503 (DB not connected) show empty list silently
  setError(error.message);
  setDiscussions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  const handleInteraction = () => {
    if (!user) {
      navigate("/login");
    }
  };

  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.DISCUSSIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.$id}`,
          'x-appwrite-token': user.$id,
          'x-user-email': user.email,
          'x-user-name': user.name || user.email,
          'x-user-avatar': user.avatar || ''
        },
        body: JSON.stringify({
          title: newDiscussion.title,
          content: newDiscussion.content,
          tags: newDiscussion.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create discussion');
      }

      const data = await response.json();
      
      // Add new discussion to the list
      setDiscussions(prev => [data.discussion, ...prev]);
      
      // Reset form
      setNewDiscussion({ title: '', content: '', tags: '' });
      setShowNewDiscussion(false);
    } catch (error) {
      console.error('Error creating discussion:', error);
      setError(error.message);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading discussions...</p>
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
            {!user && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 Sign in to join discussions and share your knowledge!
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* New Discussion Button */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <button 
              onClick={() => setShowNewDiscussion(!showNewDiscussion)}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
            >
              <FiPlus className="w-5 h-5 mr-2" />
              {showNewDiscussion ? 'Cancel' : 'Start New Discussion'}
            </button>
          </motion.div>
        )}

        {/* New Discussion Form */}
        {showNewDiscussion && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Create New Discussion
              </h3>
              <form onSubmit={handleCreateDiscussion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter discussion title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, content: e.target.value }))}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your thoughts, questions, or knowledge..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newDiscussion.tags}
                    onChange={(e) => setNewDiscussion(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="algorithms, optimization, tips"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
                  >
                    Create Discussion
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewDiscussion(false)}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg"
          >
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Discussions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8">
            {discussions.length === 0 ? (
              <div className="text-center py-8">
                <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No discussions yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to start a discussion!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {discussions.map((discussion, index) => (
                  <motion.div
                    key={discussion._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl p-4 sm:p-6 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md cursor-pointer"
                    onClick={() => navigate(`/discuss/${discussion._id}`)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
                          {discussion.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm line-clamp-2">
                          {discussion.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <div className="flex items-center space-x-1">
                            <FiUsers className="w-4 h-4" />
                            <span>{discussion.authorName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiClock className="w-4 h-4" />
                            <span>{formatTimeAgo(discussion.createdAt)}</span>
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
                          <span>{discussion.replies?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiEye className="w-4 h-4" />
                          <span>{discussion.views || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FiHeart className="w-4 h-4" />
                          <span>{discussion.likes?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Login Prompt for Non-Authenticated Users */}
            {!user && discussions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="mt-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white text-center"
              >
                <div className="flex items-center justify-center mb-3">
                  <FiLogIn className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold">Join the Discussion!</h3>
                </div>
                <p className="text-indigo-100 mb-4">
                  Sign in to participate in discussions, ask questions, and share your knowledge with the community!
                </p>
                <button
                  onClick={handleInteraction}
                  className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Sign In to Participate
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 