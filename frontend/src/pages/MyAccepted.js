import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const MyAccepted = () => {
  const { user } = useAuth();
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    fetchAcceptedRequests();
  }, []);

  const fetchAcceptedRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/help/my-accepted', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Split into active and completed
      setAcceptedRequests(data.filter(r => r.status === 'accepted'));
      setCompletedRequests(data.filter(r => r.status === 'completed'));
    } catch (error) {
      console.error('Failed to fetch accepted requests:', error);
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
        fetchAcceptedRequests();
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📋 My Accepted Helps</h1>
          <Link
            to="/volunteer-dashboard"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Active Helps Section */}
        {acceptedRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🟢 Active Helps ({acceptedRequests.length})</h2>
            <div className="space-y-4">
              {acceptedRequests.map((request) => (
                <div key={request._id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 capitalize">
                        {request.taskType?.replace('-', ' ')}
                      </h3>
                      <p className="text-gray-600 mt-1">{request.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>

                  {request.elderly && (
                    <div className="border-t pt-4 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Elderly Person</p>
                          <div className="flex items-center mt-1">
                            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium">{request.elderly.name}</span>
                          </div>
                        </div>
                        {request.elderly.phone && (
                          <div>
                            <p className="text-sm text-gray-500">Contact</p>
                            <a
                              href={`tel:${request.elderly.phone}`}
                              className="flex items-center mt-1 text-blue-600 hover:text-blue-700"
                            >
                              <PhoneIcon className="h-4 w-4 mr-2" />
                              {request.elderly.phone}
                            </a>
                          </div>
                        )}
                        {request.location && (
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <div className="flex items-center mt-1">
                              <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span>{request.location.city || 'Unknown'}</span>
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-500">Accepted on</p>
                          <div className="flex items-center mt-1">
                            <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => handleComplete(request._id)}
                          disabled={completing === request._id}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                        >
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          {completing === request._id ? 'Completing...' : 'Mark as Completed'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Helps Section */}
        {completedRequests.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">✅ Completed Helps ({completedRequests.length})</h2>
            <div className="space-y-4">
              {completedRequests.map((request) => (
                <div key={request._id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 capitalize">
                        {request.taskType?.replace('-', ' ')}
                      </h3>
                      <p className="text-gray-600 mt-1">{request.description}</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      Completed
                    </span>
                  </div>

                  {request.elderly && (
                    <div className="border-t pt-4 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Elderly Person</p>
                          <div className="flex items-center mt-1">
                            <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="font-medium">{request.elderly.name}</span>
                          </div>
                        </div>
                        {request.completedAt && (
                          <div>
                            <p className="text-sm text-gray-500">Completed on</p>
                            <div className="flex items-center mt-1">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                              <span>{new Date(request.completedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Rating Section */}
                      {request.rating && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-gray-700 mb-1">⭐ Rating from elderly:</p>
                          <div className="flex items-center">
                            <div className="flex text-yellow-400 mr-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className={star <= request.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm font-medium">{request.rating}/5</span>
                          </div>
                          {request.review && (
                            <p className="text-sm text-gray-600 mt-2 italic">"{request.review}"</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {acceptedRequests.length === 0 && completedRequests.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No accepted helps yet</h3>
            <p className="text-gray-500 mb-6">Browse available requests to help someone!</p>
            <Link
              to="/browse-requests"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 inline-block"
            >
              Browse Requests
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccepted;