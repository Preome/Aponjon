import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmergencyStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencyStatus();
    // Poll every 5 seconds
    const interval = setInterval(fetchEmergencyStatus, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchEmergencyStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/emergency/sos-status/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setEmergency(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-red-600 py-6 px-8">
            <h2 className="text-3xl font-bold text-white text-center">🚨 Emergency Status</h2>
          </div>

          <div className="py-8 px-8">
            {emergency?.volunteer ? (
              <div className="text-center">
                <div className="bg-green-100 p-6 rounded-lg mb-6">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">Help is on the way!</h3>
                  <p className="text-gray-700">
                    {emergency.volunteer.name} is coming to help you.
                  </p>
                  {emergency.volunteer.phone && (
                    <a
                      href={`tel:${emergency.volunteer.phone}`}
                      className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                      📞 Call Volunteer
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-yellow-100 p-6 rounded-lg mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
                  <h3 className="text-2xl font-bold text-yellow-700 mb-2">Waiting for response...</h3>
                  <p className="text-gray-600">
                    We're notifying nearby volunteers. Please stay calm.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/elderly-dashboard')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyStatus;