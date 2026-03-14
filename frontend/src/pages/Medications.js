import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BellIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const Medications = () => {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [summary, setSummary] = useState({
    totalDoses: 0,
    takenDoses: 0,
    skippedDoses: 0,
    pendingDoses: 0,
    adherenceRate: 0
  });
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    unit: 'tablet',
    frequency: 'twice',
    times: ['09:00', '21:00'],
    instructions: '',
    prescribedBy: '',
    startDate: new Date().toISOString().split('T')[0],
    notifications: {
      enabled: true,
      reminderTime: 5
    }
  });

  useEffect(() => {
    fetchMedications();
    fetchSummary();
  }, []);

  const fetchMedications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setMedications(data);
    } catch (error) {
      console.error('Failed to fetch medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/medications/summary/today', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFrequencyChange = (e) => {
    const frequency = e.target.value;
    const times = generateTimesForFrequency(frequency);
    setFormData({ ...formData, frequency, times });
  };

  const generateTimesForFrequency = (frequency) => {
    const defaults = {
      once: ['09:00'],
      twice: ['09:00', '21:00'],
      thrice: ['08:00', '14:00', '20:00'],
      'four-times': ['08:00', '12:00', '16:00', '20:00'],
      'every-4-hours': ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
      'every-6-hours': ['00:00', '06:00', '12:00', '18:00'],
      'every-8-hours': ['00:00', '08:00', '16:00']
    };
    return defaults[frequency] || ['09:00'];
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const addTimeField = () => {
    setFormData({ ...formData, times: [...formData.times, '12:00'] });
  };

  const removeTimeField = (index) => {
    const newTimes = formData.times.filter((_, i) => i !== index);
    setFormData({ ...formData, times: newTimes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      // Send times as strings - backend will convert to objects
      const medicationData = {
        ...formData,
        // Keep times as strings, backend will convert
      };
      
      const url = editingMed 
        ? `http://localhost:5000/api/medications/${editingMed._id}`
        : 'http://localhost:5000/api/medications';
      
      const response = await fetch(url, {
        method: editingMed ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(medicationData)
      });

      if (response.ok) {
        fetchMedications();
        fetchSummary();
        setShowForm(false);
        setEditingMed(null);
        resetForm();
      } else {
        const error = await response.json();
        alert('Error: ' + error.message);
      }
    } catch (error) {
      console.error('Failed to save medication:', error);
      alert('Failed to save medication. Please try again.');
    }
  };

  const handleTakeDose = async (medId, timeIndex) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/medications/${medId}/take/${timeIndex}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchMedications();
      fetchSummary();
    } catch (error) {
      console.error('Failed to mark dose as taken:', error);
    }
  };

  const handleSkipDose = async (medId, timeIndex) => {
    if (!window.confirm('Skip this dose?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/medications/${medId}/skip/${timeIndex}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchMedications();
      fetchSummary();
    } catch (error) {
      console.error('Failed to skip dose:', error);
    }
  };

  const handleDelete = async (medId) => {
    if (!window.confirm('Delete this medication?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/medications/${medId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchMedications();
      fetchSummary();
    } catch (error) {
      console.error('Failed to delete medication:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dosage: '',
      unit: 'tablet',
      frequency: 'twice',
      times: ['09:00', '21:00'],
      instructions: '',
      prescribedBy: '',
      startDate: new Date().toISOString().split('T')[0],
      notifications: {
        enabled: true,
        reminderTime: 5
      }
    });
  };

  const editMedication = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      unit: med.unit,
      frequency: med.frequency,
      times: med.times.map(t => t.time),
      instructions: med.instructions || '',
      prescribedBy: med.prescribedBy || '',
      startDate: med.startDate.split('T')[0],
      notifications: med.notifications || { enabled: true, reminderTime: 5 }
    });
    setShowForm(true);
  };

  const isDoseTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const doseTime = new Date();
    doseTime.setHours(hours, minutes, 0);
    const now = new Date();
    return Math.abs(now - doseTime) < 3600000; // Within 1 hour
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">💊 Medication Management</h1>
          <button
            onClick={() => {
              resetForm();
              setEditingMed(null);
              setShowForm(true);
            }}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Medication
          </button>
        </div>

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500 mb-2">Total Doses</p>
            <p className="text-3xl font-bold text-gray-900">{summary.totalDoses}</p>
          </div>
          <div className="bg-green-50 rounded-xl shadow-md p-6">
            <p className="text-sm text-green-600 mb-2">✅ Taken</p>
            <p className="text-3xl font-bold text-green-700">{summary.takenDoses}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-md p-6">
            <p className="text-sm text-yellow-600 mb-2">⏳ Pending</p>
            <p className="text-3xl font-bold text-yellow-700">{summary.pendingDoses}</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-md p-6">
            <p className="text-sm text-red-600 mb-2">❌ Skipped</p>
            <p className="text-3xl font-bold text-red-700">{summary.skippedDoses}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-md p-6">
            <p className="text-sm text-blue-600 mb-2">📊 Adherence</p>
            <p className="text-3xl font-bold text-blue-700">{summary.adherenceRate}%</p>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingMed ? 'Edit Medication' : 'Add New Medication'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      placeholder="e.g., Metformin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      name="dosage"
                      value={formData.dosage}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                      placeholder="e.g., 500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="input-field"
                    >
                      <option value="tablet">Tablet</option>
                      <option value="capsule">Capsule</option>
                      <option value="mg">mg</option>
                      <option value="ml">ml</option>
                      <option value="puff">Puff</option>
                      <option value="drop">Drop</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleFrequencyChange}
                      className="input-field"
                    >
                      <option value="once">Once daily</option>
                      <option value="twice">Twice daily</option>
                      <option value="thrice">Three times daily</option>
                      <option value="four-times">Four times daily</option>
                      <option value="every-4-hours">Every 4 hours</option>
                      <option value="every-6-hours">Every 6 hours</option>
                      <option value="every-8-hours">Every 8 hours</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Times
                    </label>
                    {formData.times.map((time, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(index, e.target.value)}
                          className="input-field flex-1"
                        />
                        {formData.times.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTimeField(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addTimeField}
                      className="text-primary-600 text-sm hover:text-primary-700 mt-1"
                    >
                      + Add another time
                    </button>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions
                    </label>
                    <textarea
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      className="input-field"
                      rows="2"
                      placeholder="e.g., Take with food, avoid alcohol..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prescribed By
                    </label>
                    <input
                      type="text"
                      name="prescribedBy"
                      value={formData.prescribedBy}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Dr. Name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="input-field"
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="notifications.enabled"
                          checked={formData.notifications.enabled}
                          onChange={handleInputChange}
                          className="rounded text-primary-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable reminders</span>
                      </label>

                      {formData.notifications.enabled && (
                        <select
                          name="notifications.reminderTime"
                          value={formData.notifications.reminderTime}
                          onChange={handleInputChange}
                          className="input-field w-32"
                        >
                          <option value="5">5 min before</option>
                          <option value="10">10 min before</option>
                          <option value="15">15 min before</option>
                          <option value="30">30 min before</option>
                          <option value="60">1 hour before</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 btn-primary py-3"
                  >
                    {editingMed ? 'Update' : 'Add'} Medication
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMed(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Medications List */}
        {medications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">💊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No medications added</h3>
            <p className="text-gray-500 mb-6">Add your first medication to start tracking</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary inline-flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Medication
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((med) => (
              <div key={med._id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{med.name}</h3>
                    <p className="text-gray-600">{med.dosage} {med.unit} • {med.frequency.replace('-', ' ')}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editMedication(med)}
                      className="text-gray-400 hover:text-primary-600"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(med._id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {med.instructions && (
                  <p className="text-sm text-gray-500 mb-4 italic">{med.instructions}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {med.times.map((timeSlot, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        timeSlot.taken
                          ? 'bg-green-50 border-green-200'
                          : timeSlot.skipped
                          ? 'bg-red-50 border-red-200'
                          : isDoseTime(timeSlot.time)
                          ? 'bg-yellow-50 border-yellow-200 animate-pulse'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{timeSlot.time}</span>
                        {timeSlot.taken ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : timeSlot.skipped ? (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        ) : isDoseTime(timeSlot.time) ? (
                          <ClockIcon className="h-5 w-5 text-yellow-500 animate-pulse" />
                        ) : null}
                      </div>
                      
                      {!timeSlot.taken && !timeSlot.skipped && (
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleTakeDose(med._id, index)}
                            className="flex-1 bg-green-500 text-white text-xs py-1 rounded hover:bg-green-600"
                          >
                            Take
                          </button>
                          <button
                            onClick={() => handleSkipDose(med._id, index)}
                            className="flex-1 bg-gray-400 text-white text-xs py-1 rounded hover:bg-gray-500"
                          >
                            Skip
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {med.prescribedBy && (
                  <p className="text-xs text-gray-400 mt-4">
                    Prescribed by: {med.prescribedBy}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Medications;