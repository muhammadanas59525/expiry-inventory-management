const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const AuthController = {
    // Register a new user
    register: async (req, res) => {
        try {
            const { name, email, password, role, shopDetails } = req.body;

            // Validate role
            if (!['admin', 'shopkeeper', 'customer'].includes(role)) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid role' 
                });
            }

            // Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ 
                    success: false,
                    message: 'User already exists' 
                });
            }

            // Validate shopkeeper details
            if (role === 'shopkeeper' && !shopDetails) {
                return res.status(400).json({
                    success: false,
                    message: 'Shop details are required for shopkeeper registration'
                });
            }

            // Create new user
            user = new User({
                name,
                email,
                password,
                role,
                shopDetails: role === 'shopkeeper' ? shopDetails : undefined
            });

            // Hash password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            // Save user
            await user.save();

            // Create token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        shopDetails: user.shopDetails
                    }
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Server error' 
            });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            console.log('Login attempt:', req.body);
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Check if user exists
            const user = await User.findOne({ email });
            if (!user) {
                console.log('User not found:', email);
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid email or password' 
                });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                console.log('Invalid password for user:', email);
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid email or password' 
                });
            }

            // Check if user is active
            if (user.status === 'inactive') {
                return res.status(403).json({
                    success: false,
                    message: 'Account is inactive'
                });
            }

            // Create token
            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Send response
            res.json({
                success: true,
                data: {
                    token,
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        shopDetails: user.shopDetails
                    }
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                success: false,
                message: 'Server error' 
            });
        }
    },

    // Get user profile
    getProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.userId).select('-password');
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false,
                message: 'Server error' 
            });
        }
    },

    // Update user profile
    updateProfile: async (req, res) => {
        try {
            const { name, email, phone, address, shopDetails } = req.body;
            const user = await User.findById(req.user.userId);

            // Update basic info
            if (name) user.name = name;
            if (email) user.email = email;
            if (phone) user.phone = phone;
            if (address) user.address = address;

            // Update shop details for shopkeepers
            if (user.role === 'shopkeeper' && shopDetails) {
                user.shopDetails = {
                    ...user.shopDetails,
                    ...shopDetails
                };
            }

            await user.save();
            res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        phone: user.phone,
                        address: user.address,
                        shopDetails: user.role === 'shopkeeper' ? user.shopDetails : undefined
                    }
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false,
                message: 'Server error' 
            });
        }
    },

    // Change password
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = await User.findById(req.user.userId);

            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await user.save();

            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Request password reset
    requestPasswordReset: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // In a real application, you would:
            // 1. Generate a reset token
            // 2. Save it to the user record with an expiry
            // 3. Send an email with the reset link
            // For now, we'll just return a success message
            res.json({ message: 'Password reset instructions sent to email' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Reset password
    resetPassword: async (req, res) => {
        try {
            const { token, newPassword } = req.body;

            // In a real application, you would:
            // 1. Verify the reset token
            // 2. Check if it's expired
            // 3. Update the password
            // For now, we'll return an error
            res.status(400).json({ message: 'Password reset functionality not implemented' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Logout
    logout: async (req, res) => {
        try {
            // In a real application with refresh tokens, you would:
            // 1. Invalidate the refresh token
            // 2. Clear any session data
            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    // Verify token and return user data
    verify: async (req, res) => {
        try {
            // Get token from header
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user data
            const user = await User.findById(decoded.userId).select('-password');
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if user is active
            if (user.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'Account is not active'
                });
            }

            res.json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        shopDetails: user.shopDetails
                    }
                }
            });
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
    }
};

module.exports = AuthController; 