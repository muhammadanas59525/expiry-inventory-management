import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axiosInstance from './utils/axios';

// Common Components
import Login from './component/pages/Login';
import Signup from './component/pages/Signup';
import NotFound from './component/pages/NotFound';
import Settings from './component/pages/Setting';
import About from './component/pages/About';
import Upi from './component/pages/Upi';
import Help from './component/pages/Help';

// Admin Components
import Admin from './component/Admin/Admin';
import AdminDashboard from './component/Admin/AdminDashboard';
import AdminUsers from './component/Admin/AdminUsers';

// Shopkeeper Components
import Shopkeeper from './component/Shopkeeper/Shopkeeper';
import Shop from './component/Shopkeeper/Shop';
import HomeShop from './component/Shopkeeper/HomeShop';
import AddProduct from './component/Shopkeeper/AddProduct';
import Inventory from './component/Shopkeeper/Inventory';
import Erp from './component/Shopkeeper/Erp';
import Notishop from './component/Shopkeeper/Notishop';
import ProfileShop from './component/Shopkeeper/ProfileShop';
import NavbarShop from './component/Shopkeeper/NavbarShop';
import SidebarShop from './component/Shopkeeper/SidebarShop';
import ProductDetailsShop from './component/Shopkeeper/ProductDetailsShop';
import Barcodegen from './component/Shopkeeper/Barcodegen';
import Qrcodegen from './component/Shopkeeper/Qrcodegen';
import Analysis from './component/Shopkeeper/Analysis';
import ShopHome from './component/Shop/ShopHome';

// Customer Components
import Customer from './component/Customer/Customer';
import CustomerDashboard from './component/Customer/CustomerDashboard';
import HomeCust from './component/Customer/HomeCust';
import ProductDetailsCust from './component/Customer/ProductDetailsCust';
import Cart from './component/Customer/Cart';
import Checkout from './component/Customer/Checkout';
import CustomerBill from './component/Customer/CustomerBill';
import ProfileCust from './component/Customer/ProfileCust';
import NavbarCust from './component/Customer/NavbarCust';
import SidebarCust from './component/Customer/SidebarCust';
import ShopLayout from './component/pages/ShopLayout/ShopLayout';
import CustomerLayout from './component/pages/CustomerLayout/CustomerLayout';
import CartItems from './component/Customer/Cart';
import OrderConfirmation from './component/Customer/OrderConfirmation'; 

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
    userType: null,
    loading: true
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const userInfo = localStorage.getItem('userInfo');
        
        console.log('Checking auth status. Token exists:', !!token, 'UserInfo exists:', !!userInfo);
        
        if (!token || !userInfo) {
          console.log('No token or userInfo found, not authenticated');
          setAuth({ isAuthenticated: false, user: null, userType: null, loading: false });
          return;
        }

        // Parse userInfo to get initial data
        const parsedUserInfo = JSON.parse(userInfo);
        console.log('User role from localStorage:', parsedUserInfo.role);
        
        // Set auth immediately with stored data to avoid unnecessary loading state
        setAuth({
          isAuthenticated: true,
          user: parsedUserInfo,
          userType: parsedUserInfo.role,
          loading: false
        });
        
        // Skip profile checking since backend endpoints don't exist yet
        // This will use the stored userInfo instead and prevent console errors
        console.log('Using stored user info - skipping profile endpoints');

        /* COMMENTED OUT TO AVOID 404 ERRORS
        try {
          // Try to fetch profile data from different potential endpoints
          // Try several possible routes that might exist in the backend
          let profileResponse = null;
          let errorMessages = [];
          
          // List of potential profile endpoints to try
          const profileEndpoints = [
            '/users/profile',
            '/auth/profile',
            '/user/profile',
            '/profile',
            '/shop/profile'
          ];
          
          // Try each endpoint in sequence until one works
          for (const endpoint of profileEndpoints) {
            try {
              console.log(`Trying ${endpoint} endpoint`);
              profileResponse = await axiosInstance.get(endpoint);
              console.log(`Profile response from ${endpoint}:`, profileResponse.data);
              // If we got here, we found a working endpoint
              break;
            } catch (endpointError) {
              console.log(`Endpoint ${endpoint} failed:`, endpointError.message);
              errorMessages.push(`${endpoint}: ${endpointError.message}`);
            }
          }
          
          if (profileResponse && profileResponse.data) {
            // Extract user data based on different possible response formats
            const userData = profileResponse.data.data || profileResponse.data;
            
            console.log('Setting auth with fresh profile data');
            console.log('User role from API response:', userData.role);
            
            setAuth({
              isAuthenticated: true,
              user: userData,
              userType: userData.role,
              loading: false
            });
          } else {
            console.warn('All profile endpoints failed, using stored user info as fallback');
            console.log('Error messages:', errorMessages.join(' | '));
            // Auth already set with parsedUserInfo above
          }
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
          // Auth already set with parsedUserInfo above
          console.log('Using stored user info as fallback due to profile fetch error');
        }
        */
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setAuth({ isAuthenticated: false, user: null, userType: null, loading: false });
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData, token) => {
    console.log('handleLogin called with:', userData, token);
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setAuth({
      isAuthenticated: true,
      user: userData,
      userType: userData.role,
      loading: false
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setAuth({
      isAuthenticated: false,
      user: null,
      userType: null,
      loading: false
    });
  };

  // Protected route component
  const ProtectedRoute = ({ element, allowedRoles }) => {
    if (auth.loading) {
      console.log('Auth loading, showing loading indicator...');
      return <div className="loading-container">Loading authentication...</div>;
    }
    
    // If not authenticated, redirect to login
    if (!auth.isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    // Check role permissions if allowedRoles is specified
    if (allowedRoles && !allowedRoles.includes(auth.userType)) {
      console.log(`Unauthorized role: ${auth.userType}. Allowed roles: ${allowedRoles.join(', ')}`);
      return <Navigate to="/unauthorized" replace />;
    }
    
    // If we get here, the user is authenticated and authorized
    console.log('User authenticated and authorized as:', auth.userType);
    console.log('Rendering protected route with user:', auth.user);
    
    // Special check for shopkeeper routes
    if (allowedRoles && allowedRoles.includes('shopkeeper') && auth.userType === 'shopkeeper') {
      console.log('Shopkeeper access granted, rendering shopkeeper routes');
    }
    
    return element;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            auth.isAuthenticated ? 
              <Navigate to={getHomeRouteByUserType(auth.userType)} /> : 
              <Login onLogin={handleLogin} />
          } 
        />
        <Route path="/register" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/unauthorized" element={<div>You are not authorized to access this page</div>} />
        <Route path="/upi-payment" element={<Upi />} />

        {/* Admin Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute 
              element={
                <Admin user={auth.user} onLogout={handleLogout}>
                  <Routes>
                    <Route path="/home" element={<AdminDashboard user={auth.user} />} />
                    <Route path="/users" element={<AdminUsers user={auth.user} />} />
                    <Route path="/settings" element={<Settings user={auth.user} />} />
                  </Routes>
                </Admin>
              } 
              allowedRoles={["admin"]}
            />
          }
        />

        <Route 
          path="/shopkeeper/*" 
          element={
            <ProtectedRoute 
              element={<ShopLayout user={auth.user} type={auth.userType} onLogout={handleLogout} />}
              allowedRoles={["shopkeeper"]}
            />
          }
        >     
          <Route path="" element={<HomeShop user={auth.user} searchQuery="" />} />
          <Route path="addproduct" element={<AddProduct />} />
          <Route path="product/:id" element={<ProductDetailsShop user={auth.user} />} />
          <Route path="inventory" element={<Inventory user={auth.user} />} />
          <Route path="about" element={<About user={auth.user} />} />
          <Route path="barcode" element={<Barcodegen user={auth.user} />} />
          <Route path="qrcode" element={<Qrcodegen user={auth.user} />} />
          <Route path="erp" element={<Erp user={auth.user} />} />
          <Route path="analysis" element={<Analysis user={auth.user} />} />
          <Route path="notification" element={<Notishop user={auth.user} />} />
          <Route path="profile" element={<ProfileShop user={auth.user} />} />
          <Route path="settings" element={<Settings user={auth.user} />} />
        </Route>

        <Route 
          path="/customer/*" 
          element={
            <ProtectedRoute 
              element={<CustomerLayout user={auth.user} onLogout={handleLogout} />}
              allowedRoles={["customer"]}
            />
          }
        >     
          <Route path="" element={<HomeCust user={auth.user} />} />
          <Route path="product/:id" element={<ProductDetailsCust user={auth.user}  />} />
          <Route path="cart" element={<Cart user={auth.user} />} />
          <Route path="checkout" element={<Checkout user={auth.user} />} />
          <Route path="bill" element={<CustomerBill user={auth.user} />} />
          <Route path="about" element={<About user={auth.user} />} />
          <Route path="barcode" element={<Barcodegen user={auth.user} />} />
          <Route path="qrcode" element={<Qrcodegen user={auth.user} />} />
          <Route path="order-confirmation" element={<OrderConfirmation />} />
          <Route path="help" element={<Help />} />
          <Route path="profile" element={<ProfileCust user={auth.user} />} />
          <Route path="settings" element={<Settings user={auth.user} />} />
        </Route>

        {/* Root path - redirect based on userType */}
        <Route 
          path="/" 
          element={
            auth.loading ? (
              <div>Loading...</div>
            ) : auth.isAuthenticated ? (
              <Navigate to={getHomeRouteByUserType(auth.userType)} />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

// Helper function to get home route based on userType
function getHomeRouteByUserType(userType) {
    switch (userType) {
        case 'shopkeeper':
            return '/shopkeeper';
        case 'customer':
            return '/customer';
        case 'admin':
            return '/admin';
        default:
            return '/login';
    }
}

export default App;