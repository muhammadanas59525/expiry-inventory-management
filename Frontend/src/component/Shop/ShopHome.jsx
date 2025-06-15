import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ShopHome.css';

const ShopHome = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/shop/products');
            
            if (response.data && response.data.success) {
                setProducts(response.data.products || []);
                setError(null);
            } else {
                setProducts([]);
                setError('No products found in database');
            }
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products from database');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = () => {
        navigate('/shop/add-product');
    };

    const handleEditProduct = (productId) => {
        navigate(`/shop/edit-product/${productId}`);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            const response = await axiosInstance.delete(`/api/shop/products/${productId}`);
            
            if (response.data && response.data.success) {
                toast.success('Product deleted successfully');
                fetchProducts(); // Refresh the product list
            } else {
                toast.error('Failed to delete product');
            }
        } catch (err) {
            console.error('Error deleting product:', err);
            toast.error('Failed to delete product');
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
                {products.length === 0 ? (
                    <div className="no-products">
                        <p className="no-products-text">No products in database</p>
                        <button className="add-product-btn" onClick={handleAddProduct}>
                            Add Your First Product
                        </button>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map(product => (
                            <div key={product._id} className="product-card">
                                <div className="product-image">
                                    <img 
                                        src={product.imageUrl || 'https://placehold.co/300x200/e2e8f0/1e293b?text=No+Image'} 
                                        alt={product.name}
                                        onError={(e) => {
                                            e.target.src = 'https://placehold.co/300x200/e2e8f0/1e293b?text=No+Image';
                                        }}
                                    />
                                </div>
                                <div className="product-details">
                                    <h3>{product.name}</h3>
                                    <p className="product-price">₹{product.price.toFixed(2)}</p>
                                    {product.discount > 0 && (
                                        <span className="discount-badge">{product.discount}% OFF</span>
                                    )}
                                    <p className="product-category">{product.category}</p>
                                    <p className="product-stock">Stock: {product.stock || 0}</p>
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

export default ShopHome; 