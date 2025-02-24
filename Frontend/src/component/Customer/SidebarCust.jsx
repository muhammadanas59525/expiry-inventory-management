import React from 'react';
import { NavLink } from 'react-router-dom';
import './SidebarCust.css';

const SidebarCust = () => {
  return (
    <div className="sidebar">
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>Home</NavLink>
        </li>
        <li>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? 'active' : '')}>Cart</NavLink>
        </li>
        <li>
          <NavLink to="/bill" className={({ isActive }) => (isActive ? 'active' : '')}>Order</NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>Profile</NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : '')}>Settings</NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>About</NavLink>
        </li>
        <li>
          <NavLink to="/other" className={({ isActive }) => (isActive ? 'active' : '')}>Other</NavLink>
        </li>
      </ul>
    </div>
  );
};

export default SidebarCust;