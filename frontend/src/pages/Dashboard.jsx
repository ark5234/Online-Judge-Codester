import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-6 pt-32 pb-16 flex justify-center">
      <div className="container mx-auto max-w-screen-md flex flex-col items-center space-y-8">
        {/* Welcome Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 mb-8 w-full flex justify-between items-center">
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
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow transition duration-200 cursor-pointer hover:underline"
          >
            Logout
          </button>
        </div>
        {/* Submissions */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 mb-8 w-full flex flex-col justify-between transition-all hover:scale-[1.02]">
          <div>
            <h2 className="text-xl font-semibold text-blue-700 dark:text-white mb-1">Your Submissions</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Review your past attempts and verdicts here.
            </p>
          </div>
          <button className="mt-4 text-sm text-blue-600 dark:text-blue-300 font-medium hover:underline cursor-pointer">
            View History →
          </button>
        </div>
        {/* Contests */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 mb-8 w-full flex flex-col justify-between transition-all hover:scale-[1.02]">
          <div>
            <h2 className="text-xl font-semibold text-blue-700 dark:text-white mb-1">Available Contests</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Participate in ongoing or upcoming contests.
            </p>
          </div>
          <button className="mt-4 text-sm text-blue-600 dark:text-blue-300 font-medium hover:underline cursor-pointer">
            Explore Contests →
          </button>
        </div>
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-8 mb-8 w-full transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-xl font-semibold text-blue-700 dark:text-white">
              Quick Actions
            </h2>
          </div>
          <ul className="list-disc ml-5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="hover:text-blue-500 cursor-pointer transition">Practice Problems</li>
            <li className="hover:text-blue-500 cursor-pointer transition">Update Profile</li>
            <li className="hover:text-blue-500 cursor-pointer transition">Manage Submissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
