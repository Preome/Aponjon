import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/elderly-dashboard');
      } else {
        setError(data.message || 'Failed to create request');
      }
    } catch (err) {
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
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                {error}
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

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Location
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    className="input-field md:col-span-3"
                    placeholder="Street address"
                    required
                  />
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="City"
                    required
                  />
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="State"
                    required
                  />
                </div>
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
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;