const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

// Chat endpoint
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    console.log(`💬 Chat from ${req.user.email}:`, message);

    // Create system prompt
    const systemPrompt = `You are "Aponjon Assistant", a warm, caring health companion for elderly users. 
Speak in a friendly, gentle manner with occasional emojis. Use simple, clear language. 
Never give medical diagnoses - always suggest consulting a doctor for serious concerns.
Provide emotional support and companionship.
The user's name is: ${req.user.name || 'Friend'}`;

    // Build conversation
    let chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I'll be a caring health companion." }] },
        ...(conversationHistory || []).slice(-5).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
      ],
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.7,
      }
    });

    // Send message
    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ reply, timestamp: new Date() });

  } catch (error) {
    console.error('❌ Gemini Error:', error.message);
    
    // Friendly fallback
    res.json({ 
      reply: "I'm here with you! 😊 Let me try that again. Could you please repeat?",
      timestamp: new Date()
    });
  }
});

// Health tip endpoint
router.get('/tip', protect, async (req, res) => {
  const tips = [
    "💧 Drink 6-8 glasses of water daily to stay hydrated",
    "🚶 Take a short 15-minute walk after meals to aid digestion",
    "⏰ Take medications at the same time each day",
    "🧘 Gentle stretching in the morning improves flexibility",
    "📞 Call a friend or family member today - social connection is important!",
    "😴 Aim for 7-8 hours of sleep each night",
    "🥗 Eat colorful fruits and vegetables for better nutrition",
    "💪 Try chair exercises if standing is difficult",
    "🧠 Do crossword puzzles to keep your mind active",
    "❤️ Check your blood pressure regularly if you have hypertension"
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  res.json({ tip: randomTip });
});

module.exports = router;