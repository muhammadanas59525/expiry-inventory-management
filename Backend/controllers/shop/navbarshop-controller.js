const Notification = require('../models/notification.model');
const Product = require('../models/Product');
const User = require('../models/user.model');

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming user is attached from auth middleware
        
        const notifications = await Notification.find({ userId })
            .populate('relatedProductId', 'name price expiryDate imageUrl')
            .sort({ created_at: -1 });
            
        res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};

// Mark notifications as read
const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        await Notification.findByIdAndUpdate(notificationId, {
            isRead: true
        });
        
        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error.message
        });
    }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        
        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error.message
        });
    }
};

// Generate product expiry notifications (can be run as a cron job)
const generateExpiryNotifications = async (req, res) => {
    try {
        const users = await User.find({
            'notificationPreferences.expiryNotification': true
        });
        
        for (const user of users) {
            const daysBeforeExpiry = user.notificationPreferences.daysBeforeExpiry || 10;
            const today = new Date();
            
            // Set time to check products expiring in the next X days
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + daysBeforeExpiry);
            
            const expiringProducts = await Product.find({
                expiryDate: { 
                    $gte: today,
                    $lte: futureDate
                }
            });
            
            // Create notifications for each expiring product
            for (const product of expiringProducts) {
                // Check if notification already exists
                const existingNotification = await Notification.findOne({
                    userId: user._id,
                    type: 'EXPIRY',
                    relatedProductId: product._id,
                    isRead: false
                });
                
                if (!existingNotification) {
                    const daysUntilExpiry = Math.ceil(
                        (new Date(product.expiryDate) - today) / (1000 * 60 * 60 * 24)
                    );
                    
                    await Notification.create({
                        userId: user._id,
                        title: 'Product Expiring Soon',
                        message: `${product.name} is expiring in ${daysUntilExpiry} days`,
                        type: 'EXPIRY',
                        relatedProductId: product._id
                    });
                }
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'Expiry notifications generated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate notifications',
            error: error.message
        });
    }
};

module.exports = {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    generateExpiryNotifications
};