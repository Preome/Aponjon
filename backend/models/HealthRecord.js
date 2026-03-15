const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  
  // Vitals
  bloodPressure: {
    systolic: Number,
    diastolic: Number,
    unit: { type: String, default: 'mmHg' }
  },
  heartRate: {
    value: Number,
    unit: { type: String, default: 'bpm' }
  },
  temperature: {
    value: Number,
    unit: { type: String, default: '°F' }
  },
  oxygenLevel: {
    value: Number,
    unit: { type: String, default: '%' }
  },
  weight: {
    value: Number,
    unit: { type: String, default: 'kg' }
  },
  bloodSugar: {
    value: Number,
    unit: { type: String, default: 'mg/dL' },
    type: { type: String, enum: ['fasting', 'post-meal', 'random'], default: 'random' }
  },
  
  // Symptoms & Notes
  symptoms: [String],
  notes: String,
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'bad', 'terrible']
  },
  
  // Medications taken
  medicationsTaken: [{
    name: String,
    time: Date,
    taken: Boolean
  }],
  
  // Emergency incidents
  isEmergency: {
    type: Boolean,
    default: false
  },
  emergencyType: String,
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);