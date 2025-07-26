import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t pt-6 text-center text-sm text-gray-500 bg-white dark:bg-gray-900">
      <p>&copy; {currentYear} OJ Codester. All rights reserved.</p>
      <div className="space-x-4 mt-2">
        <Link to="/privacy" className="hover:underline cursor-pointer transition">Privacy Policy</Link>
        <Link to="/terms" className="hover:underline cursor-pointer transition">Terms of Service</Link>
        <Link to="/cookie" className="hover:underline cursor-pointer transition">Cookie Policy</Link>
      </div>
    </footer>
  );
} 