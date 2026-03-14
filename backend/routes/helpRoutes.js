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
      console.log('Auth error:', error);
      return res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// TEST ROUTE - Check if route is working
router.get('/test', (req, res) => {
  res.json({ message: 'Help routes working' });
});

// ============= NEARBY REQUESTS (NEW) =============
// Get nearby pending requests for volunteers (within 3km)
router.get('/nearby', protect, async (req, res) => {
  try {
    console.log('🔍 Nearby requests requested by:', req.user.email);
    
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can view nearby requests' });
    }

    // Get volunteer's location
    const volunteer = await User.findById(req.user._id);
    
    if (!volunteer.location || !volunteer.location.coordinates) {
      console.log('📍 Volunteer has no location set');
      return res.status(400).json({ 
        message: 'Please update your location first',
        needsLocation: true 
      });
    }

    console.log('📍 Volunteer location:', volunteer.location.coordinates);

    // Find pending requests within 3km (3000 meters)
    const requests = await HelpRequest.find({
      status: 'pending',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: volunteer.location.coordinates
          },
          $maxDistance: 3000 // 3km in meters
        }
      }
    }).populate('elderly', 'name phone location');

    console.log(`✅ Found ${requests.length} nearby requests within 3km`);
    res.json(requests);
  } catch (error) {
    console.error('❌ Error finding nearby requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============= UPDATE LOCATION =============
// Update volunteer location
router.put('/update-location', protect, async (req, res) => {
  try {
    const { coordinates, address, city } = req.body;
    
    console.log('📍 Updating location for user:', req.user.email);
    console.log('   Coordinates:', coordinates);
    console.log('   Address:', address);
    
    const user = await User.findById(req.user._id);
    user.location = {
      type: 'Point',
      coordinates,
      address,
      city
    };
    user.lastLocationUpdate = Date.now();
    
    await user.save();
    console.log('✅ Location updated successfully');
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('❌ Error updating location:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all pending requests (for volunteers)
router.get('/pending', protect, async (req, res) => {
  try {
    console.log('Fetching pending requests for user:', req.user.email);
    
    const requests = await HelpRequest.find({ status: 'pending' })
      .populate('elderly', 'name phone location')
      .sort('-createdAt');
    
    console.log(`Found ${requests.length} pending requests`);
    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a help request (Elderly only)
router.post('/', protect, async (req, res) => {
  try {
    console.log('Creating request for user:', req.user.email);
    
    if (req.user.role !== 'elderly') {
      return res.status(403).json({ message: 'Only elderly can create requests' });
    }
    
    const request = await HelpRequest.create({
      elderly: req.user._id,
      ...req.body,
      status: 'pending'
    });
    
    console.log('Request created:', request._id);
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get my requests (for elderly)
router.get('/my-requests', protect, async (req, res) => {
  try {
    const requests = await HelpRequest.find({ elderly: req.user._id })
      .populate('volunteer', 'name phone')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my accepted requests (for volunteer)
router.get('/my-accepted', protect, async (req, res) => {
  try {
    const requests = await HelpRequest.find({ 
      volunteer: req.user._id,
      status: { $in: ['accepted', 'completed'] }
    })
      .populate('elderly', 'name phone location')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept a request (Volunteer only)
router.put('/accept/:id', protect, async (req, res) => {
  try {
    console.log('Accepting request:', req.params.id);
    
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can accept requests' });
    }
    
    const request = await HelpRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already taken' });
    }
    
    request.volunteer = req.user._id;
    request.status = 'accepted';
    await request.save();
    
    console.log('Request accepted successfully');
    res.json(request);
  } catch (error) {
    console.error('Error accepting request:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update request status
router.put('/status/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const request = await HelpRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check authorization
    if (req.user.role === 'elderly' && request.elderly.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (req.user.role === 'volunteer' && request.volunteer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    request.status = status;
    if (status === 'completed') {
      request.completedAt = Date.now();
    }
    
    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get stats for dashboard
router.get('/stats', protect, async (req, res) => {
  try {
    let stats = {};
    
    if (req.user.role === 'elderly') {
      const total = await HelpRequest.countDocuments({ elderly: req.user._id });
      const pending = await HelpRequest.countDocuments({ elderly: req.user._id, status: 'pending' });
      const accepted = await HelpRequest.countDocuments({ elderly: req.user._id, status: 'accepted' });
      const completed = await HelpRequest.countDocuments({ elderly: req.user._id, status: 'completed' });
      
      stats = { total, pending, accepted, completed };
    } else if (req.user.role === 'volunteer') {
      const accepted = await HelpRequest.countDocuments({ volunteer: req.user._id, status: 'accepted' });
      const completed = await HelpRequest.countDocuments({ volunteer: req.user._id, status: 'completed' });
      const available = await HelpRequest.countDocuments({ status: 'pending' });
      
      stats = { accepted, completed, available };
    }
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete a request (Volunteer marks as completed)
router.put('/complete/:id', protect, async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if volunteer is the one who accepted it
    if (req.user.role !== 'volunteer' || request.volunteer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Request must be accepted first' });
    }
    
    request.status = 'completed';
    request.completedAt = Date.now();
    await request.save();
    
    res.json({ message: 'Request marked as completed', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add rating and review (Elderly rates after completion)
router.post('/rate/:id', protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const request = await HelpRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if elderly is the one who created it
    if (req.user.role !== 'elderly' || request.elderly.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Request must be completed first' });
    }
    
    if (request.rating) {
      return res.status(400).json({ message: 'Already rated' });
    }
    
    request.rating = rating;
    request.review = review;
    request.ratedAt = Date.now();
    await request.save();
    
    res.json({ message: 'Rating submitted successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get volunteer's rating stats
router.get('/volunteer-rating/:volunteerId', async (req, res) => {
  try {
    const requests = await HelpRequest.find({ 
      volunteer: req.params.volunteerId,
      rating: { $exists: true, $ne: null }
    });
    
    const totalRatings = requests.length;
    const avgRating = requests.reduce((sum, r) => sum + r.rating, 0) / totalRatings || 0;
    const ratingCounts = {1:0, 2:0, 3:0, 4:0, 5:0};
    
    requests.forEach(r => {
      ratingCounts[r.rating]++;
    });
    
    res.json({
      totalRatings,
      avgRating: avgRating.toFixed(1),
      ratingCounts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;