const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'elderly' },
  phone: String,
  age: Number,
  // Add location field for geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false
    },
    address: String,
    city: String
  },
  lastLocationUpdate: Date
}, { timestamps: true });

// Create geospatial index for finding nearby requests
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);