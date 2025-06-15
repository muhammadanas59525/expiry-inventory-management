import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './ProductDetailsShop.css';
import axiosInstance from '../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductDetailsShop = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState(location.state?.product || null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(!product);
    const [error, setError] = useState(null);
    const [newDiscount, setNewDiscount] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!product && id) {
                try {
                    setLoading(true);
                    
                    const response = await axiosInstance.get(`/shop/products/${id}`);
                    
                    if (response.data.success) {
                        setProduct(response.data.product || response.data.data);
                        setNewDiscount(response.data.product?.discount || response.data.data?.discount || 0);
                    } else {
                        setError("Failed to load product details");
                    }
                } catch (err) {
                    console.error("Error fetching product:", err);
                    setError("Failed to load product details");
                } finally {
                    setLoading(false);
                }
            } else if (product) {
                setNewDiscount(product.discount || 0);
            }
        };
        
        fetchProduct();
    }, [id, product]);

    const handleDeleteProduct = async () => {
        const productId = product?._id || id;
        
        console.log("Attempting to delete product with ID:", productId);
        if (!productId) {
            toast.error("Product ID not found");
            return;
        }
        
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            setIsDeleting(true);
            
            // Make sure we're using the same URL structure the backend expects
            console.log("Making delete request to:", `/shop/products/${productId}`);
            const response = await axiosInstance.delete(`/shop/products/${productId}`);
            
            console.log("Delete response:", response.data);
            if (response.data.success) {
                toast.success("Product deleted successfully");
                setTimeout(() => {
                    navigate('/shopkeeper');
                }, 500);
            } else {
                toast.error("Failed to delete product: " + (response.data.message || "Unknown error"));
                setIsDeleting(false);
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            const errorMsg = err.response?.data?.message || err.message || "Unknown error";
            console.error("Error details:", errorMsg);
            
            // If we get a 404, it means the product is already gone, which is what we wanted
            // So we'll treat it as a success
            if (err.response && err.response.status === 404) {
                toast.info("Product was already removed or doesn't exist");
                setTimeout(() => {
                    navigate('/shopkeeper');
                }, 500);
            } else {
                toast.error("Error deleting product: " + errorMsg);
                setIsDeleting(false);
            }
        }
    };

    const handleUpdateDiscount = async () => {
        const productId = product?._id || id;
        
        console.log("Updating discount for product ID:", productId);
        if (!productId) {
            toast.error("Product ID not found");
            return;
        }

        try {
            setIsUpdating(true);
            
            console.log("Making patch request to:", `/shop/products/${productId}`);
            console.log("With data:", { discount: parseFloat(newDiscount) });
            
            const response = await axiosInstance.patch(`/shop/products/${productId}`, {
                discount: parseFloat(newDiscount)
            });
            
            console.log("Update response:", response.data);
            if (response.data.success) {
                toast.success("Discount updated successfully");
                setProduct({
                    ...product,
                    discount: parseFloat(newDiscount)
                });
            } else {
                toast.error("Failed to update discount: " + (response.data.message || "Unknown error"));
            }
        } catch (err) {
            console.error("Error updating discount:", err);
            const errorMsg = err.response?.data?.message || err.message || "Unknown error";
            console.error("Error details:", errorMsg);
            toast.error("Error updating discount: " + errorMsg);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelClick = () => {
        navigate('/shopkeeper');
    };

    if (loading) {
        return (
            <div className="product-details-page loading">
                <div className="loading-spinner">Loading product details...</div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-details-page error">
                <div className="error-message">{error || "Product not found"}</div>
                <button className="navigate-back" onClick={handleCancelClick}>Go Back to Home</button>
            </div>
        );
    }

    return (
        <div className={`product-details-page ${isDeleting ? 'fade-out' : ''}`}>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="product-container">
                <div className="product-image-section">
                    <img src={product.imageUrl || 'https://placehold.co/400x300?text=No+Image'} alt={product.name} />
                </div>
                <div className="product-info-section">
                    <h2>{product.name}</h2>
                    <p className="description">{product.description}</p>
                    <div className="price-section">
                        {product.discount > 0 ? (
                            <>
                                <span className="original-price">₹{product.price.toFixed(2)}</span>
                                <span className="discounted-price">
                                    ₹{(product.price * (1 - product.discount/100)).toFixed(2)}
                                </span>
                                <span className="discount-badge">-{product.discount}%</span>
                            </>
                        ) : (
                            <span className="price">₹{product.price.toFixed(2)}</span>
                        )}
                    </div>
                    <div className="stock-info">
                        <span className={`stock-status ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                            {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                        </span>
                    </div>
                    <div className="date-info">
                        {product.manufactureDate && (
                            <p className="manufacture-date">
                                Manufactured: {new Date(product.manufactureDate).toLocaleDateString()}
                            </p>
                        )}
                        {product.expiryDate && (
                            <p className="expiry-date">
                                Expires: {new Date(product.expiryDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    
                    <div className="discount-update-section">
                        <h3>Update Discount</h3>
                        <div className="discount-form">
                            <div className="input-group">
                                <input 
                                    type="number" 
                                    min="0"
                                    max="100"
                                    value={newDiscount}
                                    onChange={(e) => setNewDiscount(e.target.value)}
                                    placeholder="Enter discount percentage" 
                                />
                                <span className="percentage-symbol">%</span>
                            </div>
                            <button 
                                className="update-discount-button"
                                onClick={handleUpdateDiscount}
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Updating...' : 'Update Discount'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="action-buttons">
                        <button className="cancel-button" onClick={handleCancelClick}>
                            Cancel
                        </button>
                        <button className="remove-button" onClick={handleDeleteProduct}>
                            {isDeleting ? 'Removing...' : 'Remove Product'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsShop;