const express = require('express');
const router = express.Router();
const BillingController = require('../../controllers/BillingController');
const auth = require('../../middleware/auth');
const shopkeeper = require('../../middleware/shopkeeper');

// Apply authentication and shopkeeper middleware to all routes
router.use(auth, shopkeeper);

// Create a new bill
router.post('/', BillingController.create);

// Get all bills
router.get('/', BillingController.getAll);

// Get billing statistics
router.get('/stats', BillingController.getStats);

// Get a single bill
router.get('/:id', BillingController.getOne);

// Update bill status
router.patch('/:id/status', BillingController.updateStatus);

module.exports = router;