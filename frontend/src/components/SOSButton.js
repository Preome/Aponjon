import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SOSButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState('');

  const handleSOS = async () => {
    setSending(true);
    setMessage('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('❌ Please login first');
        setSending(false);
        return;
      }

      console.log('🚨 Sending SOS emergency...');
      
      const response = await fetch('http://localhost:5000/api/emergency/sos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ SOS Sent! Help is on the way.`);
        setShowConfirm(false);
        
        // Navigate to emergency status page
        setTimeout(() => {
          navigate(`/emergency-status/${data.requestId}`);
        }, 1500);
      } else {
        setMessage(data.message || 'Failed to send SOS');
      }
    } catch (error) {
      console.error('SOS error:', error);
      setMessage('❌ Failed to send SOS. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Only show for elderly users
  if (user?.role !== 'elderly') return null;

  if (showConfirm) {
    return (
      <div className="fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-red-200 z-50">
        <h3 className="text-xl font-bold text-red-600 mb-3">🚨 Confirm Emergency SOS</h3>
        <p className="text-gray-700 mb-4">
          Are you sure you need emergency help? This will alert all nearby volunteers immediately.
        </p>
        
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        
        <div className="flex space-x-3">
          <button
            onClick={handleSOS}
            disabled={sending}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Yes, Send SOS'}
          </button>
          <button
            onClick={() => {
              setShowConfirm(false);
              setMessage('');
            }}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all hover:scale-110 animate-pulse z-40 flex items-center justify-center"
      style={{ width: '80px', height: '80px' }}
    >
      <div className="text-center">
        <div className="text-3xl mb-1">🚨</div>
        <div className="text-xs font-bold">SOS</div>
      </div>
    </button>
  );
};

export default SOSButton;