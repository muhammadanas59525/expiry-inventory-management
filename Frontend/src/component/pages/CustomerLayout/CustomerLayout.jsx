import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarCust from '../../Customer/SidebarCust';
import NavbarCust from '../../Customer/NavbarCust';
import './CustomerLayout.css';

function CustomerLayout({ user, onLogout }) {
  const handleSearch = (query) => {
    console.log('Search query from layout:', query);
    // Implement search functionality here
  };

  return (
    <div className='customer-layout'>
      <SidebarCust user={user} onLogout={onLogout} />
      <div className="customer-content">
        <NavbarCust addSearchQuery={handleSearch} user={user} onLogout={onLogout} />
        <main className="customer-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default CustomerLayout;