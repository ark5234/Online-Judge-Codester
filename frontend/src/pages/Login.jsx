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
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4">
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-sm w-full space-y-6">
        <div className="flex flex-col items-center">
          <img src="/vite.svg" alt="OJ Codester Logo" className="h-10 w-10 mb-2" />
          <h1 className="text-2xl font-bold text-center">Login to Codester</h1>
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white py-2 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center space-x-2 disabled:opacity-60 border border-gray-200 dark:border-gray-700"
          disabled={loading}
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4 w-4" alt="Google logo" />
          <span>{loading ? "Redirecting..." : "Continue with Google"}</span>
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