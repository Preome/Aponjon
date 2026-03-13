import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: {
      total: 0,
      elderly: 0,
      volunteers: 0
    },
    requests: {
      total: 0,
      pending: 0,
      accepted: 0,
      completed: 0
    }
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch recent users
      const usersResponse = await fetch('http://localhost:5000/api/admin/users?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const users = await usersResponse.json();
      setRecentUsers(users.slice(0, 5));

      // Fetch recent requests
      const requestsResponse = await fetch('http://localhost:5000/api/admin/requests?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const requests = await requestsResponse.json();
      setRecentRequests(requests.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
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
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
            <p className="text-gray-600">Total Users</p>
            <div className="mt-2 text-sm text-gray-500">
              <span className="mr-3">👴 {stats.users.elderly}</span>
              <span>🤝 {stats.users.volunteers}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.requests.total}</p>
            <p className="text-gray-600">Total Requests</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.requests.pending}</p>
            <p className="text-gray-600">Pending</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.requests.completed}</p>
            <p className="text-gray-600">Completed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
              <Link to="/admin/users" className="text-primary-600 text-sm hover:text-primary-700">
                View All
              </Link>
            </div>
            
            {recentUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No users yet</p>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-200 rounded-full p-2">
                        <UserIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <span className="text-xs px-2 py-1 bg-gray-200 rounded-full mt-1 inline-block">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Requests</h2>
              <Link to="/admin/requests" className="text-primary-600 text-sm hover:text-primary-700">
                View All
              </Link>
            </div>
            
            {recentRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No requests yet</p>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 capitalize">
                        {request.taskType?.replace('-', ' ')}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>From: {request.elderly?.name || 'Unknown'}</p>
                      {request.volunteer && <p>Volunteer: {request.volunteer.name}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/users"
              className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 transition"
            >
              <UserGroupIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <span className="text-gray-700 font-medium">Manage Users</span>
            </Link>
            <Link
              to="/admin/requests"
              className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 transition"
            >
              <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <span className="text-gray-700 font-medium">Manage Requests</span>
            </Link>
            <Link
              to="/admin/reports"
              className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 transition"
            >
              <CheckCircleIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <span className="text-gray-700 font-medium">View Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;