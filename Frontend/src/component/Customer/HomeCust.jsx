import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiChevronLeft, 
    FiChevronRight, 
    FiArrowRight, 
    FiHeart,
    FiSearch,
    FiShoppingCart,
    FiFilter,
    FiStar
} from 'react-icons/fi';
import './HomeCust.css';
import { image, p } from 'framer-motion/client';

const HomeCust = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(['All', 'Groceries', 'Dairy', 'Bakery', 'Snacks', 'Beverages']);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [bestSellingProducts, setBestSellingProducts] = useState([]);
    const [expiringProducts, setExpiringProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [heroSlideIndex, setHeroSlideIndex] = useState(0);
    const [expirySlideIndex, setExpirySlideIndex] = useState(0);

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('featured');
    const [showDiscounted, setShowDiscounted] = useState(false);

    // Refs for scroll buttons
    const categoryRef = useRef(null);
    const expirySliderRef = useRef(null);
    
    // Product data by category
    const productDataByCategory = {
        "Groceries": {
            products: [
                {
                    name: "Organic Rice",
                    image: "https://img.freepik.com/free-photo/high-angle-bowl-with-rice-grains_23-2149359504.jpg?t=st=1741581628~exp=1741585228~hmac=397899dd1404731e50f758853b1c79c84ff83790aa69fd03223654d8f9dc8208&w=740"
                },
                {
                    name: "Whole Wheat Pasta",
                    image: "https://img.freepik.com/free-photo/homemade-uncooked-pastas-wooden-platter-rustic-surface_114579-34668.jpg?t=st=1741581948~exp=1741585548~hmac=0fc8d4a55a9a223cd641d3d430a190c09bd455f2c5603ac7db049314c70fe02f&w=1060"
                },
                {
                    name: "Extra Virgin Olive Oil",
                    image: "https://img.freepik.com/free-photo/close-up-olive-oil-bottle-with-leaves_23-2148285918.jpg?t=st=1741582019~exp=1741585619~hmac=71d667bc1d33f89f14ee39e9951bb836d09bada6559baec22bc438c38de9754f&w=740"
                },
                {
                    name: "Quinoa",
                    image: "https://img.freepik.com/premium-photo/white-quinoa-seeds_71965-139.jpg?w=900"
                },
                {
                    name: "Lentils",
                    image: "https://img.freepik.com/free-photo/bowl-sackcloth-red-raw-lentils-wooden-board_114579-88679.jpg?t=st=1741582336~exp=1741585936~hmac=d8b80924550023413c4887cc442500896f318b970dce89717841a64e16c9bf6b&w=900"
                },
                {
                    name: "Chickpeas",
                    image: "https://img.freepik.com/free-photo/cooked-chickpeas-bowl_53876-139906.jpg?t=st=1741582378~exp=1741585978~hmac=df7435321da356e79742a73c8da76d7c458771c2bff620349c9603d63e8ce056&w=740"
                },
                {
                    name: "Tomato Sauce",
                    image: "https://img.freepik.com/free-photo/tomato-juice-glass-jars-wooden-board_114579-55562.jpg?t=st=1741582520~exp=1741586120~hmac=e7e6d27315ed5bcc76aa5f76fe9df711e5abba193dadede06ebd67f7c1b896cf&w=900"
                },
                {
                    name: "Basmati Rice",
                    image: "https://img.freepik.com/free-photo/top-view-raw-rice-inside-brown-plate-grey-surface_140725-90609.jpg?t=st=1741582563~exp=1741586163~hmac=6c98c56bff3ed2fb5f80ccf9ad7cd2544e5d742cc1d57d60cb7aa3222e1bf147&w=900"
                },
                {
                    name: "Sugar",
                    image: "https://img.freepik.com/free-photo/world-diabetes-day-sugar-cubes-glass-bowl-dark-floor_1150-26665.jpg?t=st=1741582594~exp=1741586194~hmac=a64dc3c2408b814ea4cac725384ef4739dabe0fd5be8e5b669290d4f6500b7aa&w=900"
                },
                {
                    name: "Black Beans",
                    image: "https://img.freepik.com/free-photo/black-bean-small-wooden-spoon-place-sack-bag-full-black-bean_1150-35417.jpg?t=st=1741583348~exp=1741586948~hmac=1524abf617404c7cda86c84277ee2d229e8876af6e4430919f333be006e0bb5f&w=900",
                }


            ]
        },
        "Dairy": {
            products: [
                {
                    name: "Greek Yogurt",
                    image: "https://img.freepik.com/free-vector/container-surrounded-by-flowing-yogurt-from-natural-milk_1268-15510.jpg?t=st=1741583416~exp=1741587016~hmac=a54f4e138d16933c52f88c38e8fcb45b633a106f7456bc4c1899b48b42ffb35f&w=900"
                },
                {
                    name: "Organic Milk",
                    image: "https://img.freepik.com/free-vector/milk-bottle-glass-nature_1284-32751.jpg?t=st=1741583511~exp=1741587111~hmac=16cdfab6766babb22ca20eaf5a3f4d9c5e6ffa61350bdd063bb96e57a6896840&w=900"
                },
                {
                    name: "Fresh Butter",
                    image: "https://img.freepik.com/free-vector/dairy-butter-realistic-composition-as-mockup-advertising-brand-with-text-fresh-milk-healthy-product-natural-ingredients_1284-32346.jpg?t=st=1741583641~exp=1741587241~hmac=57ef83ced88367337469aedccbf43befa53b03553e733c01b4308683825ea8f7&w=900"
                },
                {
                    name: "Cottage Cheese",
                    image: "https://img.freepik.com/free-psd/fresh-cubes-creamy-feta-cheese-plate-garnished-with-basil_632498-25707.jpg?t=st=1741583678~exp=1741587278~hmac=507b017c30047b87bbb975a4bf18823cb98c1c95df63819257012291ab9e1eac&w=900"
                },
                {
                    name: "Mozzarella",
                    image: "https://img.freepik.com/free-photo/fresh-mozzarella-cheese-soft-italian-cheeses-tomato-basil-olives-oil-rosemary-wooden-serving-board-light-wooden-surface-healthy-food-top-view-flat-lay_1150-44821.jpg?t=st=1741583721~exp=1741587321~hmac=e2d06172d6af520cf0db03c829f61362a9336fb3d51de1bd80133457cea56330&w=900"
                },
                {
                    name: "Ice Cream",
                    image: "https://img.freepik.com/free-photo/delicious-ice-cream-with-topping_23-2150735486.jpg?t=st=1741583797~exp=1741587397~hmac=ed90b8de4e2b8062ebf358bfdf1dc22d598b5c7badbd9c113e15ae22f9a08a23&w=900"
                },
                {
                    name: "Wipping Cream",
                    image: "https://img.freepik.com/free-photo/delicious-traditional-dessert-assortment_23-2149143315.jpg?t=st=1741583891~exp=1741587491~hmac=bd7687cd171620678a7090e3626690f31d81a4a5bf3d6a95bfb9a370f422dcbb&w=900"
                },
                {
                    name: "Parmesan Cheese",
                    image: "https://img.freepik.com/free-photo/delicious-buffet-with-cheese-wooden-board_23-2148432622.jpg?t=st=1741583952~exp=1741587552~hmac=09683132cd715e46d91263f0a906384cf93c98c996ea5189b72facc1551ec05a&w=740"
                },
                {
                    name: "Cheese",
                    image: "https://img.freepik.com/free-photo/cheese-wood_573717-86.jpg?t=st=1741584034~exp=1741587634~hmac=d980209fd3e8a9dd8a09daf013999962c1838d1d9809620da6dc11d3bf824485&w=900"
                },
            ]
        },

        "Bakery": {
            products: [
                {
                    name: "Bread",
                    image: "https://img.freepik.com/free-photo/slices-dark-white-bread-box-tablecloth_114579-5825.jpg?t=st=1741583997~exp=1741587597~hmac=8d943176cc7c1ea23079243866094ed4bb60a156420f3746c02b82f48aea5737&w=740"
                },
                {
                    name: "Croissants",
                    image: "https://img.freepik.com/free-photo/croissant-high-angle-view-wooden-cutting-board_176474-8125.jpg?t=st=1741584193~exp=1741587793~hmac=f6ee6cb3e013c44c854465a65a452bb4f96e278637a34a60a2df1d7e14c84dae&w=900"
                },
                {
                    name: "Whole Grain Loaf",
                    image: "https://img.freepik.com/free-photo/vertical-view-black-bread-slices-flour-oatmeal-light-ice-blue-pattern-background-with-free-space_179666-47247.jpg?t=st=1741584264~exp=1741587864~hmac=c0acbe31bce0f0e1c5c1f91465f0f3c96c20ab8ef72547d42fd3cc09b7c602f5&w=740"
                },
                {
                    name: "Challah",
                    image: "https://img.freepik.com/free-photo/close-up-challah-dish-hanukkah_23-2151102338.jpg?t=st=1741584369~exp=1741587969~hmac=09a906e993566d8f87d746284dd60a2219a59d010ab53ae9662e07396a684d43&w=740"
                },
                {
                    name: "Cinnamon Rolls",
                    image: "https://img.freepik.com/free-photo/close-up-view-delicious-cinnamon-rolls_23-2148779675.jpg?t=st=1741588785~exp=1741592385~hmac=49a6a4cd9605efa56e036e811c8cb45bd196778d15a422f5e41ceec58da763a7&w=826"
                },
                {
                    name: "Chocolate Cake",
                    image: "https://img.freepik.com/free-photo/high-angle-chocolate-muffins-cooling-rack-with-copy-space_23-2148569668.jpg?t=st=1741588875~exp=1741592475~hmac=e8840272d5b0d1f2b0462bcdcfa8fa6c7d7b7fde0f788c274ea0d8addc70e3e4&w=740" 
                },
                {
                    name: "Cream Cup Cake",
                    image: "https://img.freepik.com/free-photo/cupcakes-decorated-whipped-cream-frozen-raspberries_114579-7878.jpg?t=st=1741589104~exp=1741592704~hmac=543496713593dae322952038713cf4e77168b4b5b2b1800644dd6f45c96d9f5c&w=1380"
                },
                {
                    name: "Sweet Samoosa",
                    image: "https://img.freepik.com/free-photo/close-up-indian-patisserie-products-with-chocolate_23-2148295023.jpg?t=st=1741589184~exp=1741592784~hmac=cc85299863794b81f868845ded66506818e13946d541cc19a5c6da1381c7ce4c&w=900"
                },
                {
                    name: "Roast Rolls",
                    image: "https://img.freepik.com/premium-photo/close-up-food_1048944-13028046.jpg?w=826"
                },
            ]
        },


        "Snacks": {
            products: [
                {
                    name: "Mixed Nuts",
                    image:"https://img.freepik.com/free-photo/view-allergens-commonly-found-nuts_23-2150170314.jpg?t=st=1741589538~exp=1741593138~hmac=e39520ac9bfa23e491d3e515aeafb76a3e5a514b0834879ad053f37bf3827906&w=740"
                },
                {
                    name: "Dark Chocolate",
                    image:"https://img.freepik.com/free-photo/close-up-view-delicious-chocolate-wooden-table_23-2148746669.jpg?t=st=1741589599~exp=1741593199~hmac=1413aa6365aca8ffd96b00135cc23335fbb1a07c8ce55375fa027e2eba625d4b&w=740"
                },
                {
                    name: "Burfi",
                    image:"https://img.freepik.com/free-photo/nagpur-orange-burfee-barfi-burfi-is-creamy-fudge-made-with-fresh-oranges-mawa_466689-72287.jpg?t=st=1741593662~exp=1741597262~hmac=e8f8cae95de2232503d62220407465c88ce7402e842c73c0ef3e4cc47781f454&w=740"
                },
                {
                    name:"Jalebi",
                    image:"https://img.freepik.com/free-psd/sweet-jalebi-indian-dessert-bowl-orange-spiral-treat_84443-34466.jpg?t=st=1741593731~exp=1741597331~hmac=207c8428c91d92ae10ec7c336d2f05dc95e203fb0b3ae958e1d6e27459aa0e36&w=900"
                },
                {
                    name:"Potato chips",
                    image:"https://img.freepik.com/free-vector/potato-chips-advertising-composition-with-realistic-images-crisps-natural-potatoes-pack-shot_1284-27373.jpg?t=st=1741594027~exp=1741597627~hmac=c27a7411aee8f6c0746108d684012d27f21c62dbc5f1fc9215078fbc08b8f7cd&w=826"
                }

            ]},
        "Beverages": {
            products: [
                {
                    name: "Tea",
                    image: "https://img.freepik.com/free-vector/cup-tea-ad_52683-35124.jpg?uid=R102603567&ga=GA1.1.869426162.1696254688&semt=ais_hybrid"
                },
                {
                    name: "Coffee",
                    image: "https://img.freepik.com/free-photo/cup-coffee-with-heart-drawn-foam_1286-70.jpg?uid=R102603567&ga=GA1.1.869426162.1696254688&semt=ais_hybrid"
                },
                {
                    name: "Hot Chocolate",
                    image: "https://img.freepik.com/free-photo/high-angle-cup-coffee-arrangement_23-2148647881.jpg?uid=R102603567&ga=GA1.1.869426162.1696254688&semt=ais_hybrid"
                },
                {
                    name: "Coca Cola",
                    image: "https://img.freepik.com/free-photo/glass-coca-cola-with-ice-cubes-lemon-slice-grey-background_140725-10691.jpg?uid=R102603567&ga=GA1.1.869426162.1696254688&semt=ais_hybrid"
                },
                {
                    name: "Sprite",
                    image: "https://img.freepik.com/free-vector/realistic-lime-soda-advertisement_52683-8100.jpg?uid=R102603567&ga=GA1.1.869426162.1696254688&semt=ais_hybrid"
                },
                {
                    name: "Milk",
                    image: "https://img.freepik.com/free-vector/realistic-natural-rustic-milk-package-ad-poster-with-milk-splashes-glass-camomile-field-with-text-illustration_1284-29515.jpg?uid=R102603567&ga=GA1.1.869426162.1696254688&semt=ais_hybrid" 
                },
                {
                    name: "Red Bull",
                    image: "https://img.freepik.com/premium-photo/bratislava-slovakia-2032020-can-tin-fresh-red-bull-drink-with-brick-wall-backround-red-bull-company-is-most-popular-brand-world_527096-16777.jpg?uid=R102603567&ga=GA1.1.869426162.1696254688&semt=ais_hybrid"
                },
                {
                    name: "Almond Milk",
                    image: "https://img.freepik.com/free-vector/carton-box-with-almond-milk_1268-15470.jpg?uid=R102603567&ga=GA1.1.869426162.1696254688&semt=ais_hybrid"
                },
                
            ]
        },
            
                
       
    };
    
    // Process products for different displays
    const processProductsForDisplays = (products) => {
        // Get featured products
        const featured = products.filter(p => p.featured || p.rating >= 4.5).slice(0, 5);
        setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 5));
        
        // Get expiring products
        const today = new Date();
        const threshold = new Date();
        threshold.setDate(today.getDate() + 30);
        
        const expiring = products
            .filter(p => {
                const expiry = new Date(p.expiryDate);
                return expiry > today && expiry <= threshold;
            })
            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
            .slice(0, 10);
        
        setExpiringProducts(expiring);
        
        // Get best selling products
        const bestSelling = [...products]
            .sort((a, b) => b.totalSales - a.totalSales)
            .slice(0, 8);
        
        setBestSellingProducts(bestSelling);
    };

    // Generate mock products
    const generateMockProducts = () => {
        const mockProducts = [];
        
        for (let i = 1; i <= 50; i++) {
            // Pick a random category
            const categoryKeys = Object.keys(productDataByCategory);
            const category = categoryKeys[Math.floor(Math.random() * categoryKeys.length)];
            
            const today = new Date();
            const expiryDate = new Date();
            
            // Random expiry date between today and 60 days from now
            expiryDate.setDate(today.getDate() + Math.floor(Math.random() * 60) + 1);
            
            // Random price between 5 and 100
            const price = Math.floor(Math.random() * 95) + 5;
            
            // Make 20% of products featured
            const featured = Math.random() < 0.2;
            
            // Random rating between 3 and 5
            const rating = (3 + Math.random() * 2).toFixed(1);
            
            // Random sales count
            const totalSales = Math.floor(Math.random() * 100);
            
            // Get category-specific data
            const categoryData = productDataByCategory[category];
            const productIndex = i % categoryData.products.length;
            const productData = categoryData.products[productIndex];
            
            mockProducts.push({
                _id: `product-${i}`,
                name: productData.name,
                description: `This is a premium ${category.toLowerCase()} product. It's carefully selected for the best quality and taste.`,
                price: price,
                image: productData.image,
                category: category,
                expiryDate: expiryDate,
                stock: Math.floor(Math.random() * 50) + 1,
                featured: featured,
                rating: parseFloat(rating),
                totalSales: totalSales
            });
        }
        
        return mockProducts;
    };
    
    // Helper functions
    const getDaysUntilExpiry = (expiryDate) => {
        const today = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const getDiscountPercentage = (daysToExpiry) => {
        if (daysToExpiry <= 5) {
            return 50;
        } else if (daysToExpiry <= 15) {
            return 30;
        } else {
            return 15;
        }
    };

    // Fetch all necessary data
    const fetchAllData = async () => {
        try {
            setLoading(true);
            let apiProducts = [];
            let mockProducts = [];
            
            // Try to fetch from API
            try {
                const res = await fetch('http://localhost:3000/api/products/get');
                const data = await res.json();
                if (data && data.data && Array.isArray(data.data)) {
                    apiProducts = data.data.map(product => ({
                        ...product,
                        //source: 'api'
                    }));
                    console.log('API products loaded:', apiProducts.length);
                }
            } catch (error) {
                console.log('API fetch failed:', error);
            }
            
            // Generate mock products with different ID format
            mockProducts = generateMockProducts().map(product => ({
                ...product,
                _id: `mock-${product._id}`,
                //source: 'mock'
            }));
            console.log('Mock products generated:', mockProducts.length);
            
            // Combine both sources
            const combinedProducts = [...apiProducts, ...mockProducts];
            setProducts(combinedProducts);
            
            // Extract unique categories
            const uniqueCategories = ['All', ...new Set(combinedProducts.map(product => product.category))];
            setCategories(uniqueCategories);
            
            // Process products
            processProductsForDisplays(combinedProducts);
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load products. Please try again later.');
            setLoading(false);
        }
    };
    
    // Slider navigation
    const nextExpirySlide = () => {
        setExpirySlideIndex(prevIndex => {
            const maxIndex = expiringProducts.length - 1;
            return prevIndex >= maxIndex ? 0 : prevIndex + 1;
        });
    };

    const prevExpirySlide = () => {
        setExpirySlideIndex(prevIndex => {
            const maxIndex = expiringProducts.length - 1;
            return prevIndex <= 0 ? maxIndex : prevIndex - 1;
        });
    };

    // Filter products based on search and filters
    const getFilteredProducts = () => {
        return products.filter(product => {
            // Filter by search query
            if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
                !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            
            // Filter by category
            if (selectedCategory !== 'All' && product.category !== selectedCategory) {
                return false;
            }
            
            // Filter by price range
            if (product.price < priceRange.min || product.price > priceRange.max) {
                return false;
            }
            
            // Filter by discounted/expiring
            if (showDiscounted) {
                const daysToExpiry = getDaysUntilExpiry(product.expiryDate);
                if (daysToExpiry === 0 || daysToExpiry > 30) {
                    return false;
                }
            }
            
            return true;
        }).sort((a, b) => {
            // Sort based on selected sort option
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'newest':
                    return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
                case 'featured':
                default:
                    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating;
            }
        });
    };

    // Handler functions
    const handleProductClick = (productId) => {
        const selectedProduct = products.find(p => p._id === productId);
        navigate(`/customer/product/${productId}`, { 
            state: { product: selectedProduct } 
        });
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        window.scrollTo({ top: document.querySelector('.products-section').offsetTop, behavior: 'smooth' });
    };

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        console.log('Added to cart:', product);
    };

    const handleAddToWishlist = (e, product) => {
        e.stopPropagation();
        console.log('Added to wishlist:', product);
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchQuery('');
        setPriceRange({ min: 0, max: 1000 });
        setSelectedCategory('All');
        setSortBy('featured');
        setShowDiscounted(false);
    };

    // Scroll category container
    const scrollCategory = (direction) => {
        if (categoryRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            categoryRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Effect to fetch data and setup auto-slide
    useEffect(() => {
        fetchAllData();
        
        const interval = setInterval(() => {
            if (featuredProducts.length > 0) {
                setHeroSlideIndex(prev => 
                    prev === featuredProducts.length - 1 ? 0 : prev + 1
                );
            }
        }, 5000);
        
        return () => clearInterval(interval);
    }, [featuredProducts.length]);

    const filteredProducts = getFilteredProducts();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button className="retry-btn" onClick={fetchAllData}>Try Again</button>
            </div>
        );
    }

    return (
        <div className="home-container">
           {/* Filter Section */}
           <div className="filter-container">
                <div className="filter-header">
                    <h3 className="filter-title">Find Products</h3>
                    <button className="toggle-filters-btn" onClick={() => setShowFilters(!showFilters)}>
                        {showFilters ? 'Hide Filters' : 'Show Filters'} <FiFilter />
                    </button>
                </div>
                
                <div className={`filter-content ${showFilters ? '' : 'collapsed'}`}>
                    <div className="filter-row">
                        <div className="search-container">
                            <span className="search-icon"><FiSearch /></span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    <div className="filter-row">
                        <div className="filter-group">
                            <label className="filter-label">Category</label>
                            <div className="select-wrapper">
                                <select 
                                    className="filter-select"
                                    value={selectedCategory}
                                    onChange={e => setSelectedCategory(e.target.value)}
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                                <span className="select-arrow">▼</span>
                            </div>
                        </div>
                        
                        <div className="filter-group">
                            <label className="filter-label">Price Range</label>
                            <div className="price-range">
                                <input
                                    type="number"
                                    className="price-input"
                                    placeholder="Min"
                                    value={priceRange.min}
                                    onChange={e => setPriceRange({...priceRange, min: parseInt(e.target.value) || 0})}
                                />
                                <span>to</span>
                                <input
                                    type="number"
                                    className="price-input"
                                    placeholder="Max"
                                    value={priceRange.max}
                                    onChange={e => setPriceRange({...priceRange, max: parseInt(e.target.value) || 1000})}
                                />
                            </div>
                        </div>
                        
                        <div className="filter-group">
                            <label className="filter-label">Sort By</label>
                            <div className="select-wrapper">
                                <select 
                                    className="filter-select"
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                >
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="newest">Newest First</option>
                                </select>
                                <span className="select-arrow">▼</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="filter-row">
                        <label className="filter-checkbox">
                            <input 
                                type="checkbox" 
                                checked={showDiscounted}
                                onChange={e => setShowDiscounted(e.target.checked)}
                            />
                            Show only discounted products
                        </label>
                    </div>
                    
                    <div className="filter-actions">
                        <button className="reset-btn" onClick={resetFilters}>Reset All</button>
                        <button className="apply-btn" onClick={() => setShowFilters(false)}>Apply Filters</button>
                    </div>
                </div>
            </div>
             
                    
        {/* Hero Section with Slider */}
        <section className="hero-section">
                        <div className="hero-slides">
                            {featuredProducts.map((product, index) => (
                                <div 
                                    key={product._id}
                                    className={`hero-slide ${index === heroSlideIndex ? 'active' : ''}`}
                                    onClick={() => handleProductClick(product._id)}
                                >
                                    <div className="hero-content">
                                        <div className="hero-text">
                                            <h1 className="hero-title">{product.name}</h1>
                                            <p className="hero-description">{product.description}</p>
                                            <button className="hero-btn">Shop Now</button>
                                        </div>
                                        <div className="hero-image">
                                            <img src={product.image} alt={product.name} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="hero-indicators">
                            {featuredProducts.map((_, index) => (
                                <span
                                    key={index}
                                    className={`hero-indicator ${index === heroSlideIndex ? 'active' : ''}`}
                                    onClick={() => setHeroSlideIndex(index)}
                                ></span>
                            ))}
                        </div>
                    </section>


            {/* Products Section with Filter Results */}
            <section className="products-section">
                <div className="section-header">
                    <h2 className="section-title">
                        {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                        {filteredProducts.length > 0 && <span className="product-count"> ({filteredProducts.length})</span>}
                    </h2>
                </div>
                
                {filteredProducts.length > 0 ? (
                    // Find the product card rendering in your component and update it:

            <div className="products-grid">
                {filteredProducts.map(product => (
                    <div 
                        key={product._id} 
                        className="product-card"
                        onClick={() => handleProductClick(product._id)}
                    >
                        <div className="product-image-container">
                            <img 
                                src={product.image||product.imageUrl} 
                                alt={product.name}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://via.placeholder.com/300x200/e9ecef/495057?text=${encodeURIComponent(product.name)}`;
                                }}
                            />
                            
                            <div className="product-badges">
                                {product.featured && (
                                    <div className="badge new-badge">
                                        <span>Featured</span>
                                    </div>
                                )}
                                
                                {getDaysUntilExpiry(product.expiryDate) <= 30 && getDaysUntilExpiry(product.expiryDate) > 0 && (
                                    <div className="badge expiry-badge">
                                        <span>Expires in {getDaysUntilExpiry(product.expiryDate)} days</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="product-details">
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-category">{product.category}</p>
                            <div className="product-price-row">
                                <span className="product-price">${product.price.toFixed(2)}</span>
                                {product.source && (
                                    <span className={`product-source ${product.source}`}>
                                        {product.source === 'api' ? 'DB' : 'Mock'}
                                    </span>
                                )}
                            </div>
                            <button 
                                className="add-cart-btn"
                                onClick={handleAddToCart}
                                >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
                ) : (
                    <div className="no-products-message">
                        <p>No products found matching your criteria.</p>
                        <button className="reset-btn" onClick={resetFilters}>Reset Filters</button>
                    </div>
                )}
            </section>


            {/* Near Expiry Products Section */}
            {expiringProducts.length > 0 && (
                <section className="expiring-products-section">
                    <div className="section-header">
                        <h2 className="section-title">Special Discount Offers</h2>
                        <span className="view-all" onClick={() => navigate('/expiring-products')}>
                            View all <FiArrowRight />
                        </span>
                    </div>
                    
                    <div className="expiry-slider">
                        <button 
                            className="slider-control prev" 
                            onClick={prevExpirySlide}
                            aria-label="Previous slide"
                        >
                            <FiChevronLeft />
                        </button>
                        
                        <div className="expiry-slider-wrapper" style={{ transform: `translateX(-${expirySlideIndex * 100}%)` }}>
                            {expiringProducts.map((product, index) => {
                                const daysToExpiry = getDaysUntilExpiry(product.expiryDate);
                                const discount = getDiscountPercentage(daysToExpiry);
                                const originalPrice = product.originalPrice || (product.price * (100 / (100 - discount))).toFixed(2);
                                
                                return (
                                    <div key={product._id} className="expiry-product-card" onClick={() => handleProductClick(product._id)}>
                                        <div className="expiry-product-image">
                                            <img src={product.image} alt={product.name} />
                                            <span className="expiry-tag">
                                                {daysToExpiry <= 5 
                                                    ? `Expires in ${daysToExpiry} days!` 
                                                    : `Expires soon - ${daysToExpiry} days left`
                                                }
                                            </span>
                                        </div>
                                        <div className="expiry-product-details">
                                            <h3 className="expiry-product-name">{product.name}</h3>
                                            <p className="expiry-product-description">{product.description}</p>
                                            <div className="expiry-product-price">
                                                <span className="original-price">${parseFloat(originalPrice).toFixed(2)}</span>
                                                <span className="discounted-price">${parseFloat(product.price).toFixed(2)}</span>
                                                <span className="discount-percentage">{discount}% OFF</span>
                                            </div>
                                            <div className="expiry-product-actions">
                                                <button 
                                                    className="add-to-cart-btn"
                                                    onClick={(e) => handleAddToCart(e, product)}
                                                >
                                                    Add to Cart
                                                </button>
                                                <button 
                                                    className="wishlist-btn"
                                                    onClick={(e) => handleAddToWishlist(e, product)}
                                                >
                                                    <FiHeart />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        <button 
                            className="slider-control next" 
                            onClick={nextExpirySlide}
                            aria-label="Next slide"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                    
                    <div className="expiry-slider-indicators">
                        {expiringProducts.map((_, index) => (
                            <span 
                                key={index} 
                                className={`expiry-indicator ${index === expirySlideIndex ? 'active' : ''}`}
                                onClick={() => setExpirySlideIndex(index)}
                            />
                        ))}
                    </div>
                </section>
            )}
            

            {/* Categories Section
            <section className="categories-section">
                <h2 className="section-title">Shop by Category</h2>
                
                <div className="categories-scroll-container">
                    <button 
                        className="category-scroll-btn left"
                        onClick={() => scrollCategory('left')}
                    >
                        <FiChevronLeft />
                    </button>
                    
                    <div className="categories-wrapper" ref={categoryRef}>
                        {categories.filter(cat => cat !== 'All').map(category => (
                            <div 
                                key={category} 
                                className="category-card"
                                onClick={() => handleCategoryClick(category)}
                            >
                                <div className="category-icon">
                                    <FiStar />
                                </div>
                                <h3 className="category-name">{category}</h3>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        className="category-scroll-btn right"
                        onClick={() => scrollCategory('right')}
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </section> */}
            
            
            {/* Best Selling Products */}
            <section className="products-section">
                <div className="section-header">
                    <h2 className="section-title">Best Selling Products</h2>
                    <span className="view-all">
                        View all <FiArrowRight />
                    </span>
                </div>
                
                <div className="products-grid">
                    {bestSellingProducts.map(product => (
                        <div 
                            key={product._id} 
                            className="product-card"
                            onClick={() => handleProductClick(product._id)}
                        >
                            <div className="product-image-container">
                                <img src={product.image||product.imageUrl} alt={product.name} />
                                
                                <div className="product-badges">
                                    {product.featured && (
                                        <div className="badge new-badge">
                                            <span>Featured</span>
                                        </div>
                                    )}
                                    
                                    {getDaysUntilExpiry(product.expiryDate) <= 30 && getDaysUntilExpiry(product.expiryDate) > 0 && (
                                        <div className="badge expiry-badge">
                                            <span>Expires in {getDaysUntilExpiry(product.expiryDate)} days</span>
                                        </div>
                                    )}
                                </div>
                                
                                <button 
                                    className="wishlist-toggle" 
                                    onClick={(e) => handleAddToWishlist(e, product)}
                                >
                                    <FiHeart />
                                </button>
                            </div>
                            
                            <div className="product-details">
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-category">{product.category}</p>
                                <div className="product-price-row">
                                    <span className="product-price">
                                        ${product.price.toFixed(2)}
                                    </span>
                                    {getDaysUntilExpiry(product.expiryDate) <= 30 && getDaysUntilExpiry(product.expiryDate) > 0 && (
                                        <span className="product-original-price">
                                            ${(product.price * 1.2).toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                <div className="product-actions">
                                    <button 
                                        className="add-to-cart"
                                        onClick={(e) => handleAddToCart(e, product)}
                                    >
                                        <FiShoppingCart /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            
        </div>
    );
};

export default HomeCust;
