const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    shopkeeper: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['purchase', 'sale', 'return', 'adjustment', 'damaged', 'expired'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    previousQuantity: {
        type: Number,
        required: true
    },
    newQuantity: {
        type: Number,
        required: true
    },
    unitCost: {
        type: Number,
        required: true
    },
    totalCost: {
        type: Number,
        required: true
    },
    reference: {
        type: String,
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'referenceModel'
    },
    referenceModel: {
        type: String,
        enum: ['Billing', 'Purchase', 'Return'],
        required: true
    },
    batch: {
        number: String,
        manufacturingDate: Date,
        expiryDate: Date
    },
    location: {
        type: String,
        required: true
    },
    notes: String,
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
inventorySchema.index({ product: 1, shopkeeper: 1, created_at: -1 });

// Update timestamps
inventorySchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

// Static method to get current stock level
inventorySchema.statics.getCurrentStock = async function(productId, shopkeeperId) {
    const latestMovement = await this.findOne({
        product: productId,
        shopkeeper: shopkeeperId
    }).sort({ created_at: -1 });
    
    return latestMovement ? latestMovement.newQuantity : 0;
};

// Static method to get stock value
inventorySchema.statics.getStockValue = async function(shopkeeperId) {
    const stockValue = await this.aggregate([
        {
            $match: { shopkeeper: mongoose.Types.ObjectId(shopkeeperId) }
        },
        {
            $group: {
                _id: '$product',
                latestMovement: { $last: '$$ROOT' }
            }
        },
        {
            $project: {
                value: {
                    $multiply: ['$latestMovement.newQuantity', '$latestMovement.unitCost']
                }
            }
        },
        {
            $group: {
                _id: null,
                totalValue: { $sum: '$value' }
            }
        }
    ]);
    
    return stockValue.length > 0 ? stockValue[0].totalValue : 0;
};

module.exports = mongoose.model('Inventory', inventorySchema); 