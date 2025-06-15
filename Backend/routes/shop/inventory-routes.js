const express = require('express');
const router = express.Router();
const InventoryController = require('../../controllers/InventoryController');
const auth = require('../../middleware/auth');
const shopkeeper = require('../../middleware/shopkeeper');

// Apply authentication and shopkeeper middleware to all routes
router.use(auth, shopkeeper);

// Get inventory history for a product
router.get('/product/:productId', InventoryController.getProductHistory);

// Get all inventory movements
router.get('/', InventoryController.getAllMovements);

// Get inventory value
router.get('/value', InventoryController.getInventoryValue);

// Get low stock products
router.get('/low-stock', InventoryController.getLowStock);

// Get inventory statistics
router.get('/stats', InventoryController.getStats);

// Create inventory adjustment
router.post('/adjust', InventoryController.createAdjustment);

module.exports = router; 