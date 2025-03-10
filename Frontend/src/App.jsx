import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

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
    userType: null, // Changed from 'role' to 'userType' for consistency
    loading: true
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setAuth({ isAuthenticated: false, user: null, userType: null, loading: false });
          return;
        }

        // Verify token and get user data
        const response = await axios.get('http://localhost:3000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setAuth({
            isAuthenticated: true,
            user: response.data.user,
            userType: response.data.user.userType, // Using consistent naming
            loading: false
          });
        } else {
          // Token invalid
          localStorage.removeItem('token');
          setAuth({ isAuthenticated: false, user: null, userType: null, loading: false });
        }
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        setAuth({ isAuthenticated: false, user: null, userType: null, loading: false });
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setAuth({
      isAuthenticated: true,
      user: userData,
      userType: userData.userType, // Using consistent naming
      loading: false
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setAuth({
      isAuthenticated: false,
      user: null,
      userType: null, // Using consistent naming
      loading: false
    });
  };

  // Protected route component
  const ProtectedRoute = ({ element, allowedRoles }) => {
    if (auth.loading) return <div>Loading...</div>;
    
    if (!auth.isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    if (allowedRoles && !allowedRoles.includes(auth.userType)) { // Changed from auth.role to auth.userType
      return <Navigate to="/unauthorized" />;
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
        // In your Routes configuration file
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
                   <Route path="" element={<HomeShop user={auth.user} />} />
                   <Route path="addproduct" element={<AddProduct user={auth.user} />} />
                    {/* <Route path="erp" element={<Inventory user={auth.user} />} /> */}
                    <Route path="product/:id" element={<ProductDetailsShop user={auth.user} />} />
                    <Route path="inventory" element={<Inventory user={auth.user} />} />
                    <Route path="about" element={<About user={auth.user} />} />
                    {/* Code Generation */}
                    <Route path="barcode" element={<Barcodegen user={auth.user} />} />
                    <Route path="qrcode" element={<Qrcodegen user={auth.user} />} />
                    
                    {/* Business & Analytics */}
                    <Route path="erp" element={<Erp user={auth.user} />} />
                    <Route path="analysis" element={<Analysis user={auth.user} />} />
                    
                    {/* User & Account */}
                    <Route path="notification" element={<Notishop user={auth.user} />} />
                    <Route path="profile" element={<ProfileShop user={auth.user} />} />
                    <Route path="settings" element={<Settings user={auth.user} />} />
        </Route>
        {/* Shopkeeper Routes */}
        {/* <Route 
          path="/shopkeeper/*" 
          element={
            <ProtectedRoute
              element={
                <HomeShop user={auth.user} onLogout={handleLogout}>
                  <Routes> */}
                    {/* Dashboard & Main Views */}
                    {/* <Route path="/home" element={<HomeShop user={auth.user} />} /> */}
                    {/* Product Management */}
                    {/* <Route path="/add-product" element={<AddProduct user={auth.user} />} />
                    <Route path="/erp" element={<Inventory user={auth.user} />} />
                    <Route path="/product/:id" element={<ProductDetailsShop user={auth.user} />} /> */}
                    
                    {/* Code Generation */}
                    {/* <Route path="/barcode" element={<Barcodegen user={auth.user} />} />
                    <Route path="/qrcode" element={<Qrcodegen user={auth.user} />} /> */}
                    
                    {/* Business & Analytics */}
                    {/* <Route path="/erp" element={<Erp user={auth.user} />} />
                    <Route path="/analysis" element={<Analysis user={auth.user} />} /> */}
                    
                    {/* User & Account */}
                    {/* <Route path="/notifications" element={<Notishop user={auth.user} />} />
                    <Route path="/profile" element={<ProfileShop user={auth.user} />} />
                    <Route path="/settings" element={<Settings user={auth.user} />} />
                  </Routes>
                </HomeShop>
              } 
              allowedRoles={["shopkeeper"]}
            />
          }
        /> */}



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
                   {/* <Route path="cart" element={<CartItems user={auth.user} />} /> */}
                    {/* <Route path="erp" element={<Inventory user={auth.user} />} /> */}
                    <Route path="product/:id" element={<ProductDetailsCust user={auth.user}  />} />
                    <Route path="cart" element={<Cart user={auth.user} />} />
                    <Route path="checkout" element={<Checkout user={auth.user} />} />
                    <Route path="bill" element={<CustomerBill user={auth.user} />} />
                    <Route path="about" element={<About user={auth.user} />} />
                    {/* Code Generation */}
                    <Route path="barcode" element={<Barcodegen user={auth.user} />} />
                    <Route path="qrcode" element={<Qrcodegen user={auth.user} />} />
                    {/* // In your Routes file */}
                    <Route path="order-confirmation" element={<OrderConfirmation />} />
                    {/* // In your Routes configuration */}
                    <Route path="help" element={<Help />} />
                    
                    {/* Business & Analytics */}
                    {/* <Route path="erp" elemen */}
                    {/* // t={<Erp user={auth.user} />} /> */}
                    {/* <Route path="analysis" element={<Analysis user={auth.user} />} /> */}
                    
                    {/* User & Account */}
                    {/* <Route path="notification" element={<Notishop user={auth.user} />} /> */}
                    <Route path="profile" element={<ProfileCust user={auth.user} />} />
                    <Route path="settings" element={<Settings user={auth.user} />} />
        </Route>

        {/* Customer Routes */}
        {/* <Route 
          path="/customer/*" 
          element={
            <ProtectedRoute 
              element={
                <Customer user={auth.user} onLogout={handleLogout}>
                  <Routes>
                    {/* Dashboard & Main Views */}
                    {/* <Route path="/" element={<CustomerDashboard user={auth.user} />} />
                    <Route path="/home" element={<HomeCust user={auth.user} />} /> */}
                    
                    {/* Shopping */}
                    {/* <Route path="/product/:id" element={<ProductDetailsCust user={auth.user} />} />
                    <Route path="/cart" element={<Cart user={auth.user} />} />
                    <Route path="/checkout" element={<Checkout user={auth.user} />} />
                    <Route path="/bill" element={<CustomerBill user={auth.user} />} /> */}
                    
                    {/* User & Account */}
                    {/* <Route path="/profile" element={<ProfileCust user={auth.user} />} />
                    <Route path="/settings" element={<Settings user={auth.user} />} />
                  </Routes>
                </Customer> */}
              {/* } 
              allowedRoles={["customer"]}
            />
          }
        // /> */} 

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
function getHomeRouteByUserType(userType) { // Changed from role to userType for consistency
  switch (userType) {
    case 'admin':
      return '/admin';
    case 'shopkeeper':
      return '/shopkeeper';
    case 'customer':
      return '/customer';
    default:
      return '/login';
  }
}

export default App;