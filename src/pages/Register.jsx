import React, { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

export default function Register() {
  const { setAuth } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/auth/register', { username, email, password });
      setAuth(res.data);
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-300">Register</h2>
        {error && <div className="mb-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-2 rounded">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="email" className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Register</button>
        </form>
      </div>
    </div>
  );
} 