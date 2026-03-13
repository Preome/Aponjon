const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all requests
// @route   GET /api/admin/requests
// @access  Private/Admin
const getAllRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find({})
      .populate('elderly', 'name email phone')
      .populate('volunteer', 'name email phone')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalElderly = await User.countDocuments({ role: 'elderly' });
    const totalVolunteers = await User.countDocuments({ role: 'volunteer' });
    
    const totalRequests = await HelpRequest.countDocuments();
    const pendingRequests = await HelpRequest.countDocuments({ status: 'pending' });
    const acceptedRequests = await HelpRequest.countDocuments({ status: 'accepted' });
    const completedRequests = await HelpRequest.countDocuments({ status: 'completed' });

    res.json({
      users: {
        total: totalUsers,
        elderly: totalElderly,
        volunteers: totalVolunteers
      },
      requests: {
        total: totalRequests,
        pending: pendingRequests,
        accepted: acceptedRequests,
        completed: completedRequests
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getAllRequests,
  getStats,
  deleteUser
};