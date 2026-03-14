const mongoose = require('mongoose');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    
    const users = await User.find({});
    console.log(`\n📊 Total users: ${users.length}`);
    
    users.forEach((user, i) => {
      console.log(`\n--- User ${i+1} ---`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`Has location: ${user.location ? '✅' : '❌'}`);
      
      if (user.location) {
        console.log(`Location type: ${user.location.type}`);
        console.log(`Coordinates: ${user.location.coordinates}`);
        console.log(`Valid: ${user.location.coordinates && user.location.coordinates.length === 2 ? '✅' : '❌'}`);
      }
    });
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

checkUsers();