const express = require('express');
const { 
    getWishlist,
    addToWishlist,
    removeFromWishlist
} = require('../controllers/shop/wishlist-controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all wishlist routes
router.use(protect);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/:itemId', removeFromWishlist);

module.exports = router;