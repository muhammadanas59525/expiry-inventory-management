const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['EXPIRY', 'STOCK', 'SYSTEM', 'PAYMENT', 'OTHER'],
        default: 'SYSTEM'
    },
    relatedProductId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);