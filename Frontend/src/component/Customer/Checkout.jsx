import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Checkout.css';
import { QRCodeSVG } from 'qrcode.react';


function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
        // Add to your existing state variables
    const [formErrors, setFormErrors] = useState({ hasErrors: false, message: '' });
    const [addressConfirmed, setAddressConfirmed] = useState(false);
    const [activeSection, setActiveSection] = useState('shipping');

const [orderCompleted, setOrderCompleted] = useState(false);
const [showQRCode, setShowQRCode] = useState(false);



    // Add to your existing state variables
const [paymentStatus, setPaymentStatus] = useState({
    status: '', // 'processing', 'success', 'error', 'awaiting_input'
    message: ''
});
const [showUpiModal, setShowUpiModal] = useState(false);
const [showCreditCardForm, setShowCreditCardForm] = useState(false);
const [orderComplete, setOrderComplete] = useState(false);
    
        
    // Order processing state
    const [orderProcessing, setOrderProcessing] = useState(false);
    
    // Shipping information
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
    });
    
    // Payment information
    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: ''
    });
    
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    
    // Pre-filled address options
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    
    // Order summary calculations
    const shippingCost = 5.99;
    const taxRate = 0.07; // 7% tax rate
    
    // Calculate subtotal from cart items
    const calculateSubtotal = () => {
        return cart.reduce((total, item) => {
            const price = item.product?.price || 0;
            const discount = item.product?.discount || 0;
            const discountedPrice = price * (1 - discount / 100);
            return total + (discountedPrice * (item.quantity || 1));
        }, 0);
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.product?.price || item.price || 0;
            const discount = item.product?.discount || item.discount || 0;
            const quantity = item.quantity || 1;
            
            return total + (price * (1 - discount/100) * quantity);
        }, 0).toFixed(2);
    };
    
    
    const subtotal = calculateSubtotal();
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + shippingCost + taxAmount;

    // Get cart data from location state or fetch it if not available
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Try to get cart from location state first
                if (location.state?.cart) {
                    console.log('Using cart from location state:', location.state.cart);
                    setCart(location.state.cart);
                } else {
                    // Fetch cart data from API if not in location state
                    const token = localStorage.getItem('token');
                    if (!token) {
                        navigate('/login');
                        return;
                    }
                    
                    const cartResponse = await axios.get('http://localhost:3000/api/cart', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (cartResponse.data && cartResponse.data.success && Array.isArray(cartResponse.data.data)) {
                        setCart(cartResponse.data.data);
                    } else {
                        setCart([]);
                    }
                }
                
                // Fetch saved addresses
                await fetchSavedAddresses();
                
                setLoading(false);
            } catch (err) {
                console.error('Error loading checkout data:', err);
                setError('Failed to load checkout data. Please try again.');
                setLoading(false);
            }
        };
        
        fetchData();
    }, [location.state, navigate]);
    
    // Fetch saved addresses from backend
    const fetchSavedAddresses = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.get('http://localhost:3000/api/users/addresses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.addresses) {
                setSavedAddresses(response.data.addresses);
                
                // Use the default address if available
                if (response.data.addresses.length > 0) {
                    const defaultAddress = response.data.addresses.find(addr => addr.isDefault) || 
                                          response.data.addresses[0];
                    setShippingInfo({
                        fullName: defaultAddress.fullName || '',
                        address: defaultAddress.address || '',
                        city: defaultAddress.city || '',
                        state: defaultAddress.state || '',
                        postalCode: defaultAddress.postalCode || '',
                        country: defaultAddress.country || '',
                        phone: defaultAddress.phone || ''
                    });
                }
            }
        } catch (err) {
            console.error('Error fetching saved addresses:', err);
        }
    };
    
    // Handle selection of a saved address
    const handleSelectAddress = (address) => {
        setShippingInfo({
            fullName: address.fullName || '',
            address: address.address || '',
            city: address.city || '',
            state: address.state || '',
            postalCode: address.postalCode || '',
            country: address.country || '',
            phone: address.phone || ''
        });
        setShowAddressForm(false);
    };
    
    // Save a new address
// Update the handleSaveAddress function

const handleSaveAddress = () => {
    // Validate all required fields
    const requiredFields = ['fullName', 'address', 'city', 'state', 'postalCode', 'country', 'phone'];
    const missingFields = requiredFields.filter(field => !shippingInfo[field]);
    
    if (missingFields.length > 0) {
        setFormErrors({
            hasErrors: true,
            message: `Please fill all required fields: ${missingFields.join(', ')}`
        });
        return;
    }
    
    // Check if address already exists
    const addressExists = savedAddresses.some(
        addr => addr.fullName === shippingInfo.fullName && addr.address === shippingInfo.address
    );
    
    // If it's a new address, add it to saved addresses
    if (!addressExists) {
        setSavedAddresses([...savedAddresses, {...shippingInfo}]);
    }
    
    // Hide form and show saved status
    setShowAddressForm(false);
    setAddressConfirmed(true);
    
    // Enable payment section
    setActiveSection('payment');
    
    // Show success message
    setFormErrors({
        hasErrors: false,
        message: 'Address saved successfully!'
    });
    
    // Clear message after 3 seconds
    setTimeout(() => {
        setFormErrors({
            hasErrors: false,
            message: ''
        });
    }, 3000);
};
    
    // Place the order
// Update or add the handlePlaceOrder function

// Update your handlePlaceOrder function

const handlePlaceOrder = async () => {
    // Validate order details
    if (!shippingInfo.fullName || !shippingInfo.address) {
        setFormErrors({
            hasErrors: true,
            message: 'Please complete your shipping information'
        });
        return;
    }

    if (!paymentMethod) {
        setFormErrors({
            hasErrors: true,
            message: 'Please select a payment method'
        });
        return;
    }


    if (paymentMethod === 'upi') {
        // Show UPI QR code
        setShowQRCode(true);
    } else if (paymentMethod === 'cashOnDelivery') {
        // Process COD order
        setOrderProcessing(true);
        
        // Simulate order processing
        setTimeout(() => {
            setOrderProcessing(false);
            setOrderCompleted(true);
            
            // Redirect to success page after a delay
            setTimeout(() => {
                navigate('/customer/order-confirmation', {
                    state: {
                        orderId: 'ORD-' + Date.now().toString().slice(-6),
                        paymentMethod: 'Cash on Delivery',
                        shippingInfo,
                        orderItems: cart,
                        totalAmount: calculateTotal()
                    }
                });
            }, 1500);
        }, 2000);


        // Generate UPI payment link
const generateUPILink = () => {
    const amount = calculateTotal();
    return `upi://pay?pa=anujithdasan123@oksbi&pn=GroceryStore&am=${amount}&cu=INR&tn=Order%20Payment`;
};

// Handle UPI payment completion
const handleUPIPaymentComplete = () => {
    setShowQRCode(false);
    setOrderCompleted(true);
    
    // Redirect to success page
    navigate('/customer/order-confirmation', {
        state: {
            orderId: 'ORD-' + Date.now().toString().slice(-6),
            paymentMethod: 'UPI Payment',
            shippingInfo,
            orderItems: cart,
            totalAmount: calculateTotal()
        }
    });
};

        
        // Create temporary order object
        const orderDetails = {
            orderId: 'TEMP-' + Date.now(),
            items: cart,
            totalAmount: totalAmount,
            shippingInfo: shippingInfo,
            paymentMethod: 'UPI'
        };
        
        // Navigate to UPI payment page with order details
        navigate('/upi-payment', { 
            state: { 
                order: orderDetails
            } 
        });
        return;
    }
    
    // Handle other payment methods as before
    setOrderProcessing(true);
    
    try {
        // Create order data
        const orderData = {
            items: cart.map(item => ({
                productId: item._id,
                quantity: item.quantity,
                price: item.price
            })),
            shipping: shippingInfo,
            paymentMethod: paymentMethod
        };
        
        // Example API call to create order
        // const response = await axios.post('http://localhost:3000/api/orders/create', orderData);
        
        // For demo purposes, simulate API call
        setTimeout(() => {
            setOrderProcessing(false);
            setOrderComplete(true);
            
            // Navigate to order success page
            setTimeout(() => {
                navigate('/customer/order-success', {
                    state: {
                        orderId: 'ORD' + Math.floor(Math.random() * 1000000)
                    }
                });
            }, 2000);
        }, 1500);
    } catch (error) {
        console.error('Error placing order:', error);
        setOrderProcessing(false);
        setFormErrors({
            hasErrors: true,
            message: 'Failed to place order. Please try again.'
        });
    }
};

    
    // Update shipping info
    const handleShippingInfoChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Update payment info
    const handlePaymentInfoChange = (e) => {
        const { name, value } = e.target;
        setPaymentInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Format card number with spaces
    const formatCardNumber = (value) => {
        // Remove non-digit characters
        const digitsOnly = value.replace(/\D/g, '');
        // Insert space every 4 digits
        const formattedValue = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
        return formattedValue.substring(0, 19); // Limit to 16 digits + 3 spaces
    };
    
    // Detect card type based on number
    const getCardType = (cardNumber) => {
        const number = cardNumber.replace(/\D/g, '');
        
        if (/^4/.test(number)) return 'Visa';
        if (/^5[1-5]/.test(number)) return 'Mastercard';
        if (/^3[47]/.test(number)) return 'American Express';
        if (/^6(?:011|5)/.test(number)) return 'Discover';
        
        return 'Unknown';
    };
    
    // Handle card number input with formatting
    const handleCardNumberChange = (e) => {
        const formattedValue = formatCardNumber(e.target.value);
        setPaymentInfo(prev => ({
            ...prev,
            cardNumber: formattedValue
        }));
    };
    
    if (loading) {
        return (
            <div className="checkout-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading checkout information...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="checkout-container">
                <div className="error-message">
                    <h2>Something went wrong</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate('/customer/cart')}>
                        Return to Cart
                    </button>
                </div>
            </div>
        );
    }
    
    if (cart.length === 0) {
        return (
            <div className="checkout-container">
                <div className="empty-cart-message">
                    <h2>Your cart is empty</h2>
                    <p>You cannot proceed to checkout with an empty cart.</p>
                    <button onClick={() => navigate('/customer')}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="checkout-header">
                <h1>Checkout</h1>
            </div>
            
            <div className="checkout-content">
                <div className="checkout-left">
                    {/* Shipping Information */}
                    <div className="checkout-section">
                        <h2>Shipping Information</h2>
                        
                        {!showAddressForm && savedAddresses.length > 0 && (
                            <div className="saved-addresses">
                                <h3>Saved Addresses</h3>
                                <div className="address-list">
                                    {savedAddresses.map((address, index) => (
                                        <div 
                                            key={index} 
                                            className={`saved-address ${
                                                address.fullName === shippingInfo.fullName && 
                                                address.address === shippingInfo.address ? 'selected' : ''
                                            }`}
                                            onClick={() => handleSelectAddress(address)}
                                        >
                                            <p><strong>{address.fullName}</strong></p>
                                            <p>{address.address}</p>
                                            <p>{address.city}, {address.state} {address.postalCode}</p>
                                            <p>{address.country}</p>
                                            <p>{address.phone}</p>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    className="make-payment-btn"
                                    onClick={() => setShowAddressForm(true)}
                                >
                                    Add New Address
                                </button>
                            </div>
                        )}
                        
                        {(showAddressForm || savedAddresses.length === 0) && (
                            <div className="address-form">
                                <div className="form-group">
                                    <label htmlFor="fullName">Full Name *</label>
                                    <input
                                        type="text"
                                        id="fullName"
                                        name="fullName"
                                        value={shippingInfo.fullName}
                                        onChange={handleShippingInfoChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="address">Address *</label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={shippingInfo.address}
                                        onChange={handleShippingInfoChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="city">City *</label>
                                        <input
                                            type="text"
                                            id="city"
                                            name="city"
                                            value={shippingInfo.city}
                                            onChange={handleShippingInfoChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="state">State/Province *</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={shippingInfo.state}
                                            onChange={handleShippingInfoChange}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="postalCode">Postal Code *</label>
                                        <input
                                            type="text"
                                            id="postalCode"
                                            name="postalCode"
                                            value={shippingInfo.postalCode}
                                            onChange={handleShippingInfoChange}
                                            required
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="country">Country *</label>
                                        <input
                                            type="text"
                                            id="country"
                                            name="country"
                                            value={shippingInfo.country}
                                            onChange={handleShippingInfoChange}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number *</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={shippingInfo.phone}
                                        onChange={handleShippingInfoChange}
                                        required
                                    />
                                </div>
                                
                                <div className="form-actions">
                                    {savedAddresses.length > 0 && (
                                        <button 
                                            type="button" 
                                            className="cancel-btn"
                                            onClick={() => setShowAddressForm(false)}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    
                                    <button 
                                        type="button" 
                                        className="make-payment-btn"
                                        onClick={handleSaveAddress}
                                    >
                                        Save Address
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>


                        {/* Display form messages */}
                    {formErrors.message && (
                        <div className={`form-message ${formErrors.hasErrors ? 'error' : 'success'}`}>
                            {formErrors.message}
                        </div>
                    )}

                    {/* Address confirmed status */}
                    {addressConfirmed && !showAddressForm && (
                        <div className="address-confirmed">
                            <div className="confirmation-icon">✓</div>
                            <h3>Shipping Address Confirmed</h3>
                            <div className="confirmed-address">
                                <p><strong>{shippingInfo.fullName}</strong></p>
                                <p>{shippingInfo.address}</p>
                                <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}</p>
                                <p>{shippingInfo.country}</p>
                                <p>{shippingInfo.phone}</p>
                            </div>
                            <button 
                                className="edit-address-btn"
                                onClick={() => setShowAddressForm(true)}
                            >
                                Edit Address
                            </button>
                        </div>
                    )}

                    {/* Proceed to Payment button */}
                    {addressConfirmed && !showAddressForm && (
                        <div className="proceed-section">
                            <button 
                                className="proceed-payment-btn"
                                onClick={() => setActiveSection('payment')}
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    )}


                    
                    {/* Payment Information */}
                                    {/* Payment Section */}
                <div className={`checkout-section payment-section ${activeSection === 'payment' ? 'active' : ''}`}>
                    <h2>Payment Method</h2>
                    
                        {activeSection === 'payment' ? (
                        <div className="payment-options">
                            <div className="payment-option">
                                {/* <input 
                                    type="radio" 
                                    id="creditCard" 
                                    name="paymentMethod" 
                                    value="creditCard" 
                                    checked={paymentMethod === 'creditCard'}
                                    onChange={() => setPaymentMethod('creditCard')}
                                />
                                <label htmlFor="creditCard">Credit Card</label> */}
                            </div>
                            
                            <div className="payment-option">
                                {/* <input 
                                    type="radio" 
                                    id="upi" 
                                    name="paymentMethod" 
                                    value="upi"
                                    checked={paymentMethod === 'upi'}
                                    onChange={() => setPaymentMethod('upi')}
                                />
                                <label htmlFor="upi">UPI Payment</label> */}
                            </div>
                                
                                <div className="payment-option">
                                    <input 
                                        type="radio" 
                                        id="cashOnDelivery" 
                                        name="paymentMethod" 
                                        value="cashOnDelivery"
                                        checked={paymentMethod === 'cashOnDelivery'}
                                        onChange={() => setPaymentMethod('cashOnDelivery')}
                                    />
                                <label htmlFor="cashOnDelivery">Payment</label>
                            </div>
                            
                            <button 
                                className="make-payment-btn"
                                onClick={handlePlaceOrder}
                                disabled={!paymentMethod}
                            >
                                Make Payment
                            </button>

                            {/* Display payment status */}
                                                        {/* Payment Status Message */}
                            {paymentStatus.message && (
                                <div className={`payment-status ${paymentStatus.status}`}>
                                    {paymentStatus.status === 'processing' && (
                                        <div className="loading-spinner"></div>
                                    )}
                                    {paymentStatus.message}
                                </div>
                            )}

                        </div>
                    ) : (
                        <p className="section-disabled-message">
                            Please confirm your shipping information first
                        </p>
                    )}
                </div>

                
                {/* UPI Payment Modal */}
{/* {showUpiModal && (
    <div className="modal-overlay">
        <div className="modal-content upi-modal">
            <button 
                className="modal-close" 
                onClick={() => setShowUpiModal(false)}
            >×</button>
            
            <div className="upi-payment-info">
                <h3>Complete Your Payment</h3>
                
                <div className="upi-details">
                    <p>Please pay using UPI to:</p>
                    <div className="upi-id">anujithdasan123@oksbi</div>
                    
                    <div className="upi-qr-placeholder"> */}
                        {/* In a real app, you would generate a QR code here */}
                        {/* <div className="mock-qr">
                            UPI QR Code
                        </div>
                    </div>
                    
                    <p className="upi-instructions">
                        1. Open your UPI app (Google Pay, PhonePe, Paytm, etc.)<br/>
                        2. Select "Pay by UPI ID"<br/>
                        3. Enter the UPI ID shown above<br/>
                        4. Enter amount: ${cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}<br/>
                        5. Complete the payment
                    </p>
                </div>
                
                <div className="upi-buttons">
                    <button 
                        className="try-again-btn"
                        onClick={() => {
                            const upiLink = `upi://pay?pa=anujithdasan123@oksbi&pn=GroceryStore&am=${cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}&cu=INR&tn=Order%20Payment`;
                            window.location.href = upiLink;
                        }}
                    >
                        Open UPI App
                    </button>
                    
                    <button 
                        className="payment-complete-btn"
                        onClick={() => {
                            setShowUpiModal(false);
                            setPaymentStatus({
                                status: 'success',
                                message: 'Payment successful! Your order has been placed.'
                            });
                            setOrderComplete(true); */}
                            
                            {/* // Redirect to confirmation page
                            setTimeout(() => { */}
                                {/* // clearCart(); // Assuming you have a function to clear cart
                                navigate('/customer/order-confirmation', { 
                                    state: { 
                                        orderId: 'ORD' + Math.floor(Math.random() * 1000000),
                                        shippingInfo,
                                        paymentMethod: 'UPI Payment',
                                        cartItems
                                    } 
                                });
                            }, 2000);
                        }}
                    >
                        I've Completed the Payment
                    </button>
                </div>
            </div>
        </div>
    </div>
)} */}



{/* UPI QR Code Modal */}
{showQRCode && (
    <div className="modal-overlay">
        <div className="modal-content upi-modal">
            <button 
                className="modal-close" 
                onClick={() => setShowQRCode(false)}
            >×</button>
            
            <div className="upi-payment-info">
                <h3>Complete Your Payment</h3>
                
                <p className="payment-amount">Amount: ₹{calculateTotal()}</p>
                
                <div className="qr-container">
                    <QRCodeSVG 
                        value={generateUPILink()}
                        size={200}
                        level={"H"}
                    />
                </div>
                
                <div className="upi-details">
                    <p>Pay to UPI ID:</p>
                    <div className="upi-id">anujithdasan123@oksbi</div>
                    
                    <p className="upi-instructions">
                        1. Open your UPI app (GPay, PhonePe, Paytm, etc.)<br/>
                        2. Scan this QR code or enter UPI ID manually<br/>
                        3. Enter amount: ₹{calculateTotal()}<br/>
                        4. Complete the payment
                    </p>
                </div>
                
                <div className="upi-buttons">
                    <button 
                        className="payment-complete-btn"
                        onClick={handleUPIPaymentComplete}
                    >
                        I've Completed the Payment
                    </button>
                </div>
            </div>
        </div>
    </div>
)}



{/* Order Processing/Completed Messages */}
{orderProcessing && (
    <div className="order-processing-overlay">
        <div className="order-processing">
            <div className="spinner"></div>
            <p>Processing your order...</p>
        </div>
    </div>
)}

{orderCompleted && (
    <div className="order-completed-overlay">
        <div className="order-completed">
            <div className="success-icon">✓</div>
            <h3>Order Placed Successfully!</h3>
            <p>Thank you for your order.</p>
            <p>Redirecting to order confirmation...</p>
        </div>
    </div>
)}

            </div>
                
                <div className="checkout-right">
                    {/* Order Summary */}
                    <div className="checkout-section order-summary">
                        <h2>Order Summary</h2>
                        
                        <div className="order-items">
                            {cart.map((item, index) => (
                                <div key={index} className="order-item">
                                    <div className="item-image">
                                        <img 
                                            src={item.product?.imageUrl || 'https://via.placeholder.com/60'} 
                                            alt={item.product?.name || 'Product'} 
                                        />
                                    </div>
                                    <div className="item-details">
                                        <h3>{item.product?.name || 'Product'}</h3>
                                        <p>Qty: {item.quantity}</p>
                                        <p className="item-price">
                                            ${((item.product?.price || 0) * (1 - (item.product?.discount || 0) / 100)).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="order-summary-totals">
                            <div className="summary-line">
                                <span>Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-line">
                                <span>Shipping</span>
                                <span>${shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="summary-line">
                                <span>Tax</span>
                                <span>${taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="summary-line total">
                                <span>Total</span>
                                <span>${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <button 
                            className="place-order-btn" 
                            onClick={handlePlaceOrder}
                            disabled={orderProcessing}
                        >
                            {orderProcessing ? 'Processing...' : 'Place Order'}
                        </button>
                        
                        <button 
                            className="make-payment-btn" 
                            onClick={() => navigate('/customer/cart')}
                            disabled={orderProcessing}
                        >
                            Back to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;