import React, { useContext, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

export default function Login() {
  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/auth/login', { email, password });
      setAuth(res.data);
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post('/auth/google', { idToken: credentialResponse.credential });
      setAuth(res.data);
      localStorage.setItem('token', res.data.token);
    } catch (err) {
      setError('Google login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">Sign In</h2>
        {error && <div className="mb-4 bg-red-100 text-red-700 p-2 rounded">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" className="w-full p-2 border rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" className="w-full p-2 border rounded" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Login</button>
        </form>
        <div className="my-4 text-center text-gray-500">or</div>
        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google login failed')} />
        </div>
      </div>
    </div>
  );
} 