import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircleIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const CompletedHistory = () => {
  const { user } = useAuth();
  const [completedRequests, setCompletedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, rated, unrated
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCompletedHistory();
  }, []);

  const fetchCompletedHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/help/my-accepted', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Filter only completed requests
      const completed = data.filter(r => r.status === 'completed');
      setCompletedRequests(completed);
    } catch (error) {
      console.error('Failed to fetch completed history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating) => {
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

  const filteredRequests = completedRequests.filter(req => {
    // Filter by rating status
    if (filter === 'rated' && !req.rating) return false;
    if (filter === 'unrated' && req.rating) return false;
    
    // Search by task type or elderly name
    if (searchTerm) {
      const taskMatch = req.taskType?.toLowerCase().includes(searchTerm.toLowerCase());
      const nameMatch = req.elderly?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return taskMatch || nameMatch;
    }
    
    return true;
  });

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
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📜 Completed History</h1>
            <p className="text-gray-600 mt-1">All your completed help requests</p>
          </div>
          <Link
            to="/volunteer-dashboard"
            className="mt-4 md:mt-0 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Stats Summary */}
        {completedRequests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Total Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedRequests.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">With Ratings</p>
              <p className="text-2xl font-bold text-green-600">
                {completedRequests.filter(r => r.rating).length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Without Ratings</p>
              <p className="text-2xl font-bold text-yellow-600">
                {completedRequests.filter(r => !r.rating).length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-purple-600">
                {completedRequests.filter(r => r.rating).length > 0
                  ? (completedRequests.reduce((sum, r) => sum + (r.rating || 0), 0) / completedRequests.filter(r => r.rating).length).toFixed(1)
                  : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('rated')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'rated' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rated
              </button>
              <button
                onClick={() => setFilter('unrated')}
                className={`px-4 py-2 rounded-lg transition ${
                  filter === 'unrated' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Unrated
              </button>
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search by task or elderly..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Completed Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No completed requests found</h3>
            <p className="text-gray-500">
              {completedRequests.length === 0 
                ? "You haven't completed any help requests yet."
                : "No requests match your current filters."}
            </p>
            {completedRequests.length > 0 && (
              <button
                onClick={() => { setFilter('all'); setSearchTerm(''); }}
                className="mt-4 text-primary-600 hover:text-primary-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row justify-between">
                  {/* Left side - Request info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 capitalize">
                        {request.taskType?.replace('-', ' ')}
                      </h3>
                      {request.isEmergency && (
                        <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                          🚨 Emergency
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">{request.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-700">{request.elderly?.name || 'Unknown'}</span>
                      </div>
                      
                      {request.elderly?.phone && (
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <a href={`tel:${request.elderly.phone}`} className="text-blue-600 hover:underline">
                            {request.elderly.phone}
                          </a>
                        </div>
                      )}
                      
                      {request.location?.city && (
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-700">{request.location.city}</span>
                        </div>
                      )}
                      
                      {request.completedAt && (
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-gray-700">
                            {new Date(request.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side - Rating */}
                  <div className="mt-4 md:mt-0 md:ml-6 md:border-l md:pl-6 flex flex-col items-center justify-center">
                    {request.rating ? (
                      <div className="text-center">
                        <div className="flex items-center mb-2">
                          <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                          <span className="text-2xl font-bold text-gray-900">{request.rating}</span>
                          <span className="text-gray-500 ml-1">/5</span>
                        </div>
                        {getRatingStars(request.rating)}
                        {request.review && (
                          <div className="mt-3 max-w-xs">
                            <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">
                              "{request.review}"
                            </p>
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Rated on {new Date(request.ratedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-400 mb-2">No rating yet</p>
                        <span className="inline-block bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm">
                          Pending
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletedHistory;