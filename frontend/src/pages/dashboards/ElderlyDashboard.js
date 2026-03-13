import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusCircleIcon,
  PhoneIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const ElderlyDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    acceptedRequests: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/help/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const requests = await response.json();
      
      const total = requests.length;
      const pending = requests.filter(r => r.status === 'pending').length;
      const accepted = requests.filter(r => r.status === 'accepted').length;
      const completed = requests.filter(r => r.status === 'completed').length;

      setStats({
        totalRequests: total,
        pendingRequests: pending,
        completedRequests: completed,
        acceptedRequests: accepted
      });

      setRecentRequests(requests.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
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
          <p className="text-gray-600">Here's your care request overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalRequests}</p>
            <p className="text-gray-600">Total Requests</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
            <p className="text-gray-600">Pending</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.acceptedRequests}</p>
            <p className="text-gray-600">Being Helped</p>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link 
            to="/create-request" 
            className="bg-primary-600 text-white p-6 rounded-xl shadow-md hover:bg-primary-700 transition flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">Request Help</h3>
              <p className="text-primary-100">Get assistance with daily tasks</p>
            </div>
            <PlusCircleIcon className="h-8 w-8" />
          </Link>
          
          <Link 
            to="/requests" 
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200 flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">My Requests</h3>
              <p className="text-gray-600">View all your help requests</p>
            </div>
            <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400" />
          </Link>
        </div>

        {/* Active Help Section */}
        {recentRequests.filter(r => r.status === 'accepted').length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Help</h2>
            <div className="space-y-4">
              {recentRequests.filter(r => r.status === 'accepted').map((request) => (
                <div key={request._id} className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {request.taskType?.replace('-', ' ')}
                    </h3>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      In Progress
                    </span>
                  </div>
                  {request.volunteer && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">
                          Volunteer: {request.volunteer.name}
                        </span>
                      </div>
                      {request.volunteer.phone && (
                        <a
                          href={`tel:${request.volunteer.phone}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center"
                        >
                          <PhoneIcon className="h-4 w-4 mr-1" />
                          Call
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Requests */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Requests</h2>
          
          {recentRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No requests yet</p>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {request.taskType?.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(request.preferredTime).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElderlyDashboard;