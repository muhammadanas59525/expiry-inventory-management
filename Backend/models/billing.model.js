const mongoose=require('mongoose');

const billingSchema = new mongoose.Schema({
    user_id: {  // user_id is the id of the user who made the purchase
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    total: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        required: true,
        default: Date.now
    }
},{timestamps:true});

module.exports = mongoose.model('Billing', billingSchema);