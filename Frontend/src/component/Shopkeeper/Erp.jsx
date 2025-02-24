import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Barcodegen from './Barcodegen';
import Qrcodegen from './Qrcodegen';
import './Erp.css';

const Erp = () => {
    const [rows, setRows] = useState([]);
    const [showActionPopup, setShowActionPopup] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    const [formData, setFormData] = useState({
        slno: 1,
        pname: '',
        quantity: '',
        price: '',
        discount: '',
        total: '',
        manufactureDate: '',
        expiryDate: ''
    });
    const [showScanner, setShowScanner] = useState(false);
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [showQrCodeModal, setShowQrCodeModal] = useState(false);
    const [productDetails, setProductDetails] = useState({});
    const handleActionClick = (product) => {
        setSelectedProduct(product);
        setShowActionPopup(true);
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleScan = (data) => {
        if (data) {
            try {
                const productData = JSON.parse(data);
                setFormData({
                    ...formData,
                    pname: productData.pname,
                    price: productData.price,
                    manufactureDate: productData.manufactureDate,
                    expiryDate: productData.expiryDate
                });
                setShowScanner(false);
            } catch (error) {
                console.error('Invalid barcode data');
            }
        }
    };

    const handleAdd = (e) => {
        e.preventDefault();
        const total = (formData.price * formData.quantity) - (formData.price * formData.quantity * (formData.discount / 100));
        setRows([...rows, { ...formData, total }]);
        setFormData({
            slno: formData.slno + 1,
            pname: '',
            quantity: '',
            price: '',
            discount: '',
            total: '',
            manufactureDate: '',
            expiryDate: ''
        });
    };

    const handleGenerateBarcode = (product) => {
        const barcodeData = JSON.stringify({
            slno: product.slno,
            pname: product.pname,
            quantity: product.quantity,
            price: product.price,
            discount: product.discount,
            total: product.total,
            manufactureDate: product.manufactureDate,
            expiryDate: product.expiryDate
        });
        setProductDetails({ ...product, barcodeData });
        setShowBarcodeModal(true);
    };

    

    const handleGenerateQrCode = (product) => {
        const qrData = JSON.stringify({
            slno: product.slno,
            pname: product.pname,
            quantity: product.quantity,
            price: product.price,
            discount: product.discount,
            total: product.total,
            manufactureDate: product.manufactureDate,
            expiryDate: product.expiryDate
        });
        setProductDetails({ ...product, qrData });
        setShowQrCodeModal(true);
    };

    const handlePrintDetails = (product) => {
        const printContent = `
            <div>
                <h2>Product Details</h2>
                <p><strong>Product Name:</strong> ${product.pname}</p>
                <p><strong>Quantity:</strong> ${product.quantity}</p>
                <p><strong>Price:</strong> ${product.price}</p>
                <p><strong>Discount:</strong> ${product.discount}</p>
                <p><strong>Total:</strong> ${product.total}</p>
                <p><strong>Manufacturing Date:</strong> ${product.manufactureDate}</p>
                <p><strong>Expiry Date:</strong> ${product.expiryDate}</p>
            </div>
        `;
        const WinPrint = window.open('', '', 'width=900,height=650');
        WinPrint.document.write(printContent);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    };

    const handlePrintAll = () => {
        const printContent = rows.map(product => `
            <div style="margin-bottom: 20px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
                <h3>Product Details - ${product.pname}</h3>
                <p><strong>Serial Number:</strong> ${product.slno}</p>
                <p><strong>Quantity:</strong> ${product.quantity}</p>
                <p><strong>Price:</strong> ${product.price}</p>
                <p><strong>Discount:</strong> ${product.discount}%</p>
                <p><strong>Total:</strong> ${product.total}</p>
                <p><strong>Manufacturing Date:</strong> ${product.manufactureDate}</p>
                <p><strong>Expiry Date:</strong> ${product.expiryDate}</p>
            </div>
        `).join('');
        const WinPrint = window.open('', '', 'width=900,height=650');
        WinPrint.document.write(`
            <html>
                <head>
                    <title>Product List</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h3 { color: #333; margin-bottom: 10px; }
                        p { margin: 5px 0; }
                    </style>
                </head>
                <body>
                    <h2>Complete Product List</h2>
                    ${printContent}
                </body>
            </html>
        `);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    };
    useEffect(() => {
        let scanner;
        if (showScanner) {
            scanner = new Html5QrcodeScanner('reader', {
                qrbox: { width: 250, height: 250 },
                fps: 5
            });
            scanner.render(success, error);
        }
        return () => {
            if (scanner) {
                scanner.clear();
            }
        };
    }, [showScanner]);

   // Update the success handler for scanner
   const success = (result) => {
    try {
        const scannedData = JSON.parse(result);
        const newProduct = {
            slno: rows.length + 1,
            pname: scannedData.pname || '',
            quantity: scannedData.quantity || 1,
            price: scannedData.price || 0,
            discount: scannedData.discount || 0,
            manufactureDate: scannedData.manufactureDate || '',
            expiryDate: scannedData.expiryDate || ''
        };
        
        const total = (newProduct.price * newProduct.quantity) - 
                     (newProduct.price * newProduct.quantity * (newProduct.discount / 100));
        
        setRows(prevRows => [...prevRows, { ...newProduct, total }]);
        setShowScanner(false);
        
    } catch (error) {
        console.error('Invalid code data');
    }
};

    const error = (err) => {
        console.warn(err);
    };


    return (
        <div className="erp">
            <h2>Inventory System</h2>
            
            <div className="top-buttons">
                <button className="scan-button" onClick={() => setShowScanner(true)}>
                    Scan Barcode
                </button>
                <button className="print-all-button" onClick={handlePrintAll}>
                    Print All Products
                </button>
            </div>
            {showScanner && (
                <div className="scanner-modal">
                    <div className="scanner-content">
                        <div id="reader"></div>
                        <button onClick={() => setShowScanner(false)}>Close</button>
                    </div>
                </div>
            )}

            <form onSubmit={handleAdd} className="addtable">
                <div className="tableinput">
                    <label htmlFor="slno">Sl. No:</label>
                    <input type="number" id="slno" name="slno" value={formData.slno} onChange={handleChange} readOnly />
                    
                    <label htmlFor="pname">Product Name:</label>
                    <input type="text" id="pname" name="pname" value={formData.pname} onChange={handleChange} required />
                    
                    <label htmlFor="quantity">Quantity:</label>
                    <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} required />
                    
                    <label htmlFor="price">Price:</label>
                    <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required />
                    
                    <label htmlFor="discount">Discount (%):</label>
                    <input type="number" id="discount" name="discount" value={formData.discount} onChange={handleChange} required />

                    <label htmlFor="manufactureDate">Manufacture Date:</label>
                    <input type="date" id="manufactureDate" name="manufactureDate" value={formData.manufactureDate} onChange={handleChange} required />

                    <label htmlFor="expiryDate">Expiry Date:</label>
                    <input type="date" id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required />
                </div>
                <button type="submit">Add Product</button>
            </form>

            <div className="tablerow header">
                <span>Sl. No</span>
                <span>Product Name</span>
                <span>Quantity</span>
                <span>Price</span>
                <span>Discount</span>
                <span>Total</span>
                <span>Actions</span>
            </div>

            {rows.map((row, index) => (
                <div className="tablerow" key={index}>
                    <span>{row.slno}</span>
                    <span>{row.pname}</span>
                    <span>{row.quantity}</span>
                    <span>{row.price}</span>
                    <span>{row.discount}</span>
                    <span>{row.total}</span>
                    <div className="action-buttons">
                        <button onClick={() => handleActionClick(row)}>Actions</button>
                        <button onClick={() => setRows(rows.filter((_, i) => i !== index))}>Delete</button>
                    </div>
                </div>
            ))}
            {showActionPopup && selectedProduct && (
                <div className="action-popup-modal">
                    <div className="action-popup-content">
                        <h3>Actions for {selectedProduct.pname}</h3>
                        <div className="action-popup-buttons">
                            <button onClick={() => {
                                handleGenerateBarcode(selectedProduct);
                                setShowActionPopup(false);
                            }}>Generate Barcode</button>
                            
                            <button onClick={() => {
                                handleGenerateQrCode(selectedProduct);
                                setShowActionPopup(false);
                            }}>Generate QR Code</button>
                            
                            <button onClick={() => {
                                handlePrintDetails(selectedProduct);
                                setShowActionPopup(false);
                            }}>Print Details</button>
                        </div>
                        <button className="close-button" onClick={() => setShowActionPopup(false)}>Close</button>
                    </div>
                </div>
            )}

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

export default Erp;