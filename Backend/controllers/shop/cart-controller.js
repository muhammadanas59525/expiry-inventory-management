const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');

// Get user cart
const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find user cart or create if not exists
        let cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name price imageUrl quantity discount expiryDate description'
        });
        
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: []
            });
            await cart.save();
        }
        
        res.json({
            success: true,
            data: cart.items.map(item => ({
                _id: item._id,
                productId: item.product._id,
                name: item.product.name,
                price: item.product.price,
                imageUrl: item.product.imageUrl,
                quantity: item.quantity,
                stock: item.product.quantity,
                discount: item.product.discount,
                expiryDate: item.product.expiryDate,
                description: item.product.description
            }))
        });
    } catch (err) {
        console.error('Error getting cart:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to get cart'
        });
    }
};

// Add item to cart
const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;
        
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
        
        // Check if quantity is valid
        const requestedQuantity = quantity || 1;
        if (requestedQuantity > product.quantity) {
            return res.status(400).json({
                success: false,
                message: 'Requested quantity exceeds available stock'
            });
        }
        
        // Find user cart or create if not exists
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: []
            });
        }
        
        // Check if product already in cart
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        
        if (itemIndex > -1) {
            // Product exists in cart, update quantity
            cart.items[itemIndex].quantity += requestedQuantity;
        } else {
            // Product not in cart, add new item
            cart.items.push({
                product: productId,
                quantity: requestedQuantity
            });
        }
        
        await cart.save();
        
        // Return updated cart
        const updatedCart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name price imageUrl quantity discount expiryDate description'
        });
        
        res.status(200).json({
            success: true,
            message: 'Product added to cart',
            data: updatedCart.items.map(item => ({
                _id: item._id,
                productId: item.product._id,
                name: item.product.name,
                price: item.product.price,
                imageUrl: item.product.imageUrl,
                quantity: item.quantity,
                stock: item.product.quantity,
                discount: item.product.discount,
                expiryDate: item.product.expiryDate,
                description: item.product.description
            }))
        });
    } catch (err) {
        console.error('Error adding to cart:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart'
        });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        const { quantity } = req.body;
        
        // Validate request
        if (!itemId || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Item ID and quantity are required'
            });
        }
        
        // Find cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        // Find item in cart
        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }
        
        // Check if product has enough stock
        const product = await Product.findById(cart.items[itemIndex].product);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        if (quantity > product.quantity) {
            return res.status(400).json({
                success: false,
                message: 'Requested quantity exceeds available stock'
            });
        }
        
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
        
        await cart.save();
        
        res.status(200).json({
            success: true,
            message: 'Cart item updated',
            data: cart.items[itemIndex]
        });
    } catch (err) {
        console.error('Error updating cart item:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to update cart item'
        });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        
        // Find cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        // Remove item
        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        
        await cart.save();
        
        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: cart.items
        });
    } catch (err) {
        console.error('Error removing from cart:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart'
        });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Find cart
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        
        // Clear items
        cart.items = [];
        
        await cart.save();
        
        res.status(200).json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (err) {
        console.error('Error clearing cart:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart'
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};