const mongoose = require('mongoose');
require('dotenv').config();

const fixAllUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Find all users with any location field
    const users = await User.find({ location: { $exists: true } });
    console.log(`📊 Found ${users.length} users with location field`);
    
    let fixed = 0;
    let removed = 0;
    
    for (const user of users) {
      // Check if location is valid
      const hasValidLocation = user.location && 
                               user.location.coordinates && 
                               Array.isArray(user.location.coordinates) && 
                               user.location.coordinates.length === 2;
      
      if (!hasValidLocation) {
        // Remove invalid location
        user.location = undefined;
        await user.save();
        console.log(`❌ Removed invalid location for: ${user.email}`);
        removed++;
      } else {
        console.log(`✅ Valid location for: ${user.email}`);
        fixed++;
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`   ✅ Users with valid location: ${fixed}`);
    console.log(`   ❌ Users with location removed: ${removed}`);
    console.log(`   📊 Total users processed: ${users.length}`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

fixAllUsers();