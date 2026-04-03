import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import Layout from './components/Layout';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const FullScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#050d1a' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      <p style={{ fontFamily: 'Syne, sans-serif', color: '#2dd4bf', fontSize: 13, letterSpacing: '0.1em' }}>
        LOADING
      </p>
    </div>
  </div>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
    <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <Layout><DashboardPage /></Layout>
      </ProtectedRoute>
    } />
    <Route path="/admin" element={
      <ProtectedRoute adminOnly>
        <Layout><AdminPage /></Layout>
      </ProtectedRoute>
    } />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0a1a33',
              color: '#e2e8f0',
              border: '1px solid rgba(45,212,191,0.2)',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#2dd4bf', secondary: '#050d1a' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#050d1a' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
