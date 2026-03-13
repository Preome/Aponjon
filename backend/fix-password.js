const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const fixPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Find the user with plain text password
    const user = await User.findOne({ email: 'elder@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found');
      process.exit();
    }
    
    console.log('📋 Current password (plain text):', user.password);
    
    // Hash the password properly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    console.log('🔐 New hashed password:', hashedPassword);
    
    // Update the user
    user.password = hashedPassword;
    await user.save();
    
    console.log('✅ Password fixed!');
    
    // Verify it works
    const verifyUser = await User.findOne({ email: 'elder@gmail.com' });
    const isMatch = await bcrypt.compare('123456', verifyUser.password);
    console.log('Verification test:', isMatch ? '✅ NOW IT WORKS!' : '❌ Still broken');
    
    mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

fixPassword();