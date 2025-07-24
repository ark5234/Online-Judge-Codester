import React from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 px-4 container-fluid">
      <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-200 dark:border-gray-800 text-center card-hover">
        <h1 className="text-2xl font-extrabold text-blue-700 dark:text-white mb-2">Register for OJ Codester</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Registration is handled via Google. Click below to login and create your account instantly!</p>
        <Link to="/login" className="btn-primary w-full block bg-blue-700 text-white hover:bg-blue-800">Continue with Google</Link>
      </div>
    </div>
  );
}
