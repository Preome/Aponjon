const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// ✅ IMPROVED CORS CONFIGURATION - This will work for all your frontend URLs
const allowedOrigins = [
  'http://localhost:3000',                          // Local development
  'https://aponjon.vercel.app',                     // Vercel frontend
  'https://aponjon-elderlycare.onrender.com',       // Your Render frontend
  'https://aponjon-1.onrender.com'                  // Your Render backend
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

// Connect to MongoDB with better error handling
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err.message));

// Import routes
const userRoutes = require('./routes/userRoutes');
const helpRoutes = require('./routes/helpRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const geminiChatRoutes = require('./routes/geminiChatRoutes');
const medicationRoutes = require('./routes/medicationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const healthReportRoutes = require('./routes/HealthReportRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/gemini', geminiChatRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/health', healthReportRoutes);
app.use('/api/admin', adminRoutes);

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Health check route for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));