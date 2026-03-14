import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboards
import ElderlyDashboard from './pages/dashboards/ElderlyDashboard';
import VolunteerDashboard from './pages/dashboards/VolunteerDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';

// Request Pages
import CreateRequest from './pages/CreateRequest';
import BrowseRequests from './pages/BrowseRequests';
import MyRequests from './pages/MyRequests';
import NearbyRequests from './pages/NearbyRequests';
import RateVolunteer from './pages/RateVolunteer'; // ← Added this import

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch(user.role) {
      case 'elderly': return <Navigate to="/elderly-dashboard" replace />;
      case 'volunteer': return <Navigate to="/volunteer-dashboard" replace />;
      case 'admin': return <Navigate to="/admin-dashboard" replace />;
      default: return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Elderly Routes */}
            <Route path="/elderly-dashboard" element={
              <ProtectedRoute allowedRoles={['elderly']}>
                <ElderlyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/create-request" element={
              <ProtectedRoute allowedRoles={['elderly']}>
                <CreateRequest />
              </ProtectedRoute>
            } />
            <Route path="/my-requests" element={
              <ProtectedRoute allowedRoles={['elderly']}>
                <MyRequests />
              </ProtectedRoute>
            } />
            
            {/* NEW: Rate Volunteer Route (Elderly only) */}
            <Route path="/rate-volunteer/:id" element={
              <ProtectedRoute allowedRoles={['elderly']}>
                <RateVolunteer />
              </ProtectedRoute>
            } />
            
            {/* Volunteer Routes */}
            <Route path="/volunteer-dashboard" element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/browse-requests" element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <BrowseRequests />
              </ProtectedRoute>
            } />
            
            {/* Also add /requests as alias for browse-requests */}
            <Route path="/requests" element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <BrowseRequests />
              </ProtectedRoute>
            } />
            
            {/* Nearby Requests with Map */}
            <Route path="/nearby-requests" element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <NearbyRequests />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;