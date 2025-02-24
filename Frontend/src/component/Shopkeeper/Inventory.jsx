import React, { useState } from 'react';
import './Inventory.css';
import Barcodegen from './Barcodegen';
import Qrcodegen from './Qrcodegen';

const Inventory = () => {
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [showQrCodeModal, setShowQrCodeModal] = useState(false);
    const [productDetails, setProductDetails] = useState({});
    const [rows, setRows] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const product = Object.fromEntries(formData.entries());
        setRows([...rows, product]);
        e.target.reset();
    };

    const handleGenerateBarcode = (product) => {
        setProductDetails(product);
        setShowBarcodeModal(true);
    };

    const handleGenerateQrCode = (product) => {
        setProductDetails(product);
        setShowQrCodeModal(true);
    };

    const handlePrintDetails = (product) => {
        const printContent = `
            <div>
                <h2>Product Details</h2>
                <p><strong>Product Name:</strong> ${product.pname}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Product SKU:</strong> ${product.productsku}</p>
                <p><strong>Brand / Manufacturer:</strong> ${product.brand}</p>
                <p><strong>Description:</strong> ${product.description}</p>
                <p><strong>Quantity in Stock:</strong> ${product.quantityinstock}</p>
                <p><strong>Reorder Quantity:</strong> ${product.reorderquantity}</p>
                <p><strong>Minimum Stock Level:</strong> ${product.minimumstock}</p>
                <p><strong>Storage Location:</strong> ${product.storagelocation}</p>
                <p><strong>Manufacturing Date:</strong> ${product.manufacturingdate}</p>
                <p><strong>Expiry Date:</strong> ${product.expirydate}</p>
                <p><strong>Purchase Price:</strong> ${product.purchaseprice}</p>
                <p><strong>Selling Price:</strong> ${product.sellingprice}</p>
                <p><strong>Discounts:</strong> ${product.discounts}</p>
                <p><strong>Tax Rate:</strong> ${product.taxrate}</p>
                <p><strong>Supplier Name:</strong> ${product.suppliername}</p>
                <p><strong>Purchase Date:</strong> ${product.purchasedate}</p>
                <p><strong>Supplier Contact:</strong> ${product.suppliercontact}</p>
                <p><strong>Payment Terms:</strong> ${product.paymentterms}</p>
                <p><strong>Batch Number:</strong> ${product.batchnumber}</p>
                <p><strong>Barcode/QR Code:</strong> ${product.barcode}</p>
                <p><strong>Serial Number:</strong> ${product.serialnumber}</p>
                <p><strong>Additional Expiry Date:</strong> ${product.additionalexpirydate}</p>
            </div>
        `;
        const WinPrint = window.open('', '', 'width=900,height=650');
        WinPrint.document.write(printContent);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    };

    const handlePrintAllDetails = () => {
        const printContent = rows.map(product => `
            <div>
                <h2>Product Details</h2>
                <p><strong>Product Name:</strong> ${product.pname}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Product SKU:</strong> ${product.productsku}</p>
                <p><strong>Brand / Manufacturer:</strong> ${product.brand}</p>
                <p><strong>Description:</strong> ${product.description}</p>
                <p><strong>Quantity in Stock:</strong> ${product.quantityinstock}</p>
                <p><strong>Reorder Quantity:</strong> ${product.reorderquantity}</p>
                <p><strong>Minimum Stock Level:</strong> ${product.minimumstock}</p>
                <p><strong>Storage Location:</strong> ${product.storagelocation}</p>
                <p><strong>Manufacturing Date:</strong> ${product.manufacturingdate}</p>
                <p><strong>Expiry Date:</strong> ${product.expirydate}</p>
                <p><strong>Purchase Price:</strong> ${product.purchaseprice}</p>
                <p><strong>Selling Price:</strong> ${product.sellingprice}</p>
                <p><strong>Discounts:</strong> ${product.discounts}</p>
                <p><strong>Tax Rate:</strong> ${product.taxrate}</p>
                <p><strong>Supplier Name:</strong> ${product.suppliername}</p>
                <p><strong>Purchase Date:</strong> ${product.purchasedate}</p>
                <p><strong>Supplier Contact:</strong> ${product.suppliercontact}</p>
                <p><strong>Payment Terms:</strong> ${product.paymentterms}</p>
                <p><strong>Batch Number:</strong> ${product.batchnumber}</p>
                <p><strong>Barcode/QR Code:</strong> ${product.barcode}</p>
                <p><strong>Serial Number:</strong> ${product.serialnumber}</p>
                <p><strong>Additional Expiry Date:</strong> ${product.additionalexpirydate}</p>
            </div>
        `).join('');
        const WinPrint = window.open('', '', 'width=900,height=650');
        WinPrint.document.write(printContent);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    };

    const handleDelete = (index) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    return (
        <div className="inventory-container">
            <h1>Inventory</h1>
            <form className="inventory-form" onSubmit={handleSubmit}>
                <h2>Basic Product Details</h2>
                <div className="form-section">
                    <label htmlFor="pname">Product Name:</label>
                    <input type="text" id="pname" name="pname" required />

                    <label htmlFor="category">Category:</label>
                    <input type="text" id="category" name="category" required />

                    <label htmlFor="productsku">Product SKU:</label>
                    <input type="text" id="productsku" name="productsku" required />

                    <label htmlFor="brand">Brand / Manufacturer:</label>
                    <input type="text" id="brand" name="brand" required />

                    <label htmlFor="description">Description:</label>
                    <input type="text" id="description" name="description" required />
                </div>

                <h2>Stock & Inventory Details</h2>
                <div className="form-section">
                    <label htmlFor="quantityinstock">Quantity in Stock:</label>
                    <input type="number" id="quantityinstock" name="quantityinstock" required />

                    <label htmlFor="reorderquantity">Reorder Quantity:</label>
                    <input type="number" id="reorderquantity" name="reorderquantity" required />

                    <label htmlFor="minimumstock">Minimum Stock Level:</label>
                    <input type="number" id="minimumstock" name="minimumstock" required />

                    <label htmlFor="storagelocation">Storage Location:</label>
                    <input type="text" id="storagelocation" name="storagelocation" required />

                    <label htmlFor="manufacturingdate">Manufacturing Date:</label>
                    <input type="date" id="manufacturingdate" name="manufacturingdate" required />

                    <label htmlFor="expirydate">Expiry Date:</label>
                    <input type="date" id="expirydate" name="expirydate" required />
                </div>

                <h2>Pricing & Financial Details</h2>
                <div className="form-section">
                    <label htmlFor="purchaseprice">Purchase Price:</label>
                    <input type="number" id="purchaseprice" name="purchaseprice" required />

                    <label htmlFor="sellingprice">Selling Price:</label>
                    <input type="number" id="sellingprice" name="sellingprice" required />

                    <label htmlFor="discounts">Discounts (if applicable):</label>
                    <input type="number" id="discounts" name="discounts" />

                    <label htmlFor="taxrate">Tax Rate:</label>
                    <input type="number" id="taxrate" name="taxrate" required />
                </div>

                <h2>Supplier & Vendor Information</h2>
                <div className="form-section">
                    <label htmlFor="suppliername">Supplier Name:</label>
                    <input type="text" id="suppliername" name="suppliername" required />

                    <label htmlFor="purchasedate">Purchase Date:</label>
                    <input type="date" id="purchasedate" name="purchasedate" required />

                    <label htmlFor="suppliercontact">Supplier Contact:</label>
                    <input type="text" id="suppliercontact" name="suppliercontact" required />

                    <label htmlFor="paymentterms">Payment Terms:</label>
                    <input type="text" id="paymentterms" name="paymentterms" required />
                </div>

                <h2>Additional Tracking Details</h2>
                <div className="form-section">
                    <label htmlFor="batchnumber">Batch Number (if applicable):</label>
                    <input type="text" id="batchnumber" name="batchnumber" />

                    <label htmlFor="barcode">Barcode/QR Code:</label>
                    <input type="text" id="barcode" name="barcode" />

                    <label htmlFor="serialnumber">Serial Number (if applicable):</label>
                    <input type="text" id="serialnumber" name="serialnumber" />

                    <label htmlFor="additionalexpirydate">Expiry Date (if applicable):</label>
                    <input type="date" id="additionalexpirydate" name="additionalexpirydate" />
                </div>

                <button type="submit">Add Product</button>
            </form>

            <div className="inventory-list">
                {rows.map((row, index) => (
                    <div key={index} className="inventory-item">
                        <span>{row.pname}</span>
                        <span>{row.sellingprice}</span>
                        <span>{row.manufacturingdate}</span>
                        <span>{row.expirydate}</span>
                        <button onClick={() => handleGenerateBarcode(row)}>Generate Barcode</button>
                        <button onClick={() => handleGenerateQrCode(row)}>Generate QR Code</button>
                        <button onClick={() => handlePrintDetails(row)}>Print Details</button>
                        <button onClick={() => handleDelete(index)}>Delete</button>
                    </div>
                ))}
            </div>

            <button className="print-all-button" onClick={handlePrintAllDetails}>Print All Details</button>

            {showBarcodeModal && (
                <div className="barcode-modal">
                    <Barcodegen productDetails={productDetails} onClose={() => setShowBarcodeModal(false)} />
                </div>
            )}

            {showQrCodeModal && (
                <div className="qrcode-modal">
                    <Qrcodegen productDetails={productDetails} onClose={() => setShowQrCodeModal(false)} />
                </div>
            )}
        </div>
    );
};

export default Inventory;