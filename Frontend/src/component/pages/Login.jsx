import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import { FaUserAlt } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        userType: 'customer'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

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
        
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        if (!formData.password.trim()) newErrors.password = 'Password is required';
        
        return newErrors;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        setLoading(true);
        
        try {
            // Send username, password, and userType directly in the request body
            const response = await axios.post('http://localhost:3000/api/user/login', {
                username: formData.username,
                password: formData.password,
                userType: formData.userType
            });
            
            console.log("Login Response:", response.data);
            
            if (response.data) {
                // Store token
                localStorage.setItem('token', response.data.token);
                
                // Extract user info
                const userInfo = {
                    _id: response.data._id,
                    username: response.data.username,
                    email: response.data.email,
                    userType: response.data.userType
                };
                
                // Store user info
                localStorage.setItem('userInfo', JSON.stringify(userInfo));
                
                // Update auth state via props
                if (onLogin) {
                    onLogin(userInfo, response.data.token);
                }
                
                // Navigate based on user type
                switch(response.data.userType) {
                    case 'admin':
                        navigate('/admin');
                        break;
                    case 'shopkeeper':
                        navigate('/shopkeeper');
                        break;
                    case 'customer':
                    default:
                        navigate('/customer');
                        break;
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.response) {
                if (error.response.status === 401) {
                    setErrors({ general: 'Invalid username or password' });
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
            <form onSubmit={handleLogin}>
                <div className="container">
                    <div className="logo">
                        <h1>EXIMS</h1>
                    </div>
                    
                    {errors.general && <div className="error-message">{errors.general}</div>}
                    
                    <div className='inputbox'>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                        <FaUserAlt className='icon' />
                        {errors.username && <span className="error">{errors.username}</span>}
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
                        <label htmlFor="userType">User Type:</label>
                        <select
                            id="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            required>
                            <option value="customer">Customer</option>
                            <option value="shopkeeper">Shopkeeper</option>
                            <option value="admin">Admin</option>
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