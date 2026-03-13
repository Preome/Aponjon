const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const diagnose = async () => {
  try {
    console.log('🔍 Starting diagnosis...');
    console.log('Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Find all users
    const users = await User.find({});
    console.log(`\n📊 Total users in database: ${users.length}`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
      process.exit();
    }
    
    // Check each user
    for (const user of users) {
      console.log('\n-------------------');
      console.log('👤 USER:', user.email);
      console.log('-------------------');
      console.log('ID:', user._id);
      console.log('Name:', user.name);
      console.log('Role:', user.role);
      console.log('Phone:', user.phone);
      console.log('Age:', user.age);
      console.log('Password in DB:', user.password);
      console.log('Password length:', user.password.length);
      
      // Check if password is hashed
      const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
      console.log('Is password hashed?', isHashed);
      
      if (!isHashed) {
        console.log('⚠️  WARNING: Password is stored as PLAIN TEXT!');
      }
      
      // Test password comparison with common password
      if (user.email === 'elder@gmail.com') {
        const testPassword = '123456';
        try {
          const isMatch = await bcrypt.compare(testPassword, user.password);
          console.log(`🔐 Password test with "${testPassword}":`, isMatch ? '✅ MATCH' : '❌ NO MATCH');
        } catch (error) {
          console.log('❌ Error comparing password:', error.message);
        }
      }
    }
    
    mongoose.disconnect();
    console.log('\n✅ Diagnosis complete');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Call the function
diagnose();