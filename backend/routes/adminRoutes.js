const express = require('express');
const router = express.Router();
const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');
const jwt = require('jsonwebtoken');

// Middleware to verify token and check if admin
const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all requests
// @route   GET /api/admin/requests
// @access  Private/Admin
router.get('/requests', protect, async (req, res) => {
  try {
    const requests = await HelpRequest.find({})
      .populate('elderly', 'name email phone')
      .populate('volunteer', 'name email phone')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalElderly = await User.countDocuments({ role: 'elderly' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    const totalRequests = await HelpRequest.countDocuments();
    const pendingRequests = await HelpRequest.countDocuments({ status: 'pending' });
    const acceptedRequests = await HelpRequest.countDocuments({ status: 'accepted' });
    const completedRequests = await HelpRequest.countDocuments({ status: 'completed' });
    const emergencyRequests = await HelpRequest.countDocuments({ isEmergency: true });

    res.json({
      users: {
        total: totalUsers,
        elderly: totalElderly,
        volunteers: totalVolunteers,
        admins: totalAdmins
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        accepted: acceptedRequests,
        completed: completedRequests,
        emergencies: emergencyRequests
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow deleting other admins
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;