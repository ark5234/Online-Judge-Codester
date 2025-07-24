import { Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ children }) {
  return (
    <nav className="p-4 bg-gray-100 dark:bg-gray-800 flex gap-4 items-center shadow-sm">
      <Link to="/" className="font-bold text-blue-700 dark:text-white text-lg">OJ Codester</Link>
      <Link to="/login" className="hover:underline">Login</Link>
      <Link to="/register" className="hover:underline">Register</Link>
      <Link to="/dashboard" className="hover:underline">Dashboard</Link>
      <div className="ml-auto flex items-center gap-2">{children}<ThemeToggle /></div>
    </nav>
  );
} 