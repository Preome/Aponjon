import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  MapIcon // ← Added MapIcon for nearby requests
} from '@heroicons/react/24/outline';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    accepted: 0,
    completed: 0,
    available: 0
  });
  const [activeHelps, setActiveHelps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      setActiveHelps(acceptedData.filter(r => r.status === 'accepted'));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <p className="text-3xl font-bold text-gray-900">{stats.accepted || 0}</p>
            <p className="text-gray-600">Active Helps</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completed || 0}</p>
            <p className="text-gray-600">Completed</p>
          </div>
        </div>

        {/* Quick Actions - Updated with 3 options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Nearby Requests with Map - NEW */}
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

          {/* Browse Regular Requests */}
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
          
          {/* My Helps */}
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

        {/* Active Helps */}
        {activeHelps.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
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
                        {help.elderly.phone && (
                          <a
                            href={`tel:${help.elderly.phone}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center"
                          >
                            <PhoneIcon className="h-4 w-4 mr-1" />
                            Call
                          </a>
                        )}
                      </div>
                    </div>
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