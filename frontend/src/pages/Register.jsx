import React from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-4">
      <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-sm w-full space-y-6 text-center">
        <h1 className="text-2xl font-bold">Register for OJ Codester</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Registration is handled via Google. Click below to login and create your account instantly!</p>
        <Link to="/login" className="w-full block bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Continue with Google</Link>
      </div>
    </div>
  );
} 