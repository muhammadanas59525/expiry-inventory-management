const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const ProductController = {
    // Create a new product
    async create(req, res) {
        try {
            const { name, description, price, category, sku, cost, tax, supplier } = req.body;
            
            // Check if SKU already exists for this shopkeeper
            const existingProduct = await Product.findOne({
                sku,
                shopkeeper: req.user._id
            });
            
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'SKU already exists'
                });
            }
            
            const product = new Product({
                ...req.body,
                shopkeeper: req.user._id
            });
            
            await product.save();
            
            // Create initial inventory record
            const inventory = new Inventory({
                product: product._id,
                shopkeeper: req.user._id,
                type: 'adjustment',
                quantity: product.inventory.quantity || 0,
                previousQuantity: 0,
                newQuantity: product.inventory.quantity || 0,
                unitCost: product.cost,
                totalCost: (product.cost * (product.inventory.quantity || 0)),
                reference: 'Initial Stock',
                referenceModel: 'Product',
                location: 'Main Storage'
            });
            
            await inventory.save();
            
            res.status(201).json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get all products for a shopkeeper
    async getAll(req, res) {
        try {
            const { category, search, sort, limit = 10, page = 1 } = req.query;
            
            const query = {
                shopkeeper: req.user._id
            };
            
            if (category) {
                query.category = category;
            }
            
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { sku: { $regex: search, $options: 'i' } }
                ];
            }
            
            const sortOptions = {};
            if (sort) {
                const [field, order] = sort.split(':');
                sortOptions[field] = order === 'desc' ? -1 : 1;
            } else {
                sortOptions.created_at = -1;
            }
            
            const skip = (page - 1) * limit;
            
            const products = await Product.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit));
                
            const total = await Product.countDocuments(query);
            
            res.json({
                success: true,
                data: products,
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

    // Get a single product
    async getOne(req, res) {
        try {
            const { id } = req.params;
            
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID'
                });
            }
            
            const product = await Product.findOne({
                _id: id,
                shopkeeper: req.user._id
            }).populate('supplier', 'name company');
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Update a product
    async update(req, res) {
        try {
            const { id } = req.params;
            
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID'
                });
            }
            
            const product = await Product.findOneAndUpdate(
                {
                    _id: id,
                    shopkeeper: req.user._id
                },
                {
                    ...req.body,
                    updated_at: Date.now()
                },
                { new: true }
            );
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Delete a product
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID'
                });
            }
            
            const product = await Product.findOneAndDelete({
                _id: id,
                shopkeeper: req.user._id
            });
            
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }
            
            // Delete related inventory records
            await Inventory.deleteMany({
                product: id
            });
            
            res.json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Update product inventory
    async updateInventory(req, res) {
        try {
            const { id } = req.params;
            const { quantity, type, notes } = req.body;
            
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID'
                });
            }
            
            const product = await Product.findOne({
                _id: id,
                shopkeeper: req.user._id
            });
            
            if (!product) {
                return res.status(404).json({
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
            await product.save();
            
            // Create inventory record
            const inventory = new Inventory({
                product: id,
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
            
            await inventory.save();
            
            res.json({
                success: true,
                data: {
                    product,
                    inventory
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
    }
};

module.exports = ProductController; 