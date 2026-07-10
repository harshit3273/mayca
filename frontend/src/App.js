import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFound from './pages/NotFound';
import CADashboard from './pages/ca/CADashboard';
import ClientDashboard from './pages/client/ClientDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* CA routes */}
          <Route path="/ca/*" element={
            <PrivateRoute role="ca">
              <CADashboard />
            </PrivateRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/*" element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Client routes */}
          <Route path="/client/*" element={
            <PrivateRoute role="client">
              <ClientDashboard />
            </PrivateRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<LandingPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </AuthProvider>
  );
}

export default App;
