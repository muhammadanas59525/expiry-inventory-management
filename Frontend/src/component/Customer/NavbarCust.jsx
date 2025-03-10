import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import './NavbarCust.css';

const NavbarCust = ({ addSearchQuery }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      addSearchQuery(searchQuery);
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <div className="NavBarCust">
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
          <Link to='/customer/'>Home</Link>
          <Link to='/customer/cart'>Cart</Link>
          <button onClick={() => navigate('/login')}>Login</button>
          <button onClick={() => navigate('/register')}>Register</button>
        </div>
      </nav>
      <div className="maincust-container">
        <Outlet/>
      </div>
    </div>
  );
};

export default NavbarCust;