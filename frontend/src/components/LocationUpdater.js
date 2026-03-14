import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const LocationUpdater = ({ onLocationUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [address, setAddress] = useState('');
  const [locationSet, setLocationSet] = useState(false);

  // Simple reverse geocoding using OpenStreetMap (no API key needed)
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
        country: data.address?.country || ''
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError('');
    setLocationSet(false);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Got location:', latitude, longitude);
        
        try {
          // Get address from coordinates
          const locationInfo = await reverseGeocode(latitude, longitude);
          
          if (!locationInfo) {
            // Use fallback address if geocoding fails
            const fallbackAddress = `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setAddress(fallbackAddress);
            
            // Still send coordinates to backend even without address
            await sendLocationToBackend(longitude, latitude, fallbackAddress, 'Unknown');
          } else {
            setAddress(locationInfo.address);
            await sendLocationToBackend(longitude, latitude, locationInfo.address, locationInfo.city);
          }
          
        } catch (err) {
          console.error('Location processing error:', err);
          setError('Failed to process location');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Please enable location access to find nearby requests';
        
        if (error.code === 1) {
          errorMessage = 'Location permission denied. Please allow location access in your browser.';
        } else if (error.code === 2) {
          errorMessage = 'Location unavailable. Please try again.';
        } else if (error.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const sendLocationToBackend = async (longitude, latitude, address, city) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Sending to backend:', { longitude, latitude, address, city });
      
      const response = await fetch('http://localhost:5000/api/help/update-location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coordinates: [longitude, latitude],
          address: address,
          city: city
        })
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (response.ok) {
        setLocationSet(true);
        if (onLocationUpdate) {
          onLocationUpdate({ 
            latitude, 
            longitude, 
            address, 
            city 
          });
        }
      } else {
        setError(data.message || 'Failed to save location');
      }
    } catch (err) {
      console.error('Network error:', err);
      setError('Cannot connect to server. Is backend running?');
    }
  };

  // Auto-get location on component mount
  useEffect(() => {
    if (user?.role === 'volunteer' && !locationSet) {
      getCurrentLocation();
    }
  }, []);

  if (user?.role !== 'volunteer') return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-800 mb-1">📍 Your Location</h3>
          {address ? (
            <p className="text-sm text-blue-600 break-words">{address}</p>
          ) : (
            <p className="text-sm text-blue-600">
              {loading ? 'Getting your location...' : 'Click Update Location to set your location'}
            </p>
          )}
          {locationSet && (
            <p className="text-xs text-green-600 mt-1">✅ Location saved successfully</p>
          )}
        </div>
        <button
          onClick={getCurrentLocation}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 ml-4 whitespace-nowrap"
        >
          {loading ? 'Updating...' : 'Update Location'}
        </button>
      </div>
      
      {error && (
        <div className="mt-3 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-500">
        <p>• You'll only see requests within 3km of your location</p>
        <p>• Using OpenStreetMap - Completely free, no API key needed</p>
        {!locationSet && !loading && !error && (
          <p className="text-blue-600 mt-1">👉 Click "Update Location" to start</p>
        )}
      </div>
    </div>
  );
};

export default LocationUpdater;