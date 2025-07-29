import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CodeRunner from './pages/CodeRunner';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Status from './pages/Status';
import Ranks from './pages/Ranks';
import Discuss from './pages/Discuss';
import Contests from './pages/Contests';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AdminRoute from './routes/AdminRoute';
import { ThemeProvider } from './context/ThemeProvider';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20 md:pt-28 w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/code-runner" element={<CodeRunner />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:id" element={<ProblemDetail />} />
          <Route path="/status" element={<Status />} />
          <Route path="/ranks" element={<Ranks />} />
          <Route path="/discuss" element={<Discuss />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          {/* Optional: Fallback Route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// Optional 404 fallback component
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 dark:bg-gray-900">
      <h1 className="text-4xl font-bold text-red-500 dark:text-red-400 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Oops! The page you're looking for doesn't exist.</p>
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
