const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        console.log('Auth header:', authHeader);
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No authorization header provided'
            });
        }
        
        // Extract token from Bearer format
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);
            
            // Find user
            const user = await User.findOne({
                _id: decoded.userId
            });
            
            if (!user) {
                console.error(`User ID ${decoded.userId} not found in database`);
                return res.status(401).json({
                    success: false,
                    message: `User not found: ${decoded.userId}`
                });
            }
            
            // Check status only if it exists, otherwise consider it active
            if (user.status !== undefined && user.status !== 'active') {
                console.error(`User ${decoded.userId} found but status is ${user.status}, not active`);
                return res.status(401).json({
                    success: false,
                    message: `User inactive: Status is ${user.status}`
                });
            }
            
            // If status is undefined, log it but proceed
            if (user.status === undefined) {
                console.warn(`User ${decoded.userId} found but status field is missing. Treating as active.`);
                
                // Optionally set status to active and save
                try {
                    user.status = 'active';
                    await user.save();
                    console.log(`Updated user ${decoded.userId} with 'active' status`);
                } catch (saveError) {
                    console.error(`Failed to update user status: ${saveError.message}`);
                    // Continue anyway
                }
            }
            
            // Update last login
            user.lastLogin = Date.now();
            await user.save();
            
            req.token = token;
            req.user = user;
            next();
        } catch (verifyError) {
            console.error('Token verification error:', verifyError);
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                error: verifyError.message
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: error.message
        });
    }
}; 