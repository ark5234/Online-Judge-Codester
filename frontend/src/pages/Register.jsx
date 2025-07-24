import React from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4">
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-sm w-full space-y-6 text-center">
        
        {/* Logo (Optional) */}
        <div className="flex flex-col items-center">
          <img src="/vite.svg" alt="OJ Codester" className="h-10 w-10 mb-2" />
          <h1 className="text-2xl font-bold">Register for OJ Codester</h1>
        </div>
        
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          We use <strong>Google Sign-In</strong> for secure authentication. Click below to continue.
        </p>
        
        <Link
          to="/login"
          className="block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Continue with Google
        </Link>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Already have an account? <Link to="/login" className="underline hover:text-blue-600 dark:hover:text-blue-400">Login</Link>
        </p>
      </div>
    </div>
  );
}
