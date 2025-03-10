import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './ProductDetailsShop.css';
import axios from 'axios';

const ProductDetailsShop = ({ deleteProduct }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState(location.state?.product || null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(!product);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchProduct = async () => {
            if (!product && id) {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://localhost:3000/api/products/get/${id}`);
                    if (response.data.success) {
                        setProduct(response.data.data);
                    } else {
                        setError("Failed to load product details");
                    }
                } catch (err) {
                    console.error("Error fetching product:", err);
                    setError("Failed to load product details");
                } finally {
                    setLoading(false);
                }
            }
        };
        
        fetchProduct();
    }, [id, product]);

    // const handleDeleteProduct = () => {
    //     if (window.confirm('Are you sure you want to delete this product?')) {
    //         setIsDeleting(true);
    //         deleteProduct(product.id);
    //         setTimeout(() => {
    //             navigate('/homeshop');
    //         }, 500);
    //     }
    // };
    const handleDeleteProduct = async () => {
        // Get product ID, either from the product object or URL params
        const productId = product?._id || id;
        
        if (!productId) {
            alert("Product ID not found");
            return;
        }
        
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            setIsDeleting(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                alert("Authentication required. Please log in again.");
                navigate('/login');
                return;
            }
            
            console.log("Deleting product with ID:", productId);
            
            const response = await axios.delete(
                `http://localhost:3000/api/products/delete/${productId}`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log("Delete response:", response.data);
            
            if (response.data.success) {
                alert("Product deleted successfully");
                setTimeout(() => {
                    navigate('/shopkeeper');
                }, 500);
            } else {
                alert("Failed to delete product: " + (response.data.message || "Unknown error"));
                setIsDeleting(false);
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            alert("Error deleting product: " + (err.response?.data?.message || err.message || "Unknown error"));
            setIsDeleting(false);
        }
    };
    return (
        <div className={`product-details-page ${isDeleting ? 'fade-out' : ''}`}>
            <div className="product-container">
                <div className="product-image-section">
                <img src={product.imageUrl || 'https://via.placeholder.com/400x300'} alt={product.name} />
                </div>
                <div className="product-info-section">
                    <h2>{product.name}</h2>
                    <p className="description">{product.description}</p>
                    <div className="price-section">
                        {product.discount > 0 ? (
                            <>
                                <span className="original-price">${product.price.toFixed(2)}</span>
                                <span className="discounted-price">
                                    ${(product.price * (1 - product.discount/100)).toFixed(2)}
                                </span>
                                <span className="discount-badge">-{product.discount}%</span>
                            </>
                        ) : (
                            <span className="price">${product.price.toFixed(2)}</span>
                        )}
                    </div>
                    <div className="stock-info">
                        <span className={`stock-status ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                        </span>
                    </div>
                    <div className="date-info">
                        <p className="manufacture-date">
                            Manufactured: {new Date(product.manufactureDate).toLocaleDateString()}
                        </p>
                        <p className="expiry-date">
                            Expires: {new Date(product.expiryDate).toLocaleDateString()}
                        </p>
                    </div>
                    <button className="remove-button" onClick={()=>handleDeleteProduct()}>
                        Remove Product
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsShop;