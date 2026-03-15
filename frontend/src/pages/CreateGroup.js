import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CreateGroup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'general',
    isPrivate: false
  });

  const categories = [
    { value: 'general', label: 'General', icon: '💬' },
    { value: 'hobby', label: 'Hobby & Interests', icon: '🎨' },
    { value: 'health', label: 'Health & Wellness', icon: '❤️' },
    { value: 'support', label: 'Support Group', icon: '🤝' },
    { value: 'local', label: 'Local Community', icon: '🏘️' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/messages/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const group = await response.json();
        navigate(`/group/${group._id}`);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Only elderly users can create groups
  if (user?.role !== 'elderly') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 text-center">
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="mt-4">Only elderly users can create groups.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-purple-600 py-6 px-8">
            <h2 className="text-3xl font-bold text-white text-center">Create New Group</h2>
            <p className="text-purple-100 text-center mt-2">Bring elders together with shared interests</p>
          </div>

          <div className="py-8 px-8">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Gardening Lovers, Book Club, etc."
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="input-field"
                  placeholder="What is this group about? Who can join?"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData({...formData, category: cat.value})}
                      className={`p-3 rounded-lg border-2 text-left transition ${
                        formData.category === cat.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl mr-2">{cat.icon}</span>
                      <span className="font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Setting */}
              

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-bold">✨ Tip:</span> A welcoming description helps more 
                  elders find and join your group!
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Group'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;