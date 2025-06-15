const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');

// Configure multer for product images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        console.log('Fetching all products for customers');
        const { category, search, sort, page = 1, limit = 10 } = req.query;
        const query = { isActive: true };

        // Apply filters
        if (category && category !== 'All') {
            query.category = category;
        }
        if (search) {
            query.$text = { $search: search };
        }

        // Apply sorting
        let sortOption = {};
        if (sort) {
            switch (sort) {
                case 'price_asc':
                    sortOption = { price: 1 };
                    break;
                case 'price_desc':
                    sortOption = { price: -1 };
                    break;
                case 'newest':
                    sortOption = { createdAt: -1 };
                    break;
                default:
                    sortOption = { createdAt: -1 };
            }
        }

        // Pagination
        const skip = (page - 1) * limit;
        const products = await Product.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('shopkeeperId', 'name email phone address');

        const total = await Product.countDocuments(query);

        console.log(`Found ${products.length} products`);
        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching products',
            error: err.message 
        });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            isActive: true
        }).populate('shopkeeperId', 'name email phone address');
        
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
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching product',
            error: err.message 
        });
    }
});

// Create product (shopkeeper only)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.role !== 'shopkeeper') {
            return res.status(403).json({ 
                success: false,
                message: 'Only shopkeepers can create products' 
            });
        }

        const {
            name,
            description,
            price,
            category,
            brand,
            stock,
            barcode,
            specifications
        } = req.body;

        const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];

        const product = new Product({
            name,
            description,
            price,
            category,
            brand,
            stock,
            barcode,
            specifications: JSON.parse(specifications || '{}'),
            images,
            shopkeeperId: req.user._id
        });

        await product.save();
        res.status(201).json({
            success: true,
            data: product
        });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error creating product',
            error: err.message 
        });
    }
});

// Update product (shopkeeper only)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            shopkeeperId: req.user._id
        });

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Product not found' 
            });
        }

        const {
            name,
            description,
            price,
            category,
            brand,
            stock,
            barcode,
            specifications,
            isActive
        } = req.body;

        // Update fields
        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = price;
        if (category) product.category = category;
        if (brand) product.brand = brand;
        if (stock !== undefined) product.stock = stock;
        if (barcode) product.barcode = barcode;
        if (specifications) product.specifications = JSON.parse(specifications);
        if (isActive !== undefined) product.isActive = isActive;

        // Handle new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
            product.images = [...product.images, ...newImages];
        }

        await product.save();
        res.json({
            success: true,
            data: product
        });
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error updating product',
            error: err.message 
        });
    }
});

// Delete product (shopkeeper only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            shopkeeperId: req.user._id
        });

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Product not found' 
            });
        }

        res.json({ 
            success: true,
            message: 'Product deleted successfully' 
        });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting product',
            error: err.message 
        });
    }
});

// Get shopkeeper's products
router.get('/shopkeeper/:shopkeeperId', async (req, res) => {
    try {
        const products = await Product.find({ 
            shopkeeperId: req.params.shopkeeperId,
            isActive: true 
        })
        .sort({ createdAt: -1 })
        .populate('shopkeeperId', 'name email phone address');

        res.json({
            success: true,
            data: products
        });
    } catch (err) {
        console.error('Error fetching shopkeeper products:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching shopkeeper products',
            error: err.message 
        });
    }
});

module.exports = router; 