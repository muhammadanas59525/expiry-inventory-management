import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PiHeartFill } from "react-icons/pi";
import { GrPowerCycle } from "react-icons/gr";
import { FaTruck } from "react-icons/fa";
import './ProductDetailsCust.css';

const ProductDetailsCust = ({ addToCart, addToWishlist, updateCartQuantity, cart = [] }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { product } = location.state;

    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (cart) {
            const cartItem = cart.find(item => item.id === product.id);
            if (cartItem) {
                setQuantity(cartItem.quantity);
            }
        }
    }, [cart, product.id]);

    const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);
    const [showReturnPopup, setShowReturnPopup] = useState(false);

    const handleAddToCart = () => {
        addToCart({ ...product, quantity });
    };

    const handleBuyNow = () => {
        navigate('/bill', { state: { cart: [{ ...product, quantity }] } });
    };

    const handleAddToWishlist = () => {
        addToWishlist(product);
    };

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value);
        setQuantity(newQuantity);
        updateCartQuantity(product.id, newQuantity);
    };

    return (
        <div className="product-details-container">
            <div className="left-side">
                <div className="wishlist-button" onClick={handleAddToWishlist}>
                    <PiHeartFill />
                </div>
                <img src={product.imageUrl} alt={product.name} className="product-image" />
            </div>
            <div className="right-side">
                <h1>{product.name}</h1>
                <p>Price: ${product.price}</p>
                <p>{product.description}</p>
                <div className="quantity-control">
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="1"
                        value={quantity}
                        onChange={handleQuantityChange}
                    />
                </div>
                <div className="button-group">
                    <button onClick={handleAddToCart}>Add to Cart</button>
                    <button onClick={handleBuyNow}>Buy Now</button>
                </div>
                <div className="info-boxes">
                    <div className="info-box" onClick={() => setShowDeliveryPopup(true)}>
                        <FaTruck /> Delivery Details
                    </div>
                    <div className="info-box" onClick={() => setShowReturnPopup(true)}>
                        <GrPowerCycle /> Return Details
                    </div>
                </div>
            </div>

            {showDeliveryPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Delivery Details</h2>
                        <p>Free delivery within 5-7 business days.</p>
                        <button onClick={() => setShowDeliveryPopup(false)}>Close</button>
                    </div>
                </div>
            )}

            {showReturnPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Return Details</h2>
                        <p>30-day return policy with full refund.</p>
                        <button onClick={() => setShowReturnPopup(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailsCust;