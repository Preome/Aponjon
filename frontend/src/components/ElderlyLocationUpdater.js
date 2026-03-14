import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ElderlyLocationUpdater = ({ onLocationUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [locationSet, setLocationSet] = useState(false);

  // Simple reverse geocoding using OpenStreetMap
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get address');
      }
      
      const data = await response.json();
      
      return {
        address: data.display_name,
        city: data.address?.city || data.address?.town || data.address?.village || '',
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  const updateLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Got elderly location:', latitude, longitude);
        
        try {
          // Get address from coordinates
          const locationInfo = await reverseGeocode(latitude, longitude);
          
          const token = localStorage.getItem('token');
          
          // Update location in backend
          const response = await fetch('http://localhost:5000/api/help/update-location', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              coordinates: [longitude, latitude],
              address: locationInfo?.address || `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              city: locationInfo?.city || 'Unknown'
            })
          });

          if (response.ok) {
            setAddress(locationInfo?.address || 'Location updated');
            setLocationSet(true);
             window.dispatchEvent(new Event('locationUpdated'));
            if (onLocationUpdate) {
              onLocationUpdate({ latitude, longitude });
            }
            alert('✅ Location updated successfully! You can now use SOS.');
          } else {
            setError('Failed to save location');
          }
        } catch (err) {
          console.error('Location error:', err);
          setError('Failed to update location');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Please enable location access for SOS to work');
        setLoading(false);
      }
    );
  };

  // Check if user already has location on component mount
  useEffect(() => {
    const checkLocation = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await response.json();
        
        if (userData.location && userData.location.coordinates) {
          setLocationSet(true);
          setAddress(userData.location.address || 'Location set');
        }
      } catch (error) {
        console.error('Failed to check location:', error);
      }
    };
    
    checkLocation();
  }, []);

  if (user?.role !== 'elderly') return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-blue-800">📍 Your Location for SOS</h3>
          {address ? (
            <p className="text-sm text-blue-600 mt-1">{address.substring(0, 50)}...</p>
          ) : (
            <p className="text-sm text-blue-600 mt-1">
              {locationSet ? 'Location set' : 'Location not set'}
            </p>
          )}
          {locationSet && (
            <p className="text-xs text-green-600 mt-1">✅ SOS ready</p>
          )}
        </div>
        <button
          onClick={updateLocation}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? 'Updating...' : 'Update Location'}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}
      
      {!locationSet && !error && (
        <p className="text-xs text-red-500 mt-2">
          ⚠️ Please update your location to use the SOS button
        </p>
      )}
    </div>
  );
};

export default ElderlyLocationUpdater;