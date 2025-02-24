import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
    const navigate = useNavigate();

    const handleSignup = (e) => {
        e.preventDefault();
        // Add your signup logic here
        navigate('/');
    };

    return (
        <div className="signup">
            <form onSubmit={handleSignup}>
                <div className="container">
                    <div className='inputbox'>
                        <label htmlFor="username">First Name:</label>
                        <input type="text" id="fname" placeholder="First Name" required />
                    </div>
                    <div className='inputbox'>
                        <label htmlFor="username">Last Name:</label>
                        <input type="text" id="lname" placeholder="Last Name" required />
                    </div>
                    <div className='inputbox'>
                        <label htmlFor="username">Phone Number:</label>
                        <input type="number" id="pnumber" placeholder="Phone Number" required />
                    </div>
                    <div className='inputbox'>
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" placeholder='Password' name="password" required />
                    </div>
                    <div className='inputbox'>
                        <label htmlFor="password">Confirm Password:</label>
                        <input type="password" id="confirmPassword" placeholder='Confirm Password' name="confirmPassword" required />
                    </div>
                    <div className="button">
                        <button type="submit">Sign Up</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Signup;