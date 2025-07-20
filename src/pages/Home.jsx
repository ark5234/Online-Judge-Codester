import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Home() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/problems')
      .then(res => {
        console.log('Problems API response:', res.data);
        setProblems(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load problems');
        setLoading(false);
      });
  }, []);

  const safeProblems = Array.isArray(problems) ? problems : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-blue-700 dark:text-blue-300">Problems</h1>
        {loading && <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>}
        {error && <div className="text-center text-red-500 dark:text-red-400">{error}</div>}
        <div className="grid gap-6">
          {safeProblems.map(p => (
            <div key={p._id || p.id} className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex justify-between items-center hover:shadow-lg transition">
              <div>
                <Link to={`/problems/${p._id || p.id}`} className="text-lg font-semibold text-blue-600 dark:text-blue-300 hover:underline">{p.title}</Link>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold
                ${p.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200' :
                  p.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'}`}>
                {p.difficulty}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 