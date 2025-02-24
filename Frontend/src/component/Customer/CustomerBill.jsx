import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CustomerBill.css';

const CustomerBill = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cart = [] } = location.state || {};

    const [customerDetails, setCustomerDetails] = useState({
        name: "John Doe",
        houseName: "123 Main St",
        apartment: "Apt 4B",
        city: "Springfield",
        phone: "(123) 456-7890",
        email: "johndoe@example.com"
    });

    const [previousDetails, setPreviousDetails] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('netbanking');
    const [selectedPaymentOption, setSelectedPaymentOption] = useState('');
    const [isPaymentPopupOpen, setIsPaymentPopupOpen] = useState(false);

    const handleUpdateDetails = (e) => {
        e.preventDefault();
        setPreviousDetails([...previousDetails, customerDetails]);
        setIsPopupOpen(false);
    };

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const discountPrice = item.price - (item.price * (item.discount || 0) / 100);
            return total + (discountPrice * item.quantity);
        }, 0).toFixed(2);
    };

    const totalAmount = calculateTotal();
    const totalCount = cart.reduce((count, item) => count + item.quantity, 0);

    const handlePlaceOrder = () => {
        if (paymentMethod === 'cod') {
            navigate('/order');
        } else {
            setSelectedPaymentOption('');
        }
    };

    const handleCancelOrder = () => {
        navigate('/cart');
    };

    const handlePaymentOptionSelect = (option) => {
        setSelectedPaymentOption(option);
        setIsPaymentPopupOpen(true);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        setIsPaymentPopupOpen(false);
        navigate('/order');
    };

    return (
        <div className="customer-bill">
            <div className="left-side">
                <h2>Shipping Details</h2>
                <p><strong>Name:</strong> {customerDetails.name}</p>
                <p><strong>House Name:</strong> {customerDetails.houseName}</p>
                <p><strong>Apartment:</strong> {customerDetails.apartment}</p>
                <p><strong>City:</strong> {customerDetails.city}</p>
                <p><strong>Phone Number:</strong> {customerDetails.phone}</p>
                <p><strong>Email:</strong> {customerDetails.email}</p>
                <button onClick={() => setIsPopupOpen(true)}>Update Details</button>
                {previousDetails.length > 0 && (
                    <div className="previous-details">
                        <h3>Previous Shipping Details</h3>
                        {previousDetails.map((details, index) => (
                            <div key={index} className="previous-detail">
                                <p><strong>Name:</strong> {details.name}</p>
                                <p><strong>House Name:</strong> {details.houseName}</p>
                                <p><strong>Apartment:</strong> {details.apartment}</p>
                                <p><strong>City:</strong> {details.city}</p>
                                <p><strong>Phone Number:</strong> {details.phone}</p>
                                <p><strong>Email:</strong> {details.email}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="right-side">
                <h2>Bill Summary</h2>
                <div className="grid-container">
                    {cart.map((item, index) => (
                        <div key={index} className="grid-item">
                            <img src={item.image} alt={item.name} className="product-image" />
                            <h3>{item.name}</h3>
                            <p>Price: ${item.price.toFixed(2)}</p>
                            <p>Quantity: {item.quantity}</p>
                            <p>Discount: {item.discount || 0}%</p>
                            <p>Total: ${(item.price - (item.price * (item.discount || 0) / 100)) * item.quantity}</p>
                        </div>
                    ))}
                </div>
                <h2>Total Items: {totalCount}</h2>
                <h2>Total Amount: ${totalAmount}</h2>
                <div className="payment-method">
                    <h3>Payment Method</h3>
                    <label>
                        <input
                            type="radio"
                            value="netbanking"
                            checked={paymentMethod === 'netbanking'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        Net Banking
                    </label>
                    {paymentMethod === 'netbanking' && (
                        <div className="payment-options">
                            <button onClick={() => handlePaymentOptionSelect('upi')}>UPI</button>
                            <button onClick={() => handlePaymentOptionSelect('creditcard')}>Credit Card</button>
                            <button onClick={() => handlePaymentOptionSelect('debitcard')}>Debit Card</button>
                        </div>
                    )}
                    <label>
                        <input
                            type="radio"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        Cash on Delivery
                    </label>
                </div>
                <div className="button-group">
                    <button onClick={handlePlaceOrder}>Place Order</button>
                    <button onClick={handleCancelOrder}>Cancel Order</button>
                </div>
            </div>

            {isPopupOpen && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Update Customer Details</h2>
                        <form onSubmit={handleUpdateDetails}>
                            <label>
                                Name:
                                <input
                                    type="text"
                                    value={customerDetails.name}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                                />
                            </label>
                            <label>
                                House Name:
                                <input
                                    type="text"
                                    value={customerDetails.houseName}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, houseName: e.target.value })}
                                />
                            </label>
                            <label>
                                Apartment:
                                <input
                                    type="text"
                                    value={customerDetails.apartment}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, apartment: e.target.value })}
                                />
                            </label>
                            <label>
                                City:
                                <input
                                    type="text"
                                    value={customerDetails.city}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, city: e.target.value })}
                                />
                            </label>
                            <label>
                                Phone Number:
                                <input
                                    type="text"
                                    value={customerDetails.phone}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                                />
                            </label>
                            <label>
                                Email:
                                <input
                                    type="email"
                                    value={customerDetails.email}
                                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                                />
                            </label>
                            <button type="submit">Save</button>
                            <button type="button" onClick={() => setIsPopupOpen(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            {isPaymentPopupOpen && (
                <div className="popup">
                    <div className="popup-content">
                        <h2>Enter Payment Details</h2>
                        <form onSubmit={handlePaymentSubmit}>
                            {selectedPaymentOption === 'upi' && (
                                <label>
                                    UPI Number:
                                    <input type="text" required />
                                </label>
                            )}
                            {(selectedPaymentOption === 'creditcard' || selectedPaymentOption === 'debitcard') && (
                                <>
                                    <label>
                                        Card Number:
                                        <input type="text" required />
                                    </label>
                                    <label>
                                        CVV:
                                        <input type="text" required />
                                    </label>
                                    <label>
                                        Expiry Date:
                                        <input type="month" required />
                                    </label>
                                </>
                            )}
                            <button type="submit">Submit Payment</button>
                            <button type="button" onClick={() => setIsPaymentPopupOpen(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerBill;