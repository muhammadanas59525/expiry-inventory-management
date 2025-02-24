import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ProductDetailsShop.css';

const ProductDetailsShop = ({ deleteProduct }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { product } = location.state;
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteProduct = () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setIsDeleting(true);
            deleteProduct(product.id);
            setTimeout(() => {
                navigate('/homeshop');
            }, 500);
        }
    };

    return (
        <div className={`product-details-page ${isDeleting ? 'fade-out' : ''}`}>
            <div className="product-container">
                <div className="product-image-section">
                    <img src={product.image} alt={product.name} />
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
                    <button className="remove-button" onClick={handleDeleteProduct}>
                        Remove Product
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsShop;