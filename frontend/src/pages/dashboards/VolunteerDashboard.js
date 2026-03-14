import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Add useNavigate
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  MapIcon
} from '@heroicons/react/24/outline';

const VolunteerDashboard = () => {
  const navigate = useNavigate(); // Add this
  const { user } = useAuth();
  const [stats, setStats] = useState({
    accepted: 0,
    completed: 0,
    available: 0
  });
  const [activeHelps, setActiveHelps] = useState([]);
  const [completedHelps, setCompletedHelps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);
  const [pendingEmergencies, setPendingEmergencies] = useState(0); // Add this

  useEffect(() => {
    fetchDashboardData();
    checkEmergencies();
    // Check for emergencies every 10 seconds
    const interval = setInterval(checkEmergencies, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkEmergencies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/emergency/pending-emergencies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPendingEmergencies(data.length);
    } catch (error) {
      console.error('Failed to check emergencies:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsResponse = await fetch('http://localhost:5000/api/help/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch accepted requests
      const acceptedResponse = await fetch('http://localhost:5000/api/help/my-accepted', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const acceptedData = await acceptedResponse.json();
      
      // Split into active and completed
      setActiveHelps(acceptedData.filter(r => r.status === 'accepted'));
      setCompletedHelps(acceptedData.filter(r => r.status === 'completed'));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (requestId) => {
    if (!window.confirm('Have you completed this help request?')) return;
    
    setCompleting(requestId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/help/complete/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Request marked as completed!');
        fetchDashboardData(); // Refresh data
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to complete request');
      }
    } catch (error) {
      console.error('Failed to complete request:', error);
      alert('Network error. Please try again.');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Ready to help someone today?</p>
        </div>

        {/* Emergency Alert Banner - Shows if there are pending emergencies */}
        {pendingEmergencies > 0 && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6 animate-pulse cursor-pointer" 
               onClick={() => navigate('/emergency-alerts')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-3xl mr-3">🚨</span>
                <div>
                  <h3 className="font-bold text-lg">{pendingEmergencies} Emergency SOS {pendingEmergencies === 1 ? 'Alert' : 'Alerts'}!</h3>
                  <p className="text-red-100">Click to view and respond immediately</p>
                </div>
              </div>
              <span className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold">
                View Now →
              </span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
              <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.available || 0}</p>
            <p className="text-gray-600">Available Requests</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-4">
              <ClockIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeHelps.length}</p>
            <p className="text-gray-600">Active Helps</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{completedHelps.length}</p>
            <p className="text-gray-600">Completed</p>
          </div>

          {/* Emergency Stats Card */}
          <div className="bg-red-50 rounded-xl shadow-md p-6 border-2 border-red-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <span className="text-2xl">🚨</span>
              </div>
              {pendingEmergencies > 0 && (
                <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs animate-pulse">
                  {pendingEmergencies} NEW
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900">{pendingEmergencies}</p>
            <p className="text-gray-600">Pending Emergencies</p>
          </div>
        </div>

        {/* Quick Actions - Now with 4 columns including Emergency */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Emergency Alerts Button - NEW */}
          <button
            onClick={() => navigate('/emergency-alerts')}
            className={`p-6 rounded-xl shadow-md transition flex items-center justify-between ${
              pendingEmergencies > 0 
                ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">🚨 EMERGENCY</h3>
              <p className={pendingEmergencies > 0 ? 'text-red-100' : 'text-orange-100'}>
                {pendingEmergencies > 0 ? `${pendingEmergencies} active alerts` : 'No active alerts'}
              </p>
            </div>
            <span className="text-4xl">🚨</span>
          </button>

          <Link 
            to="/nearby-requests" 
            className="bg-green-600 text-white p-6 rounded-xl shadow-md hover:bg-green-700 transition flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">Nearby Map</h3>
              <p className="text-green-100">Find requests within 3km</p>
            </div>
            <MapIcon className="h-8 w-8" />
          </Link>

          <Link 
            to="/browse-requests" 
            className="bg-primary-600 text-white p-6 rounded-xl shadow-md hover:bg-primary-700 transition flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">Browse All</h3>
              <p className="text-primary-100">See all available requests</p>
            </div>
            <ClipboardDocumentListIcon className="h-8 w-8" />
          </Link>
          
          <Link 
            to="/my-accepted" 
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200 flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">My Helps</h3>
              <p className="text-gray-600">View your accepted requests</p>
            </div>
            <UserIcon className="h-8 w-8 text-gray-400" />
          </Link>
        </div>

        {/* Active Helps Section */}
        {activeHelps.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Active Helps</h2>
            <div className="space-y-4">
              {activeHelps.map((help) => (
                <div key={help._id} className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {help.taskType?.replace('-', ' ')}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{help.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Active
                    </span>
                  </div>
                  
                  {help.elderly && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <UserIcon className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-gray-700">{help.elderly.name}</span>
                          </div>
                          {help.location && (
                            <div className="flex items-center text-sm">
                              <MapPinIcon className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-600">{help.location.city}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {help.elderly.phone && (
                            <a
                              href={`tel:${help.elderly.phone}`}
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center"
                            >
                              <PhoneIcon className="h-4 w-4 mr-1" />
                              Call
                            </a>
                          )}
                          <button
                            onClick={() => handleComplete(help._id)}
                            disabled={completing === help._id}
                            className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center disabled:opacity-50"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            {completing === help._id ? 'Completing...' : 'Complete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Helps Section */}
        {completedHelps.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Completed</h2>
            <div className="space-y-4">
              {completedHelps.slice(0, 3).map((help) => (
                <div key={help._id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {help.taskType?.replace('-', ' ')}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{help.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                      Completed
                    </span>
                  </div>
                  {help.completedAt && (
                    <p className="text-xs text-gray-400 mt-2">
                      Completed on: {new Date(help.completedAt).toLocaleDateString()}
                    </p>
                  )}
                  {help.rating && (
                    <p className="text-sm text-yellow-600 mt-2">
                      ⭐ Rating: {help.rating}/5
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;