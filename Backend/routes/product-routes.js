const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// Public route - Get all active products (no auth required)
router.get('/', async (req, res) => {
    try {
        // Query parameters for filtering
        const { category, search, minPrice, maxPrice, sort, shopkeeper } = req.query;
        
        // Build filter
        let filter = { 
            active: true,  // Only return active products
            // Add more conditions like 'quantity > 0' if you want to only show in-stock items
        };
        
        // Add category filter if provided
        if (category && category !== 'All') {
            filter.category = category;
        }
        
        // Add shopkeeper filter if provided
        if (shopkeeper) {
            filter.shopkeeper = shopkeeper;
        }
        
        // Add search filter if provided
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Add price filter if provided
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        // Build sort
        let sortOption = {};
        if (sort) {
            switch (sort) {
                case 'price-asc':
                    sortOption = { price: 1 };
                    break;
                case 'price-desc':
                    sortOption = { price: -1 };
                    break;
                case 'newest':
                    sortOption = { createdAt: -1 };
                    break;
                case 'popularity':
                    sortOption = { sold: -1 };
                    break;
                default:
                    sortOption = { createdAt: -1 };
            }
        } else {
            sortOption = { createdAt: -1 }; // Default sort by newest
        }
        
        console.log('Public products filter:', filter);
        console.log('Public products sort:', sortOption);
        
        // Get paginated products
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const products = await Product.find(filter)
            .populate('shopkeeper', 'name email phone address') // Include shopkeeper info
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .select('-__v'); // Exclude version field
        
        const total = await Product.countDocuments(filter);
        
        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

// Get a single product by ID (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findOne({ 
            _id: id,
            active: true // Only return active products
        })
        .populate('shopkeeper', 'name email phone address') // Include shopkeeper info
        .select('-__v');
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or inactive'
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// Get products by shopkeeper ID (public)
router.get('/shopkeeper/:shopkeeperId', async (req, res) => {
    try {
        const { shopkeeperId } = req.params;
        const { category, search, minPrice, maxPrice, sort } = req.query;
        
        // Build filter
        let filter = { 
            shopkeeper: shopkeeperId,
            active: true  // Only return active products
        };
        
        // Add category filter if provided
        if (category && category !== 'All') {
            filter.category = category;
        }
        
        // Add search filter if provided
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Add price filter if provided
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        
        // Build sort
        let sortOption = {};
        if (sort) {
            switch (sort) {
                case 'price-asc':
                    sortOption = { price: 1 };
                    break;
                case 'price-desc':
                    sortOption = { price: -1 };
                    break;
                case 'newest':
                    sortOption = { createdAt: -1 };
                    break;
                default:
                    sortOption = { createdAt: -1 };
            }
        } else {
            sortOption = { createdAt: -1 }; // Default sort by newest
        }
        
        // Get paginated products
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const products = await Product.find(filter)
            .populate('shopkeeper', 'name email phone address') // Include shopkeeper info
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .select('-__v');
        
        const total = await Product.countDocuments(filter);
        
        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Error fetching shopkeeper products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching shopkeeper products',
            error: error.message
        });
    }
});

module.exports = router; 