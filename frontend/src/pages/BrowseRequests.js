import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BrowseRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      
      console.log('Fetching pending requests...');
      
      const response = await fetch('http://localhost:5000/api/help/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      console.log('Response:', response.status, data);
      
      if (response.ok) {
        setRequests(data);
        console.log(`Found ${data.length} pending requests`);
      } else {
        setError(data.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setAccepting(requestId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/help/accept/${requestId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Request accepted successfully!');
        navigate('/volunteer-dashboard');
      } else {
        alert(data.message || 'Failed to accept request');
        setAccepting(null);
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Network error. Please try again.');
      setAccepting(null);
    }
  };

  // Redirect if not volunteer
  if (user?.role !== 'volunteer') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-4">Only volunteers can browse requests.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Available Help Requests</h1>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
            <button 
              onClick={fetchRequests}
              className="ml-4 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}
        
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500 text-lg">No pending requests at the moment</p>
            <p className="text-gray-400 mt-2">Check back later!</p>
            <button 
              onClick={fetchRequests}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              ↻ Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.urgency === 'high' ? 'bg-red-100 text-red-700' :
                      request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {request.urgency} urgency
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                    {request.taskType?.replace('-', ' ')}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">{request.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <p>📍 {request.location?.city || 'Location not specified'}</p>
                    <p>👤 From: {request.elderly?.name}</p>
                    {request.preferredTime && (
                      <p>🕐 Preferred: {new Date(request.preferredTime).toLocaleString()}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleAccept(request._id)}
                    disabled={accepting === request._id}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-medium"
                  >
                    {accepting === request._id ? 'Accepting...' : 'Accept Request'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseRequests;