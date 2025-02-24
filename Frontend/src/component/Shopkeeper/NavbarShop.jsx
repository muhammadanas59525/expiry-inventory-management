import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import './NavbarShop.css';

const NavbarShop = ({ addSearchQuery }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      addSearchQuery(searchQuery);
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <nav className="navbar">
      <h1>EXIMS</h1>
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)} 
        />
        <button onClick={handleSearch}><FaSearch /></button>
      </div>
      <div className="links">
        <button onClick={() => navigate('/')}>Home</button>
        <button onClick={() => navigate('/erp')}>Billing</button>
        <button onClick={() => navigate('/addproduct')}>Add Product</button>
        <button onClick={() => navigate('/login')}>Login</button>
        <button onClick={() => navigate('/register')}>Register</button>
      </div>
    </nav>
  );
};

export default NavbarShop;