import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './component/LandingPage';
import Login from './component/auth/login/login';
import Register from './component/auth/login/register';
import Dashboard from './component/Dashboard';
import EmergencyRequest from './component/EmergencyRequest';
import VolunteerMap from './component/VolunteerMap';
import AdminPanel from './component/AdminPanel';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/emergency" 
            element={
              <ProtectedRoute>
                <EmergencyRequest />
              </ProtectedRoute>
            } 
          />
          {/* Map route with optional emergency ID parameter */}
          <Route 
            path="/map/:emergencyId?" 
            element={
              <ProtectedRoute>
                <VolunteerMap />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;