const mongoose = require('mongoose');
require('dotenv').config();

const fixLocationField = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Find all users with invalid location
    const users = await User.find({
      $or: [
        { 'location.type': { $exists: true }, 'location.coordinates': { $exists: false } },
        { 'location.type': { $exists: true }, 'location.coordinates': { $size: 0 } }
      ]
    });
    
    console.log(`Found ${users.length} users with invalid location`);
    
    // Remove location field from these users
    for (const user of users) {
      user.location = undefined;
      await user.save();
      console.log(`✅ Fixed user: ${user.email} - location removed`);
    }
    
    console.log('\n🎉 All users fixed!');
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

fixLocationField();