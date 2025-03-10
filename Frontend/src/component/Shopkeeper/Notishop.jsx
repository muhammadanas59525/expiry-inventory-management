import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Notishop.css';

const NotiShop = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (products.length > 0) {
            checkExpiryDates();
        }
    }, [products]);

    const fetchProducts = async () => {
        try {
            // Create mock data since API is not responding
            // const mockProducts = [
            //     {
            //         _id: '1',
            //         id: 1,
            //         name: 'Product 1',
            //         description: 'Description 1',
            //         price: 10.99,
            //         discount: 5,
            //         quantity: 20,
            //         manufactureDate: new Date('2023-01-01'),
            //         expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
            //     },
            //     {
            //         _id: '2',
            //         id: 2,
            //         name: 'Product 2',
            //         description: 'Description 2',
            //         price: 19.99,
            //         discount: 0,
            //         quantity: 15,
            //         manufactureDate: new Date('2023-02-15'),
            //         expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago (expired)
            //     },
            //     {
            //         _id: '3',
            //         id: 3,
            //         name: 'Product 3',
            //         description: 'Description 3',
            //         price: 29.99,
            //         discount: 10,
            //         quantity: 8,
            //         manufactureDate: new Date('2023-03-10'),
            //         expiryDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000) // 9 days from now
            //     }
            // ];
            
            // setProducts(mockProducts);
            // setError(null);
            
            // When the backend is ready, uncomment this
            const response = await axios.get('http://localhost:3000/api/products/get');
            setProducts(response.data);
            setError(null);
        } catch (error) {
            setError('Failed to fetch products. Please check your network connection.');
            console.error('Error fetching products:', error);
        }
    };

    const checkExpiryDates = () => {
        const currentDate = new Date();
        const newNotifications = products.map(product => {
            const expiryDate = new Date(product.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

            if (daysUntilExpiry <= 0) {
                return {
                    id: product._id,
                    productId: product.id,
                    type: 'expired',
                    message: `${product.name} has expired!`,
                    date: currentDate,
                    severity: 'high',
                    product: product
                };
            } else if (daysUntilExpiry <= 10) {
                return {
                    id: product._id,
                    productId: product.id,
                    type: 'warning',
                    message: `${product.name} will expire in ${daysUntilExpiry} days`,
                    date: currentDate,
                    severity: 'medium',
                    product: product
                };
            }
            return null;
        }).filter(Boolean);

        setNotifications(newNotifications);
    };

    const handleNotificationClick = (notification) => {
        navigate(`/product/${notification.productId}`, { state: { product: notification.product } });
    };

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="notification-container">
            <h2>Product Notifications</h2>
            <div className="notification-list">
                {notifications.length === 0 ? (
                    <p className="no-notifications">No notifications to display</p>
                ) : (
                    notifications.map((notification, index) => (
                        <div 
                            key={`${notification.id}-${index}`}
                            className={`notification-item ${notification.type} ${notification.severity}`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="notification-content">
                                <p className="notification-message">{notification.message}</p>
                                <span className="notification-date">
                                    {new Date(notification.date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotiShop;