const mongoose = require('mongoose');
require('dotenv').config();

const removeLocation = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const User = require('./models/User');
    
    // Remove location field from all users
    const result = await User.updateMany(
      {}, // all users
      { $unset: { location: "" } } // remove location field
    );
    
    console.log(`✅ Updated ${result.modifiedCount} users - location removed`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

removeLocation();