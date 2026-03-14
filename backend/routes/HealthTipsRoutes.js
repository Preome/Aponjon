const express = require('express');
const router = express.Router();
const HealthTip = require('../models/HealthTip');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

// Get random health tip
router.get('/random', protect, async (req, res) => {
  try {
    const count = await HealthTip.countDocuments();
    if (count === 0) {
      // Fallback tips if database is empty
      const fallbackTips = [
        "💧 Drink 6-8 glasses of water daily to stay hydrated",
        "🚶 Take a short 15-minute walk after meals to aid digestion",
        "⏰ Take medications at the same time each day",
        "🧘 Gentle stretching in the morning improves flexibility",
        "📞 Call a friend or family member today - social connection is important!"
      ];
      return res.json({ tip: fallbackTips[Math.floor(Math.random() * fallbackTips.length)] });
    }
    
    const random = Math.floor(Math.random() * count);
    const healthTip = await HealthTip.findOne().skip(random);
    res.json({ tip: healthTip.tip });
  } catch (error) {
    console.error('Error fetching health tip:', error);
    res.status(500).json({ tip: "Take care of your health today! 💪" });
  }
});

// Get tips by category
router.get('/category/:category', protect, async (req, res) => {
  try {
    const tips = await HealthTip.find({ category: req.params.category })
      .limit(5)
      .sort('-createdAt');
    res.json(tips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Add new tip (optional)
router.post('/add', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin only' });
    }
    
    const newTip = await HealthTip.create(req.body);
    res.status(201).json(newTip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;