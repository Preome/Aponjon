import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BellIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const MedicationAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState({ due: [], upcoming: [] });
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationPermission(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            setNotificationPermission(true);
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    // Check every minute
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, []);

  // Show browser notification when new due medications appear
  useEffect(() => {
    if (notificationPermission && alerts.due.length > 0) {
      const dueNames = alerts.due.map(d => d.name).join(', ');
      new Notification('💊 Medication Reminder', {
        body: `${alerts.due.length} medication${alerts.due.length > 1 ? 's are' : ' is'} due now: ${dueNames}`,
        icon: '/favicon.ico',
        requireInteraction: true
      });
    }
  }, [alerts.due]);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/medications/active');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch medication alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeDose = async (medId, timeIndex) => {
    try {
      await api.put(`/medications/${medId}/take/${timeIndex}`);
      fetchAlerts(); // Refresh alerts
    } catch (error) {
      console.error('Failed to mark dose as taken:', error);
    }
  };

  if (user?.role !== 'elderly') return null;
  if (loading) return null;
  if (alerts.due.length === 0 && alerts.upcoming.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {/* Due Now Alerts */}
      {alerts.due.map((med) => (
        <div key={`${med._id}-${med.timeIndex}`} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <BellIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-800">🔔 Medication Due Now!</h3>
                <p className="text-red-700">
                  <span className="font-semibold">{med.name}</span> • {med.dosage} {med.unit}
                </p>
                <p className="text-sm text-red-600">
                  Scheduled for {med.timeSlot} ({med.minutesLate > 0 ? `${med.minutesLate} min late` : 'now'})
                </p>
              </div>
            </div>
            <button
              onClick={() => handleTakeDose(med._id, med.timeIndex)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center text-sm"
            >
              <CheckCircleIcon className="h-4 w-4 mr-1" />
              Mark Taken
            </button>
          </div>
        </div>
      ))}

      {/* Upcoming Alerts */}
      {alerts.upcoming.map((med) => (
        <div key={`${med._id}-${med.timeIndex}`} className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow-md">
          <div className="flex items-start space-x-3">
            <ClockIcon className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-yellow-800">⏰ Upcoming Medication</h3>
              <p className="text-yellow-700">
                <span className="font-semibold">{med.name}</span> • {med.dosage} {med.unit}
              </p>
              <p className="text-sm text-yellow-600">
                Due in {med.minutesUntil} minutes at {med.timeSlot}
              </p>
            </div>
          </div>
        </div>
      ))}

      <div className="text-right">
        <Link to="/medications" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View all medications →
        </Link>
      </div>
    </div>
  );
};

export default MedicationAlerts;