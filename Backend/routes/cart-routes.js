const express = require('express');
const { 
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} = require('../controllers/shop/cart-controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all cart routes
router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);  // Changed from /add to match frontend
router.put('/:itemId', updateCartItem);  // Changed from /update/:itemId
router.delete('/:itemId', removeFromCart);  // Changed from /remove/:itemId
router.delete('/clear', clearCart);

module.exports = router;