import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AutoLocationUpdater = ({ onComplete }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const updateLocationAutomatically = async () => {
      // Only run for elderly users
      if (user?.role !== 'elderly') {
        setStatus('skipped');
        return;
      }

      // Check if user already has location
      if (user?.location?.coordinates && user.location.coordinates.length > 0) {
        console.log('User already has location:', user.location);
        setStatus('exists');
        setMessage('Location already set');
        if (onComplete) onComplete(true);
        return;
      }

      setStatus('getting');
      

      // Get current position
      if (!navigator.geolocation) {
        setStatus('error');
        setMessage('Geolocation not supported');
        if (onComplete) onComplete(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 Auto got location:', latitude, longitude);

          try {
            // Get address from coordinates
            const addressResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const addressData = await addressResponse.json();

            const locationData = {
              coordinates: [longitude, latitude],
              address: addressData.display_name || `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              city: addressData.address?.city || addressData.address?.town || 'Unknown'
            };

            // Send to backend
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/help/update-location', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(locationData)
            });

            if (response.ok) {
              setStatus('success');
              
              
              // Update user in localStorage
              const updatedUser = { ...user, location: { type: 'Point', ...locationData } };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              
              // Dispatch event for SOS button
              window.dispatchEvent(new Event('locationUpdated'));
              
              if (onComplete) onComplete(true);
            } else {
              setStatus('error');
              setMessage('Failed to save location');
              if (onComplete) onComplete(false);
            }
          } catch (error) {
            console.error('Auto location error:', error);
            setStatus('error');
            setMessage('Error getting location');
            if (onComplete) onComplete(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setStatus('error');
          setMessage('Please enable location for SOS');
          if (onComplete) onComplete(false);
        },
        { timeout: 10000 }
      );
    };

    updateLocationAutomatically();
  }, [user]);

  // Don't show anything if not elderly or already has location
  if (user?.role !== 'elderly' || status === 'exists' || status === 'skipped') {
    return null;
  }

  // Show brief status message
  return (
    <div className={`fixed top-20 right-4 z-50 p-3 rounded-lg shadow-lg text-sm ${
      status === 'success' ? 'bg-green-100 text-green-700' :
      status === 'error' ? 'bg-red-100 text-red-700' :
      'bg-blue-100 text-blue-700'
    }`}>
      {status === 'getting' && (
        <div className="flex items-center">
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          {message}
        </div>
      )}
      {(status === 'success' || status === 'error') && (
        <div className="flex items-center">
          <span className="mr-2">{status === 'success' ? '✅' : '⚠️'}</span>
          {message}
        </div>
      )}
    </div>
  );
};

export default AutoLocationUpdater;