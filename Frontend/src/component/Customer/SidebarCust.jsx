import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaShoppingCart, FaClipboardList, FaUser, FaCog, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';
import './SidebarCust.css';

const SidebarCust = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar-cust">
      <div className="sidebar-header">
        <h2>EXIMS</h2>
        {user && <p>{user.name}</p>}
      </div>
      
      <ul className="sidebar-menu">
        <li>
          <NavLink 
            to="/customer/" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FaHome />
            <span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/customer/cart" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FaShoppingCart />
            <span>Cart</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/customer/checkout" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FaClipboardList />
            <span>Orders</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/customer/profile" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FaUser />
            <span>Profile</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/customer/settings" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FaCog />
            <span>Settings</span>
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/customer/about" 
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <FaInfoCircle />
            <span>About</span>
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={onLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarCust;