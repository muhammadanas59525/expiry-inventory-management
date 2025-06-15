import React, { useState, useEffect } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { FaCalendarAlt, FaChartPie, FaChartLine, FaChartBar } from 'react-icons/fa';
import axiosInstance from '../../utils/axios';
import { toast } from 'react-toastify';
import './Analysis.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Analysis = () => {
    const [dateRange, setDateRange] = useState('month');
    const [chartType, setChartType] = useState('line');
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    const [summaryData, setSummaryData] = useState({
        totalProducts: 0,
        totalSales: 0,
        totalRevenue: 0,
        profitMargin: 0,
        topProducts: [],
        worstProducts: [],
        categorySales: {}
    });

    useEffect(() => {
        fetchProducts();
        
        // Set default date range
        const today = new Date();
        const end = today.toISOString().split('T')[0];
        
        let start;
        if (dateRange === 'week') {
            const lastWeek = new Date(today);
            lastWeek.setDate(today.getDate() - 7);
            start = lastWeek.toISOString().split('T')[0];
        } else if (dateRange === 'month') {
            const lastMonth = new Date(today);
            lastMonth.setMonth(today.getMonth() - 1);
            start = lastMonth.toISOString().split('T')[0];
        } else if (dateRange === 'year') {
            const lastYear = new Date(today);
            lastYear.setFullYear(today.getFullYear() - 1);
            start = lastYear.toISOString().split('T')[0];
        }
        
        setStartDate(start);
        setEndDate(end);
    }, [dateRange]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            
            try {
                const response = await axiosInstance.get('/shop/products');
                
                if (response.data && response.data.success) {
                    const productData = response.data.products || [];
                    setProducts(productData);
                    console.log('Products loaded from API:', productData.length);
                    
                    // Simulate some sales data for now (this would come from backend in a real app)
                    simulateSalesData(productData);
                } else {
                    throw new Error('Failed to load products');
                }
            } catch (err) {
                console.warn('Backend connection failed, using sample data for display:', err);
                
                // Generate sample products for testing when backend is unavailable
                const sampleProducts = generateSampleProducts();
                setProducts(sampleProducts);
                console.log('Using sample products:', sampleProducts.length);
                
                // Simulate sales for the sample products
                simulateSalesData(sampleProducts);
                
                // Show toast only in development
                if (process.env.NODE_ENV === 'development') {
                    toast.info('Using sample data - backend connection unavailable');
                }
            }
        } catch (err) {
            console.error('Error in analysis component:', err);
            toast.error('Error loading analysis data');
        } finally {
            setLoading(false);
        }
    };

    // Function to generate sample products for testing
    const generateSampleProducts = () => {
        const categories = ['Electronics', 'Groceries', 'Clothing', 'Home & Kitchen', 'Beauty'];
        
        return Array.from({ length: 20 }, (_, i) => ({
            _id: `sample-${i + 1}`,
            name: `Sample Product ${i + 1}`,
            description: `This is a sample product ${i + 1}`,
            price: Math.floor(Math.random() * 1000) + 50,
            quantity: Math.floor(Math.random() * 100) + 5,
            category: categories[Math.floor(Math.random() * categories.length)],
            discount: Math.floor(Math.random() * 30),
            manufactureDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
            expiryDate: new Date(Date.now() + Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)
        }));
    };
    
    const simulateSalesData = (products) => {
        // Creating mock sales data based on products - in a real app, this would come from backend
        const mockSales = products.map(product => {
            // Generate random sales between 1 and 100 for each product
            const quantity = Math.floor(Math.random() * 100) + 1;
            return {
                productId: product._id,
                productName: product.name,
                category: product.category,
                quantity: quantity,
                totalPrice: quantity * product.price * (1 - product.discount/100),
                date: new Date(
                    Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
                ) // Random date within last 30 days
            };
        });
        
        setSales(mockSales);
        calculateSummaryData(products, mockSales);
    };

    const calculateSummaryData = (products, salesData) => {
        // Calculate total products
        const totalProducts = products.length;
        
        // Calculate total sales quantity
        const totalSalesQuantity = salesData.reduce((acc, sale) => acc + sale.quantity, 0);
        
        // Calculate total revenue
        const totalRevenue = salesData.reduce((acc, sale) => acc + sale.totalPrice, 0);
        
        // Calculate profit margin (just an estimation for demo)
        const profitMargin = totalRevenue * 0.3; // Assuming 30% profit margin
        
        // Calculate top selling products
        const productSales = {};
        salesData.forEach(sale => {
            if (!productSales[sale.productId]) {
                productSales[sale.productId] = {
                    id: sale.productId,
                    name: sale.productName,
                    category: sale.category,
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[sale.productId].quantity += sale.quantity;
            productSales[sale.productId].revenue += sale.totalPrice;
        });
        
        const productSalesArray = Object.values(productSales);
        
        // Get top 5 products by quantity
        const topProducts = [...productSalesArray]
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
            
        // Get worst 5 products by quantity
        const worstProducts = [...productSalesArray]
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 5);
            
        // Calculate sales by category
        const categorySales = {};
        salesData.forEach(sale => {
            const category = sale.category || 'Uncategorized';
            if (!categorySales[category]) {
                categorySales[category] = 0;
            }
            categorySales[category] += sale.totalPrice;
        });

            setSummaryData({
            totalProducts,
            totalSales: totalSalesQuantity,
            totalRevenue,
            profitMargin,
            topProducts,
            worstProducts,
            categorySales
            });
        };

    const getChartData = () => {
        // Format depends on type of chart
        switch (chartType) {
            case 'pie':
                return getPieChartData();
            case 'bar':
                return getBarChartData();
            case 'line':
            default:
                return getLineChartData();
        }
    };

    const getLineChartData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const salesData = new Array(12).fill(0);
        const revenueData = new Array(12).fill(0);

        sales.forEach(sale => {
            const date = new Date(sale.date);
            const month = date.getMonth();
            salesData[month] += sale.quantity;
            revenueData[month] += sale.totalPrice;
        });

        return {
            labels: months,
            datasets: [
                {
                    label: 'Sales Quantity',
                    data: salesData,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'Revenue',
                    data: revenueData,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }
            ]
        };
    };

    const getBarChartData = () => {
        // Sort products by sales for bar chart
        const topSelling = [...summaryData.topProducts].slice(0, 10);
        
        return {
            labels: topSelling.map(product => product.name),
            datasets: [
                {
                    label: 'Units Sold',
                    data: topSelling.map(product => product.quantity),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                }
            ]
        };
    };

    const getPieChartData = () => {
        // Use category sales for pie chart
        const categories = Object.keys(summaryData.categorySales);
        const values = Object.values(summaryData.categorySales);
        
        return {
            labels: categories,
            datasets: [
                {
                    data: values,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(199, 199, 199, 0.6)',
                    ],
                    borderWidth: 1,
                }
            ]
        };
    };

    const handleDateRangeChange = (e) => {
        setDateRange(e.target.value);
    };

    const handleChartTypeChange = (type) => {
        setChartType(type);
    };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Business Analysis Report</title>
                    <style>
                        body { font-family: Arial; padding: 20px; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .date-range { text-align: center; margin-bottom: 30px; font-style: italic; }
                        .summary { margin: 20px 0; }
                        .product { margin: 10px 0; padding: 10px; background: #f5f5f5; }
                        .flex-container { display: flex; justify-content: space-between; }
                        .column { width: 48%; }
                        h2 { color: #3b82f6; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                    <h1>Business Analysis Report</h1>
                    </div>
                    <div class="date-range">
                        <p>Period: ${startDate} to ${endDate}</p>
                    </div>
                    <div class="summary">
                        <h2>Summary</h2>
                        <p>Total Products: ${summaryData.totalProducts}</p>
                        <p>Total Sales (Units): ${summaryData.totalSales}</p>
                        <p>Total Revenue: ₹${summaryData.totalRevenue.toFixed(2)}</p>
                        <p>Estimated Profit: ₹${summaryData.profitMargin.toFixed(2)}</p>
                    </div>
                    
                    <div class="flex-container">
                        <div class="column">
                            <h2>Top Selling Products</h2>
                        ${summaryData.topProducts.map(product => `
                            <div class="product">
                                    <p><strong>Name:</strong> ${product.name}</p>
                                    <p><strong>Category:</strong> ${product.category || 'N/A'}</p>
                                    <p><strong>Units Sold:</strong> ${product.quantity}</p>
                                    <p><strong>Revenue:</strong> ₹${product.revenue.toFixed(2)}</p>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="column">
                            <h2>Worst Selling Products</h2>
                            ${summaryData.worstProducts.map(product => `
                                <div class="product">
                                    <p><strong>Name:</strong> ${product.name}</p>
                                    <p><strong>Category:</strong> ${product.category || 'N/A'}</p>
                                    <p><strong>Units Sold:</strong> ${product.quantity}</p>
                                    <p><strong>Revenue:</strong> ₹${product.revenue.toFixed(2)}</p>
                            </div>
                        `).join('')}
                        </div>
                    </div>
                    
                    <div>
                        <h2>Sales by Category</h2>
                        <ul>
                            ${Object.entries(summaryData.categorySales).map(([category, revenue]) => `
                                <li><strong>${category}:</strong> ₹${revenue.toFixed(2)}</li>
                            `).join('')}
                        </ul>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const renderChart = () => {
        const chartData = getChartData();
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: chartType === 'pie' 
                        ? 'Sales by Category' 
                        : chartType === 'bar'
                            ? 'Top Selling Products'
                            : 'Sales and Revenue Trends'
                },
            },
        };

        switch (chartType) {
            case 'pie':
                return <Pie data={chartData} options={options} />;
            case 'bar':
                return <Bar data={chartData} options={options} />;
            case 'line':
            default:
                return <Line data={chartData} options={options} />;
        }
    };

    return (
        <div className="analysis-container">
            <h1>Business Analysis Dashboard</h1>
            
            <div className="controls">
                <div className="date-controls">
                    <div className="date-range-select">
                        <label htmlFor="dateRange"><FaCalendarAlt /> Time Period:</label>
                <select 
                            id="dateRange"
                    value={dateRange} 
                            onChange={handleDateRangeChange}
                >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                </select>
                    </div>
                    
                    <div className="date-inputs">
                        <div className="date-input">
                            <label htmlFor="startDate">From:</label>
                            <input 
                                id="startDate"
                                type="date" 
                                value={startDate} 
                                onChange={(e) => setStartDate(e.target.value)} 
                            />
                        </div>
                        <div className="date-input">
                            <label htmlFor="endDate">To:</label>
                            <input 
                                id="endDate"
                                type="date" 
                                value={endDate} 
                                onChange={(e) => setEndDate(e.target.value)} 
                            />
                        </div>
                    </div>
                </div>
                
                <div className="chart-controls">
                    <button 
                        className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                        onClick={() => handleChartTypeChange('line')}
                    >
                        <FaChartLine /> Line
                    </button>
                    <button 
                        className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                        onClick={() => handleChartTypeChange('bar')}
                    >
                        <FaChartBar /> Bar
                    </button>
                    <button 
                        className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
                        onClick={() => handleChartTypeChange('pie')}
                    >
                        <FaChartPie /> Pie
                    </button>
                    
                    <button className="print-btn" onClick={handlePrint}>
                        Generate Report
                    </button>
                </div>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <h3>Total Products</h3>
                    <p>{summaryData.totalProducts}</p>
                </div>
                <div className="summary-card">
                    <h3>Total Sales (Units)</h3>
                    <p>{summaryData.totalSales}</p>
                </div>
                <div className="summary-card">
                    <h3>Total Revenue</h3>
                    <p>₹{summaryData.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                    <h3>Profit Margin</h3>
                    <p>₹{summaryData.profitMargin.toFixed(2)}</p>
                </div>
            </div>

            <div className="chart-container">
                {loading ? (
                    <div className="loading-spinner">Loading data...</div>
                ) : (
                    renderChart()
                )}
            </div>

            <div className="products-analysis">
            <div className="top-products">
                <h2>Top Selling Products</h2>
                {summaryData.topProducts.map((product, index) => (
                    <div key={index} className="product-item">
                            <span className="product-name">{product.name}</span>
                            <span className="product-category">{product.category || 'N/A'}</span>
                            <span className="product-units">{product.quantity} units</span>
                            <span className="product-revenue">₹{product.revenue.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                
                <div className="worst-products">
                    <h2>Low Performing Products</h2>
                    {summaryData.worstProducts.map((product, index) => (
                        <div key={index} className="product-item">
                            <span className="product-name">{product.name}</span>
                            <span className="product-category">{product.category || 'N/A'}</span>
                            <span className="product-units">{product.quantity} units</span>
                            <span className="product-revenue">₹{product.revenue.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="insights-section">
                <h2>Business Insights</h2>
                <div className="insights-container">
                    {summaryData.topProducts.length > 0 && (
                        <div className="insight-card">
                            <h3>Top Performer</h3>
                            <p>
                                <strong>{summaryData.topProducts[0].name}</strong> is your best seller with {summaryData.topProducts[0].quantity} units sold, 
                                generating ₹{summaryData.topProducts[0].revenue.toFixed(2)} in revenue.
                            </p>
                            <p className="insight-action">
                                Consider increasing inventory or featuring this product prominently.
                            </p>
                        </div>
                    )}
                    
                    {summaryData.worstProducts.length > 0 && (
                        <div className="insight-card">
                            <h3>Underperforming Items</h3>
                            <p>
                                <strong>{summaryData.worstProducts[0].name}</strong> has low sales with only {summaryData.worstProducts[0].quantity} units sold.
                            </p>
                            <p className="insight-action">
                                Consider offering discounts or bundling with popular items to increase sales.
                            </p>
                        </div>
                    )}
                    
                    <div className="insight-card">
                        <h3>Sales Trend</h3>
                        <p>
                            Your overall sales for this period: <strong>{summaryData.totalSales} units</strong> with 
                            a total revenue of <strong>₹{summaryData.totalRevenue.toFixed(2)}</strong>.
                        </p>
                        <p className="insight-action">
                            The average revenue per product is ₹{(summaryData.totalRevenue / summaryData.totalProducts).toFixed(2)}.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;