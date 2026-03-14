const mongoose = require('mongoose');
require('dotenv').config();

const testUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Create a test user WITHOUT location
    const testUser = await User.create({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'elderly',
      phone: '1234567890',
      age: 65
    });
    
    console.log('✅ Test user created with NO location:', testUser.email);
    console.log('Location field:', testUser.location); // Should be undefined
    
    // Clean up
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Test user deleted');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testUser();