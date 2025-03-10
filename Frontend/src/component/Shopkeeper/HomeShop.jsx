import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaFilter, FaSort } from 'react-icons/fa';
import './HomeShop.css';
import axios from 'axios';

const HomeShop = ({  searchQuery }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterDiscount, setFilterDiscount] = useState(0);
    const [filterExpiry, setFilterExpiry] = useState('all');
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    
    // Get search query from URL if present
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlSearchTerm = params.get('search');
        if (urlSearchTerm) {
            setLocalSearchTerm(urlSearchTerm);
        }
    }, [location.search]);

    // Update local search term if searchQuery prop changes
    useEffect(() => {
        if (searchQuery) {
            setLocalSearchTerm(searchQuery);
        }
    }, [searchQuery]);
    
    const handleProductClick = (product) => {
        navigate(`/shopkeeper/product/${product._id}`, { state: { product } });
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

    // Apply filters and sorting whenever products or filter settings change
    useEffect(() => {
        let result = [...products];
        
        // Apply discount filter
        if (filterDiscount > 0) {
            result = result.filter(product => product.discount >= filterDiscount);
        }
        
        // Apply expiry filter
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);
        
        if (filterExpiry === 'week') {
            result = result.filter(product => {
                const expiryDate = new Date(product.expiryDate);
                return expiryDate <= nextWeek && expiryDate >= today;
            });
        } else if (filterExpiry === 'month') {
            result = result.filter(product => {
                const expiryDate = new Date(product.expiryDate);
                return expiryDate <= nextMonth && expiryDate >= today;
            });
        } else if (filterExpiry === 'expired') {
            result = result.filter(product => {
                const expiryDate = new Date(product.expiryDate);
                return expiryDate < today;
            });
        }
        
        // Apply search term
        if (localSearchTerm.trim()) {
            const term = localSearchTerm.toLowerCase().trim();
            result = result.filter(product => 
                product.name.toLowerCase().includes(term) || 
                (product.description && product.description.toLowerCase().includes(term))
            );
        }
        
        // Apply sorting
        result.sort((a, b) => {
            let comparison = 0;
            
            if (sortBy === 'name') {
                comparison = a.name.localeCompare(b.name);
            } else if (sortBy === 'price') {
                comparison = a.price - b.price;
            } else if (sortBy === 'discount') {
                comparison = a.discount - b.discount;
            } else if (sortBy === 'expiry') {
                const dateA = new Date(a.expiryDate).getTime();
                const dateB = new Date(b.expiryDate).getTime();
                comparison = dateA - dateB;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        
        setFilteredProducts(result);
    }, [products, filterDiscount, filterExpiry, sortBy, sortOrder, localSearchTerm]);

    const toggleFilter = () => {
        setFilterOpen(!filterOpen);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };
    
    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const handleDiscountFilter = (e) => {
        setFilterDiscount(Number(e.target.value));
    };
    
    const handleExpiryFilter = (e) => {
        setFilterExpiry(e.target.value);
    };

    const clearFilters = () => {
        setSortBy('name');
        setSortOrder('asc');
        setFilterDiscount(0);
        setFilterExpiry('all');
        setLocalSearchTerm('');
        // Clear URL search parameter
        navigate('/');
    };

    return (
        <div className="home">
            <div className="filter-container">
                <div className="filter-header">
                    <h2>Welcome to Our E-commerce Store</h2>
                    <button 
                        className="filter-toggle-btn"
                        onClick={toggleFilter}
                    >
                        <FaFilter /> Filter Products
                    </button>
                </div>
                
                {filterOpen && (
                    <div className="filter-dropdown">
                        <div className="filter-row">
                            {localSearchTerm && (
                                <div className="active-search">
                                    <span>Currently searching: <strong>"{localSearchTerm}"</strong></span>
                                    <button onClick={() => setLocalSearchTerm('')}>Clear Search</button>
                                </div>
                            )}
                            
                            <div className="filter-group">
                                <label htmlFor="sortBy">Sort By:</label>
                                <div className="sort-controls">
                                    <select 
                                        id="sortBy" 
                                        value={sortBy} 
                                        onChange={handleSortChange}
                                    >
                                        <option value="name">Name</option>
                                        <option value="price">Price</option>
                                        <option value="discount">Discount</option>
                                        <option value="expiry">Expiry Date</option>
                                    </select>
                                    <button 
                                        className={`sort-order ${sortOrder === 'desc' ? 'desc' : ''}`}
                                        onClick={toggleSortOrder}
                                        title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                                    >
                                        <FaSort />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="filter-row">
                            <div className="filter-group">
                                <label htmlFor="discountFilter">Minimum Discount:</label>
                                <select 
                                    id="discountFilter" 
                                    value={filterDiscount} 
                                    onChange={handleDiscountFilter}
                                >
                                    <option value={0}>All Products</option>
                                    <option value={5}>5% or more</option>
                                    <option value={10}>10% or more</option>
                                    <option value={20}>20% or more</option>
                                    <option value={50}>50% or more</option>
                                </select>
                            </div>
                            
                            <div className="filter-group">
                                <label htmlFor="expiryFilter">Expiry Date:</label>
                                <select 
                                    id="expiryFilter" 
                                    value={filterExpiry} 
                                    onChange={handleExpiryFilter}
                                >
                                    <option value="all">All Products</option>
                                    <option value="week">Expiring This Week</option>
                                    <option value="month">Expiring This Month</option>
                                    <option value="expired">Expired Products</option>
                                </select>
                            </div>
                            
                            <button 
                                className="clear-filters"
                                onClick={clearFilters}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="results-info">
                <span>Showing {filteredProducts.length} of {products.length} products</span>
                {localSearchTerm && (
                    <span className="search-results-text">Search results for: "{localSearchTerm}"</span>
                )}
            </div>

            <div className="product-list">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="product-card"
                            onClick={() => handleProductClick(product)}
                        >
                            {product.discount > 0 && (
                                <div className="discount-badge">-{product.discount}%</div>
                            )}
                            
                            {new Date(product.expiryDate) < new Date() && (
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
                                        <span className="original-price">
                                            ${product.price.toFixed(2)}
                                        </span>
                                    )}
                                    <span className="current-price">
                                        ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                                    </span>
                                </p>
                                {product.expiryDate && (
                                    <p className={`expiry-date ${new Date(product.expiryDate) < new Date() ? 'expired' : ''}`}>
                                        Expires: {new Date(product.expiryDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-products">
                        <p>No products match your filters. Try adjusting your criteria.</p>
                        <button onClick={clearFilters}>Clear All Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeShop;