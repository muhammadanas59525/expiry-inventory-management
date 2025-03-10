const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');
const { address } = require('framer-motion/client');

// Verify token and return user data
const verifyToken = async (req, res) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Return user data
        res.json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                userType: user.userType,
                firstName: user.firstName,
                lastName: user.lastName,
                address: user.address,
                phone: user.phone,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }
        });
        console.log('User data:', user);
    } catch (error) {
        console.error('Token verification error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

module.exports = { verifyToken };