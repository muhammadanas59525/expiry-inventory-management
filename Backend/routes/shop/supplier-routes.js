const express = require('express');
const router = express.Router();
const SupplierController = require('../../controllers/SupplierController');
const auth = require('../../middleware/auth');
const shopkeeper = require('../../middleware/shopkeeper');

// Apply authentication and shopkeeper middleware to all routes
router.use(auth, shopkeeper);

// Create a new supplier
router.post('/', SupplierController.create);

// Get all suppliers
router.get('/', SupplierController.getAll);

// Get supplier statistics
router.get('/stats/overview', SupplierController.getStats);

// Get a single supplier
router.get('/:id', SupplierController.getOne);

// Update a supplier
router.put('/:id', SupplierController.update);

// Delete a supplier
router.delete('/:id', SupplierController.delete);

module.exports = router; 