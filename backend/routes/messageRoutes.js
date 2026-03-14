const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');
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

// ==================== FRIEND REQUESTS ====================

// Send friend request
router.post('/friend-request/:userId', protect, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (targetUser.friends.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already exists
    const existingRequest = targetUser.friendRequests.find(
      r => r.from.toString() === req.user._id.toString() && r.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    targetUser.friendRequests.push({
      from: req.user._id,
      status: 'pending'
    });

    await targetUser.save();

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept/reject friend request
router.put('/friend-request/:requestId', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    
    const user = await User.findById(req.user._id);
    const request = user.friendRequests.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;

    if (status === 'accepted') {
      // Add each other as friends
      user.friends.push(request.from);
      const friend = await User.findById(request.from);
      friend.friends.push(req.user._id);
      await friend.save();
    }

    await user.save();

    res.json({ message: `Friend request ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get friend requests
router.get('/friend-requests', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friendRequests.from', 'name email age location.city');

    const pendingRequests = user.friendRequests.filter(r => r.status === 'pending');
    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get friends list
router.get('/friends', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name email onlineStatus lastSeen age location.city bio interests');

    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== MESSAGES ====================

// Send message to user
router.post('/send/:receiverId', protect, async (req, res) => {
  try {
    const { content } = req.body;
    
    // Check if they are friends
    const receiver = await User.findById(req.params.receiverId);
    if (!receiver.friends.includes(req.user._id)) {
      return res.status(403).json({ message: 'You must be friends to message' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: req.params.receiverId,
      content,
      deliveredAt: new Date()
    });

    // Emit socket event for real-time (we'll add socket.io later)
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get conversation with user
router.get('/conversation/:userId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    })
    .sort('createdAt')
    .populate('sender', 'name onlineStatus')
    .populate('receiver', 'name onlineStatus');

    // Mark messages as read
    await Message.updateMany(
      { 
        sender: req.params.userId, 
        receiver: req.user._id,
        'readBy.user': { $ne: req.user._id }
      },
      { 
        $push: { readBy: { user: req.user._id, readAt: new Date() } }
      }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread message count
router.get('/unread', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      'readBy.user': { $ne: req.user._id }
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== GROUPS ====================

// Create group
router.post('/groups', protect, async (req, res) => {
  try {
    const { name, description, category, isPrivate } = req.body;

    const group = await Group.create({
      name,
      description,
      category,
      isPrivate,
      createdBy: req.user._id,
      admins: [req.user._id],
      members: [{
        user: req.user._id,
        role: 'admin'
      }]
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all groups (public)
router.get('/groups', protect, async (req, res) => {
  try {
    const groups = await Group.find({ isPrivate: false })
      .populate('createdBy', 'name')
      .populate('lastMessage');

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's groups
router.get('/my-groups', protect, async (req, res) => {
  try {
    const groups = await Group.find({
      'members.user': req.user._id
    }).populate('createdBy', 'name');

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join group
router.post('/groups/:groupId/join', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if already member
    if (group.members.some(m => m.user.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already a member' });
    }

    if (group.isPrivate) {
      // Add to join requests
      group.joinRequests.push({ user: req.user._id });
      await group.save();
      return res.json({ message: 'Join request sent' });
    } else {
      // Directly add to public group
      group.members.push({ user: req.user._id, role: 'member' });
      await group.save();
      res.json({ message: 'Joined group successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send group message
router.post('/groups/:groupId/message', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);

    // Check if user is member
    if (!group.members.some(m => m.user.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not a group member' });
    }

    const message = await Message.create({
      sender: req.user._id,
      group: req.params.groupId,
      content: req.body.content,
      deliveredAt: new Date()
    });

    group.lastMessage = message._id;
    await group.save();

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get group messages
router.get('/groups/:groupId/messages', protect, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .sort('createdAt')
      .populate('sender', 'name onlineStatus');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== USER DISCOVERY ====================

// Find other elders
router.get('/discover', protect, async (req, res) => {
  try {
    const users = await User.find({
      role: 'elderly',
      _id: { $ne: req.user._id },
      friends: { $ne: req.user._id }
    })
    .select('name age location.city bio interests onlineStatus lastSeen')
    .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update online status
router.put('/status', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'online', 'offline', 'away'
    
    await User.findByIdAndUpdate(req.user._id, {
      onlineStatus: status,
      lastSeen: status === 'online' ? null : new Date()
    });

    res.json({ message: 'Status updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single group details
router.get('/groups/:groupId', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('createdBy', 'name')
      .populate('members.user', 'name email onlineStatus')
      .populate('lastMessage');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;