import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Erp from './component/Shopkeeper/Erp';
import NavbarShop from './component/Shopkeeper/NavbarShop';
import NavbarCust from './component/Customer/NavbarCust';
import HomeCust from './component/Customer/HomeCust';
import HomeShop from './component/Shopkeeper/HomeShop';
import Login from './component/pages/Login';
import Signup from './component/pages/Signup';
import ProductDetailsCust from './component/Customer/ProductDetailsCust';
import ProductDetailsShop from './component/Shopkeeper/ProductDetailsShop';
import CartItems from './component/Customer/Cart';
import CustomerBill from './component/Customer/CustomerBill';
import SidebarShop from './component/Shopkeeper/SidebarShop';
import SidebarCust from './component/Customer/SidebarCust';
import ProfileCust from './component/Customer/ProfileCust';
import Shopkeeper from './component/Shopkeeper/Shopkeeper';
import Customer from './component/Customer/Customer';
import Admin from './component/Admin/Admin';
import AddProduct from './component/Shopkeeper/AddProduct';
import Inventory from './component/Shopkeeper/Inventory';
import Analysis from './component/Shopkeeper/Analysis';
import { IoReorderThreeSharp } from "react-icons/io5";
import About from './component/pages/About';
import Settings from './component/pages/Setting';

const initialProducts = [
  {
    id: 1,
    name: 'Product 1',
    description: 'This is the description for product 1.',
    price: 10.00,
    image: 'https://img.freepik.com/free-photo/top-view-different-sugar-cookies-inside-plate-grey-surface-candy-sugar-sweet-tea-cookies-biscuit_140725-74643.jpg?t=st=1736768283~exp=1736771883~hmac=2a7e4d9c24b25ce06f31af64a184a9126c038c3302bf19f3299ad9b66d342ac3&w=360'
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'This is the description for product 2.',
    price: 20.00,
    image: 'https://img.freepik.com/free-photo/side-view-thai-ice-cream-roll-whipped-cream-decorated-with-colorful-sprinkles-cardboard-bowl-black-wall_140725-12928.jpg?t=st=1736768114~exp=1736771714~hmac=eafc8f2bbe93467d98cb0565ee787a20edfd91d3a2bec87e3432d237e13625a5&w=360'
  },
  {
    id: 3,
    name: 'Product 3',
    description: 'This is the description for product 3.',
    price: 30.00,
    image: 'https://img.freepik.com/free-photo/pile-broken-chocolate-table-against-brown-studio-background-hot-chocolate-spray_155003-38188.jpg?t=st=1736768186~exp=1736771786~hmac=de962eed6d3a66d0452c585b5b96df8cdeaf0ea62730912a7c1b15056a947e80&w=360'
  }
];

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userType, setUserType] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [language, setLanguage] = useState('en');

  const addSearchQuery = (query) => {
    setSearchHistory((prevHistory) => [...prevHistory, query]);
  };
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };


  useEffect(() => {
    const storedUserType = localStorage.getItem('userType');
    if (storedUserType) {
      setUserType(storedUserType);
    }
  }, []);

  const addToCart = (product) => {
    const existingProduct = cart.find(cartItem => cartItem.id === product.id);
    if (existingProduct) {
      setCart(cart.map(cartItem =>
        cartItem.id === product.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const addToWishlist = (product) => {
    if (!wishlist.find(wishlistItem => wishlistItem.id === product.id)) {
      setWishlist([...wishlist, product]);
    }
  };

  const updateCartQuantity = (productId, quantity) => {
    setCart(cart.map(cartItem =>
      cartItem.id === productId ? { ...cartItem, quantity } : cartItem
    ));
  };

  const deleteProduct = (productId) => {
    setProducts(products.filter(product => product.id !== productId));
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="App">
        {userType === 'shopkeeper' ? <NavbarShop addSearchQuery={addSearchQuery}/> : <NavbarCust addSearchQuery={addSearchQuery}/>}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <IoReorderThreeSharp />
        </button>
        <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          {userType === 'shopkeeper' ? <SidebarShop /> : <SidebarCust />}
          
          
     
          <div className="content">
            <Routes>
              <Route path="/" element={userType === 'shopkeeper' ? <HomeShop products={products} setProducts={setProducts} /> : <HomeCust products={products} setProducts={setProducts} />} />
              <Route path="/erp" element={userType === 'shopkeeper' ? <Erp /> : <Navigate to="/login" />} />
              <Route path="/product/:id" element={userType === 'shopkeeper' ? <ProductDetailsShop addToCart={addToCart} addToWishlist={addToWishlist} deleteProduct={deleteProduct} /> : <ProductDetailsCust addToCart={addToCart} addToWishlist={addToWishlist} updateCartQuantity={updateCartQuantity} cart={cart} />} />
              <Route path="/cart" element={userType === 'customer' ? <CartItems cart={cart} setCart={setCart} wishlist={wishlist} setWishlist={setWishlist} updateCartQuantity={updateCartQuantity} /> : <Navigate to="/login" />} />
              <Route path="/bill" element={<CustomerBill />} />
              <Route path="/login" element={<Login setUserType={setUserType} />} />
              <Route path="/register" element={<Signup />} />
              <Route path="/profile" element={<ProfileCust />} />
              <Route path="/settings" element={<Settings searchHistory={searchHistory} setSearchHistory={setSearchHistory}  />} />
              <Route path="/about" element={<About/>} />
              <Route path="/other" element={<div>Other Details Page</div>} />

              <Route path="/admin" element={userType === 'admin' ? 
              <Admin /> : 
              <Navigate to="/login" />} />

              <Route path="/shopkeeper" element={userType === 'shopkeeper' ? 
              <Shopkeeper 
              products={products} 
              setProducts={setProducts} /> : 
              <Navigate to="/login" />} />

              <Route path="/customer" element={userType === 'customer' ? 
              <Customer 
              products={products} 
              setProducts={setProducts} 
              cart={cart} setCart={setCart} 
              wishlist={wishlist} 
              setWishlist={setWishlist} /> 
              : <Navigate to="/login" />} />

              <Route path="/addproduct" element={userType === 'shopkeeper' ? <AddProduct products={products} setProducts={setProducts} /> : <Navigate to="/login" />} />
              <Route path="/inventory" element={userType === 'shopkeeper' ? <Inventory /> : <Navigate to="/login" />} />
              <Route path="/analysis" element={
    userType === 'shopkeeper' ? 
    <Analysis 
      products={products} 
      sales={[]} // Add sales array
      purchases={[]} // Add purchases array
    /> : 
    <Navigate to="/login" />
  }  />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;