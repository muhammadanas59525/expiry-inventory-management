import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserAlt, FaEnvelope, FaPhone, FaStore, FaMapMarkerAlt } from 'react-icons/fa';
import { RiLockPasswordFill } from 'react-icons/ri';
import axios from 'axios'; 
import './Signup.css';

const Signup = () => {
    const navigate = useNavigate();
    const [userType, setUserType] = useState('customer');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
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
        
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        
        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        
        // Additional validation for shopkeeper
        if (userType === 'shopkeeper') {
            if (!formData.storeName.trim()) newErrors.storeName = 'Store name is required';
            if (!formData.address.trim()) newErrors.address = 'Address is required';
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
            // Prepare user data based on user model
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone || undefined, // Optional field
                username: formData.username,
                password: formData.password,
                userType: userType
            };
            
            // Add shopkeeper specific fields if applicable
            if (userType === 'shopkeeper') {
                userData.storeName = formData.storeName;
                userData.address = formData.address;
            }
            
            // Backend API call (commented for now)
            
            const response = await axios.post('http://localhost:3000/api/user/register', userData);
            
            // If successful, store token and user info
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userType', response.data.userType);
                localStorage.setItem('userInfo', JSON.stringify({
                    username: response.data.username,
                    firstName: response.data.firstName,
                    lastName: response.data.lastName
                }));
            }
            
            
            // Mock successful API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Store in localStorage for development purposes
            // In production, this should be handled by the backend with proper auth
            const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check for duplicate username or email
            const userExists = existingUsers.some(user => 
                user.username === formData.username || user.email === formData.email
            );
            
            if (userExists) {
                const isDuplicateUsername = existingUsers.some(user => user.username === formData.username);
                throw new Error(isDuplicateUsername ? 'Username already exists' : 'Email already in use');
            }
            
            // Create new user object
            const newUser = {
                _id: Date.now().toString(), // Mock ID
                ...userData,
                createdAt: new Date().toISOString()
            };
            
            // Don't store password in plain text (this is just for demo)
            // In a real app, password would be hashed on the server
            
            // Save to localStorage
            existingUsers.push(newUser);
            localStorage.setItem('users', JSON.stringify(existingUsers));
            
            // Show success message
            setShowSuccessMessage(true);
            
            // Mock token for development
            localStorage.setItem('token', `mock-jwt-token-${newUser._id}`);
            localStorage.setItem('userType', userType);
            localStorage.setItem('userInfo', JSON.stringify({
                username: formData.username,
                firstName: formData.firstName,
                lastName: formData.lastName,
                ...(userType === 'shopkeeper' && {
                    storeName: formData.storeName,
                    address: formData.address
                })
            }));
            
            // Redirect after a delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
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
                                placeholder="Phone Number" 
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <FaPhone className='icon' />
                            {errors.phone && <span className="error">{errors.phone}</span>}
                        </div>
                    </div>
                    
                    <div className='inputbox'>
                        <label htmlFor="username">Username:</label>
                        <input 
                            type="text" 
                            id="username" 
                            placeholder="Choose a username" 
                            value={formData.username}
                            onChange={handleChange}
                            required 
                        />
                        <FaUserAlt className='icon' />
                        {errors.username && <span className="error">{errors.username}</span>}
                    </div>
                    
                    <div className="form-row">
                        <div className='inputbox'>
                            <label htmlFor="password">Password:</label>
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="Password" 
                                value={formData.password}
                                onChange={handleChange}
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
                    
                    {userType === 'shopkeeper' && (
                        <>
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
                            
                            <div className='inputbox'>
                                <label htmlFor="address">Store Address:</label>
                                <input 
                                    type="text" 
                                    id="address" 
                                    placeholder="Store Address" 
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                />
                                <FaMapMarkerAlt className='icon' />
                                {errors.address && <span className="error">{errors.address}</span>}
                            </div>
                        </>
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