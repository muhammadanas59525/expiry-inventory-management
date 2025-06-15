const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Debug middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Headers:', req.headers['content-type']);
    next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const userRoutes = require('./routes/user-routes');
const productRoutes = require('./routes/shop/product-routes');
const publicProductRoutes = require('./routes/product-routes');
const cartRoutes = require('./routes/cart-routes');
const wishlistRoutes = require('./routes/wishlist-routes');

// API routes
app.use('/api/users', userRoutes);
app.use('/api/shop/products', productRoutes);
app.use('/api/products', publicProductRoutes);  // Public product route for customers
app.use('/api/cart', cartRoutes);  // Cart routes
app.use('/api/wishlist', wishlistRoutes);  // Wishlist routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    res.status(500).json({ 
        success: false,
        message: err.message || 'Something broke!' 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Static files are served from: ${path.join(__dirname, 'public')}`);
});