const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
    try {
        console.log("Auth middleware running");
        console.log("Headers:", req.headers);
        
        let token;
        
        // Check for token in authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log("Token found:", token.substring(0, 20) + "...");
        } else {
            console.log("No Bearer token found in Authorization header");
        }
        
        if (!token) {
            console.log("No token provided");
            return res.status(401).json({  success: false,
                message: 'Not authorized, no token' });
        }
        
        try {
            // Verify token
            console.log("Verifying token with secret:", process.env.JWT_SECRET ? "Using env variable" : "Using fallback secret");
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
            console.log("Token verified, decoded:", decoded);
            
            // Get user from token
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                console.log("User not found for ID:", decoded.id);
                return res.status(404).json({
                    success: false,
                     message: 'User not found' });
            }
            
            console.log("User found:", user.username);
            req.user = user;
            next();
        } catch (err) {
            console.error("Token verification error:", err);
            return res.status(401).json({ message: 'Not authorized, invalid token' });
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { protect };