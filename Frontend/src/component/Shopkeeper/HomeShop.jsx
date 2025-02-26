import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomeShop.css';

const HomeShop = ({ products, setProducts }) => {
    const navigate = useNavigate();

    const handleProductClick = (product) => {
        navigate(`/product/${product.id}`, { state: { product } });
    };

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await fetch('http://localhost:3000/api/products/get');
            const data = await res.json();
            setProducts(data.data);
        };
        fetchProducts();
    }
    , [setProducts]);

    return (
        <div className="home">
            <h2>Welcome to Our E-commerce Store</h2>
            <div className="product-list">
                {products.map((product,id) => (
                    <div className="product-card" key={id} onClick={() => handleProductClick(product)}>
                        <img src={product.imageUrl} alt={product.name} />
                        <div className="product-info">
                            <h3>{product.name}</h3>
                            <div className="price-info">
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
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeShop;