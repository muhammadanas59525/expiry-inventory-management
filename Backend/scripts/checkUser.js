const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const User = require('../models/User');
    try {
      const user = await User.findOne({ email: 'asdf@gmail.com' });
      if (user) {
        console.log('User found:', {
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
          created_at: user.created_at
        });
      } else {
        console.log('User not found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  }); 