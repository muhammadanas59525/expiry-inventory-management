const express = require('express');
const router = express.Router();
const CartController = require('../controllers/shop/cart-controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all cart routes
router.use(authMiddleware);

// Get user's cart
router.get('/', CartController.getCart);

// Add item to cart
router.post('/', CartController.addToCart);

// Update cart item quantity
router.put('/:itemId', CartController.updateCartItem);

// Remove item from cart
router.delete('/:itemId', CartController.removeFromCart);

// Clear cart
router.delete('/', CartController.clearCart);

module.exports = router;