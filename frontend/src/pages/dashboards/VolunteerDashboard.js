import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    acceptedRequests: 0,
    completedRequests: 0,
    nearbyRequests: 0
  });
  const [activeHelps, setActiveHelps] = useState([]);
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch my accepted requests
      const myRequestsResponse = await fetch('http://localhost:5000/api/help/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const myRequests = await myRequestsResponse.json();
      
      const accepted = myRequests.filter(r => r.status === 'accepted').length;
      const completed = myRequests.filter(r => r.status === 'completed').length;

      setStats(prev => ({
        ...prev,
        acceptedRequests: accepted,
        completedRequests: completed
      }));

      setActiveHelps(myRequests.filter(r => r.status === 'accepted'));

      // Fetch nearby requests
      const nearbyResponse = await fetch('http://localhost:5000/api/help/nearby', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const nearby = await nearbyResponse.json();
      setStats(prev => ({
        ...prev,
        nearbyRequests: nearby.length
      }));
      setNearbyRequests(nearby.slice(0, 3));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/help/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to complete request:', error);
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Ready to help someone today?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.nearbyRequests}</p>
            <p className="text-gray-600">Nearby Requests</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.acceptedRequests}</p>
            <p className="text-gray-600">Active Helps</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.completedRequests}</p>
            <p className="text-gray-600">Completed</p>
          </div>
        </div>

        {/* Active Helps */}
        {activeHelps.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Active Helps</h2>
            <div className="space-y-4">
              {activeHelps.map((help) => (
                <div key={help._id} className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {help.taskType?.replace('-', ' ')}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{help.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      Active
                    </span>
                  </div>
                  
                  {help.elderly && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 text-gray-500 mr-1" />
                            <span className="text-sm text-gray-600">{help.elderly.name}</span>
                          </div>
                          {help.location && (
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 text-gray-500 mr-1" />
                              <span className="text-sm text-gray-600">{help.location.city}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {help.elderly.phone && (
                            <a
                              href={`tel:${help.elderly.phone}`}
                              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 flex items-center"
                            >
                              <PhoneIcon className="h-3 w-3 mr-1" />
                              Call
                            </a>
                          )}
                          <button
                            onClick={() => handleCompleteRequest(help._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                          >
                            Mark Complete
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

        {/* Nearby Requests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Nearby Help Requests</h2>
            
            {nearbyRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No nearby requests</p>
            ) : (
              <div className="space-y-4">
                {nearbyRequests.map((request) => (
                  <div key={request._id} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 capitalize">
                        {request.taskType?.replace('-', ' ')}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(request.preferredTime).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                    {request.location && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {request.location.city}, {request.location.state}
                      </div>
                    )}
                    <Link
                      to={`/requests`}
                      className="text-primary-600 text-sm font-medium hover:text-primary-700"
                    >
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            )}
            
            <Link
              to="/requests"
              className="mt-4 block text-center text-primary-600 font-medium hover:text-primary-700"
            >
              Browse All Requests
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-md p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/requests"
                className="block bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition"
              >
                <p className="font-medium">Browse Available Requests</p>
                <p className="text-sm opacity-90">Find someone who needs help</p>
              </Link>
              <Link
                to="/profile"
                className="block bg-white bg-opacity-20 p-4 rounded-lg hover:bg-opacity-30 transition"
              >
                <p className="font-medium">Update Your Profile</p>
                <p className="text-sm opacity-90">Set your availability and location</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;