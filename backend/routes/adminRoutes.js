const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllRequests,
  getStats,
  deleteUser
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Apply middleware to all routes
router.use(protect);
router.use(admin);

// Define routes
router.get('/users', getAllUsers);
router.get('/requests', getAllRequests);
router.get('/stats', getStats);
router.delete('/users/:id', deleteUser);

module.exports = router;