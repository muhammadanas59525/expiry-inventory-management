import React from 'react'
import '../ShopLayout/ShopLayout.css'
import SidebarShop from '../../Shopkeeper/SidebarShop'
import NavbarShop from '../../Shopkeeper/NavbarShop'
import { Outlet } from 'react-router-dom'

function ShopLayout({ user, type, onLogout }) {
  console.log('ShopLayout rendering with user:', user);
  
  return (
    <div className='ShopLayout'>
        <SidebarShop user={user} />
        <NavbarShop user={user} userType={type} onLogout={onLogout} />
        <div className="shop-content">
          <Outlet />
        </div>
    </div>
  )
}

export default ShopLayout