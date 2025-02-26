const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    serialNumber: { type: Number, required: false },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    manufactureDate: { type: Date, required: true },
    imageUrl: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
