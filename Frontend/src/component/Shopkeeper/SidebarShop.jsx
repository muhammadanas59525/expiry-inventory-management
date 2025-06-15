import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaHome, FaCog, FaUser, FaBox, FaPlus, FaInfo, FaEllipsisH, FaBell } from 'react-icons/fa';
import axios from 'axios';
import './SidebarShop.css';

const SidebarShop = () => {
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    checkNotifications();
  }, []);

  const checkNotifications = async () => {
    try {
      // Mock data for now
      const mockProducts = [
        {
          _id: '1',
          name: 'Product 1',
          expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        },
        {
          _id: '2',
          name: 'Product 2',
          expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          _id: '3',
          name: 'Product 3',
          expiryDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
        }
      ];
      
      const currentDate = new Date();
      const count = mockProducts.filter(product => {
        const expiryDate = new Date(product.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 10;
      }).length;
      
      setNotificationCount(count);
      
      // When backend is ready, uncomment this
      // const response = await axios.get('http://localhost:5000/api/notifications/count');
      // setNotificationCount(response.data.count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <div className="sidebar-shop">
      <ul>
        <li>
          <NavLink to="/shopkeeper/" className={({ isActive }) => isActive ? "active" : ""}>
            <FaHome className="icon" />
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/shopkeeper/inventory" className={({ isActive }) => isActive ? "active" : ""}>
            <FaBox className="icon" /> Inventory
          </NavLink>
        </li>
        <li>
          <NavLink to="/shopkeeper/addproduct" className={({ isActive }) => isActive ? "active" : ""}>
            <FaPlus className="icon" /> Add Product
          </NavLink>
        </li>
        <li>
          <NavLink to="/shopkeeper/analysis" className={({ isActive }) => isActive ? "active" : ""}>
            <FaPlus className="icon" /> Analysis
          </NavLink>
        </li>
        <li>
          <NavLink to="/shopkeeper/profile" className={({ isActive }) => isActive ? "active" : ""}>
            <FaUser className="icon" /> Profile
          </NavLink>
        </li>
        <li>
          <NavLink to="/shopkeeper/settings" className={({ isActive }) => isActive ? "active" : ""}>
            <FaCog className="icon" /> Settings
          </NavLink>
        </li>
        <li>
          <NavLink to="/shopkeeper/notification" className={({ isActive }) => isActive ? "active" : ""}>
            <div className="notification-icon-container">
              <FaBell className="icon" />
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </div>
            Notifications
          </NavLink>
        </li>
        <li>
          <NavLink to="/shopkeeper/about" className={({ isActive }) => isActive ? "active" : ""}>
            <FaInfo className="icon" /> About
          </NavLink>
        </li>
        <li>
          <NavLink to="/shopkeeper/other" className={({ isActive }) => isActive ? "active" : ""}>
            <FaEllipsisH className="icon" /> Other
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default SidebarShop;