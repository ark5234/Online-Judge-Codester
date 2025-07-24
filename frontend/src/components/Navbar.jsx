import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ children }) {
  return (
    <nav className="bg-gray-100 dark:bg-gray-900 shadow-md py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-2xl font-bold text-blue-700 dark:text-white tracking-wide hover:text-blue-900 dark:hover:text-gray-300 transition"
          >
            OJ Codester
          </Link>
          <div className="flex gap-6 text-md font-medium">
            <Link
              to="/login"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition"
            >
              Register
            </Link>
            <Link
              to="/dashboard"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white transition"
            >
              Dashboard
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
