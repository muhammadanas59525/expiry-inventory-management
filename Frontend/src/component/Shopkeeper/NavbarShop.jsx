import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaExclamationCircle, FaSignOutAlt, FaUser } from 'react-icons/fa';
import './NavbarShop.css';

const NavbarShop = ({ onSearch, user, userType, onLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  
  const isAuthenticated = !!user;

  useEffect(() => {
    console.log('NavbarShop - User:', user);
    
    // Check for expired/soon-to-expire products
    checkNotifications();
  }, [user]);

  const checkNotifications = () => {
    // Mock product data with expiry dates
    const mockProducts = [
      {
        id: 1,
        name: 'Product 1',
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      },
      {
        id: 2,
        name: 'Product 2',
        expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago (expired)
      },
      {
        id: 3,
        name: 'Product 3',
        expiryDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000) // 9 days from now
      }
    ];
    
    const currentDate = new Date();
    
    // Find expired and soon-to-expire products
    const expiredProducts = mockProducts.filter(product => 
      new Date(product.expiryDate) < currentDate
    );
    
    const soonToExpireProducts = mockProducts.filter(product => {
      const expiryDate = new Date(product.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry > 0 && daysUntilExpiry <= 10;
    });
    
    // Set notification count
    setNotificationCount(expiredProducts.length + soonToExpireProducts.length);
    
    // Set alert message if there are any expired products
    if (expiredProducts.length > 0) {
      setAlertMessage(`${expiredProducts.length} product${expiredProducts.length > 1 ? 's' : ''} expired!`);
      setShowAlert(true);
    } else if (soonToExpireProducts.length > 0) {
      setAlertMessage(`${soonToExpireProducts.length} product${soonToExpireProducts.length > 1 ? 's' : ''} expiring soon!`);
      setShowAlert(true);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Pass search query to parent component
      if (onSearch) {
        onSearch(searchQuery);
      }
      
      // If we're not already on the home page, navigate there with the search query
      if (window.location.pathname !== '/shopkeeper') {
        navigate('/shopkeeper?search=' + encodeURIComponent(searchQuery));
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleViewNotifications = () => {
    navigate('/shopkeeper/notification');
  };
  
  const handleCloseAlert = () => {
    setShowAlert(false);
  };
  
  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback if onLogout prop is not provided
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      navigate('/login');
    }
  };

  return (
    <div className="NavBarShop">
      <nav className="navbar">
        <h1>EXIMS</h1>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            aria-label="Search products"
          />
          <button onClick={handleSearch} aria-label="Search">
            <FaSearch />
          </button>
        </div>
        
        <div className="navbar-menu">
          <Link to='/shopkeeper/' className="navbar-menu-item">Home</Link>
          <Link to='/shopkeeper/erp' className="navbar-menu-item">Billing</Link>
          <Link to='/shopkeeper/addproduct' className="navbar-menu-item">Add Product</Link>
          
          {isAuthenticated ? (
            <>
              <div className="user-info">
                <Link to='/shopkeeper/profile' className="navbar-menu-item">
                  <FaUser className="icon" /> {user?.name || 'Profile'}
                </Link>
              </div>
              <button onClick={handleLogoutClick} className="navbar-menu-item logout-btn">
                <FaSignOutAlt className="icon" /> Logout
              </button>
            </>
          ) : (
            <Link to='/login' className="navbar-menu-item">Login</Link>
          )}
          
          <div className="notification-badge-container" onClick={handleViewNotifications}>
            <FaBell />
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span>
            )}
          </div>
        </div>
        
        {showAlert && (
          <div className="expiry-alert">
            <FaExclamationCircle className="alert-icon" />
            <span className="alert-text">{alertMessage}</span>
            <div className="expiry-alerts-btns">
              <button className="view-notifications" onClick={handleViewNotifications}>
                View
              </button>
              <button className="close-alert" onClick={handleCloseAlert}>×</button>
            </div>
          </div>
        )}
      </nav>
      <div className="main-container">
        <Outlet/>
      </div>
    </div>
  );
};

export default NavbarShop;