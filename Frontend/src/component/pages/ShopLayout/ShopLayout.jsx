import React from 'react'
import '../ShopLayout/ShopLayout.css'
import SidebarShop from '../../Shopkeeper/SidebarShop'
import NavbarShop from '../../Shopkeeper/NavbarShop'

function ShopLayout() {
  return (
    <div className='ShopLayout'>
        <SidebarShop/>
        <NavbarShop/>
    </div>
  )
}

export default ShopLayout