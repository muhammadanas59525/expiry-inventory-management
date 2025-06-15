const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const User = require('../models/User');
    try {
      await User.deleteMany({});
      console.log('All users deleted successfully');
    } catch (error) {
      console.error('Error deleting users:', error);
    }
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  }); 