import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeShop.css';

const ProductBox = ({ product }) => {
  const navigate = useNavigate();
  const isExpired = new Date(product.expiryDate) < new Date();
  
  const handleProductClick = () => {
    navigate(`/shopkeeper/product/${product._id}`, { state: { product } });
  };

  // Calculate discounted price
  const discountedPrice = product.discount 
    ? (product.price * (1 - product.discount / 100)).toFixed(2) 
    : product.price.toFixed(2);

  return (
    <div className="product-card" onClick={handleProductClick}>
      {product.discount > 0 && (
        <div className="discount-badge">-{product.discount}%</div>
      )}
      
      {isExpired && (
        <div className="expired-badge">Expired</div>
      )}
      
      <img
        src={product.imageUrl || 'https://via.placeholder.com/300x200'}
        alt={product.name}
        className="product-image"
      />
      
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-price">
          {product.discount > 0 && (
            <span className="original-price">${product.price.toFixed(2)}</span>
          )}
          <span className="current-price">${discountedPrice}</span>
        </p>
        
        {product.expiryDate && (
          <p className={`expiry-date ${isExpired ? 'expired' : ''}`}>
            Expires: {new Date(product.expiryDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductBox; 