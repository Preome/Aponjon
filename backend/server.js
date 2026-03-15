const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// Import routes
const userRoutes = require('./routes/userRoutes');
const helpRoutes = require('./routes/helpRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const geminiChatRoutes = require('./routes/geminiChatRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const healthReportRoutes = require('./routes/healthReportRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ← ADD THIS

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/gemini', geminiChatRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/health', healthReportRoutes);
app.use('/api/admin', adminRoutes); // ← ADD THIS

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));