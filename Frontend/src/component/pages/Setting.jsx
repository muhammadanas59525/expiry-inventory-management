import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Setting.css';

const Settings = ({user, searchHistory, setSearchHistory }) => {
    const [activeModal, setActiveModal] = useState(null);
    const [theme, setTheme] = useState('default');
    const navigate = useNavigate();

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    const openModal = (modalName) => {
        setActiveModal(modalName);
    };

    const closeModal = () => {
        setActiveModal(null);
    };

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        closeModal();
    };

    

    const handleLogout = () => {
        if (window.confirm('Do you want to logout?')) {
            // Perform logout logic here
            console.log('User logged out');
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            navigate('/login'); // Redirect to login page
        }
    };

    const handleDeleteSearch = (index) => {
        const updatedHistory = searchHistory.filter((_, i) => i !== index);
        setSearchHistory(updatedHistory);
    };

    return (
        <div className="settings-container">
            <h1>Settings</h1>
            <div className="settings-cards">
                <div className="settings-card" onClick={() => openModal('personalDetails')}>Personal Details</div>
                <div className="settings-card" onClick={() => openModal('theme')}>Theme</div>
                <div className="settings-card" onClick={() => openModal('giftCard')}>Gift Card</div>
                <div className="settings-card" onClick={() => openModal('paymentHistory')}>Payment History</div>
                <div className="settings-card" onClick={() => openModal('searchHistory')}>Search History</div>
                <div className="settings-card" onClick={() => openModal('logout')}>Logout</div>
                <div className="settings-card" onClick={() => openModal('customerService')}>Customer Service</div>
            </div>

            {activeModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        {activeModal === 'personalDetails' && (
                            <div>
                                <h2>Personal Details</h2>
                                <p><strong>Name:</strong>{user.username}</p>
                                <p><strong>Email:</strong>{user.email}</p>
                                <p><strong>Phone:</strong>{user.phone}</p>
                                <p><strong>Address:</strong>{user.address}</p>
                            </div>
                        )}
                        {activeModal === 'theme' && (
                            <div>
                                <h2>Change Theme</h2>
                                <div className="theme-btns">
                                    <button onClick={() => handleThemeChange('default')}>Default</button>
                                    <button onClick={() => handleThemeChange('light')}>Light Mode</button>
                                    <button onClick={() => handleThemeChange('dark')}>Dark Mode</button>
                                </div>
                            </div>
                        )}
                        {activeModal === 'giftCard' && <div>Manage Gift Card</div>}
                        {activeModal === 'paymentHistory' && <div>View Payment History</div>}
                        {activeModal === 'searchHistory' && (
                            <div>
                                <h2>Search History</h2>
                                <ul>
                                    {searchHistory.map((item, index) => (
                                        <li key={index}>
                                            {item}
                                            <button className="delete-button" onClick={() => handleDeleteSearch(index)}>×</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {activeModal === 'logout' && (
                            <div className='logout-dialog'>
                                <h2>Logout</h2>
                                <button className='logout-btn' onClick={handleLogout}>Confirm Logout</button>
                            </div>
                        )}
                        
                        {activeModal === 'customerService' && (
                            <div>
                                <h2>Contact Customer Service</h2>
                                <p>Email: exims@gmail.com</p>
                                <p>Phone: +1234567890</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;