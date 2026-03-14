import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  MapIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const VolunteerDashboard = () => {
  const navigate = useNavigate();
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
  const [pendingEmergencies, setPendingEmergencies] = useState(0);
  const [volunteerRating, setVolunteerRating] = useState({
    avgRating: 0,
    totalRatings: 0
  });

  useEffect(() => {
    fetchDashboardData();
    checkEmergencies();
    fetchVolunteerRating();
    
    // Check for emergencies every 10 seconds
    const interval = setInterval(() => {
      checkEmergencies();
      fetchDashboardData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchVolunteerRating = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/help/volunteer-rating/${user?._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setVolunteerRating(data);
    } catch (error) {
      console.error('Failed to fetch rating:', error);
    }
  };

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
        fetchVolunteerRating(); // Refresh rating
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

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-lg ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
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

        {/* Stats Cards - Now with 5 cards including Rating */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
              <ClipboardDocumentListIcon className="h-6 w-6 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.available || 0}</p>
            <p className="text-gray-600">Available</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-4">
              <ClockIcon className="h-6 w-6 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{activeHelps.length}</p>
            <p className="text-gray-600">Active</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{completedHelps.length}</p>
            <p className="text-gray-600">Completed</p>
          </div>

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
            <p className="text-gray-600">Emergencies</p>
          </div>

          <div className="bg-yellow-50 rounded-xl shadow-md p-6">
            <div className="bg-yellow-100 p-3 rounded-lg w-fit mb-4">
              <StarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{volunteerRating.avgRating || 0}</p>
            <p className="text-gray-600">Rating</p>
            <div className="mt-2">
              {renderStars(Math.round(volunteerRating.avgRating || 0))}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {volunteerRating.totalRatings || 0} reviews
            </p>
          </div>
        </div>

        {/* Quick Actions - Now with 5 options */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {/* Emergency Alerts Button */}
          <button
            onClick={() => navigate('/emergency-alerts')}
            className={`p-6 rounded-xl shadow-md transition flex items-center justify-between ${
              pendingEmergencies > 0 
                ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">🚨 SOS</h3>
              <p className={pendingEmergencies > 0 ? 'text-red-100' : 'text-orange-100'}>
                {pendingEmergencies > 0 ? `${pendingEmergencies} active` : 'No alerts'}
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
              <p className="text-green-100">3km radius</p>
            </div>
            <MapIcon className="h-8 w-8" />
          </Link>

          <Link 
            to="/browse-requests" 
            className="bg-primary-600 text-white p-6 rounded-xl shadow-md hover:bg-primary-700 transition flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">Browse All</h3>
              <p className="text-primary-100">All requests</p>
            </div>
            <ClipboardDocumentListIcon className="h-8 w-8" />
          </Link>
          
          <Link 
            to="/my-accepted" 
            className="bg-purple-600 text-white p-6 rounded-xl shadow-md hover:bg-purple-700 transition flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">My Helps</h3>
              <p className="text-purple-100">{activeHelps.length} active</p>
            </div>
            <UserIcon className="h-8 w-8" />
          </Link>

          <Link 
            to="/completed-history" 
            className="bg-gray-600 text-white p-6 rounded-xl shadow-md hover:bg-gray-700 transition flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">History</h3>
              <p className="text-gray-100">{completedHelps.length} completed</p>
            </div>
            <CheckCircleIcon className="h-8 w-8" />
          </Link>
        </div>

        {/* Active Helps Section */}
        {activeHelps.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🟢 Your Active Helps ({activeHelps.length})
            </h2>
            <div className="space-y-4">
              {activeHelps.map((help) => (
                <div key={help._id} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize flex items-center">
                        {help.taskType?.replace('-', ' ')}
                        {help.isEmergency && (
                          <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                            🚨 EMERGENCY
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{help.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                      ACTIVE
                    </span>
                  </div>
                  
                  {help.elderly && (
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <UserIcon className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-gray-700 font-medium">{help.elderly.name}</span>
                          </div>
                          {help.location && (
                            <div className="flex items-center text-sm">
                              <MapPinIcon className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-600">{help.location.city}</span>
                            </div>
                          )}
                          <div className="flex items-center text-sm">
                            <ClockIcon className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-gray-600">
                              Started: {new Date(help.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {help.elderly.phone && (
                            <a
                              href={`tel:${help.elderly.phone}`}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center"
                            >
                              <PhoneIcon className="h-4 w-4 mr-1" />
                              Call
                            </a>
                          )}
                          <button
                            onClick={() => handleComplete(help._id)}
                            disabled={completing === help._id}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center disabled:opacity-50"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              ✅ Recently Completed ({completedHelps.length})
            </h2>
            <div className="space-y-4">
              {completedHelps.slice(0, 5).map((help) => (
                <div key={help._id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {help.taskType?.replace('-', ' ')}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{help.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      Completed
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-gray-500">Elderly</p>
                      <p className="font-medium">{help.elderly?.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium">{help.location?.city || 'Unknown'}</p>
                    </div>
                    {help.completedAt && (
                      <div>
                        <p className="text-gray-500">Completed on</p>
                        <p className="font-medium">{new Date(help.completedAt).toLocaleDateString()}</p>
                      </div>
                    )}
                    {help.rating && (
                      <div>
                        <p className="text-gray-500">Your rating</p>
                        <div className="flex items-center">
                          {renderStars(help.rating)}
                          <span className="ml-2 text-sm">({help.rating}/5)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {help.review && (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Review from elderly:</p>
                      <p className="text-sm text-gray-700 italic">"{help.review}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {completedHelps.length > 5 && (
              <div className="mt-4 text-center">
                <Link to="/completed-history" className="text-primary-600 hover:text-primary-700 font-medium">
                  View all {completedHelps.length} completed helps →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* No Active Helps Message */}
        {activeHelps.length === 0 && completedHelps.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🙌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No helps yet</h3>
            <p className="text-gray-500 mb-6">Start by browsing available requests near you</p>
            <div className="flex justify-center space-x-4">
              <Link to="/browse-requests" className="btn-primary">
                Browse Requests
              </Link>
              <Link to="/nearby-requests" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                View Nearby Map
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerDashboard;