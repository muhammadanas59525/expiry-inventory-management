import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { PiHeartFill } from "react-icons/pi";
import { GrPowerCycle } from "react-icons/gr";
import { FaTruck } from "react-icons/fa";
import './ProductDetailsCust.css';
import { image } from 'framer-motion/client';

const ProductDetailsCust = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams(); // Get product ID from URL params
    
    // State variables
    const [product, setProduct] = useState(location.state?.product || null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(!location.state?.product);
    const [error, setError] = useState(null);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
    const [message, setMessage] = useState(null);

    // Fetch product if not available in location state
    useEffect(() => {
        const fetchProduct = async () => {
            if (!product && id) {
                try {
                    setLoading(true);
                    console.log("Fetching product with ID:", id);
                    
                    const token = localStorage.getItem('token');
                    if (!token) {
                        setError("Authentication required. Please login to view product details.");
                        setLoading(false);
                        return;
                    }
                    
                    const response = await axios.get(`http://localhost:3000/api/shop/products/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.data.success) {
                        console.log("Product data fetched:", response.data.data);
                        setProduct(response.data.data);
                    } else {
                        setError("Failed to load product details");
                    }
                } catch (err) {
                    console.error("Error fetching product:", err);
                    setError("Failed to load product details");
                } finally {
                    setLoading(false);
                }
            }
        };
        
        fetchProduct();
    }, [id, product]);

    const handleQuantityChange = (newQty) => {
        if (newQty < 1) newQty = 1;
        if (product.quantity && newQty > product.quantity) newQty = product.quantity;
        setQuantity(newQty);
    };

  // Update your handleAddToCart function similarly
const handleAddToCart = async () => {
    try {
        setIsAddingToCart(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            setMessage({
                text: 'Please log in to add items to your cart',
                type: 'error'
            });
            setTimeout(() => setMessage(null), 3000);
            navigate('/login');
            return;
        }
        
        // Check if product object and ID exist
        if (!product || !product._id) {
            setMessage({
                text: 'Product information is missing',
                type: 'error'
            });
            setTimeout(() => setMessage(null), 3000);
            return;
        }
        
        console.log("Adding to cart:", { productId: product._id, quantity });
        
        const response = await axios.post(
            'http://localhost:3000/api/cart',
            {
                productId: product._id,
                quantity: quantity
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
        console.log("Cart response:", response.data);
        
        setMessage({
            text: 'Product added to cart',
            type: 'success'
        });
        setTimeout(() => setMessage(null), 3000);
    } catch (err) {
        console.error('Error adding to cart:', err);
        
        // Log more detailed error information
        if (err.response) {
            console.error('Error response data:', err.response.data);
            console.error('Error response status:', err.response.status);
        }
        
        setMessage({
            text: err.response?.data?.message || 'Failed to add item to cart',
            type: 'error'
        });
        setTimeout(() => setMessage(null), 3000);
    } finally {
        setIsAddingToCart(false);
    }
};

// Update your handleAddToWishlist function
// Fix the handleAddToWishlist function
const handleAddToWishlist = async () => {
    try {
        setIsAddingToWishlist(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            setMessage({
                text: 'Please log in to add items to your wishlist',
                type: 'error'
            });
            setTimeout(() => setMessage(null), 3000);
            navigate('/login');
            return;
        }
        
        console.log("Adding to wishlist:", {
            productId: product._id
        });
        
        const response = await axios.post(
            'http://localhost:3000/api/wishlist',
            {
                productId: product._id  // Make sure to send as an object with productId property
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );
        
        console.log("Wishlist response:", response.data);
        
        setMessage({
            text: 'Product added to wishlist',
            type: 'success'
        });
        setTimeout(() => setMessage(null), 3000);
    } catch (err) {
        console.error('Error adding to wishlist:', err);
        
        // Log more detailed error information
        if (err.response) {
            console.error('Error response data:', err.response.data);
            console.error('Error response status:', err.response.status);
        }
        
        setMessage({
            text: err.response?.data?.message || 'Failed to add item to wishlist',
            type: 'error'
        });
        setTimeout(() => setMessage(null), 3000);
    } finally {
        setIsAddingToWishlist(false);
    }
};

    const viewCart = () => {
        navigate('/customer/cart');
    };

    if (loading) {
        return (
            <div className="product-detail-container">
                <div className="loading-spinner">Loading product details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-detail-container">
                <div className="error-message">{error}</div>
                <button className="back-button" onClick={() => navigate('/customer')}>
                    Back to Products
                </button>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-container">
                <div className="error-message">Product not found</div>
                <button className="back-button" onClick={() => navigate('/customer')}>
                    Back to Products
                </button>
            </div>
        );
    }

    // Calculate days until expiry
    const getDaysUntilExpiry = () => {
        if (!product.expiryDate) return null;
        
        const today = new Date();
        const expiry = new Date(product.expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };
    
    // Get discount based on expiry
    const getDiscount = () => {
        const daysToExpiry = getDaysUntilExpiry();
        if (!daysToExpiry || daysToExpiry > 30) return 0;
        
        if (daysToExpiry <= 5) {
            return 50;
        } else if (daysToExpiry <= 15) {
            return 30;
        } else {
            return 15;
        }
    };
    
    const discount = product.discount || getDiscount();
    const discountedPrice = discount > 0 
        ? (product.price * (1 - discount / 100)).toFixed(2)
        : product.price.toFixed(2);

    return (
        <div className="product-detail-container">
            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}
            
            <div className="product-breadcrumb">
                <span onClick={() => navigate('/customer')}>Home</span>
                <span> / </span>
                <span onClick={() => navigate('/customer', { state: { category: product.category } })}>
                    {product.category}
                </span>
                <span> / </span>
                <span>{product.name}</span>
            </div>
            
            <div className="product-detail-content">
            <div className="product-image">
                <img src={product.imageUrl|| product.image } alt={product.name} />
                
                {getDaysUntilExpiry() && getDaysUntilExpiry() <= 30 && (
                    <div className={`expiry-badge ${getDaysUntilExpiry() <= 5 ? 'urgent' : ''}`}>
                        {getDaysUntilExpiry() <= 5 
                            ? `Expires in ${getDaysUntilExpiry()} days!` 
                            : `Expires soon: ${getDaysUntilExpiry()} days left`
                        }
                    </div>
                )}
            </div>
                
                <div className="product-info">
                    <h1 className="product-name">{product.name}</h1>
                    
                    <div className="product-price">
                        {discount > 0 && (
                            <span className="original-price">${product.price.toFixed(2)}</span>
                        )}
                        <span className="current-price">${discountedPrice}</span>
                        {discount > 0 && (
                            <span className="discount-badge">{discount}% OFF</span>
                        )}
                    </div>
                    
                    <div className="product-description">
                        <p>{product.description}</p>
                    </div>
                    
                    <div className="product-meta">
                        <div className="meta-item">
                            <span className="meta-label">Category:</span>
                            <span className="meta-value">{product.category}</span>
                        </div>
                        
                        <div className="meta-item">
                            <span className="meta-label">Availability:</span>
                            <span className={`meta-value ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {product.quantity > 0 ? `In Stock (${product.quantity} available)` : 'Out of Stock'}
                            </span>
                        </div>
                        
                        {product.expiryDate && (
                            <div className="meta-item">
                                <span className="meta-label">Expiry Date:</span>
                                <span className="meta-value">
                                    {new Date(product.expiryDate).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                    
                    <div className="quantity-selector">
                        <span className="quantity-label">Quantity:</span>
                        <div className="quantity-controls">
                            <button 
                                className="quantity-btn" 
                                onClick={() => handleQuantityChange(quantity - 1)}
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <input 
                                type="number" 
                                min="1" 
                                max={product.quantity || 99}
                                value={quantity}
                                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                className="quantity-input"
                            />
                            <button 
                                className="quantity-btn"
                                onClick={() => handleQuantityChange(quantity + 1)}
                                disabled={product.quantity && quantity >= product.quantity}
                            >
                                +
                            </button>
                        </div>
                    </div>
                    
                    <div className="product-actions">
                        <button 
                            className="add-to-cart-btn"
                            onClick={handleAddToCart}
                            disabled={!product.quantity || product.quantity <= 0 || isAddingToCart}
                        >
                            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                        </button>
                        <button 
                            className="add-to-wishlist-btn"
                            onClick={handleAddToWishlist}
                            disabled={isAddingToWishlist}
                        >
                            <PiHeartFill /> {isAddingToWishlist ? 'Adding...' : 'Add to Wishlist'}
                        </button>
                    </div>

                    <button 
                        className="add-cart-btn"
                        onClick={viewCart}
                    >
                        View Cart
                    </button>
                    
                    <div className="shipping-info">
                        <div className="shipping-item">
                            <FaTruck className="shipping-icon" />
                            <div>
                                <h4>Free Delivery</h4>
                                <p>For orders over $50</p>
                            </div>
                        </div>
                        
                        <div className="shipping-item">
                            <GrPowerCycle className="shipping-icon" />
                            <div>
                                <h4>Easy Returns</h4>
                                <p>7 days return policy</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsCust;