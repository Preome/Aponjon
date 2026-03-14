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
    enum: ['medicine', 'groceries', 'doctor-visit', 'companionship', 'other', 'emergency'],
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
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  isEmergency: {
    type: Boolean,
    default: false
  },
  emergencyResponded: [{
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date,
    message: String
  }],
  preferredTime: Date,
  completedAt: Date,
  rating: Number,
  review: String,
  ratedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

helpRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('HelpRequest', helpRequestSchema);