const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'elderly' },
  phone: String,
  age: Number,
  
  // Fix: Make location optional and properly validated
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: function() { 
        return this.coordinates ? true : false; 
      }
    },
    coordinates: {
      type: [Number],
      required: function() { 
        return this.type ? true : false; 
      },
      validate: {
        validator: function(v) {
          // If coordinates exist, they must be an array of 2 numbers
          return !v || (Array.isArray(v) && v.length === 2);
        },
        message: 'Coordinates must be an array of [longitude, latitude]'
      }
    },
    address: String,
    city: String
  },
  lastLocationUpdate: Date,
  
  // Messaging fields
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  onlineStatus: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline'
  },
  lastSeen: Date,
  bio: String,
  interests: [String]
}, { timestamps: true });

// Only create geospatial index when location has valid coordinates
userSchema.index({ 
  location: '2dsphere' 
}, { 
  sparse: true,
  partialFilterExpression: { 
    'location.coordinates': { $exists: true, $type: 'array' } 
  } 
});

module.exports = mongoose.model('User', userSchema);