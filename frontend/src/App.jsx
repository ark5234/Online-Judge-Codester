import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import { ThemeProvider } from './context/ThemeProvider';
import Navbar from './components/Navbar';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <Navbar>
        {user && <span className="mr-4 text-sm text-gray-600 dark:text-gray-300">Hi, {user.name || user.email}</span>}
      </Navbar>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Optional: Fallback Route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

// Optional 404 fallback component
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-red-500 dark:text-red-400 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Oops! The page you’re looking for doesn’t exist.</p>
      <a href="/" className="text-blue-600 dark:text-blue-400 underline">Back to Home</a>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
