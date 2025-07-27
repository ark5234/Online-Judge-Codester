import { useEffect, useState } from "react";
import { account } from "../services/appwrite";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiLogIn, FiArrowRight } from "react-icons/fi";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    // Use production URL for Vercel deployment
    const baseUrl = window.location.origin;
    await account.createOAuth2Session(
      "google",
      `${baseUrl}/dashboard`, // success redirect
      `${baseUrl}/login`      // failure redirect
    );
    setLoading(false);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await account.get();
        if (user) navigate("/dashboard");
      } catch (err) {
        // not logged in
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sm:p-8 space-y-6 text-center"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
              <FiLogIn className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to continue your coding journey
            </p>
          </motion.div>

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
              disabled={loading}
            >
              <img
                src="/google-icon.png"
                alt="Google"
                className="w-5 h-5"
              />
              <span>
                {loading ? "Redirecting..." : "Continue with Google"}
              </span>
              {!loading && <FiArrowRight className="w-4 h-4" />}
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
          </motion.div>

          {/* Info Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-gray-600 dark:text-gray-300 text-sm text-center space-y-2"
          >
            <p>New user? Registration is automatic via Google login.</p>
            <Link 
              to="/register" 
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-300"
            >
              Learn more about our platform
              <FiArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
