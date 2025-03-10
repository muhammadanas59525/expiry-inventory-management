import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Upi.css';
import { QRCodeSVG } from 'qrcode.react'; 

const Upi = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
    const [transactionId, setTransactionId] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    
    useEffect(() => {
        // Get order details from location state or fetch from API
        if (location.state && location.state.order) {
            setOrderDetails(location.state.order);
            setLoading(false);
        } else {
            // Redirect back to checkout if no order details
            navigate('/checkout', { replace: true });
        }
    }, [location, navigate]);

    const generateUpiLink = () => {
        // Calculate the total amount from order details
        const amount = orderDetails?.totalAmount || '0.00';
        
        // Generate UPI payment link
        return `upi://pay?pa=anujithdasan123@oksbi&pn=GroceryStore&am=${amount}&cu=INR&tn=Order%20Payment`;
    };
    
    const generateQRCode = () => {
        // In a real implementation, you would generate a QR code with proper UPI details
        // For this example, we'll use a placeholder QR
        return generateUpiLink();

        // return `https://chart.googleapis.com/chart?cht=qr&chl=upi%3A%2F%2Fpay%3Fpa%3Danujithdasan123%40oksbi%26pn%3DGroceryStore%26am%3D${orderDetails?.totalAmount}%26cu%3DINR%26tn%3DOrder%2520Payment&chs=300x300&chld=L|0`;
    };
    
    const handlePaymentVerification = async () => {
        setPaymentStatus('processing');
        
        // In a real implementation, you would verify the payment with your backend
        // For this example, we'll simulate a payment verification with a timeout
        // setTimeout(() => {
        //     setPaymentStatus('success');
        //     setShowConfirmation(true);
        // }, 20000);
    };
    
    const handleOrderCompletion = async () => {
        try {
            // In a real implementation, you would update the order status in your backend
            // For this example, we'll simulate updating the order
            
            // Example API call:
            // await axios.post('/api/orders/complete', {
            //     orderId: orderDetails._id,
            //     transactionId: transactionId,
            //     paymentMethod: 'UPI'
            // });
            
            // Navigate to order success page
            navigate('/customer/order-success', {
                state: {
                    orderId: orderDetails?.orderId || 'ORD' + Math.floor(Math.random() * 1000000),
                    amount: orderDetails?.totalAmount
                }
            });
        } catch (error) {
            console.error('Error completing order:', error);
            setPaymentStatus('failed');
        }
    };
    
    if (loading) {
        return (
            <div className="upi-container loading">
                <div className="spinner"></div>
                <p>Loading payment details...</p>
            </div>
        );
    }
    
    return (
        <div className="upi-container">
            <div className="upi-payment-card">
                <div className="upi-header">
                    <h2>Complete Your Payment</h2>
                    <p className="order-amount">Amount: ${orderDetails?.totalAmount?.toFixed(2) || '0.00'}</p>
                </div>
                
                {showConfirmation ? (
                    <div className="payment-success">
                        <div className="success-icon">✓</div>
                        <h3>Payment Successful!</h3>
                        <p>Your order has been placed successfully.</p>
                        <p>Order ID: {orderDetails?.orderId || 'ORD' + Math.floor(Math.random() * 1000000)}</p>
                        <button 
                            className="confirm-button"
                            onClick={handleOrderCompletion}
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="payment-methods">
                            <h3>Pay using UPI</h3>
                            <div className="payment-options">
                                {/* Replace the img tag with the QRCodeSVG component */}
            <div className="qr-option">
                <p>Option 1: Scan QR Code</p>
                <div className="qr-code">
                    <QRCodeSVG 
                        value={generateQRCode()}
                        size={200}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                        includeMargin={false}
                    />
                </div>
                <p className="qr-instruction">Scan with any UPI app (GPay, PhonePe, Paytm, etc.)</p>
            </div>
                                
                                <div className="divider">OR</div>
                                
                                <div className="upi-id-option">
                                    <p>Option 2: Pay to UPI ID</p>
                                    <div className="upi-id-container">
                                        <p className="upi-id">anujithdasan123@oksbi</p>
                                        <button 
                                            className="copy-button"
                                            onClick={() => {
                                                navigator.clipboard.writeText('anujithdasan123@oksbi');
                                                alert('UPI ID copied to clipboard');
                                            }}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <p className="upi-instruction">
                                        1. Open your UPI app<br />
                                        2. Select "Pay by UPI ID"<br />
                                        3. Enter the UPI ID shown above<br />
                                        4. Enter amount: ${orderDetails?.totalAmount?.toFixed(2) || '0.00'}<br />
                                        5. Complete the payment
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="verify-payment">
                            <h3>Verify Payment</h3>
                            <div className="transaction-input">
                                <label htmlFor="transactionId">UPI Reference ID (Optional):</label>
                                <input
                                    type="text"
                                    id="transactionId"
                                    placeholder="e.g., UPI/123456789012"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                />
                            </div>
                            
                            {paymentStatus === 'processing' ? (
                                <div className="processing-payment">
                                    <div className="spinner"></div>
                                    <p>Verifying your payment...</p>
                                </div>
                            ) : paymentStatus === 'failed' ? (
                                <div className="payment-error">
                                    <p>Payment verification failed. Please try again.</p>
                                    <button 
                                        className="retry-button"
                                        onClick={handlePaymentVerification}
                                    >
                                        Retry Verification
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    className="verify-button"
                                    onClick={handlePaymentVerification}
                                >
                                    I've Completed the Payment
                                </button>
                            )}
                        </div>
                        
                        <div className="payment-actions">
                            <button 
                                className="cancel-button"
                                onClick={() => navigate('/customer/checkout')}
                            >
                                Cancel Payment
                            </button>
                            <button 
                                className="help-button"
                                onClick={() => navigate('/help', '_blank')}
                            >
                                Need Help?
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Upi;