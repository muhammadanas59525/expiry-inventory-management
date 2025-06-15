const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    billNumber: {
        type: String,
        required: true,
        unique: true
    },
    shopkeeper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customer: {
        name: {
            type: String,
            required: true
        },
        email: String,
        phone: String,
        address: String,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    taxTotal: {
        type: Number,
        required: true,
        default: 0
    },
    discountTotal: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'netbanking', 'other'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    transactionId: String,
    notes: String,
    status: {
        type: String,
        enum: ['draft', 'issued', 'paid', 'cancelled', 'refunded'],
        default: 'draft'
    },
    dueDate: Date,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

billingSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

// Auto-generate bill number
billingSchema.pre('save', async function(next) {
    if (!this.billNumber) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const count = await mongoose.model('Billing').countDocuments() + 1;
        this.billNumber = `BILL-${year}${month}-${count.toString().padStart(4, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Billing', billingSchema); 