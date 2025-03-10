import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './SidebarCust.css';

const SidebarCust = () => {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <Link to="/customer/" className={({ isActive }) => (isActive ? 'active' : '')}>Home</Link>
        </li>
        <li>
          <Link to="/customer/cart" className={({ isActive }) => (isActive ? 'active' : '')}>Cart</Link>
        </li>
        <li>
          <Link to="/customer/checkout" className={({ isActive }) => (isActive ? 'active' : '')}>Order</Link>
        </li>
        <li>
          <Link to="/customer/profile" className={({ isActive }) => (isActive ? 'active' : '')}>Profile</Link>
        </li>
        <li>
          <Link to="/customer/settings" className={({ isActive }) => (isActive ? 'active' : '')}>Settings</Link>
        </li>
        <li>
          <Link to="/customer/about" className={({ isActive }) => (isActive ? 'active' : '')}>About</Link>
        </li>
        <li>
          <Link to="/customer/other" className={({ isActive }) => (isActive ? 'active' : '')}>Other</Link>
        </li>
      </ul>
    </div>
  );
};

export default SidebarCust;