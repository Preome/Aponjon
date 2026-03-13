const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');

// @desc    Create a help request
// @route   POST /api/help
// @access  Private (Elderly only)
const createRequest = async (req, res) => {
  try {
    if (req.user.role !== 'elderly') {
      return res.status(403).json({ message: 'Only elderly users can create help requests' });
    }

    const { taskType, description, location, urgency, preferredTime } = req.body;

    const request = await HelpRequest.create({
      elderly: req.user.id,
      taskType,
      description,
      location,
      urgency,
      preferredTime,
      status: 'pending'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all requests (with filters)
// @route   GET /api/help
// @access  Private
const getRequests = async (req, res) => {
  try {
    const { status, taskType, city } = req.query;
    let query = {};

    if (status) query.status = status;
    if (taskType) query.taskType = taskType;
    if (city) query['location.city'] = city;

    // Elderly see their own requests, volunteers see available requests
    if (req.user.role === 'elderly') {
      query.elderly = req.user.id;
    } else if (req.user.role === 'volunteer') {
      query.status = 'pending';
    }

    const requests = await HelpRequest.find(query)
      .populate('elderly', 'name phone location')
      .populate('volunteer', 'name phone')
      .sort('-createdAt');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearby requests for volunteers
// @route   GET /api/help/nearby
// @access  Private (Volunteers only)
const getNearbyRequests = async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can view nearby requests' });
    }

    // Simple location-based filtering (you can enhance with geospatial queries)
    const { city, maxDistance = 10 } = req.query;
    
    let query = { status: 'pending' };
    if (city) {
      query['location.city'] = city;
    }

    const requests = await HelpRequest.find(query)
      .populate('elderly', 'name phone location')
      .limit(20);

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept a help request
// @route   PUT /api/help/:id/accept
// @access  Private (Volunteers only)
const acceptRequest = async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can accept requests' });
    }

    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'This request is no longer available' });
    }

    request.volunteer = req.user.id;
    request.status = 'accepted';
    await request.save();

    // TODO: Send notification to elderly user
    // You can implement email/SMS notification here

    res.json({ message: 'Request accepted successfully', request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status
// @route   PUT /api/help/:id/status
// @access  Private
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check permissions
    if (req.user.role === 'elderly' && request.elderly.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'volunteer' && (!request.volunteer || request.volunteer.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    if (status === 'completed') {
      request.completedAt = Date.now();
    }

    await request.save();

    // TODO: Send notification to relevant parties

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's requests
// @route   GET /api/help/my-requests
// @access  Private
const getUserRequests = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'elderly') {
      query.elderly = req.user.id;
    } else if (req.user.role === 'volunteer') {
      query.volunteer = req.user.id;
    }

    const requests = await HelpRequest.find(query)
      .populate('elderly', 'name phone')
      .populate('volunteer', 'name phone')
      .sort('-createdAt');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a request
// @route   DELETE /api/help/:id
// @access  Private (Elderly or Admin)
const deleteRequest = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only elderly who created it or admin can delete
    if (req.user.role !== 'admin' && request.elderly.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await request.deleteOne();
    res.json({ message: 'Request removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getNearbyRequests,
  acceptRequest,
  updateRequestStatus,
  getUserRequests,
  deleteRequest
};