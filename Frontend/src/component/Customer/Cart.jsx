import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CartItems = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCartAndWishlist();
    }, []);

    const fetchCartAndWishlist = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                navigate('/login');
                return;
            }
            
            // Fetch cart items
            const cartResponse = await axios.get('http://localhost:3000/api/cart', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Raw Cart API response:', cartResponse.data);
            
            // Fetch wishlist items
            const wishlistResponse = await axios.get('http://localhost:3000/api/wishlist', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Raw Wishlist API response:', wishlistResponse.data);
            
            // Add detailed debugging to understand the data structure
            if (cartResponse.data && cartResponse.data.success && Array.isArray(cartResponse.data.data)) {
                console.log('Cart items array structure:', cartResponse.data.data);
                
                // Print first item structure if available
                if (cartResponse.data.data.length > 0) {
                    console.log('First cart item structure:', JSON.stringify(cartResponse.data.data[0], null, 2));
                }
                
                // Try to adapt to the actual structure returned by the API
                let processedCartItems = cartResponse.data.data.map(item => {
                    // If item directly contains product details
                    if (item.name && item.price) {
                        return {
                            _id: item._id,
                            quantity: item.quantity || 1,
                            product: {
                                _id: item._id,
                                name: item.name,
                                price: item.price,
                                imageUrl: item.imageUrl,
                                discount: item.discount || 0,
                                expiryDate: item.expiryDate,
                                category: item.category
                            }
                        };
                    }
                    // If item has a product property (nested)
                    else if (item.product) {
                        return item;
                    }
                    // If item is just a product ID reference
                    else if (item.productId) {
                        return {
                            _id: item._id,
                            quantity: item.quantity || 1,
                            product: {
                                _id: item.productId,
                                name: "Product " + item.productId,
                                price: 0,
                                imageUrl: "https://via.placeholder.com/150",
                                discount: 0
                            }
                        };
                    }
                    return null;
                }).filter(item => item !== null);
                
                setCart(processedCartItems);
            } else {
                console.log('No valid cart data structure found');
                setCart([]);
            }
            
            // Process wishlist similarly
            if (wishlistResponse.data && wishlistResponse.data.success && Array.isArray(wishlistResponse.data.data)) {
                let processedWishlistItems = wishlistResponse.data.data.map(item => {
                    // If item directly contains product details
                    if (item.name && item.price) {
                        return {
                            _id: item._id,
                            product: {
                                _id: item._id,
                                name: item.name,
                                price: item.price,
                                imageUrl: item.imageUrl,
                                discount: item.discount || 0
                            }
                        };
                    }
                    // If item has a product property
                    else if (item.product) {
                        return item;
                    }
                    // If item has productId
                    else if (item.productId) {
                        return {
                            _id: item._id,
                            product: {
                                _id: item.productId,
                                name: "Product " + item.productId,
                                price: 0,
                                imageUrl: "https://via.placeholder.com/150",
                                discount: 0
                            }
                        };
                    }
                    return null;
                }).filter(item => item !== null);
                
                setWishlist(processedWishlistItems);
            } else {
                console.log('No valid wishlist data structure found');
                setWishlist([]);
            }
        } catch (err) {
            console.error('Error fetching cart and wishlist:', err);
            setError('Failed to load your cart and wishlist');
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = () => {
        if (cart.length === 0) {
            toast.info("Your cart is empty");
            return;
        }
        navigate('/customer/checkout', { state: { cart } });
    };

    const handleDelete = async (item) => {
        try {
            const token = localStorage.getItem('token');
            
            await axios.delete(`http://localhost:3000/api/cart/${item._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setCart(cart.filter(cartItem => cartItem._id !== item._id));
            toast.success("Item removed from cart");
        } catch (err) {
            console.error('Error removing item from cart:', err);
            toast.error("Failed to remove item from cart");
        }
    };

    const handleDeleteFromWishlist = async (item) => {
        try {
            const token = localStorage.getItem('token');
            
            await axios.delete(`http://localhost:3000/api/wishlist/${item._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setWishlist(wishlist.filter(wishlistItem => wishlistItem._id !== item._id));
            toast.success("Item removed from wishlist");
        } catch (err) {
            console.error('Error removing item from wishlist:', err);
            toast.error("Failed to remove item from wishlist");
        }
    };

    const handleMoveToCart = async (item) => {
        try {
            const token = localStorage.getItem('token');
            
            // Add to cart
            await axios.post(
                'http://localhost:3000/api/cart',
                { 
                    productId: item.product._id, 
                    quantity: 1 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Remove from wishlist
            await axios.delete(`http://localhost:3000/api/wishlist/${item._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Refresh data
            fetchCartAndWishlist();
            toast.success("Item moved to cart");
        } catch (err) {
            console.error('Error moving item to cart:', err);
            toast.error("Failed to move item to cart");
        }
    };
    
    const calculateDiscountedPrice = (item) => {
        if (!item || !item.product) return "0.00";
        
        const price = item.product.price || 0;
        const discount = item.product.discount || 0;
        return (price * (1 - discount / 100)).toFixed(2);
    };

    // Calculate totals with safety checks
    const totalAmount = cart.reduce((total, item) => {
        if (!item || !item.product) return total;
        
        const price = parseFloat(calculateDiscountedPrice(item));
        const quantity = item.quantity || 1;
        
        return total + (price * quantity);
    }, 0).toFixed(2);

    const totalCount = cart.reduce((count, item) => {
        return count + (item?.quantity || 0);
    }, 0);

    if (loading) {
        return (
            <div className="cart-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-container">
                <div className="error-message">
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={() => fetchCartAndWishlist()}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <ToastContainer position="top-right" autoClose={300} />

            {loading && (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading your cart...</p>
                </div>
            )}
            
            {error && (
                <div className="error-message">
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={() => fetchCartAndWishlist()}>Try Again</button>
                </div>
            )}
            
            {!loading && !error && (
                <>
            
            <div className="cart-header">
                <h1>Your Shopping Cart</h1>
                <span className="item-count">{totalCount} items</span>
            </div>
            
            <div className="cart-content">
                <div className="cart-items-container">
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <div className="empty-cart-icon">🛒</div>
                            <h2>Your cart is empty</h2>
                            <p>Looks like you haven't added any items to your cart yet.</p>
                            <button 
                                className="continue-shopping-btn" 
                                onClick={() => navigate('/customer')}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="cart-items">
                            {cart.map(item => {
                                if (!item || !item.product) return null;
                                
                                return (
                                    <div key={item._id || `cart-${Math.random()}`} className="cart-item">
                                        <div className="item-image">
                                            <img 
                                                src={item.product.imageUrl || 'https://via.placeholder.com/150'} 
                                                alt={item.product.name || 'Product'} 
                                                onClick={() => navigate(`/customer/product/${item.product._id}`)}
                                            />
                                        </div>
                                        
                                        <div className="item-details">
                                            <h3 onClick={() => navigate(`/customer/product/${item.product._id}`)}>
                                                {item.product.name || 'Product'}
                                            </h3>
                                            
                                            {item.product.category && (
                                                <p className="item-category">{item.product.category}</p>
                                            )}
                                            
                                            <div className="item-price">
                                                {item.product.discount > 0 ? (
                                                    <>
                                                        <span className="discounted-price">
                                                            ${calculateDiscountedPrice(item)}
                                                        </span>
                                                        <span className="original-price">
                                                            ${item.product.price?.toFixed(2) || '0.00'}
                                                        </span>
                                                        <span className="discount-badge">
                                                            {item.product.discount}% OFF
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="price">
                                                        ${item.product.price?.toFixed(2) || '0.00'}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {item.product.expiryDate && (
                                                <p className="expiry-date">
                                                    Expires: {new Date(item.product.expiryDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="item-actions">
                                            <div className="quantity-controls">
                                                <button 
                                                    className="quantity-btn"
                                                    onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    className="quantity-input"
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value);
                                                        if (!isNaN(value) && value >= 1) {
                                                            handleQuantityChange(item, value);
                                                        }
                                                    }}
                                                    min="1"
                                                />
                                                <button 
                                                    className="quantity-btn"
                                                    onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            
                                            <div className="action-buttons">
                                                <button 
                                                    className="buy-now-btn" 
                                                    onClick={() => handleBuy()}
                                                >
                                                    Buy Now
                                                </button>
                                                <button 
                                                    className="remove-btn" 
                                                    onClick={() => handleDelete(item)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            
                                            <div className="item-subtotal">
                                                Subtotal: ${(parseFloat(calculateDiscountedPrice(item)) * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
                
                {cart.length > 0 && (
                    <div className="order-summary">
                        <h2>Order Summary</h2>
                        <div className="summary-line">
                            <span>Items ({totalCount}):</span>
                            <span>${totalAmount}</span>
                        </div>
                        <div className="summary-line">
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-line total">
                            <span>Total:</span>
                            <span>${totalAmount}</span>
                        </div>
                        <button 
                            className="checkout-btn" 
                            onClick={handleBuy}
                            disabled={cart.length === 0}
                        >
                            Proceed to Checkout
                        </button>
                        <button 
                            className="continue-shopping-btn" 
                            style={{ marginTop: "10px", width: "100%" }} 
                            onClick={() => navigate('/customer')}
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
            
            <div className="wishlist-section">
                <h2>Your Wishlist</h2>
                
                {wishlist.length === 0 ? (
                    <div className="empty-wishlist">
                        <p>Your wishlist is empty. Save items for later by adding them to your wishlist!</p>
                    </div>
                ) : (
                    <div className="wishlist-items">
                        {wishlist.map(item => {
                            if (!item || !item.product) return null;
                            
                            return (
                                <div key={item._id || `wishlist-${Math.random()}`} className="wishlist-item">
                                    <div className="item-image">
                                        <img 
                                            src={item.product.imageUrl || 'https://via.placeholder.com/150'} 
                                            alt={item.product.name || 'Product'} 
                                            onClick={() => navigate(`/customer/product/${item.product._id}`)}
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h3 onClick={() => navigate(`/customer/product/${item.product._id}`)}>
                                            {item.product.name || 'Product'}
                                        </h3>
                                        <div className="item-price">
                                            {item.product.discount > 0 ? (
                                                <>
                                                    <span className="discounted-price">
                                                        ${calculateDiscountedPrice(item)}
                                                    </span>
                                                    <span className="original-price">
                                                        ${item.product.price?.toFixed(2) || '0.00'}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="price">
                                                    ${item.product.price?.toFixed(2) || '0.00'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="wishlist-actions">
                                        <button 
                                            className="add-to-cart-btn" 
                                            onClick={() => handleMoveToCart(item)}
                                        >
                                            Move to Cart
                                        </button>
                                        <button 
                                            className="remove-btn" 
                                            onClick={() => handleDeleteFromWishlist(item)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
        )}
        </div>
    );
};

export default CartItems;