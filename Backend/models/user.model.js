/**
 * User Model for MongoDB
 * /Backend/models/userModel.js
 */


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Please add a username'],
            unique: true
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true
        },
        password: {
            type: String,
            required: [true, 'Please add a password']
        },
        firstName: {
            type: String,
            default: ''
        },
        lastName: {
            type: String,
            default: ''
        },
        phone: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        },
        userType: {
            type: String,
            enum: ['customer', 'shopkeeper', 'admin'],
            default: 'customer'
        },
        storeName: {
            type: String,
            default: ''
        },
        bio: {  // Add this field to the schema
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

// Pre-save middleware to hash password
// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) {
//         return next();
//     }
    
//     try {
//         const salt = await bcrypt.genSalt(10);
//         this.password = await bcrypt.hash(this.password, salt);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// // Method to check if password is correct
// userSchema.methods.matchPassword = async function(enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };

const User = mongoose.model('User', userSchema);

module.exports = User;

