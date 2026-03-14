import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/help/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Help Requests</h1>
          <Link to="/create-request" className="btn-primary">
            + New Request
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500 text-lg">You haven't created any requests yet</p>
            <Link to="/create-request" className="inline-block mt-4 text-primary-600 hover:text-primary-700">
              Create your first request →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 capitalize">
                      {request.taskType?.replace('-', ' ')}
                    </h3>
                    <p className="text-gray-600 mt-1">{request.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Location</p>
                    <p className="font-medium">{request.location?.city || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Urgency</p>
                    <p className="font-medium capitalize">{request.urgency}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Created</p>
                    <p className="font-medium">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Volunteer</p>
                    <p className="font-medium">
                      {request.volunteer ? request.volunteer.name : 'Not assigned yet'}
                    </p>
                  </div>
                </div>

                {/* Show rating if exists */}
                {request.rating && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Your Rating</p>
                        <div className="flex items-center mt-1">
                          {renderStars(request.rating)}
                          <span className="ml-2 text-sm text-gray-600">
                            ({request.rating}/5)
                          </span>
                        </div>
                        {request.review && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{request.review}"
                          </p>
                        )}
                      </div>
                      {request.completedAt && (
                        <p className="text-xs text-gray-400">
                          Completed: {new Date(request.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Show Rate button if completed but not rated */}
                {request.status === 'completed' && !request.rating && (
                  <div className="mt-4 pt-4 border-t">
                    <Link
                      to={`/rate-volunteer/${request._id}`}
                      className="inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                    >
                      <span className="text-lg mr-1">⭐</span>
                      Rate Volunteer
                    </Link>
                    {request.completedAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        Completed on: {new Date(request.completedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {/* Show call button if volunteer assigned */}
                {request.volunteer && request.volunteer.phone && request.status !== 'completed' && (
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <a
                      href={`tel:${request.volunteer.phone}`}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <span className="mr-2">📞</span>
                      Call {request.volunteer.name}
                    </a>
                  </div>
                )}

                {/* Show completion date for completed requests */}
                {request.status === 'completed' && request.completedAt && !request.rating && (
                  <div className="mt-2 text-xs text-gray-400 text-right">
                    Completed on: {new Date(request.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;