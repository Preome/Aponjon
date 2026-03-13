const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getNearbyRequests,
  acceptRequest,
  updateRequestStatus,
  getUserRequests,
  deleteRequest
} = require('../controllers/helpController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createRequest)
  .get(protect, getRequests);

router.get('/nearby', protect, getNearbyRequests);
router.get('/my-requests', protect, getUserRequests);
router.put('/:id/accept', protect, acceptRequest);
router.put('/:id/status', protect, updateRequestStatus);
router.delete('/:id', protect, deleteRequest);

module.exports = router;