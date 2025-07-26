import { useEffect, useState } from "react";
import { account } from "../services/appwrite";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await account.createOAuth2Session(
      "google",
      "http://localhost:5173/dashboard", // success redirect
      "http://localhost:5173/login"      // failure redirect
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 container-fluid">
      <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-8 mb-8 space-y-6 text-center card-hover">
        <div className="flex flex-col items-center">
          <img src="/vite.svg" alt="OJ Codester Logo" className="h-10 w-10 mb-2" />
          <h1 className="text-2xl font-extrabold text-blue-700 dark:text-white text-center mb-2">Login to Codester</h1>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="btn-primary w-full flex items-center justify-center space-x-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-100 text-gray-900 dark:text-gray-900"
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
        </button>
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          <span className="text-xs text-gray-500 dark:text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        </div>
        <div className="text-gray-600 dark:text-gray-300 text-sm text-center">
          New user? Registration is automatic via Google login.<br />
          <Link to="/register" className="underline hover:text-blue-600 dark:hover:text-blue-400">Learn more</Link>
        </div>
      </div>
    </div>
  );
}
