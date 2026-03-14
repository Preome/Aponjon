const express = require('express');
const router = express.Router();
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// SOS Endpoint
router.post('/sos', protect, async (req, res) => {
  try {
    // Check if user is elderly
    if (req.user.role !== 'elderly') {
      return res.status(403).json({ message: 'Only elderly can send SOS' });
    }

    console.log('🚨 SOS EMERGENCY from:', req.user.email);

    // Get elderly's location
    let elderlyLocation = req.user.location;
    
    // If no location, try to get from request body or use default
    if (!elderlyLocation || !elderlyLocation.coordinates) {
      console.log('No location found for elderly, using default');
      elderlyLocation = {
        type: 'Point',
        coordinates: [90.4125, 23.8103], // Default Dhaka coordinates
        address: 'Location not set',
        city: 'Unknown'
      };
    }

    // Create emergency request
    const emergencyRequest = await HelpRequest.create({
      elderly: req.user._id,
      taskType: 'emergency',
      description: '🚨 EMERGENCY SOS - Immediate help needed!',
      location: elderlyLocation,
      urgency: 'emergency',
      isEmergency: true,
      status: 'pending',
      preferredTime: new Date()
    });

    console.log('Emergency request created:', emergencyRequest._id);

    // Find nearby volunteers within 5km
    let nearbyVolunteers = [];
    
    if (elderlyLocation.coordinates) {
      nearbyVolunteers = await User.find({
        role: 'volunteer',
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: elderlyLocation.coordinates
            },
            $maxDistance: 5000 // 5km
          }
        }
      });
    }

    console.log(`📢 Found ${nearbyVolunteers.length} nearby volunteers within 5km`);

    // If no nearby volunteers, find any volunteers
    if (nearbyVolunteers.length === 0) {
      nearbyVolunteers = await User.find({ role: 'volunteer' }).limit(5);
      console.log(`📢 No nearby volunteers, notifying ${nearbyVolunteers.length} available volunteers`);
    }

    // Here you would send notifications (SMS/Push/Email)
    // For now, we'll just log them
    nearbyVolunteers.forEach(volunteer => {
      console.log(`Notifying volunteer: ${volunteer.email} at location:`, volunteer.location?.coordinates);
      // TODO: Add actual notification (Twilio SMS, Push notification, etc.)
    });

    res.status(201).json({
      message: '🚨 SOS sent successfully! Help is on the way.',
      requestId: emergencyRequest._id,
      volunteersNotified: nearbyVolunteers.length
    });

  } catch (error) {
    console.error('❌ SOS Error:', error);
    res.status(500).json({ message: 'Failed to send SOS' });
  }
});

// Get emergency status
router.get('/sos-status/:id', protect, async (req, res) => {
  try {
    const emergency = await HelpRequest.findById(req.params.id)
      .populate('volunteer', 'name phone email');

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }

    res.json(emergency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept emergency (for volunteers)
router.put('/accept-emergency/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can accept emergencies' });
    }

    const emergency = await HelpRequest.findById(req.params.id);
    
    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }

    if (!emergency.isEmergency) {
      return res.status(400).json({ message: 'Not an emergency request' });
    }

    if (emergency.status !== 'pending') {
      return res.status(400).json({ message: 'Emergency already being handled' });
    }

    emergency.volunteer = req.user._id;
    emergency.status = 'accepted';
    await emergency.save();

    // Notify elderly that volunteer is coming
    console.log(`Volunteer ${req.user.email} accepted emergency ${emergency._id}`);

    res.json({ 
      message: 'Emergency accepted! Please proceed to help.',
      emergency 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all pending emergencies (for volunteers)
router.get('/pending-emergencies', protect, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const emergencies = await HelpRequest.find({
      isEmergency: true,
      status: 'pending'
    }).populate('elderly', 'name phone location');

    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;