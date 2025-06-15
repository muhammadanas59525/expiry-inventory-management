import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserAlt, FaEnvelope, FaPhone, FaStore, FaMapMarkerAlt } from 'react-icons/fa';
import { RiLockPasswordFill } from 'react-icons/ri';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState('customer');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        storeName: '',
        address: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });
        
        // Clear error for this field when user starts typing
        if (errors[id]) {
            setErrors({
                ...errors,
                [id]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Basic validation
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone.trim())) {
            newErrors.phone = 'Phone number must be 10 digits';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }
        
        // Additional validation for shopkeeper
        if (userType === 'shopkeeper') {
            if (!formData.storeName.trim()) newErrors.storeName = 'Store name is required';
        }
        
        return newErrors;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setLoading(true);
        
        try {
            // Prepare user data based on backend User model
            const userData = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                role: userType,
                phone: formData.phone.trim(),
                address: formData.address.trim()
            };
            
            const registerEndpoint = `${API_BASE_URL}/users/register`;
            console.log('Sending registration request to:', registerEndpoint);
            console.log('Registration data:', userData);
            
            const response = await axios.post(registerEndpoint, userData);
            
            console.log('Registration successful:', response.data);

            // Store token and user info
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userType', response.data.user.role);
                localStorage.setItem('userInfo', JSON.stringify(response.data.user));
            }
            
            setShowSuccessMessage(true);
            
            // Redirect after a delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                errorMessage = error.response.data.message || errorMessage;
                console.error('Error response:', error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage = 'No response from server. Please try again.';
                console.error('Error request:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                errorMessage = error.message;
                console.error('Error message:', error.message);
            }
            
            setErrors({ general: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup">
            {showSuccessMessage && (
                <div className="success-message">
                    Registration successful! Redirecting to login...
                </div>
            )}
            
            <form onSubmit={handleSignup}>
                <div className="container">
                    <h1>Create an Account</h1>
                    
                    <div className="user-type-selector">
                        <label>
                            <input 
                                type="radio" 
                                value="customer" 
                                checked={userType === 'customer'}
                                onChange={() => setUserType('customer')} 
                            />
                            Customer
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                value="shopkeeper" 
                                checked={userType === 'shopkeeper'}
                                onChange={() => setUserType('shopkeeper')} 
                            />
                            Shopkeeper
                        </label>
                    </div>
                    
                    {errors.general && <div className="error-message">{errors.general}</div>}
                    
                    <div className="form-row">
                        <div className='inputbox'>
                            <label htmlFor="firstName">First Name:</label>
                            <input 
                                type="text" 
                                id="firstName" 
                                placeholder="First Name" 
                                value={formData.firstName}
                                onChange={handleChange}
                                required 
                            />
                            <FaUserAlt className='icon' />
                            {errors.firstName && <span className="error">{errors.firstName}</span>}
                        </div>
                        
                        <div className='inputbox'>
                            <label htmlFor="lastName">Last Name:</label>
                            <input 
                                type="text" 
                                id="lastName" 
                                placeholder="Last Name" 
                                value={formData.lastName}
                                onChange={handleChange}
                                required 
                            />
                            <FaUserAlt className='icon' />
                            {errors.lastName && <span className="error">{errors.lastName}</span>}
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className='inputbox'>
                            <label htmlFor="email">Email:</label>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="Email" 
                                value={formData.email}
                                onChange={handleChange}
                                required 
                            />
                            <FaEnvelope className='icon' />
                            {errors.email && <span className="error">{errors.email}</span>}
                        </div>
                        
                        <div className='inputbox'>
                            <label htmlFor="phone">Phone:</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                placeholder="Phone Number (10 digits)" 
                                value={formData.phone}
                                onChange={handleChange}
                                pattern="[0-9]{10}"
                                required
                            />
                            <FaPhone className='icon' />
                            {errors.phone && <span className="error">{errors.phone}</span>}
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className='inputbox'>
                            <label htmlFor="password">Password:</label>
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="Password (min 6 characters)" 
                                value={formData.password}
                                onChange={handleChange}
                                minLength="6"
                                required 
                            />
                            <RiLockPasswordFill className='icon' />
                            {errors.password && <span className="error">{errors.password}</span>}
                        </div>
                        
                        <div className='inputbox'>
                            <label htmlFor="confirmPassword">Confirm Password:</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                placeholder="Confirm Password" 
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required 
                            />
                            <RiLockPasswordFill className='icon' />
                            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                        </div>
                    </div>
                    
                    <div className='inputbox'>
                        <label htmlFor="address">Address:</label>
                        <input 
                            type="text" 
                            id="address" 
                            placeholder="Full Address" 
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                        <FaMapMarkerAlt className='icon' />
                        {errors.address && <span className="error">{errors.address}</span>}
                    </div>
                    
                    {userType === 'shopkeeper' && (
                        <div className='inputbox'>
                            <label htmlFor="storeName">Store Name:</label>
                            <input 
                                type="text" 
                                id="storeName" 
                                placeholder="Store Name" 
                                value={formData.storeName}
                                onChange={handleChange}
                                required
                            />
                            <FaStore className='icon' />
                            {errors.storeName && <span className="error">{errors.storeName}</span>}
                        </div>
                    )}
                    
                    <div className="button">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                    </div>
                    
                    <div className="login-link">
                        <p>Already have an account? <Link to="/login">Login</Link></p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Signup;