import { useAuth } from "../context/AuthContext";
import { LogOut, FileText, Trophy, Flashlight } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6 pt-32 pb-16 flex justify-center">
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Welcome Card */}
        <div className="glass-card col-span-1 sm:col-span-2 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-blue-700 dark:text-white mb-1">
              Welcome, {user?.name || "User"} 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Let’s get started with your coding journey.
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow transition duration-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {/* Submissions */}
        <div className="glass-card p-6 flex flex-col justify-between transition-all hover:scale-[1.02]">
          <div>
            <FileText size={24} className="text-blue-500 dark:text-blue-400 mb-2" />
            <h2 className="text-xl font-semibold text-blue-700 dark:text-white mb-1">Your Submissions</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Review your past attempts and verdicts here.
            </p>
          </div>
          <button className="mt-4 text-sm text-blue-600 dark:text-blue-300 font-medium hover:underline">
            View History →
          </button>
        </div>

        {/* Contests */}
        <div className="glass-card p-6 flex flex-col justify-between transition-all hover:scale-[1.02]">
          <div>
            <Trophy size={24} className="text-yellow-500 dark:text-yellow-400 mb-2" />
            <h2 className="text-xl font-semibold text-blue-700 dark:text-white mb-1">Available Contests</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Participate in ongoing or upcoming contests.
            </p>
          </div>
          <button className="mt-4 text-sm text-blue-600 dark:text-blue-300 font-medium hover:underline">
            Explore Contests →
          </button>
        </div>

        {/* Quick Actions */}
        <div className="glass-card col-span-1 sm:col-span-2 p-6 transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-3 mb-3">
            <Flashlight size={22} className="text-green-500 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-blue-700 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside pl-2">
            <li className="hover:text-blue-500 cursor-pointer transition">Practice Problems</li>
            <li className="hover:text-blue-500 cursor-pointer transition">Update Profile</li>
            <li className="hover:text-blue-500 cursor-pointer transition">Manage Submissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
