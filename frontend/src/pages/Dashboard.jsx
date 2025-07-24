import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-3xl font-bold">Welcome, {user?.name || "User"} 👋</h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-white"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-2">Your Submissions</h2>
            <p className="text-gray-600 dark:text-gray-300">Check the history of all verdicts.</p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-2">Available Contests</h2>
            <p className="text-gray-600 dark:text-gray-300">Join live or upcoming contests.</p>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
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