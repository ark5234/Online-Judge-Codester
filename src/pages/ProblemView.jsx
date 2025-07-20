import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ProblemView() {
  const { id } = useParams();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dummy problem
  const problem = {
    title: 'Two Sum',
    description: 'Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
    difficulty: 'Easy',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setResult('Submitted! (API integration needed)');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded shadow p-6">
        <h2 className="text-2xl font-bold mb-2 text-blue-700 dark:text-blue-300">{problem.title}</h2>
        <div className="mb-2 text-gray-500 dark:text-gray-400">Difficulty: {problem.difficulty}</div>
        <p className="mb-4 text-gray-700 dark:text-gray-200">{problem.description}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white">
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="js">JavaScript</option>
          </select>
          <textarea value={code} onChange={e => setCode(e.target.value)} rows={10} className="w-full p-2 border rounded font-mono dark:bg-gray-800 dark:text-white" placeholder="Write your code here..." />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
        </form>
        {result && <div className="mt-4 text-green-600 dark:text-green-400">{result}</div>}
      </div>
    </div>
  );
} 