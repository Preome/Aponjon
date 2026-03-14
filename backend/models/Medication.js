const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide medication name']
  },
  dosage: {
    type: String,
    required: [true, 'Please provide dosage']
  },
  unit: {
    type: String,
    enum: ['mg', 'ml', 'tablet', 'capsule', 'puff', 'drop', 'other'],
    default: 'tablet'
  },
  frequency: {
    type: String,
    enum: ['once', 'twice', 'thrice', 'four-times', 'every-4-hours', 'every-6-hours', 'every-8-hours', 'as-needed'],
    required: true
  },
  times: [{
    time: String, // HH:MM format
    taken: {
      type: Boolean,
      default: false
    },
    takenAt: Date,
    skipped: Boolean
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  instructions: String,
  prescribedBy: String,
  pharmacy: String,
  refillReminder: {
    enabled: Boolean,
    refillDate: Date,
    refillReminderSent: Boolean
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'discontinued'],
    default: 'active'
  },
  notifications: {
    enabled: { type: Boolean, default: true },
    reminderTime: { type: Number, default: 5 }, // minutes before
    sound: { type: Boolean, default: true }
  },
  history: [{
    date: Date,
    time: String,
    status: String, // 'taken', 'skipped', 'late'
    notes: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Medication', medicationSchema);