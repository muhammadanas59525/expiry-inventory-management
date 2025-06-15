import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import './Login.css';
import { FaUserAlt } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'customer'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
        
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password.trim()) newErrors.password = 'Password is required';
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form 
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setLoading(true);
        setErrors({});
        
        try {
            console.log('Login data:', {
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            
            const response = await axiosInstance.post('/users/login', {
                email: formData.email,
                password: formData.password,
                role: formData.role
            });
            
            console.log("Login Response:", response.data);
            
            if (response.data && response.data.token) {
                // Clear any existing data
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                
                // Store token and user info in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userInfo', JSON.stringify(response.data.user));
                
                // Call the onLogin prop with user data and token 
                onLogin(response.data.user, response.data.token);
                
                // Get user role from response
                const userRole = response.data.user.role;
                
                // Determine the redirect path based on user role
                const redirectPath = userRole === 'shopkeeper' 
                    ? '/shopkeeper' 
                    : userRole === 'customer' 
                    ? '/customer' 
                    : userRole === 'admin' 
                    ? '/admin' 
                    : '/login';
                
                console.log('User successfully logged in. Redirecting to:', redirectPath);
                
                // Navigate immediately without timeout
                navigate(redirectPath, { replace: true });
            } else {
                setErrors({ general: 'Login successful but token not received. Please try again.' });
            }
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.response) {
                if (error.response.status === 401) {
                    setErrors({ general: 'Invalid email or password' });
                } else {
                    setErrors({ general: error.response.data.message || 'Login failed' });
                }
            } else if (error.request) {
                setErrors({ general: 'Server not responding. Please try again.' });
            } else {
                setErrors({ general: error.message || 'An error occurred during login' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <form onSubmit={handleSubmit}>
                <div className="container">
                    <div className="logo">
                        <h1>EXIMS</h1>
                    </div>
                    
                    {errors.general && <div className="error-message">{errors.general}</div>}
                    
                    <div className='inputbox'>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <FaUserAlt className='icon' />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </div>
                    
                    <div className='inputbox'>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            placeholder='Password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <RiLockPasswordFill className='icon' />
                        {errors.password && <span className="error">{errors.password}</span>}
                    </div>
                    
                    <div className='inputbox'>
                        <label htmlFor="role">User Type:</label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={handleChange}
                            required>
                            <option value="customer">Customer</option>
                            <option value="shopkeeper">Shopkeeper</option>
                        </select>
                    </div>
                    
                    <div className="remember">
                        <label><input type='checkbox' />Remember Me</label>
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </div>
                    
                    <div className="button">
                        <button className='login-btn' type="submit" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                    
                    <div className="register">
                        <p>Don't have an account? <Link to='/register'>Register</Link></p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Login;