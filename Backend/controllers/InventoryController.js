const Inventory = require('../models/Inventory');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const InventoryController = {
    // Get inventory history for a product
    async getProductHistory(req, res) {
        try {
            const { productId } = req.params;
            const { startDate, endDate, type, limit = 10, page = 1 } = req.query;
            
            if (!isValidObjectId(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID'
                });
            }
            
            const query = {
                product: productId,
                shopkeeper: req.user._id
            };
            
            if (type) {
                query.type = type;
            }
            
            if (startDate || endDate) {
                query.created_at = {};
                if (startDate) query.created_at.$gte = new Date(startDate);
                if (endDate) query.created_at.$lte = new Date(endDate);
            }
            
            const skip = (page - 1) * limit;
            
            const movements = await Inventory.find(query)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('product', 'name sku');
                
            const total = await Inventory.countDocuments(query);
            
            res.json({
                success: true,
                data: movements,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get all inventory movements
    async getAllMovements(req, res) {
        try {
            const { startDate, endDate, type, search, limit = 10, page = 1 } = req.query;
            
            const query = {
                shopkeeper: req.user._id
            };
            
            if (type) {
                query.type = type;
            }
            
            if (startDate || endDate) {
                query.created_at = {};
                if (startDate) query.created_at.$gte = new Date(startDate);
                if (endDate) query.created_at.$lte = new Date(endDate);
            }
            
            if (search) {
                const products = await Product.find({
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { sku: { $regex: search, $options: 'i' } }
                    ]
                }).select('_id');
                
                query.product = { $in: products.map(p => p._id) };
            }
            
            const skip = (page - 1) * limit;
            
            const movements = await Inventory.find(query)
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('product', 'name sku');
                
            const total = await Inventory.countDocuments(query);
            
            res.json({
                success: true,
                data: movements,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get inventory value
    async getInventoryValue(req, res) {
        try {
            const value = await Inventory.getStockValue(req.user._id);
            
            res.json({
                success: true,
                data: {
                    value
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get low stock products
    async getLowStock(req, res) {
        try {
            const products = await Product.find({
                shopkeeper: req.user._id,
                'inventory.quantity': { $lte: '$inventory.lowStockThreshold' }
            }).populate('supplier', 'name company');
            
            res.json({
                success: true,
                data: products
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get inventory statistics
    async getStats(req, res) {
        try {
            const { startDate, endDate } = req.query;
            
            const query = {
                shopkeeper: req.user._id
            };
            
            if (startDate || endDate) {
                query.created_at = {};
                if (startDate) query.created_at.$gte = new Date(startDate);
                if (endDate) query.created_at.$lte = new Date(endDate);
            }
            
            const stats = await Inventory.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        totalQuantity: { $sum: '$quantity' },
                        totalCost: { $sum: '$totalCost' }
                    }
                }
            ]);
            
            // Get product count with low stock
            const lowStockCount = await Product.countDocuments({
                shopkeeper: req.user._id,
                'inventory.quantity': { $lte: '$inventory.lowStockThreshold' }
            });
            
            // Get total products
            const totalProducts = await Product.countDocuments({
                shopkeeper: req.user._id
            });
            
            res.json({
                success: true,
                data: {
                    movements: stats,
                    products: {
                        total: totalProducts,
                        lowStock: lowStockCount
                    }
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Create inventory adjustment
    async createAdjustment(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            const { productId, quantity, type, notes } = req.body;
            
            if (!isValidObjectId(productId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID'
                });
            }
            
            const product = await Product.findOne({
                _id: productId,
                shopkeeper: req.user._id
            });
            
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            const previousQuantity = product.inventory.quantity;
            let newQuantity;
            
            if (type === 'add') {
                newQuantity = previousQuantity + quantity;
            } else if (type === 'subtract') {
                newQuantity = previousQuantity - quantity;
                if (newQuantity < 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Insufficient stock'
                    });
                }
            } else {
                newQuantity = quantity;
            }
            
            // Update product inventory
            product.inventory.quantity = newQuantity;
            await product.save({ session });
            
            // Create inventory record
            const inventory = new Inventory({
                product: productId,
                shopkeeper: req.user._id,
                type: 'adjustment',
                quantity: Math.abs(newQuantity - previousQuantity),
                previousQuantity,
                newQuantity,
                unitCost: product.cost,
                totalCost: product.cost * Math.abs(newQuantity - previousQuantity),
                reference: 'Manual Adjustment',
                referenceModel: 'Product',
                location: 'Main Storage',
                notes
            });
            
            await inventory.save({ session });
            
            await session.commitTransaction();
            
            res.json({
                success: true,
                data: {
                    inventory,
                    product
                }
            });
        } catch (error) {
            await session.abortTransaction();
            
            res.status(400).json({
                success: false,
                message: error.message
            });
        } finally {
            session.endSession();
        }
    }
};

module.exports = InventoryController; 