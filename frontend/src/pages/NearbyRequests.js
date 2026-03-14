import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LocationUpdater from '../components/LocationUpdater';
import FreeMap from '../components/FreeMap';

const NearbyRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsLocation, setNeedsLocation] = useState(false);
  const [accepting, setAccepting] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const fetchNearbyRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/help/nearby', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRequests(data);
        setNeedsLocation(false);
      } else if (data.needsLocation) {
        setNeedsLocation(true);
        setError(data.message);
      } else {
        setError(data.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyRequests();
  }, []);

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

      if (response.ok) {
        alert('Request accepted successfully!');
        navigate('/volunteer-dashboard');
      } else {
        const data = await response.json();
        alert(data.message);
        setAccepting(null);
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('Network error. Please try again.');
      setAccepting(null);
    }
  };

  if (user?.role !== 'volunteer') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Nearby Requests (within 3km)</h1>
        
        <LocationUpdater onLocationUpdate={(loc) => {
          setUserLocation({ lat: loc.latitude, lng: loc.longitude, address: loc.address });
          fetchNearbyRequests();
        }} />
        
        {/* Map View */}
        {userLocation && requests.length > 0 && (
          <div className="mb-8">
            <FreeMap 
              userLocation={userLocation} 
              requests={requests} 
              height="400px"
            />
          </div>
        )}
        
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
            {!needsLocation && (
              <button 
                onClick={fetchNearbyRequests}
                className="ml-4 text-sm underline"
              >
                Try again
              </button>
            )}
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500 text-lg">No requests within 3km of your location</p>
            <p className="text-gray-400 mt-2">Check back later or update your location</p>
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-green-100">
                <div className="bg-green-50 px-6 py-2 text-sm text-green-700 font-medium">
                  📍 Within 3km
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.urgency === 'high' ? 'bg-red-100 text-red-700' :
                      request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {request.urgency} urgency
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                    {request.taskType?.replace('-', ' ')}
                  </h3>
                  
                  <p className="text-gray-600 mb-4">{request.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <p>👤 {request.elderly?.name}</p>
                    <p>📍 {request.elderly?.location?.city || 'Location not specified'}</p>
                    {request.preferredTime && (
                      <p>🕐 {new Date(request.preferredTime).toLocaleString()}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleAccept(request._id)}
                    disabled={accepting === request._id}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
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

export default NearbyRequests;