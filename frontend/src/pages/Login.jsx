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
      "http://localhost:5173/dashboard",
      "http://localhost:5173/login"
    );
    setLoading(false);
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await account.get();
        if (user) navigate("/dashboard");
      } catch (err) {
        // Not logged in
      }
    };
    checkSession();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4">
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-sm w-full space-y-6">
        
        {/* Branding */}
        <div className="flex flex-col items-center">
          <img src="/vite.svg" alt="Codester Logo" className="h-10 w-10 mb-2" />
          <h1 className="text-2xl font-bold text-center">Login to Codester</h1>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          aria-label="Login with Google"
          className="w-full flex items-center justify-center space-x-3 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-300 text-gray-900 font-medium transition disabled:opacity-50"
        >
          <img
            src="/google-icon.png"
            alt="Google"
            className="w-5 h-5"
          />
          <span>{loading ? "Redirecting..." : "Continue with Google"}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
          <span className="text-xs text-gray-500 dark:text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        </div>

        {/* Info text */}
        <p className="text-sm text-center text-gray-600 dark:text-gray-300">
          New here? Signing in with Google will create your account automatically.<br />
          <Link
            to="/register"
            className="underline hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            Learn more
          </Link>
        </p>
      </div>
    </div>
  );
}
