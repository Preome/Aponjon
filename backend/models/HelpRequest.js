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
    coordinates: [Number],
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
  // New fields for rating
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  review: {
    type: String,
    default: null
  },
  ratedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

helpRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);