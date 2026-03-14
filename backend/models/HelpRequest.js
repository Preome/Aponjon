const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema({
  elderly: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  taskType: {
    type: String,
    enum: ['medicine', 'groceries', 'doctor-visit', 'companionship', 'other'],
    required: true
  },
  description: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String,
    city: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  urgency: String,
  preferredTime: Date,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Create geospatial index
helpRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);