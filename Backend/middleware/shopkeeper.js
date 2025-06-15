module.exports = async (req, res, next) => {
    try {
        console.log('Shopkeeper middleware - user:', req.user ? req.user._id : 'No user');
        console.log('User role:', req.user ? req.user.role : 'No role');
        
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User object not available in request'
            });
        }
        
        if (req.user.role !== 'shopkeeper') {
            console.error(`Access denied: User ${req.user._id} has role ${req.user.role}, not shopkeeper`);
            return res.status(403).json({
                success: false,
                message: `Access denied. Role is ${req.user.role}, required: shopkeeper`
            });
        }
        
        // Shopkeeper access granted
        console.log(`Shopkeeper access granted for user ${req.user._id}`);
        next();
    } catch (error) {
        console.error('Shopkeeper middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}; 