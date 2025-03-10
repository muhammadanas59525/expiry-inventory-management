import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProfileCust.css';

const ProfileCust = ({ user }) => {
    const [activeTab, setActiveTab] = useState('personal');
    const [profileDetails, setProfileDetails] = useState({
        username: user?.username || "User",
        email: user?.email || "",
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
        address: user?.address || "",
        createdAt: user?.createdAt || new Date().toISOString()
    });
    
    const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState(false);
    const [isChangePasswordPopupOpen, setIsChangePasswordPopupOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    
    // Form state for profile update
    const [updatedProfile, setUpdatedProfile] = useState({
        firstName: profileDetails.firstName,
        lastName: profileDetails.lastName,
        email: profileDetails.email,
        phone: profileDetails.phone,
        address: profileDetails.address
    });
    
    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // Stats
    const [stats, setStats] = useState({
        orderCount: 0,
        totalSpent: 0,
        savedItems: 0,
        reviewsWritten: 0
    });

    useEffect(() => {
        // Initialize with data from props if available
        if (user) {
            setProfileDetails({
                username: user.username || "User",
                email: user.email || "",
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phone: user.phone || "",
                address: user.address || "",
                createdAt: user.createdAt || new Date().toISOString()
            });
            
            setUpdatedProfile({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                phone: user.phone || "",
                address: user.address || ""
            });
        }
        
        fetchUserData();
        fetchOrders();
    }, [user]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                toast.error("Authentication failed. Please login again.");
                return;
            }

            // Use the correct endpoint from your backend routes
            const response = await axios.get('http://localhost:3000/api/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data) {
                const userData = response.data;
                setProfileDetails({
                    username: userData.username || "User",
                    email: userData.email || "",
                    firstName: userData.firstName || "",
                    lastName: userData.lastName || "",
                    phone: userData.phone || "",
                    address: userData.address || "",
                    createdAt: userData.createdAt || new Date().toISOString()
                });
                
                setUpdatedProfile({
                    firstName: userData.firstName || "",
                    lastName: userData.lastName || "",
                    email: userData.email || "",
                    phone: userData.phone || "",
                    address: userData.address || ""
                });
            }
        } catch (err) {
            console.error("Error fetching user data:", err);
            // Already using data from props, no need to update
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // This endpoint might need to be created in your backend
            const response = await axios.get('http://localhost:3000/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && Array.isArray(response.data)) {
                setOrders(response.data);
                
                // Calculate stats
                const orderCount = response.data.length;
                const totalSpent = response.data.reduce((sum, order) => sum + (order.total || 0), 0);
                
                setStats(prev => ({
                    ...prev,
                    orderCount,
                    totalSpent
                }));
            }
        } catch (err) {
            console.error("Error fetching order history:", err);
            // Set sample order data for demonstration
            const sampleOrders = [
                {
                    _id: "sample1",
                    orderNumber: "ORD-12345",
                    date: new Date().toISOString(),
                    status: "delivered",
                    total: 124.99,
                    items: [
                        { name: "Product 1", quantity: 2, price: 49.99 },
                        { name: "Product 2", quantity: 1, price: 25.01 }
                    ]
                },
                {
                    _id: "sample2",
                    orderNumber: "ORD-12346",
                    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    status: "processing",
                    total: 75.50,
                    items: [
                        { name: "Product 3", quantity: 1, price: 75.50 }
                    ]
                }
            ];
            
            setOrders(sampleOrders);
            
            setStats(prev => ({
                ...prev,
                orderCount: sampleOrders.length,
                totalSpent: sampleOrders.reduce((sum, order) => sum + order.total, 0),
                savedItems: 5,
                reviewsWritten: 3
            }));
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            await axios.put('http://localhost:3000/api/profile', updatedProfile, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Update the local state with new profile details
            setProfileDetails(prev => ({
                ...prev,
                firstName: updatedProfile.firstName,
                lastName: updatedProfile.lastName,
                email: updatedProfile.email,
                phone: updatedProfile.phone,
                address: updatedProfile.address
            }));
            
            setIsUpdatePopupOpen(false);
            toast.success("Profile updated successfully!");
            
        } catch (err) {
            console.error("Error updating profile:", err);
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }
        
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            await axios.put('http://localhost:3000/api/changePassword', 
                {
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setIsChangePasswordPopupOpen(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            toast.success("Password changed successfully!");
            
        } catch (err) {
            console.error("Error changing password:", err);
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    const getOrderStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'status-delivered';
            case 'processing': return 'status-processing';
            case 'shipped': return 'status-shipped';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    return (
        <div className="profile-container">
            <ToastContainer position="top-right" autoClose={3000} />
            
            {loading && <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading...</div>
            </div>}
            
            <div className="profile-header">
                <div className="avatar-container">
                    <img 
                        src={`https://ui-avatars.com/api/?name=${profileDetails.firstName || profileDetails.username}&background=3498db&color=fff&size=128`} 
                        alt="Profile" 
                        className="profile-avatar"
                    />
                    <div className="avatar-upload">
                        <i className="fa fa-camera"></i>
                    </div>
                </div>
                
                <div className="profile-info">
                    <h1 className="profile-name">
                        {profileDetails.firstName} {profileDetails.lastName || profileDetails.username}
                    </h1>
                    <p className="profile-email">{profileDetails.email}</p>
                    <div className="profile-status">Customer Account</div>
                    <p className="profile-joined">Member since {formatDate(profileDetails.createdAt)}</p>
                </div>
            </div>
            
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-value">{stats.orderCount}</div>
                    <div className="stat-label">Orders</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">${stats.totalSpent.toFixed(2)}</div>
                    <div className="stat-label">Total Spent</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.savedItems}</div>
                    <div className="stat-label">Saved Items</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.reviewsWritten}</div>
                    <div className="stat-label">Reviews</div>
                </div>
            </div>

            <div className="profile-content">
                <div className="profile-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('personal')}
                    >
                        <i className="fas fa-user"></i> Personal Info
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <i className="fas fa-shopping-bag"></i> Orders
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('addresses')}
                    >
                        <i className="fas fa-map-marker-alt"></i> Addresses
                    </button>
                </div>
                
                <div className="tab-content">
                    {activeTab === 'personal' && (
                        <div className="personal-info">
                            <h2 className="section-title">Personal Information</h2>
                            
                            <div className="info-row">
                                <div className="info-label">Username:</div>
                                <div className="info-value">{profileDetails.username}</div>
                            </div>
                            
                            <div className="info-row">
                                <div className="info-label">Full Name:</div>
                                <div className="info-value">
                                    {profileDetails.firstName} {profileDetails.lastName || 'Not provided'}
                                </div>
                            </div>
                            
                            <div className="info-row">
                                <div className="info-label">Email:</div>
                                <div className="info-value">{profileDetails.email}</div>
                            </div>
                            
                            <div className="info-row">
                                <div className="info-label">Phone:</div>
                                <div className="info-value">{profileDetails.phone || 'Not provided'}</div>
                            </div>
                            
                            <div className="info-row">
                                <div className="info-label">Address:</div>
                                <div className="info-value">{profileDetails.address || 'Not provided'}</div>
                            </div>
                            
                            <div className="action-buttons">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => setIsUpdatePopupOpen(true)}
                                >
                                    Edit Profile
                                </button>
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => setIsChangePasswordPopupOpen(true)}
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'orders' && (
                        <div className="order-history">
                            <h2 className="section-title">Order History</h2>
                            
                            {orders.length === 0 ? (
                                <div className="no-orders">
                                    <p>You haven't placed any orders yet.</p>
                                    <Link to="/customer" className="btn btn-primary">Start Shopping</Link>
                                </div>
                            ) : (
                                <table className="order-list">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Total</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => (
                                            <tr key={order._id}>
                                                <td data-label="Order ID" className="order-id">
                                                    {order.orderNumber || `#${order._id.substring(0, 8)}`}
                                                </td>
                                                <td data-label="Date" className="order-date">
                                                    {formatDate(order.date || order.createdAt)}
                                                </td>
                                                <td data-label="Status">
                                                    <span className={`order-status ${getOrderStatusClass(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td data-label="Total" className="order-total">
                                                    ${order.total?.toFixed(2)}
                                                </td>
                                                <td data-label="Actions" className="order-actions">
                                                    <button className="order-view-btn">
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'addresses' && (
                        <div className="addresses">
                            <h2 className="section-title">Your Addresses</h2>
                            
                            <p>You can manage your shipping addresses in this section.</p>
                            
                            {/* This would be populated if you implement the address feature */}
                            <div className="address-list">
                                <div className="address-card default">
                                    <div className="default-badge">Default</div>
                                    <h3 className="address-type">Home</h3>
                                    <p className="address-text">
                                        {profileDetails.address || '123 Main St, Apt 4B, Anytown, CA 12345'}
                                    </p>
                                    <div className="address-actions">
                                        <button className="address-btn edit-address">
                                            Edit
                                        </button>
                                        <button className="address-btn delete-address">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="add-address-btn">
                                    <i className="fas fa-plus"></i>
                                    Add New Address
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Update Profile Popup */}
            {isUpdatePopupOpen && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <div className="popup-header">
                            <h2 className="popup-title">Update Profile</h2>
                            <button 
                                className="close-popup"
                                onClick={() => setIsUpdatePopupOpen(false)}
                            >
                                &times;
                            </button>
                        </div>
                        
                        <form onSubmit={handleUpdateProfile}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={updatedProfile.firstName}
                                        onChange={(e) => setUpdatedProfile({...updatedProfile, firstName: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={updatedProfile.lastName}
                                        onChange={(e) => setUpdatedProfile({...updatedProfile, lastName: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={updatedProfile.email}
                                    onChange={(e) => setUpdatedProfile({...updatedProfile, email: e.target.value})}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={updatedProfile.phone}
                                    onChange={(e) => setUpdatedProfile({...updatedProfile, phone: e.target.value})}
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={updatedProfile.address}
                                    onChange={(e) => setUpdatedProfile({...updatedProfile, address: e.target.value})}
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setIsUpdatePopupOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Change Password Popup */}
            {isChangePasswordPopupOpen && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <div className="popup-header">
                            <h2 className="popup-title">Change Password</h2>
                            <button 
                                className="close-popup"
                                onClick={() => setIsChangePasswordPopupOpen(false)}
                            >
                                &times;
                            </button>
                        </div>
                        
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    required
                                />
                                {passwordData.newPassword && passwordData.confirmPassword &&
                                 passwordData.newPassword !== passwordData.confirmPassword && (
                                    <div className="form-error">Passwords don't match</div>
                                )}
                            </div>
                            
                            <div className="form-actions">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setIsChangePasswordPopupOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                    disabled={loading || (passwordData.newPassword !== passwordData.confirmPassword)}
                                >
                                    {loading ? 'Updating...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileCust;