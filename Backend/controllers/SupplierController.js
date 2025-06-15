const Supplier = require('../models/Supplier');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const SupplierController = {
    // Create a new supplier
    async create(req, res) {
        try {
            const { email } = req.body;
            
            // Check if email already exists
            const existingSupplier = await Supplier.findOne({
                email,
                shopkeeper: req.user._id
            });
            
            if (existingSupplier) {
                return res.status(400).json({
                    success: false,
                    message: 'Supplier with this email already exists'
                });
            }
            
            const supplier = new Supplier({
                ...req.body,
                shopkeeper: req.user._id
            });
            
            await supplier.save();
            
            res.status(201).json({
                success: true,
                data: supplier
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get all suppliers
    async getAll(req, res) {
        try {
            const { search, sort, limit = 10, page = 1 } = req.query;
            
            const query = {
                shopkeeper: req.user._id
            };
            
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }
            
            const sortOptions = {};
            if (sort) {
                const [field, order] = sort.split(':');
                sortOptions[field] = order === 'desc' ? -1 : 1;
            } else {
                sortOptions.company = 1;
            }
            
            const skip = (page - 1) * limit;
            
            const suppliers = await Supplier.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('products', 'name sku');
                
            const total = await Supplier.countDocuments(query);
            
            res.json({
                success: true,
                data: suppliers,
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

    // Get a single supplier
    async getOne(req, res) {
        try {
            const { id } = req.params;
            
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid supplier ID'
                });
            }
            
            const supplier = await Supplier.findOne({
                _id: id,
                shopkeeper: req.user._id
            }).populate('products', 'name sku price');
            
            if (!supplier) {
                return res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
            }
            
            res.json({
                success: true,
                data: supplier
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Update a supplier
    async update(req, res) {
        try {
            const { id } = req.params;
            
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid supplier ID'
                });
            }
            
            const supplier = await Supplier.findOneAndUpdate(
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
            
            if (!supplier) {
                return res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
            }
            
            res.json({
                success: true,
                data: supplier
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Delete a supplier
    async delete(req, res) {
        try {
            const { id } = req.params;
            
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid supplier ID'
                });
            }
            
            const supplier = await Supplier.findOneAndDelete({
                _id: id,
                shopkeeper: req.user._id
            });
            
            if (!supplier) {
                return res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Supplier deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get supplier credit status
    async getCreditStatus(req, res) {
        try {
            const { id } = req.params;
            
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid supplier ID'
                });
            }
            
            const supplier = await Supplier.findOne({
                _id: id,
                shopkeeper: req.user._id
            });
            
            if (!supplier) {
                return res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
            }
            
            res.json({
                success: true,
                data: supplier.getCreditStatus()
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Update supplier credit
    async updateCredit(req, res) {
        try {
            const { id } = req.params;
            const { amount, type } = req.body;
            
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid supplier ID'
                });
            }
            
            const supplier = await Supplier.findOne({
                _id: id,
                shopkeeper: req.user._id
            });
            
            if (!supplier) {
                return res.status(404).json({
                    success: false,
                    message: 'Supplier not found'
                });
            }
            
            if (type === 'increase') {
                supplier.currentCredit += amount;
            } else if (type === 'decrease') {
                supplier.currentCredit -= amount;
                if (supplier.currentCredit < 0) {
                    supplier.currentCredit = 0;
                }
            }
            
            await supplier.save();
            
            res.json({
                success: true,
                data: supplier.getCreditStatus()
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Get supplier statistics
    async getStats(req, res) {
        try {
            const stats = await Supplier.aggregate([
                {
                    $match: {
                        shopkeeper: new mongoose.Types.ObjectId(req.user._id)
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalCredit: { $sum: '$currentCredit' },
                        avgRating: { $avg: '$rating' }
                    }
                }
            ]);

            // Get total number of products supplied
            const totalProducts = await Supplier.aggregate([
                {
                    $match: {
                        shopkeeper: new mongoose.Types.ObjectId(req.user._id)
                    }
                },
                {
                    $project: {
                        productCount: { $size: '$products' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$productCount' }
                    }
                }
            ]);

            res.json({
                success: true,
                data: {
                    supplierStats: stats,
                    totalProducts: totalProducts[0]?.total || 0
                }
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = SupplierController; 