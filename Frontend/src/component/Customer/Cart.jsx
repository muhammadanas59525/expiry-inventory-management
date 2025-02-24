import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const CartItems = ({ cart, setCart, wishlist, setWishlist, updateCartQuantity }) => {
    const navigate = useNavigate();

    const handleBuy = () => {
        navigate('/bill', { state: { cart } });
    };

    const handleDelete = (item) => {
        setCart(cart.filter(cartItem => cartItem.id !== item.id));
    };

    const handleDeleteFromWishlist = (item) => {
        setWishlist(wishlist.filter(wishlistItem => wishlistItem.id !== item.id));
    };

    const handleMoveToCart = (item) => {
        const existingProduct = cart.find(cartItem => cartItem.id === item.id);
        if (existingProduct) {
            setCart(cart.map(cartItem =>
                cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
            ));
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
        handleDeleteFromWishlist(item);
    };

    const handleQuantityChange = (item, quantity) => {
        updateCartQuantity(item.id, quantity);
    };

    const handleBuyNow = (item) => {
        navigate('/bill', { state: { cart: [item] } });
    };

    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <div className="cart-container">
            <h2>Cart</h2>
            <div className="grid-container">
                {cart.map(item => (
                    <div key={item.id} className="grid-item">
                        <img src={item.image} alt={item.name} className="product-image" />
                        <div className="product-info">
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                            <p>Price: ${item.price}</p>
                            <p>
                                Quantity: 
                                <input 
                                    type="number" 
                                    value={item.quantity} 
                                    onChange={(e) => handleQuantityChange(item, parseInt(e.target.value))} 
                                    min="1"
                                />
                            </p>
                            <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                            <div className="button-group">
                                <button onClick={() => handleDelete(item)}>Remove</button>
                                <button onClick={() => handleBuyNow(item)}>Buy</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="cart-summary">
                <p>Total Items: {totalCount}</p>
                <p>Total Amount: ${totalAmount.toFixed(2)}</p>
            </div>
            <button onClick={handleBuy}>Buy Now</button>

            <h2>Wishlist</h2>
            <div className="grid-container">
                {wishlist.map(item => (
                    <div key={item.id} className="grid-item">
                        <img src={item.image} alt={item.name} className="product-image" />
                        <div className="product-info">
                            <h3>{item.name}</h3>
                            <p>{item.description}</p>
                            <p>${item.price}</p>
                            <div className="button-group">
                                <button onClick={() => handleMoveToCart(item)}>Move to Cart</button>
                                <button onClick={() => handleDeleteFromWishlist(item)}>Remove</button>
                                <button onClick={() => handleBuyNow(item)}>Buy</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CartItems;