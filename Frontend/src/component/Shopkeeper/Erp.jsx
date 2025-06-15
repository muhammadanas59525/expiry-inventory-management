import React, { useState, useEffect, useRef } from 'react';
import Quagga from 'quagga';
import Barcodegen from './Barcodegen';
import Qrcodegen from './Qrcodegen';
import './Erp.css';
import axiosInstance from '../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Erp = () => {
    const [rows, setRows] = useState([]);
    const [showActionPopup, setShowActionPopup] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showProductSuggestions, setShowProductSuggestions] = useState(false);
    const [totalBillAmount, setTotalBillAmount] = useState(0);
    
    const [formData, setFormData] = useState({
        slno: 1,
        pname: '',
        quantity: 1,
        price: '',
        discount: '',
        total: '',
        manufactureDate: '',
        expiryDate: '',
        productId: '' // Store the selected product's ID
    });
    const [showScanner, setShowScanner] = useState(false);
    const [showBarcodeModal, setShowBarcodeModal] = useState(false);
    const [showQrCodeModal, setShowQrCodeModal] = useState(false);
    const [productDetails, setProductDetails] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastDetectedCode, setLastDetectedCode] = useState(null);
    const scannerRef = useRef(null);
    
    const handleActionClick = (product) => {
        setSelectedProduct(product);
        setShowActionPopup(true);
    };
    
    // Handle changes in the form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Show product suggestions when typing in the product name field
        if (name === 'pname') {
            if (value.trim().length > 0) {
                const filtered = products.filter(product => 
                    product.name.toLowerCase().includes(value.toLowerCase())
                );
                setFilteredProducts(filtered);
                setShowProductSuggestions(true);
            } else {
                setShowProductSuggestions(false);
            }
        }
        
        // Recalculate total when quantity, price, or discount changes
        if (['quantity', 'price', 'discount'].includes(name)) {
            const quantity = name === 'quantity' ? parseInt(value) || 0 : parseInt(formData.quantity) || 0;
            const price = name === 'price' ? parseFloat(value) || 0 : parseFloat(formData.price) || 0;
            const discount = name === 'discount' ? parseFloat(value) || 0 : parseFloat(formData.discount) || 0;
            
            const total = (price * quantity) * (1 - discount/100);
            
            setFormData(prev => ({
                ...prev,
                total: total.toFixed(2)
            }));
        }
    };
    
    // Select a product from the suggestions
    const handleSelectProduct = (product) => {
        const manufactureDate = product.manufactureDate ? 
            new Date(product.manufactureDate).toISOString().split('T')[0] : '';
        
        const expiryDate = product.expiryDate ? 
            new Date(product.expiryDate).toISOString().split('T')[0] : '';
            
        // Calculate total based on quantity, price, and discount
        const quantity = parseInt(formData.quantity) || 1;
        const price = parseFloat(product.price) || 0;
        const discount = parseFloat(product.discount) || 0;
        const total = (price * quantity) * (1 - discount/100);
            
        setFormData({
            ...formData,
            pname: product.name,
            price: product.price.toString(),
            discount: product.discount.toString(),
            manufactureDate: manufactureDate,
            expiryDate: expiryDate,
            productId: product._id,
            total: total.toFixed(2)
        });
        
        setShowProductSuggestions(false);
    };

    // Initialize and start Quagga scanner
    const initQuagga = () => {
        if (scannerRef.current) {
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: scannerRef.current,
                    constraints: {
                        width: 480,
                        height: 320,
                        facingMode: "environment"
                    },
                },
                locator: {
                    patchSize: "medium",
                    halfSample: true
                },
                numOfWorkers: navigator.hardwareConcurrency || 4,
                decoder: {
                    readers: [
                        "code_128_reader",
                        "ean_reader",
                        "ean_8_reader",
                        "code_39_reader",
                        "code_39_vin_reader",
                        "codabar_reader",
                        "upc_reader",
                        "upc_e_reader",
                        "i2of5_reader"
                    ]
                },
                locate: true
            }, function(err) {
                if (err) {
                    console.error("Quagga initialization failed:", err);
                    toast.error("Could not initialize scanner. Please try again.");
                    return;
                }
                Quagga.start();
            });

            // Setup barcode detected event
            Quagga.onDetected(handleBarcodeDetected);

            // Draw scanning line on each processed frame
            Quagga.onProcessed(result => {
                const drawingCtx = Quagga.canvas.ctx.overlay;
                const drawingCanvas = Quagga.canvas.dom.overlay;

                if (result) {
                    if (result.boxes) {
                        drawingCtx.clearRect(
                            0,
                            0,
                            parseInt(drawingCanvas.getAttribute("width")),
                            parseInt(drawingCanvas.getAttribute("height"))
                        );
                        result.boxes.filter(box => box !== result.box).forEach(box => {
                            Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
                                color: "green",
                                lineWidth: 2
                            });
                        });
                    }

                    if (result.box) {
                        Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
                            color: "#00F",
                            lineWidth: 2
                        });
                    }

                    if (result.codeResult && result.codeResult.code) {
                        Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, {
                            color: 'red',
                            lineWidth: 3
                        });
                    }
                }
            });
        }
    };

    // Handle barcode detection
    const handleBarcodeDetected = result => {
        // Only process if it's a new code or 3 seconds have passed since last detection
        if (!lastDetectedCode || lastDetectedCode.time < Date.now() - 3000 || lastDetectedCode.code !== result.codeResult.code) {
            setLastDetectedCode({
                code: result.codeResult.code,
                time: Date.now()
            });
            
            const barcodeValue = result.codeResult.code;
            console.log("Barcode detected:", barcodeValue);
            
            // Beep sound to indicate successful scan
            const beep = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...");
            beep.play();
            
            // Look up product by barcode
            const foundProduct = products.find(p => p.barcode === barcodeValue);
            
            if (foundProduct) {
                handleSelectProduct(foundProduct);
                toast.success(`Product found: ${foundProduct.name}`);
                
                // Stop scanner after successful scan
                stopScanner();
            } else {
                toast.warning(`No product found with barcode: ${barcodeValue}`);
            }
        }
    };

    // Stop Quagga scanner
    const stopScanner = () => {
        Quagga.stop();
        setShowScanner(false);
    };

    // Fetch products from API
        const fetchProducts = async () => {
            try {
            console.log('Fetching products for billing...');
            const response = await axiosInstance.get('/shop/products');
                
                if(response.data.success) {
                const productData = response.data.products || response.data.data || [];
                setProducts(productData);
                console.log('Products loaded:', productData.length);
                } else {
                setProducts([]);
                toast.error('Failed to load products');
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            toast.error('Error loading products. Please try again.');
            setProducts([]);
            }
        };
    
    // Load products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Initialize and cleanup scanner when showScanner changes
    useEffect(() => {
        if (showScanner) {
            initQuagga();
        }
        
        return () => {
            if (showScanner) {
                Quagga.stop();
            }
        };
    }, [showScanner]);

    // Calculate total bill amount whenever rows change
    useEffect(() => {
        const total = rows.reduce((sum, row) => sum + parseFloat(row.total || 0), 0);
        setTotalBillAmount(total.toFixed(2));
    }, [rows]);

    // Add a product to the bill
    const handleAdd = async(e) => {
        e.preventDefault();
        
        // Validate inputs
        if (!formData.pname || !formData.price || !formData.quantity) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        const total = (parseFloat(formData.price) * parseInt(formData.quantity)) * 
            (1 - parseFloat(formData.discount || 0)/100);
            
        // Add the product to the rows
        setRows([...rows, { ...formData, total: total.toFixed(2) }]);
        
        // Reset the form for the next product
        setFormData({
            slno: formData.slno + 1,
            pname: '',
            quantity: 1,
            price: '',
            discount: '0',
            total: '',
            manufactureDate: '',
            expiryDate: '',
            productId: ''
        });
    };
    
    // Process the entire bill by updating stock in the database
    const handleProcessBill = async () => {
        if (rows.length === 0) {
            toast.error('Please add at least one product to the bill');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            console.log('Processing bill with items:', rows);
            
            // Track successful updates
            let successCount = 0;
            let failCount = 0;
            
            // Get unique product IDs and quantities to update
            const updates = rows.reduce((acc, row) => {
                if (row.productId) {
                    // If product exists in acc, add to its quantity
                    if (acc[row.productId]) {
                        acc[row.productId] += parseInt(row.quantity);
                    } else {
                        acc[row.productId] = parseInt(row.quantity);
                    }
                }
                return acc;
            }, {});
            
            console.log('Stock updates to process:', updates);
            
            // Update stock for each product one by one to handle errors better
            for (const [productId, quantity] of Object.entries(updates)) {
                try {
                    console.log(`Updating product ${productId} stock by reducing ${quantity} units`);
                    
                    const response = await axiosInstance.post('/shop/products/update-stock', {
                        productId,
                        quantity
                    });
                    
                    console.log('Stock update response:', response.data);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to update stock for product ${productId}:`, error);
                    failCount++;
                    // Continue with other products even if one fails
                }
            }
            
            // Save the bill data
            const billData = {
                items: rows,
                totalAmount: totalBillAmount,
                date: new Date().toISOString()
            };
            
            console.log('Saving bill data:', billData);
            
            const billResponse = await axiosInstance.post('/shop/bills', billData);
            console.log('Bill saved response:', billResponse.data);
            
            if (failCount > 0) {
                toast.warning(`Bill processed with warnings: ${failCount} product(s) could not be updated. Please check inventory.`);
            } else {
                toast.success('Bill processed successfully');
            }
            
            // Refresh product data
            fetchProducts();
            
            // Clear the bill
            setRows([]);
            setFormData({
                slno: 1,
                pname: '',
                quantity: 1,
                price: '',
                discount: '0',
                total: '',
                manufactureDate: '',
                expiryDate: '',
                productId: ''
            });
            
        } catch (error) {
            console.error('Error processing bill:', error);
            toast.error('Failed to process bill. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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
        if (rows.length === 0) {
            toast.error('No items to print');
            return;
        }
        
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
                    <div>
                        <h3>Total Bill Amount: ₹${totalBillAmount}</h3>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                    </div>
                    ${printContent}
                </body>
            </html>
        `);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    };

    return (
        <div className="erp">
            <h2>Billing System</h2>
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="top-buttons">
                <button className="scan-button" onClick={() => setShowScanner(true)}>
                    Scan Barcode
                </button>
                <button className="print-all-button" onClick={handlePrintAll}>
                    Print Bill
                </button>
                <button 
                    className="process-bill-button"
                    onClick={handleProcessBill}
                    disabled={isSubmitting || rows.length === 0}
                >
                    {isSubmitting ? 'Processing...' : 'Complete Bill & Update Stock'}
                </button>
            </div>
            
            {showScanner && (
                <div className="scanner-modal">
                    <div className="scanner-content">
                        <div className="scanner-header">
                            <h3>Scan Product Barcode</h3>
                            <p>Position barcode in the camera view</p>
                        </div>
                        <div className="viewport" ref={scannerRef}></div>
                        <div className="scanner-controls">
                            <button 
                                className="close-scanner-btn" 
                                onClick={stopScanner}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleAdd} className="addtable">
                <div className="tableinput">
                    <label htmlFor="slno">Sl. No:</label>
                    <input type="number" id="slno" name="slno" value={formData.slno} onChange={handleChange} readOnly />
                    
                    <label htmlFor="pname">Product Name:</label>
                    <div className="product-autocomplete">
                        <input 
                            type="text" 
                id="pname" 
                name="pname" 
                value={formData.pname} 
                onChange={handleChange}
                required
                            autoComplete="off"
                        />
                        {showProductSuggestions && filteredProducts.length > 0 && (
                            <div className="product-suggestions">
                                {filteredProducts.slice(0, 5).map(product => (
                                    <div 
                                        key={product._id} 
                                        className="suggestion-item"
                                        onClick={() => handleSelectProduct(product)}
                                    >
                                        {product.name} - ₹{product.price} 
                                        {product.quantity <= 5 && (
                                            <span className="low-stock">(Only {product.quantity} left)</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <label htmlFor="quantity">Quantity:</label>
                    <input 
                        type="number" 
                        id="quantity" 
                        name="quantity" 
                        value={formData.quantity} 
                        onChange={handleChange} 
                        required 
                        min="1"
                    />
                    
                    <label htmlFor="price">Price:</label>
                    <input 
                        type="number" 
                        id="price" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleChange} 
                        required 
                        readOnly={formData.productId ? true : false}
                    />
                    
                    <label htmlFor="discount">Discount (%):</label>
                    <input 
                        type="number" 
                        id="discount" 
                        name="discount" 
                        value={formData.discount} 
                        onChange={handleChange} 
                        required 
                    />

                    <label htmlFor="total">Total Amount:</label>
                    <input 
                        type="text" 
                        id="total" 
                        name="total" 
                        value={formData.total} 
                        readOnly 
                    />

                    <label htmlFor="manufactureDate">Manufacture Date:</label>
                    <input 
                        type="date" 
                        id="manufactureDate" 
                        name="manufactureDate" 
                        value={formData.manufactureDate} 
                        onChange={handleChange} 
                    />

                    <label htmlFor="expiryDate">Expiry Date:</label>
                    <input 
                        type="date" 
                        id="expiryDate" 
                        name="expiryDate" 
                        value={formData.expiryDate} 
                        onChange={handleChange} 
                    />
                </div>
                <button type="submit">Add to Bill</button>
            </form>

            <div className="bill-summary">
                <h3>Bill Total: ₹{totalBillAmount}</h3>
            </div>

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
                    <span>{row.discount}%</span>
                    <span>₹{row.total}</span>
                    <div className="action-buttons">
                        <button onClick={() => handleActionClick(row)}>Actions</button>
                        <button onClick={() => setRows(rows.filter((_, i) => i !== index))}>Remove</button>
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