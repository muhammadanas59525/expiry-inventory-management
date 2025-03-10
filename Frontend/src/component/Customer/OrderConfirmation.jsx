import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmation.css';
import { FiCheck, FiShoppingBag, FiTruck } from 'react-icons/fi';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId, paymentMethod, shippingInfo, orderItems, totalAmount } = location.state || {};
    
    if (!orderId) {
        // Redirect if no order info
        setTimeout(() => navigate('/customer/cart'), 1000);
        return <div className="loading-container">Redirecting...</div>;
    }
    
    return (
        <div className="order-confirmation">
            <div className="confirmation-card">
                <div className="success-header">
                    <div className="success-icon">
                        <FiCheck />
                    </div>
                    <h1>Order Placed Successfully!</h1>
                    <p>Thank you for your order</p>
                </div>
                
                <div className="order-details">
                    <h2>Order Details</h2>
                    <div className="detail-row">
                        <span>Order Number:</span>
                        <span>{orderId}</span>
                    </div>
                    <div className="detail-row">
                        <span>Payment Method:</span>
                        <span>{paymentMethod}</span>
                    </div>
                    <div className="detail-row">
                        <span>Total Amount:</span>
                        <span>${totalAmount}</span>
                    </div>
                </div>
                
                <div className="shipping-details">
                    <h2>Shipping Address</h2>
                    <p><strong>{shippingInfo?.fullName}</strong></p>
                    <p>{shippingInfo?.address}</p>
                    <p>{shippingInfo?.city}, {shippingInfo?.state} {shippingInfo?.postalCode}</p>
                    <p>{shippingInfo?.country}</p>
                    <p>Phone: {shippingInfo?.phone}</p>
                </div>
                
                <div className="order-items">
                    <h2>Order Items</h2>
                    {orderItems?.map((item, index) => (
                        <div key={index} className="order-item">
                            <div className="item-image">
                                <img 
                                    src={(item.product?.imageUrl || item.image || 'https://via.placeholder.com/60')} 
                                    alt={item.product?.name || item.name || 'Product'} 
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/60';
                                    }}
                                />
                            </div>
                            <div className="item-details">
                                <h3>{item.product?.name || item.name || 'Product'}</h3>
                                <p>Qty: {item.quantity}</p>
                                <p className="item-price">
                                    ${((item.product?.price || item.price || 0) * (1 - (item.product?.discount || item.discount || 0) / 100)).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="next-steps">
                    <div className="step">
                        <div className="step-icon"><FiShoppingBag /></div>
                        <div className="step-text">
                            <h3>Continue Shopping</h3>
                            <p>Explore more products</p>
                        </div>
                        <button 
                            onClick={() => navigate('/customer')}
                            className="action-button"
                        >
                            Shop More
                        </button>
                    </div>
                    
                    <div className="step">
                        <div className="step-icon"><FiTruck /></div>
                        <div className="step-text">
                            <h3>Track Order</h3>
                            <p>Check your order status</p>
                        </div>
                        <button 
                            onClick={() => navigate('/customer/orders')}
                            className="action-button"
                        >
                            My Orders
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;