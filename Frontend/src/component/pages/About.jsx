import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about-container">
            <h1>About EXIMS</h1>
            <p>
                <strong>EXIMS</strong> (Exipy Inventory Management System) is a comprehensive software solution designed to streamline and optimize the processes involved in international trade. This project aims to provide businesses with a robust platform to manage their export and import operations efficiently, ensuring compliance with global trade regulations and enhancing overall productivity.
            </p>
            <h2>Key Features</h2>
            <ul>
                <li><strong>Product Management:</strong> Add, update, and manage product details. Track product inventory levels and stock status. Set and manage product discounts and pricing.</li>
                <li><strong>Order Management:</strong> Create and manage export and import orders. Track order status from initiation to delivery. Generate invoices and shipping documents.</li>
                <li><strong>Inventory Control:</strong> Monitor stock levels in real-time. Manage warehouse locations and stock movements. Generate inventory reports and analytics.</li>
                <li><strong>Sales and Purchases:</strong> Record and analyze sales and purchase transactions. Generate sales and purchase reports. Manage supplier and customer information.</li>
                <li><strong>Analytics and Reporting:</strong> Visualize sales, purchases, and inventory data through interactive charts and graphs. Generate detailed reports for business analysis. Print and export reports for offline use.</li>
                <li><strong>User Management:</strong> Manage user roles and permissions. Ensure secure access to sensitive data. Track user activities and system logs.</li>
            </ul>
            <h2>Benefits</h2>
            <ul>
                <li><strong>Efficiency:</strong> Automates routine tasks, reducing manual effort and errors.</li>
                <li><strong>Compliance:</strong> Ensures adherence to international trade regulations and standards.</li>
                <li><strong>Visibility:</strong> Provides real-time insights into business operations and performance.</li>
                <li><strong>Scalability:</strong> Supports growing business needs with scalable architecture.</li>
                <li><strong>Integration:</strong> Easily integrates with other business systems and platforms.</li>
            </ul>
            
        </div>
    );
};

export default About;
