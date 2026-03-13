import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MapPinIcon, 
  ClockIcon, 
  UserIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const RequestsList = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = 'http://localhost:5000/api/help';
      
      if (user?.role === 'volunteer') {
        url = 'http://localhost:5000/api/help/nearby';
      } else if (user?.role === 'elderly') {
        url = 'http://localhost:5000/api/help/my-requests';
      }

      const response = await fetch(url, {
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

  const handleAcceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/help/${requestId}/accept`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchRequests(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/help/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchRequests(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'accepted': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'emergency': return 'text-red-600';
      default: return 'text-gray-600';
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'volunteer' ? 'Nearby Help Requests' : 'My Requests'}
          </h1>
          {user?.role === 'elderly' && (
            <Link to="/create-request" className="btn-primary">
              + New Request
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex space-x-2">
          {['all', 'pending', 'accepted', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Requests Grid */}
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No requests found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className={`font-semibold ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency}
                    </span>
                  </div>

                  {/* Task Type */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                    {request.taskType.replace('-', ' ')}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {request.description}
                  </p>

                  {/* Elderly Info */}
                  {request.elderly && (
                    <div className="flex items-center mb-3 text-sm text-gray-500">
                      <UserIcon className="h-4 w-4 mr-2" />
                      <span>{request.elderly.name}</span>
                    </div>
                  )}

                  {/* Location */}
                  {request.location && (
                    <div className="flex items-center mb-3 text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span>{request.location.city}, {request.location.state}</span>
                    </div>
                  )}

                  {/* Time */}
                  <div className="flex items-center mb-4 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span>{new Date(request.preferredTime).toLocaleString()}</span>
                  </div>

                  {/* Action Buttons */}
                  {user?.role === 'volunteer' && request.status === 'pending' && (
                    <button
                      onClick={() => handleAcceptRequest(request._id)}
                      className="w-full btn-primary"
                    >
                      Accept Request
                    </button>
                  )}

                  {user?.role === 'volunteer' && request.status === 'accepted' && request.volunteer?._id === user._id && (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleStatusUpdate(request._id, 'completed')}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Mark Completed
                      </button>
                      {request.elderly?.phone && (
                        <a
                          href={`tel:${request.elderly.phone}`}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                        >
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          Contact Elderly
                        </a>
                      )}
                    </div>
                  )}

                  {user?.role === 'elderly' && request.status === 'accepted' && request.volunteer && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Volunteer: {request.volunteer.name}
                      </p>
                      {request.volunteer.phone && (
                        <a
                          href={`tel:${request.volunteer.phone}`}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                        >
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          Contact Volunteer
                        </a>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(request._id, 'completed')}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Mark Completed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsList;