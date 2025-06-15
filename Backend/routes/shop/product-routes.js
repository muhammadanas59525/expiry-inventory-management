const express = require('express');
const router = express.Router();
const productController = require('../../controllers/shop/product-controller');
const auth = require('../../middleware/auth');
const shopkeeper = require('../../middleware/shopkeeper');

// Debug middleware to log all routes
router.use((req, res, next) => {
    console.log(`[Product Routes] ${req.method} ${req.url} - params:`, req.params);
    if (req.method !== 'GET') {
        console.log('[Product Routes] Request body:', req.body);
    }
    next();
});

// Test endpoint without auth
router.post('/test', (req, res) => {
    console.log('Test endpoint reached');
    console.log('Request body:', req.body);
    
    try {
        res.status(200).json({
            success: true,
            message: 'Test endpoint successful',
            receivedData: req.body
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Test endpoint error'
        });
    }
});

// TEMPORARY: Bypassing auth for testing
// router.use(auth, shopkeeper);

// Create a new product
router.post('/', productController.addProduct);

// Get all products
router.get('/', productController.getProducts);

// Get a single product
router.get('/:id', productController.getProduct);

// Update a product
router.patch('/:id', productController.updateProduct);

// Delete a product
router.delete('/:id', productController.deleteProduct);

// Update product stock after a sale
router.post('/update-stock', productController.updateStock);

// Create a bill
router.post('/bills', productController.createBill);

module.exports = router;