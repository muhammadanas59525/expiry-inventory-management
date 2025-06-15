import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './HomeShop.css';

const HomeShop = ({ user, searchQuery }) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (searchQuery) {
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchQuery, products]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching products...');
            const response = await axiosInstance.get('/shop/products');
            console.log('API Response:', response.data);
            
            if (response.data && response.data.success) {
                // Check if products are in response.data.products or response.data.data
                const productData = response.data.products || response.data.data || [];
                console.log('Products received:', productData);
                
                // Reset the products list
                setProducts([...productData]);
                setFilteredProducts([...productData]);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch products');
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load products');
            // If there's an error, clear the products list to avoid showing stale data
            setProducts([]);
            setFilteredProducts([]);
            toast.error(err.response?.data?.message || err.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        navigate('/shopkeeper/addproduct');
    };

    const handleEditProduct = (productId) => {
        console.log("Editing product with ID:", productId);
        if (!productId) {
            toast.error("Invalid product ID");
            return;
        }
        
        const productToEdit = products.find(p => p._id === productId);
        if (!productToEdit) {
            toast.error("Product not found in the local data");
            return;
        }
        
        navigate(`/shopkeeper/product/${productId}`, {
            state: { 
                product: productToEdit
            }
        });
    };

    const handleDeleteProduct = async (productId) => {
        console.log("Attempting to delete product with ID:", productId);
        if (!productId) {
            toast.error("Invalid product ID");
            return;
        }
        
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/shop/products/${productId}`);
            
            if (response.data && response.data.success) {
                toast.success('Product deleted successfully');
                await fetchProducts(); // Refresh the product list
            } else {
                throw new Error(response.data?.message || 'Failed to delete product');
            }
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error(err.response?.data?.message || err.message || 'Failed to delete product');
        }
    };

    if (loading) {
        return (
            <div className="shop-home-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="shop-home-container">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="shop-header">
                <h1>My Shop Products</h1>
                <button className="add-product-btn" onClick={handleAddProduct}>
                    Add New Product
                </button>
            </div>

            <div className="products-container">
                {filteredProducts.length === 0 ? (
                    <div className="no-products">
                        <div className="no-products-icon">📦</div>
                        <h2>No products in database</h2>
                        <p>Get started by adding your first product to your inventory</p>
                        <button className="add-first-product-btn" onClick={handleAddProduct}>
                            Add Your First Product
                        </button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {filteredProducts.map(product => (
                            <div key={product._id} className="product-card">
                                <div className="product-image">
                                    <img 
                                        src={product.imageUrl || 'https://placehold.co/300x200/e2e8f0/1e293b?text=No+Image'} 
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.src = 'https://placehold.co/300x200/e2e8f0/1e293b?text=No+Image';
                                        }}
                                    />
                                    {product.discount > 0 && (
                                        <span className="discount-badge">{product.discount}% OFF</span>
                                    )}
                                </div>
                                <div className="product-details">
                                    <h3 className="product-name">{product.name}</h3>
                                    <p className="product-price">₹{product.price?.toFixed(2) || '0.00'}</p>
                                    <div className="product-meta">
                                        <span className="product-category">{product.category || 'Uncategorized'}</span>
                                        <span className="product-quantity">Qty: {product.quantity || 0}</span>
                                    </div>
                                </div>
                                <div className="product-actions">
                                    <button 
                                        className="edit-btn"
                                        onClick={() => handleEditProduct(product._id)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDeleteProduct(product._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeShop;