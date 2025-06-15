const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        
        // Delete existing test user if exists
        await User.deleteOne({ email: 'test@example.com' });
        
        // Create new test user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('test123', salt);
        
        const user = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'customer',
            status: 'active'
        });
        
        await user.save();
        console.log('Test user created successfully:', {
            email: 'test@example.com',
            password: 'test123'  // Showing plain password for testing
        });
        
    } catch (error) {
        console.error('Error creating test user:', error);
    } finally {
        await mongoose.connection.close();
    }
};

createTestUser(); 