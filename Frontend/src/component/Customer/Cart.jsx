import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Cart.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../../utils/axios';

const CartItems = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [useMockData, setUseMockData] = useState(false);

    // Mock data for development when API is not ready
    const mockCartItems = [
        {
            _id: 'mock-cart-1',
            quantity: 2,
            product: {
                _id: 'mock-product-1',
                name: 'Mock Product 1',
                price: 99.99,
                imageUrl: 'https://placehold.co/150x150/e2e8f0/1e293b?text=Product+1',
                discount: 15,
                category: 'Groceries'
            }
        },
        {
            _id: 'mock-cart-2',
            quantity: 1,
            product: {
                _id: 'mock-product-2',
                name: 'Mock Product 2',
                price: 49.99,
                imageUrl: 'https://placehold.co/150x150/e2e8f0/1e293b?text=Product+2',
                discount: 0,
                category: 'Dairy'
            }
        }
    ];

    const mockWishlistItems = [
        {
            _id: 'mock-wishlist-1',
            product: {
                _id: 'mock-product-3',
                name: 'Mock Product 3',
                price: 199.99,
                imageUrl: 'https://via.placeholder.com/150',
                discount: 25,
                expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                category: 'Bakery'
            }
        }
    ];

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
            
            try {
                // Fetch cart items using axiosInstance
                const cartResponse = await axiosInstance.get('/cart/items');
                console.log('Raw Cart API response:', cartResponse.data);
                
                // Process cart data
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
                                    imageUrl: "https://placehold.co/150x150/e2e8f0/1e293b?text=Product",
                                    discount: 0
                                }
                            };
                        }
                        return null;
                    }).filter(item => item !== null);
                    
                    setCart(processedCartItems);
                } else {
                    console.log('No valid cart data structure found - using mock data');
                    setCart(mockCartItems);
                    setUseMockData(true);
                }
                
                // Fetch wishlist items
                const wishlistResponse = await axiosInstance.get('/wishlist/items');
                console.log('Raw Wishlist API response:', wishlistResponse.data);
                
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
                                    imageUrl: "https://placehold.co/150x150/e2e8f0/1e293b?text=Product",
                                    discount: 0
                                }
                            };
                        }
                        return null;
                    }).filter(item => item !== null);
                    
                    setWishlist(processedWishlistItems);
                } else {
                    console.log('No valid wishlist data structure found - using mock data');
                    setWishlist(mockWishlistItems);
                    setUseMockData(true);
                }
            } catch (apiError) {
                console.error('API Error:', apiError);
                console.log('Using mock data for development');
                
                // Use mock data when API fails
                setCart(mockCartItems);
                setWishlist(mockWishlistItems);
                setUseMockData(true);
                
                // Don't show error since we're using mock data
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching cart and wishlist:', err);
            setError('Failed to load your cart and wishlist');
            
            // Use mock data as fallback
            setCart(mockCartItems);
            setWishlist(mockWishlistItems);
            setUseMockData(true);
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
            // For mock data, just update the state locally
            if (useMockData) {
                setCart(cart.filter(cartItem => cartItem._id !== item._id));
                toast.success("Item removed from cart");
                return;
            }
            
            // Otherwise, try to call the API
            const response = await axiosInstance.delete(`/cart/items/${item._id}`);
            
            if (response.data && response.data.success) {
                setCart(cart.filter(cartItem => cartItem._id !== item._id));
                toast.success("Item removed from cart");
            } else {
                toast.error("Failed to remove item from cart");
            }
        } catch (error) {
            console.error('Error removing item from cart:', error);
            toast.error("Failed to remove item from cart");
            
            // If API fails, still update UI in development
            if (process.env.NODE_ENV === 'development') {
                setCart(cart.filter(cartItem => cartItem._id !== item._id));
            }
        }
    };

    const handleDeleteFromWishlist = async (item) => {
        try {
            if (useMockData) {
                // For mock data, just update the state locally
                setWishlist(wishlist.filter(wishlistItem => wishlistItem._id !== item._id));
                toast.success("Item removed from wishlist");
                return;
            }
            
            // Use the correct endpoint
            await axiosInstance.delete(`/wishlist/items/${item._id}`);
            
            setWishlist(wishlist.filter(wishlistItem => wishlistItem._id !== item._id));
            toast.success("Item removed from wishlist");
        } catch (err) {
            console.error('Error removing item from wishlist:', err);
            toast.error("Failed to remove item from wishlist");
            
            // If using mock data, still allow the UI to update
            if (useMockData) {
                setWishlist(wishlist.filter(wishlistItem => wishlistItem._id !== item._id));
            }
        }
    };

    const handleMoveToCart = async (item) => {
        try {
            if (useMockData) {
                // For mock data, just update the state locally
                const newCartItem = {
                    _id: `mock-cart-${Date.now()}`,
                    quantity: 1,
                    product: item.product
                };
                
                setCart([...cart, newCartItem]);
                setWishlist(wishlist.filter(wishlistItem => wishlistItem._id !== item._id));
                toast.success("Item moved to cart");
                return;
            }
            
            // Add to cart with correct endpoint
            await axiosInstance.post('/cart/items', { 
                productId: item.product._id, 
                quantity: 1 
            });
            
            // Remove from wishlist with correct endpoint
            await axiosInstance.delete(`/wishlist/items/${item._id}`);
            
            // Refresh data
            fetchCartAndWishlist();
            toast.success("Item moved to cart");
        } catch (err) {
            console.error('Error moving item to cart:', err);
            toast.error("Failed to move item to cart");
            
            // If using mock data, still allow the UI to update
            if (useMockData) {
                const newCartItem = {
                    _id: `mock-cart-${Date.now()}`,
                    quantity: 1,
                    product: item.product
                };
                
                setCart([...cart, newCartItem]);
                setWishlist(wishlist.filter(wishlistItem => wishlistItem._id !== item._id));
            }
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

    if (error && !useMockData) {
        return (
            <div className="cart-container">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchCartAndWishlist}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            {useMockData && (
                <div className="mock-data-notice">
                    <p>Using demo data for cart and wishlist functionality - backend API endpoints not available</p>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="cart-content">
                <div className="cart-section">
                    <h2>Your Cart ({totalCount} items)</h2>
                    
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <p>Your cart is empty</p>
                            <button onClick={() => navigate('/customer/products')}>Continue Shopping</button>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items">
                                {cart.map(item => (
                                    <div key={item._id} className="cart-item">
                                        <div className="item-image">
                                            <img 
                                                src={item.product?.imageUrl || 'https://placehold.co/150x150/e2e8f0/1e293b?text=Product'} 
                                                alt={item.product?.name || 'Product'} 
                                                className="product-image"
                                            />
                                        </div>
                                        <div className="item-details">
                                            <h3>{item.product.name}</h3>
                                            <p className="item-category">{item.product.category || 'General'}</p>
                                            <div className="price-info">
                                                {item.product.discount > 0 ? (
                                                    <>
                                                        <p className="discounted-price">${calculateDiscountedPrice(item)}</p>
                                                        <p className="original-price">${item.product.price.toFixed(2)}</p>
                                                        <p className="discount-badge">{item.product.discount}% OFF</p>
                                                    </>
                                                ) : (
                                                    <p className="normal-price">${item.product.price.toFixed(2)}</p>
                                                )}
                                            </div>
                                            <div className="quantity-controls">
                                                <p>Quantity: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <div className="item-actions">
                                            <button 
                                                className="remove-btn" 
                                                onClick={() => handleDelete(item)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="cart-summary">
                                <h3>Order Summary</h3>
                                <div className="summary-row">
                                    <span>Items ({totalCount}):</span>
                                    <span>${totalAmount}</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total:</span>
                                    <span>${totalAmount}</span>
                                </div>
                                <button className="checkout-btn" onClick={handleBuy}>
                                    Proceed to Checkout
                                </button>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="wishlist-section">
                    <h2>Your Wishlist ({wishlist.length} items)</h2>
                    
                    {wishlist.length === 0 ? (
                        <div className="empty-wishlist">
                            <p>Your wishlist is empty</p>
                        </div>
                    ) : (
                        <div className="wishlist-items">
                            {wishlist.map(item => (
                                <div key={item._id} className="wishlist-item">
                                    <div className="item-image">
                                        <img 
                                            src={item.product.imageUrl || "https://via.placeholder.com/150"} 
                                            alt={item.product.name} 
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.product.name}</h3>
                                        <div className="price-info">
                                            {item.product.discount > 0 ? (
                                                <>
                                                    <p className="discounted-price">
                                                        ${(item.product.price * (1 - item.product.discount / 100)).toFixed(2)}
                                                    </p>
                                                    <p className="original-price">${item.product.price.toFixed(2)}</p>
                                                    <p className="discount-badge">{item.product.discount}% OFF</p>
                                                </>
                                            ) : (
                                                <p className="normal-price">${item.product.price.toFixed(2)}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="item-actions">
                                        <button 
                                            className="move-to-cart-btn" 
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
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartItems;