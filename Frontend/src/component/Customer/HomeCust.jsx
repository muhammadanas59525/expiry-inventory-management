import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeCust.css';

const HomeCust = ({ products, setProducts }) => {
    const navigate = useNavigate();

    const handleProductClick = (product) => {
        navigate(`/product/${product.id}`, { state: { product } });
    };

    return (
        <div className="home">
            <h2>Welcome to Our E-commerce Store</h2>
            <div className="product-list">
                {products.map(product => (
                    <div className="product-card" key={product.id} onClick={() => handleProductClick(product)}>
                        <img src={product.image} alt={product.name} />
                        <div className="product-info">
                            <h3>{product.name}</h3>
                            <p>${Number(product.price).toFixed(2)}</p> {/* Ensure price is a number */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeCust;