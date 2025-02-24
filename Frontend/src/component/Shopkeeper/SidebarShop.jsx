import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCog, FaUser, FaBox, FaPlus, FaInfo, FaEllipsisH } from 'react-icons/fa';
import './SidebarShop.css';

const SidebarShop = () => {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaHome className="icon" /> Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/inventory" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaBox className="icon" /> Inventory
          </NavLink>
        </li>
        <li>
          <NavLink to="/addproduct" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaPlus className="icon" /> Add Product
          </NavLink>
        </li>
        <li>
          <NavLink to="/analysis" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaPlus className="icon" /> Analysis
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaUser className="icon" /> Profile
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaCog className="icon" /> Settings
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaInfo className="icon" /> About
          </NavLink>
        </li>
        <li>
          <NavLink to="/other" className={({ isActive }) => (isActive ? 'active' : '')}>
            <FaEllipsisH className="icon" /> Other
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default SidebarShop;