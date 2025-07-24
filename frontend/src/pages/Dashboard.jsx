import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6 container-fluid">
      <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center border-b pb-6 gap-4">
          <h1 className="text-3xl font-extrabold text-blue-700 dark:text-white">Welcome, {user?.name || "User"} 👋</h1>
          <button
            onClick={logout}
            className="btn-primary bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold text-lg shadow"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl card-hover">
            <h2 className="text-xl font-semibold mb-2 text-blue-700 dark:text-white">Your Submissions</h2>
            <p className="text-gray-600 dark:text-gray-300">Check the history of all verdicts.</p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl card-hover">
            <h2 className="text-xl font-semibold mb-2 text-blue-700 dark:text-white">Available Contests</h2>
            <p className="text-gray-600 dark:text-gray-300">Join live or upcoming contests.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl card-hover">
          <h2 className="text-xl font-semibold mb-2 text-blue-700 dark:text-white">Quick Actions</h2>
          <ul className="list-disc pl-5 text-gray-700 dark:text-gray-300">
            <li>View Practice Problems</li>
            <li>Update Profile Info</li>
            <li>Manage Submissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 