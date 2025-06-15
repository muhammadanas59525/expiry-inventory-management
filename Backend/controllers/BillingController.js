const Billing = require('../models/Billing');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const BillingController = {
    // Create a new bill
    async create(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            const { customer, items, paymentMethod, notes, dueDate } = req.body;
            
            // Calculate totals
            let subtotal = 0;
            let taxTotal = 0;
            let discountTotal = 0;
            
            // Validate and process items
            const processedItems = [];
            for (const item of items) {
                const product = await Product.findOne({
                    _id: item.product,
                    shopkeeper: req.user._id
                });
                
                if (!product) {
                    throw new Error(`Product not found: ${item.product}`);
                }
                
                if (product.inventory.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for product: ${product.name}`);
                }
                
                const itemSubtotal = item.quantity * product.price;
                const itemTax = (itemSubtotal * product.tax) / 100;
                
                processedItems.push({
                    product: product._id,
                    quantity: item.quantity,
                    price: product.price,
                    tax: product.tax,
                    discount: item.discount || 0,
                    subtotal: itemSubtotal
                });
                
                subtotal += itemSubtotal;
                taxTotal += itemTax;
                discountTotal += item.discount || 0;
                
                // Update inventory
                product.inventory.quantity -= item.quantity;
                await product.save({ session });
                
                // Create inventory record
                const inventory = new Inventory({
                    product: product._id,
                    shopkeeper: req.user._id,
                    type: 'sale',
                    quantity: item.quantity,
                    previousQuantity: product.inventory.quantity + item.quantity,
                    newQuantity: product.inventory.quantity,
                    unitCost: product.cost,
                    totalCost: product.cost * item.quantity,
                    reference: 'Sale',
                    referenceModel: 'Billing',
                    location: 'Main Storage'
                });
                
                await inventory.save({ session });
            }
            
            const total = subtotal + taxTotal - discountTotal;
            
            const billing = new Billing({
                shopkeeper: req.user._id,
                customer,
                items: processedItems,
                subtotal,
                taxTotal,
                discountTotal,
                total,
                paymentMethod,
                notes,
                dueDate,
                status: 'issued'
            });
            
            await billing.save({ session });
            
            await session.commitTransaction();
            
            res.status(201).json({
                success: true,
                data: billing
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
    },

    // Get all bills for a shopkeeper
    async getAll(req, res) {
        try {
            const { status, startDate, endDate, search, sort, limit = 10, page = 1 } = req.query;
            
            const query = {
                shopkeeper: req.user._id
            };
            
            if (status) {
                query.status = status;
            }
            
            if (startDate || endDate) {
                query.created_at = {};
                if (startDate) query.created_at.$gte = new Date(startDate);
                if (endDate) query.created_at.$lte = new Date(endDate);
            }
            
            if (search) {
                query.$or = [
                    { billNumber: { $regex: search, $options: 'i' } },
                    { 'customer.name': { $regex: search, $options: 'i' } },
                    { 'customer.phone': { $regex: search, $options: 'i' } }
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
            
            const bills = await Billing.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('items.product', 'name sku');
                
            const total = await Billing.countDocuments(query);
            
            res.json({
                success: true,
                data: bills,
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

    // Get a single bill
    async getOne(req, res) {
        try {
            const { id } = req.params;
            
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid bill ID'
                });
            }
            
            const bill = await Billing.findOne({
                _id: id,
                shopkeeper: req.user._id
            }).populate('items.product', 'name sku price tax');
            
            if (!bill) {
                return res.status(404).json({
                    success: false,
                    message: 'Bill not found'
                });
            }
            
            res.json({
                success: true,
                data: bill
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Update bill status
    async updateStatus(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            const { id } = req.params;
            const { status, paymentStatus, transactionId } = req.body;
            
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid bill ID'
                });
            }
            
            const bill = await Billing.findOne({
                _id: id,
                shopkeeper: req.user._id
            });
            
            if (!bill) {
                return res.status(404).json({
                    success: false,
                    message: 'Bill not found'
                });
            }
            
            // Handle cancellation
            if (status === 'cancelled' && bill.status !== 'cancelled') {
                // Restore inventory
                for (const item of bill.items) {
                    const product = await Product.findById(item.product);
                    product.inventory.quantity += item.quantity;
                    await product.save({ session });
                    
                    // Create inventory record
                    const inventory = new Inventory({
                        product: item.product,
                        shopkeeper: req.user._id,
                        type: 'return',
                        quantity: item.quantity,
                        previousQuantity: product.inventory.quantity - item.quantity,
                        newQuantity: product.inventory.quantity,
                        unitCost: product.cost,
                        totalCost: product.cost * item.quantity,
                        reference: 'Bill Cancelled',
                        referenceModel: 'Billing',
                        location: 'Main Storage'
                    });
                    
                    await inventory.save({ session });
                }
            }
            
            bill.status = status;
            if (paymentStatus) bill.paymentStatus = paymentStatus;
            if (transactionId) bill.transactionId = transactionId;
            bill.updated_at = Date.now();
            
            await bill.save({ session });
            
            await session.commitTransaction();
            
            res.json({
                success: true,
                data: bill
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
    },

    // Get billing statistics
    async getStats(req, res) {
        try {
            const { startDate, endDate } = req.query;
            
            const query = {
                shopkeeper: req.user._id,
                status: { $ne: 'cancelled' }
            };
            
            if (startDate || endDate) {
                query.created_at = {};
                if (startDate) query.created_at.$gte = new Date(startDate);
                if (endDate) query.created_at.$lte = new Date(endDate);
            }
            
            const stats = await Billing.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: '$total' },
                        totalTax: { $sum: '$taxTotal' },
                        totalDiscount: { $sum: '$discountTotal' },
                        averageBillValue: { $avg: '$total' },
                        billCount: { $sum: 1 },
                        itemsSold: {
                            $sum: {
                                $reduce: {
                                    input: '$items',
                                    initialValue: 0,
                                    in: { $add: ['$$value', '$$this.quantity'] }
                                }
                            }
                        }
                    }
                }
            ]);
            
            // Get payment method distribution
            const paymentStats = await Billing.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: '$paymentMethod',
                        count: { $sum: 1 },
                        total: { $sum: '$total' }
                    }
                }
            ]);
            
            res.json({
                success: true,
                data: {
                    summary: stats[0] || {
                        totalSales: 0,
                        totalTax: 0,
                        totalDiscount: 0,
                        averageBillValue: 0,
                        billCount: 0,
                        itemsSold: 0
                    },
                    paymentMethods: paymentStats
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

module.exports = BillingController; 