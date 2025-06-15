import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import './NavbarCust.css';

const NavbarCust = ({ addSearchQuery, user, onLogout }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      addSearchQuery(searchQuery);
      console.log('Searching for:', searchQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="navbar-cust">
      <div className="navbar-left">
        <h1>EXIMS</h1>
      </div>
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSearch}><FaSearch /></button>
      </div>
      <div className="navbar-links">
        <Link to="/customer/" className="nav-link">Home</Link>
        <Link to="/customer/cart" className="nav-link">
          <FaShoppingCart /> Cart
        </Link>
        <div className="user-menu">
          <span className="username">{user?.name || 'Guest'}</span>
          <div className="dropdown-menu">
            <Link to="/customer/profile" className="dropdown-item">Profile</Link>
            <Link to="/customer/checkout" className="dropdown-item">Orders</Link>
            <button onClick={onLogout} className="dropdown-item logout">
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarCust;