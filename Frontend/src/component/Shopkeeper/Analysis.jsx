import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import './Analysis.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Analysis = ({ products = [], sales = [], purchases = [] }) => {
    const [dateRange, setDateRange] = useState('month');
    const [summaryData, setSummaryData] = useState({
        totalProducts: 0,
        totalSales: 0,
        totalPurchases: 0,
        topProducts: []
    });

    useEffect(() => {
        const calculateSummary = () => {
            const total = products.reduce((acc, product) => {
                const price = Number(product.price) || 0;
                const quantity = Number(product.quantity) || 0;
                const discount = Number(product.discount) || 0;
                const finalPrice = price * quantity * (1 - discount/100);
                return acc + finalPrice;
            }, 0);

            // Sort products by sales volume
            const sortedProducts = [...products].sort((a, b) => 
                (b.price * b.quantity) - (a.price * a.quantity)
            ).slice(0, 5);

            setSummaryData({
                totalProducts: products.length,
                totalSales: total,
                totalPurchases: purchases.reduce((acc, p) => acc + (p.amount || 0), 0),
                topProducts: sortedProducts
            });
        };

        calculateSummary();
    }, [products, sales, purchases]);

    const getChartData = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const salesData = new Array(12).fill(0);
        const purchaseData = new Array(12).fill(0);

        products.forEach(product => {
            const date = new Date(product.manufactureDate);
            const month = date.getMonth();
            const price = Number(product.price) || 0;
            const quantity = Number(product.quantity) || 0;
            salesData[month] += price * quantity;
        });

        return {
            labels: months,
            datasets: [
                {
                    label: 'Sales',
                    data: salesData,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'Purchases',
                    data: purchaseData,
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                }
            ]
        };
    };

    const handlePrint = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Business Analysis Report</title>
                    <style>
                        body { font-family: Arial; padding: 20px; }
                        .summary { margin: 20px 0; }
                        .product { margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <h1>Business Analysis Report</h1>
                    <div class="summary">
                        <h2>Summary</h2>
                        <p>Total Products: ${summaryData.totalProducts}</p>
                        <p>Total Sales: $${summaryData.totalSales.toFixed(2)}</p>
                        <p>Total Purchases: $${summaryData.totalPurchases.toFixed(2)}</p>
                    </div>
                    <div class="top-products">
                        <h2>Top Products</h2>
                        ${summaryData.topProducts.map(product => `
                            <div class="product">
                                <p>Name: ${product.name}</p>
                                <p>Price: $${product.price}</p>
                                <p>Quantity Sold: ${product.quantity}</p>
                            </div>
                        `).join('')}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="analysis-container">
            <h1>Business Analysis</h1>
            
            <div className="controls">
                <select 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)}
                >
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="year">Last Year</option>
                </select>
                <button onClick={handlePrint}>Print Report</button>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <h3>Total Products</h3>
                    <p>{summaryData.totalProducts}</p>
                </div>
                <div className="summary-card">
                    <h3>Total Sales</h3>
                    <p>${summaryData.totalSales.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                    <h3>Total Purchases</h3>
                    <p>${summaryData.totalPurchases.toFixed(2)}</p>
                </div>
                <div className="summary-card">
                    <h3>Net Profit</h3>
                    <p>${(summaryData.totalSales - summaryData.totalPurchases).toFixed(2)}</p>
                </div>
            </div>

            <div className="chart-container">
                <Line data={getChartData()} />
            </div>

            <div className="top-products">
                <h2>Top Selling Products</h2>
                {summaryData.topProducts.map((product, index) => (
                    <div key={index} className="product-item">
                        <span>{product.name}</span>
                        <span>${Number(product.price).toFixed(2)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Analysis;