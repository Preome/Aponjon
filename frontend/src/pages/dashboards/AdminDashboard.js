import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  UserGroupIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  HeartIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: {
      total: 0,
      elderly: 0,
      volunteers: 0,
      admins: 0
    },
    requests: {
      total: 0,
      pending: 0,
      accepted: 0,
      completed: 0,
      emergencies: 0
    }
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      
      console.log('Fetching admin data...');
      
      // Fetch users
      const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const users = await usersResponse.json();
      console.log('Users fetched:', users.length);
      
      // Calculate user stats
      const totalUsers = users.length;
      const totalElderly = users.filter(u => u.role === 'elderly').length;
      const totalVolunteers = users.filter(u => u.role === 'volunteer').length;
      const totalAdmins = users.filter(u => u.role === 'admin').length;
      
      // Get recent users (last 5)
      setRecentUsers(users.slice(0, 5));

      // Fetch requests
      const requestsResponse = await fetch('http://localhost:5000/api/admin/requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!requestsResponse.ok) {
        throw new Error('Failed to fetch requests');
      }
      
      const requests = await requestsResponse.json();
      console.log('Requests fetched:', requests.length);
      
      // Calculate request stats
      const totalRequests = requests.length;
      const pendingRequests = requests.filter(r => r.status === 'pending').length;
      const acceptedRequests = requests.filter(r => r.status === 'accepted').length;
      const completedRequests = requests.filter(r => r.status === 'completed').length;
      const emergencyRequests = requests.filter(r => r.isEmergency).length;
      
      // Get recent requests (last 5)
      setRecentRequests(requests.slice(0, 5));

      setStats({
        users: {
          total: totalUsers,
          elderly: totalElderly,
          volunteers: totalVolunteers,
          admins: totalAdmins
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          accepted: acceptedRequests,
          completed: completedRequests,
          emergencies: emergencyRequests
        }
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message);
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
          {error && (
            <div className="mt-4 bg-red-50 text-red-500 p-3 rounded-lg">
              Error: {error}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
            <p className="text-gray-600">Total Users</p>
            <div className="mt-2 flex text-sm text-gray-500 space-x-3">
              <span>👴 {stats.users.elderly}</span>
              <span>🤝 {stats.users.volunteers}</span>
              <span>👨‍💼 {stats.users.admins}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-green-500" />
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

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <HeartIcon className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.requests.emergencies}</p>
            <p className="text-gray-600">Emergencies</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <UserIcon className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.users.elderly}</p>
            <p className="text-gray-600">Elderly Users</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.users.volunteers}</p>
            <p className="text-gray-600">Volunteers</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.users.total > 0 ? Math.round((stats.users.elderly / stats.users.total) * 100) : 0}%
            </p>
            <p className="text-gray-600">Elderly %</p>
          </div>
        </div>

        {/* Recent Users and Requests */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Users</h2>
              <Link to="/admin/users" className="text-primary-600 hover:text-primary-700 text-sm">
                View All →
              </Link>
            </div>
            
            {recentUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No users yet</p>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {user.role === 'elderly' ? '👴' : user.role === 'volunteer' ? '🤝' : '👨‍💼'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'elderly' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'volunteer' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Requests</h2>
              <Link to="/admin/requests" className="text-primary-600 hover:text-primary-700 text-sm">
                View All →
              </Link>
            </div>
            
            {recentRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No requests yet</p>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div key={request._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900 capitalize">
                          {request.taskType?.replace('-', ' ')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          From: {request.elderly?.name || 'Unknown'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        request.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    {request.isEmergency && (
                      <span className="inline-block mt-1 bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                        🚨 Emergency
                      </span>
                    )}
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
              className="bg-blue-50 p-4 rounded-lg text-center hover:bg-blue-100 transition"
            >
              <UserGroupIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <span className="text-blue-700 font-medium">Manage Users</span>
            </Link>
            <Link
              to="/admin/requests"
              className="bg-green-50 p-4 rounded-lg text-center hover:bg-green-100 transition"
            >
              <ClipboardDocumentListIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <span className="text-green-700 font-medium">View All Requests</span>
            </Link>
            <Link
              to="/admin/emergencies"
              className="bg-red-50 p-4 rounded-lg text-center hover:bg-red-100 transition"
            >
              <HeartIcon className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <span className="text-red-700 font-medium">Emergency Logs</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;