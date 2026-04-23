import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import SOSButton from '../../components/SOSButton';
import ElderlyLocationUpdater from '../../components/ElderlyLocationUpdater';
import AutoLocationUpdater from '../../components/AutoLocationUpdater';
import Chatbot from '../../components/Chatbot';
import MedicationAlerts from '../../components/MedicationAlerts';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusCircleIcon,
  PhoneIcon,
  UserIcon,
  CalendarIcon,
  HeartIcon,
  UsersIcon,
  DocumentTextIcon  // ← ADD THIS IMPORT
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
  const [locationUpdated, setLocationUpdated] = useState(false);
  const [autoUpdateDone, setAutoUpdateDone] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    checkLocationStatus();
  }, []);

  const checkLocationStatus = async () => {
    try {
      const response = await api.get('/users/me');
      const userData = await response.json();
      
      if (userData.location && userData.location.coordinates) {
        setLocationUpdated(true);
      }
    } catch (error) {
      console.error('Failed to check location:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/help/my-requests');
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

  const handleLocationUpdate = () => {
    setLocationUpdated(true);
    setAutoUpdateDone(true);
    // Dispatch event for SOS button
    window.dispatchEvent(new Event('locationUpdated'));
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
      {/* Auto Location Updater - runs automatically on page load */}
      <AutoLocationUpdater onComplete={handleLocationUpdate} />
      
      <div className="container mx-auto px-4">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Here's your care request overview</p>
        </div>

        {/* Manual Location Updater (backup) */}
        {!autoUpdateDone && (
          <ElderlyLocationUpdater onLocationUpdate={handleLocationUpdate} />
        )}

        {/* SOS Status Banner */}
        {!locationUpdated && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <span className="font-bold">SOS Button:</span> Getting your location automatically... Please wait.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Emergency SOS Banner - Shows when SOS is active */}
        {recentRequests.some(r => r.isEmergency && r.status === 'pending') && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6 animate-pulse">
            <div className="flex items-center">
              <span className="text-3xl mr-3">🚨</span>
              <div>
                <h3 className="font-bold text-lg">Emergency SOS Sent!</h3>
                <p className="text-red-100">Waiting for volunteer response...</p>
              </div>
            </div>
          </div>
        )}

        {/* 🔔 MEDICATION ALERTS */}
        <MedicationAlerts />

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

        {/* Quick Actions - Now with 6 options including Health Reports */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Link 
            to="/create-request" 
            className="bg-primary-600 text-white p-4 rounded-xl shadow-md hover:bg-primary-700 transition text-center"
          >
            <PlusCircleIcon className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Request Help</h3>
          </Link>
          
          <Link 
            to="/my-requests" 
            className="bg-blue-600 text-white p-4 rounded-xl shadow-md hover:bg-blue-700 transition text-center"
          >
            <ClipboardDocumentListIcon className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">My Requests</h3>
          </Link>

          <Link 
            to="/medications" 
            className="bg-purple-600 text-white p-4 rounded-xl shadow-md hover:bg-purple-700 transition text-center"
          >
            <HeartIcon className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Medications</h3>
          </Link>

          {/* NEW: Health Reports Button */}
          <Link 
            to="/health-reports" 
            className="bg-indigo-600 text-white p-4 rounded-xl shadow-md hover:bg-indigo-700 transition text-center"
          >
            <DocumentTextIcon className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Health Reports</h3>
          </Link>

          <Link 
            to="/community" 
            className="bg-green-600 text-white p-4 rounded-xl shadow-md hover:bg-green-700 transition text-center"
          >
            <UsersIcon className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Community</h3>
          </Link>

          <Link 
            to="/health-tips" 
            className="bg-orange-600 text-white p-4 rounded-xl shadow-md hover:bg-orange-700 transition text-center"
          >
            <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold text-sm">Health Tips</h3>
          </Link>
        </div>

        {/* 👥 COMMUNITY SECTION */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">👥 Elder Community</h2>
            <Link to="/community" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold">Find Friends</h3>
              <p className="text-sm text-gray-600 mt-1">Connect with other elders</p>
              <Link to="/community" className="text-green-600 text-sm mt-2 inline-block hover:underline">
                Browse →
              </Link>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold">Interest Groups</h3>
              <p className="text-sm text-gray-600 mt-1">Join hobby and support groups</p>
              <Link to="/community?tab=groups" className="text-purple-600 text-sm mt-2 inline-block hover:underline">
                Explore →
              </Link>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">✨</div>
              <h3 className="font-semibold">Create Group</h3>
              <p className="text-sm text-gray-600 mt-1">Start your own community</p>
              <Link to="/create-group" className="text-blue-600 text-sm mt-2 inline-block hover:underline">
                Create →
              </Link>
            </div>
          </div>
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
      <SOSButton />
      <Chatbot />
    </div>
  );
};

export default ElderlyDashboard;