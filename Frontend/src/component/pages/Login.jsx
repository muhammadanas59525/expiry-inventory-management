import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { FaUserAlt } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

const Login = ({ setUserType }) => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserTypeLocal] = useState('customer');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Dummy credentials for demonstration purposes
        const credentials = {
            admin: { username: 'admin', password: 'admin123' },
            shopkeeper: { username: 'shopkeeper', password: 'shop123' },
            customer: { username: 'customer', password: 'cust123' }
        };

        if (credentials[userType] && credentials[userType].username === username && credentials[userType].password === password) {
            setUserType(userType);
            localStorage.setItem('userType', userType); // Store userType in localStorage
            navigate('/');
        } else {
            setError('Incorrect username or password');
        }
    };

    return (
        <div className="login">
            <form onSubmit={handleLogin}>
                <div className="container">
                    <div className="logo">
                        <h1>EXIMS</h1>
                    </div>
                    {error && <div className="error">{error}</div>}
                    <div className='inputbox'>
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <FaUserAlt className='icon' />
                    </div>
                    <div className='inputbox'>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            placeholder='Password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <RiLockPasswordFill className='icon' />
                    </div>
                    <div className='inputbox'>
                        <label htmlFor="userType">User Type:</label>
                        <select
                            id="userType"
                            value={userType}
                            onChange={(e) => setUserTypeLocal(e.target.value)}
                            required>
                            <option value="customer">Customer</option>
                            <option value="shopkeeper">Shopkeeper</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="remember">
                        <label><input type='checkbox' />Remember Me</label>
                        <a href="/">Forgot Password?</a>
                    </div>
                    <div className="button">
                        <button type="submit">Login</button>
                    </div>
                    <div className="register">
                        <p>Don't have an account? <a href='/register'>Register</a></p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Login;