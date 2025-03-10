import React from 'react'
import SidebarCust from '../../Customer/SidebarCust'
import NavbarCust from '../../Customer/NavbarCust'

function CustomerLayout() {
  return (
    <div className='CustomerLayout'>
        <SidebarCust/>
        <NavbarCust/>
    </div>
  )
}

export default CustomerLayout