const Wishlist = require('../../models/wishlist.model');
const Product = require('../../models/Product');
const User = require('../../models/User');

// Get wishlist
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find user wishlist or create if not exists
        let wishlist = await Wishlist.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name price imageUrl quantity discount expiryDate description'
        });
        
        if (!wishlist) {
            wishlist = new Wishlist({
                user: userId,
                items: []
            });
            await wishlist.save();
        }
        
        res.json({
            success: true,
            data: wishlist.items.map(item => ({
                _id: item._id,
                productId: item.product._id,
                name: item.product.name,
                price: item.product.price,
                imageUrl: item.product.imageUrl,
                discount: item.product.discount,
                expiryDate: item.product.expiryDate
            }))
        });
    } catch (err) {
        console.error('Error getting wishlist:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to get wishlist'
        });
    }
};

// Add to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;
        
        // Validate request
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }
        
        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Find user wishlist or create if not exists
        let wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            wishlist = new Wishlist({
                user: userId,
                items: []
            });
        }
        
        // Check if product already in wishlist
        const exists = wishlist.items.some(item => 
            item.product.toString() === productId
        );
        
        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }
        
        // Add to wishlist
        wishlist.items.push({
            product: productId
        });
        
        await wishlist.save();
        
        // Return updated wishlist
        const updatedWishlist = await Wishlist.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name price imageUrl quantity discount expiryDate description'
        });
        
        res.status(200).json({
            success: true,
            message: 'Product added to wishlist',
            data: updatedWishlist.items.map(item => ({
                _id: item._id,
                productId: item.product._id,
                name: item.product.name,
                price: item.product.price,
                imageUrl: item.product.imageUrl,
                discount: item.product.discount,
                expiryDate: item.product.expiryDate
            }))
        });
    } catch (err) {
        console.error('Error adding to wishlist:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to wishlist'
        });
    }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;
        
        // Find wishlist
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }
        
        // Remove item
        // Check if itemId is a product ID or wishlist item ID
        const isProductId = wishlist.items.some(item => item.product.toString() === itemId);
        
        if (isProductId) {
            // Filter by product ID
            wishlist.items = wishlist.items.filter(item => item.product.toString() !== itemId);
        } else {
            // Filter by wishlist item ID
            wishlist.items = wishlist.items.filter(item => item._id.toString() !== itemId);
        }
        
        await wishlist.save();
        
        res.status(200).json({
            success: true,
            message: 'Item removed from wishlist'
        });
    } catch (err) {
        console.error('Error removing from wishlist:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from wishlist'
        });
    }
};

// Clear wishlist
const clearWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find wishlist
        const wishlist = await Wishlist.findOne({ user: userId });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }
        
        // Clear wishlist
        wishlist.items = [];
        await wishlist.save();
        
        res.json({
            success: true,
            message: 'Wishlist cleared successfully'
        });
    } catch (err) {
        console.error('Error clearing wishlist:', err);
        res.status(500).json({
            success: false,
            message: 'Error clearing wishlist'
        });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist
};