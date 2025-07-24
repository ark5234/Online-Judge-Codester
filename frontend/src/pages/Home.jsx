import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';

export default function Home() {
  return (
    <Hero
      title="OJ Codester"
      description="A modern online judge platform for coding contests, practice, and learning. Compete, solve, and sharpen your skills."
    >
      <div className="mt-6 flex gap-4 justify-center">
        <Link
          to="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          Register
        </Link>
      </div>
    </Hero>
  );
}
