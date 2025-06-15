const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        pincode: String
    },
    gstNumber: {
        type: String,
        trim: true
    },
    panNumber: {
        type: String,
        trim: true
    },
    paymentTerms: {
        type: String
    },
    creditLimit: {
        type: Number,
        default: 0
    },
    currentCredit: {
        type: Number,
        default: 0
    },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        ifscCode: String,
        branch: String
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    notes: String,
    documents: [{
        name: String,
        type: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    shopkeeper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient querying
supplierSchema.index({ shopkeeper: 1, company: 1 });

// Update timestamps
supplierSchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

// Method to get credit status
supplierSchema.methods.getCreditStatus = function() {
    return {
        limit: this.creditLimit,
        current: this.currentCredit,
        available: this.creditLimit - this.currentCredit
    };
};

// Static method to find active suppliers for a shopkeeper
supplierSchema.statics.findActiveSuppliers = function(shopkeeperId) {
    return this.find({
        shopkeeper: shopkeeperId,
        status: 'active'
    }).sort('company');
};

module.exports = mongoose.model('Supplier', supplierSchema); 