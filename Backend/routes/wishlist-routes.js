const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/shop/wishlist-controller');
const authMiddleware = require('../middleware/auth.middleware');

// Apply auth middleware to all wishlist routes
router.use(authMiddleware);

// Get user's wishlist
router.get('/', WishlistController.getWishlist);

// Add item to wishlist
router.post('/', WishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/:itemId', WishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/', WishlistController.clearWishlist);

module.exports = router;