import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmergencyAlerts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    fetchEmergencies();
    // Poll for new emergencies every 10 seconds
    const interval = setInterval(fetchEmergencies, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencies = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/emergency/pending-emergencies', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      
      const data = await response.json();
      setEmergencies(data);
    } catch (error) {
      console.error('Failed to fetch emergencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (emergencyId) => {
    setAccepting(emergencyId);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/emergency/accept-emergency/${emergencyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Emergency accepted! Please go help immediately.');
        navigate('/volunteer-dashboard');
      } else {
        alert(data.message || 'Failed to accept emergency');
        setAccepting(null);
      }
    } catch (error) {
      console.error('Failed to accept emergency:', error);
      alert('Network error. Please try again.');
      setAccepting(null);
    }
  };

  // Redirect if not volunteer
  if (user?.role !== 'volunteer') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="mt-4">Only volunteers can view emergency alerts.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading emergency alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🚨 Emergency Alerts</h1>
          <button
            onClick={() => navigate('/volunteer-dashboard')}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            ← Back to Dashboard
          </button>
        </div>
        
        {emergencies.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-gray-500 text-lg">No active emergencies</p>
            <p className="text-gray-400 mt-2">You'll be alerted immediately when someone needs help</p>
          </div>
        ) : (
          <div className="space-y-4">
            {emergencies.map((emergency) => (
              <div key={emergency._id} className="bg-red-50 border-2 border-red-200 rounded-xl p-6 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className="text-4xl mr-3">🚨</span>
                      <div>
                        <h2 className="text-2xl font-bold text-red-700">EMERGENCY SOS</h2>
                        <p className="text-sm text-red-600">
                          {new Date(emergency.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="font-semibold text-gray-900">{emergency.elderly?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-semibold text-gray-900">
                          {emergency.elderly?.location?.city || 'Unknown'}
                        </p>
                      </div>
                      {emergency.elderly?.phone && (
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <a href={`tel:${emergency.elderly.phone}`} className="font-semibold text-blue-600 hover:underline">
                            {emergency.elderly.phone}
                          </a>
                        </div>
                      )}
                      {emergency.location?.address && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="text-gray-700">{emergency.location.address}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-red-600 font-medium">{emergency.description}</p>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <button
                      onClick={() => handleAccept(emergency._id)}
                      disabled={accepting === emergency._id}
                      className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-red-700 disabled:opacity-50 whitespace-nowrap"
                    >
                      {accepting === emergency._id ? 'Accepting...' : '🚨 ACCEPT'}
                    </button>
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

export default EmergencyAlerts;