import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    taskType: 'groceries',
    description: '',
    location: {
      address: '',
      city: '',
      state: ''
    },
    urgency: 'medium',
    preferredTime: ''
  });

  const taskTypes = [
    { value: 'medicine', label: '💊 Medicine Delivery', description: 'Need medicines from pharmacy' },
    { value: 'groceries', label: '🛒 Grocery Shopping', description: 'Help with buying groceries' },
    { value: 'doctor-visit', label: '🏥 Doctor Visit', description: 'Need accompaniment to doctor' },
    { value: 'companionship', label: '👋 Companionship', description: 'Just need someone to talk to' },
    { value: 'other', label: '📝 Other', description: 'Other type of help' }
  ];

  const urgencyLevels = [
    { value: 'low', label: '🟢 Low', color: 'green' },
    { value: 'medium', label: '🟡 Medium', color: 'yellow' },
    { value: 'high', label: '🔴 High', color: 'red' }
  ];

  // Function to get elderly's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      setGettingLocation(true);
      
      if (!navigator.geolocation) {
        setGettingLocation(false);
        reject('Geolocation is not supported by your browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 Got elderly location:', latitude, longitude);
          
          try {
            // Get address from coordinates using OpenStreetMap (free)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            
            if (!response.ok) {
              throw new Error('Failed to get address');
            }
            
            const data = await response.json();
            
            // Extract city from address
            const city = data.address?.city || 
                        data.address?.town || 
                        data.address?.village || 
                        data.address?.county || 
                        'Unknown';
            
            const locationData = {
              coordinates: [longitude, latitude],
              address: data.display_name || `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              city: city
            };
            
            // Update form with location
            setFormData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                address: locationData.address,
                city: locationData.city,
                coordinates: locationData.coordinates
              }
            }));
            
            setGettingLocation(false);
            resolve(locationData);
          } catch (err) {
            console.error('Geocoding error:', err);
            // Fallback if geocoding fails
            const fallbackLocation = {
              coordinates: [longitude, latitude],
              address: `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              city: 'Unknown'
            };
            
            setFormData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                address: fallbackLocation.address,
                city: fallbackLocation.city,
                coordinates: fallbackLocation.coordinates
              }
            }));
            
            setGettingLocation(false);
            resolve(fallbackLocation);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setGettingLocation(false);
          
          let errorMessage = 'Please enable location access to create requests';
          if (error.code === 1) {
            errorMessage = 'Location permission denied. Please allow location access in your browser.';
          } else if (error.code === 2) {
            errorMessage = 'Location unavailable. Please try again.';
          } else if (error.code === 3) {
            errorMessage = 'Location request timed out. Please try again.';
          }
          
          reject(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // First get the elderly's current location
      let locationData;
      try {
        locationData = await getCurrentLocation();
      } catch (locationErr) {
        setError(locationErr);
        setLoading(false);
        return;
      }

      // Prepare request data with location
      const requestData = {
        taskType: formData.taskType,
        description: formData.description,
        urgency: formData.urgency,
        preferredTime: formData.preferredTime,
        location: {
          type: 'Point',
          coordinates: locationData.coordinates,
          address: locationData.address,
          city: locationData.city
        }
      };

      console.log('Submitting request:', requestData);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Request created successfully! Volunteers near you will be notified.');
        navigate('/elderly-dashboard');
      } else {
        setError(data.message || 'Failed to create request');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not elderly
  if (user?.role !== 'elderly') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-4">Only elderly users can create requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-primary-600 py-6 px-8">
            <h2 className="text-3xl font-bold text-white text-center">Request Help</h2>
            <p className="text-primary-100 text-center mt-2">Tell us what you need assistance with</p>
          </div>

          <div className="py-8 px-8">
            {/* Location Info Banner */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">📍</span>
                <div>
                  <h3 className="font-semibold text-blue-800">Location Required</h3>
                  <p className="text-sm text-blue-600 mt-1">
                    Your current location will be used to find nearby volunteers. 
                    You'll be asked for location permission when submitting.
                  </p>
                  {formData.location.address && (
                    <p className="text-xs bg-white p-2 rounded mt-2 text-gray-700">
                      <span className="font-medium">Detected:</span> {formData.location.address.substring(0, 100)}...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What do you need help with?
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {taskTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({...formData, taskType: type.value})}
                      className={`p-4 rounded-xl border-2 text-left transition ${
                        formData.taskType === type.value
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you need
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="input-field"
                  placeholder="Please provide details about what you need help with..."
                  required
                />
              </div>

              {/* Manual Location (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Location (Optional - for verification)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    className="input-field md:col-span-3"
                    placeholder="Street address"
                  />
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="State"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your actual GPS location will be used for finding nearby volunteers. 
                  This is just for reference.
                </p>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How urgent is this?
                </label>
                <div className="flex space-x-4">
                  {urgencyLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({...formData, urgency: level.value})}
                      className={`flex-1 p-3 rounded-lg border-2 transition ${
                        formData.urgency === level.value
                          ? `border-${level.color}-600 bg-${level.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || gettingLocation}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                {gettingLocation ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting your location...
                  </span>
                ) : loading ? (
                  'Submitting...'
                ) : (
                  'Submit Request'
                )}
              </button>
            </form>

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">
                <span className="font-bold">📍 How it works:</span> When you submit, we'll use your current location 
                to find volunteers within 3km. Your location is only used for this purpose.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;