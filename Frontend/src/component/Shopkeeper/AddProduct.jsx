import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddProduct.css';
import Quagga from 'quagga';

const AddProduct = () => {
  const navigate = useNavigate();
    const { id } = useParams(); // Get product ID from URL if editing
    const isEditMode = !!id;
    
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [showScanner, setShowScanner] = useState(false);
    const scannerRef = useRef(null);
    
  const [formData, setFormData] = useState({
    name: '',
        description: '',
        price: '',
        quantity: '',
    category: '',
        discount: '0',
    imageUrl: '',
        imageFile: null,
        imageUrlInput: '',
        sku: '',
        barcode: '' // Add barcode field
    });


    // Fetch product data if in edit mode
    useEffect(() => {
        if (isEditMode) {
            fetchProductDetails();
        }
    }, [id]);

    const fetchProductDetails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/shop/products/${id}`);
            
            if (response.data && response.data.success) {
                const product = response.data.product;
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price?.toString() || '',
                    quantity: product.quantity?.toString() || '',
                    category: product.category || '',
                    discount: product.discount?.toString() || '0',
                    imageUrl: product.imageUrl || '',
                    imageFile: null,
                    imageUrlInput: '',
                    sku: product.sku || '',
                    barcode: product.barcode || ''
                });
                
                // Set image preview if there's an image URL
                if (product.imageUrl) {
                    setImagePreview(product.imageUrl);
                }
            } else {
                toast.error('Failed to load product details');
                navigate('/shopkeeper/');
            }
        } catch (err) {
            console.error('Error fetching product details:', err);
            toast.error('Error loading product. Please try again.');
            navigate('/shopkeeper/');
        } finally {
            setLoading(false);
        }
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
      [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prevData => ({
                ...prevData,
                imageFile: file
            }));
            
            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prevData => ({
            ...prevData,
            imageUrlInput: url
        }));

        // Preview the image from URL
        if (url) {
            setImagePreview(url);
            // Clear any file upload
            setFormData(prevData => ({
                ...prevData,
                imageFile: null
            }));
        } else {
            setImagePreview(null);
        }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
        
    // Enhanced validation
    const requiredFields = {
        name: 'Product Name',
        description: 'Description',
        price: 'Price',
        category: 'Category',
        sku: 'SKU',
        quantity: 'Quantity',
    };

    // Check for empty required fields
    const emptyFields = Object.entries(requiredFields)
        .filter(([key]) => !formData[key]?.toString().trim())
        .map(([, label]) => label);

    if (emptyFields.length > 0) {
        toast.error(`Please fill in the following required fields: ${emptyFields.join(', ')}`);
        return;
    }
  
    // Validate numeric values
    const price = parseFloat(formData.price);
    const quantity = parseInt(formData.quantity);
    const discount = parseInt(formData.discount) || 0;

    if (isNaN(price) || price < 0) {
        toast.error('Please enter a valid price');
        return;
    }

    if (isNaN(quantity) || quantity < 0) {
        toast.error('Please enter a valid quantity');
        return;
    }

    try {
        setLoading(true);
        
        // Create the product data object with proper type conversion
        const productData = {
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: price,
            quantity: quantity,
            category: formData.category.trim(),
            sku: formData.sku.trim(),
            discount: discount,
            // Add barcode only if it exists and is not empty
            ...(formData.barcode?.trim() && { barcode: formData.barcode.trim() }),
            // Add current date for any date fields the backend expects
            manufactureDate: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // Default to 1 year expiry
        };

        // Try the test endpoint first
        try {
            console.log('Testing endpoint with simplified request...');
            const testResponse = await axiosInstance.post(
                '/shop/products/test',
                { ...productData },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Test endpoint response:', testResponse.data);
        } catch (testError) {
            console.error('Test endpoint failed:', testError);
        }

        // Log the data being sent for debugging
        console.log('Sending product data:', productData);

        let response;
        
        if (formData.imageFile) {
            const formDataWithImage = new FormData();
            
            // Append each field individually to FormData
            Object.entries(productData).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formDataWithImage.append(key, value.toString());
                }
            });
            
            // Append the image file
            formDataWithImage.append('productImage', formData.imageFile);

            response = await axiosInstance.post(
                '/shop/products',
                formDataWithImage,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
        } else if (formData.imageUrlInput) {
            // If there's an image URL, add it to the product data
            productData.imageUrl = formData.imageUrlInput.trim();
            response = await axiosInstance.post(
                '/shop/products',
                productData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        } else {
            // If no image is provided, send without image
            response = await axiosInstance.post(
                '/shop/products',
                productData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        if (response.data && response.data.success) {
            toast.success('Product added successfully');
            navigate('/shopkeeper/addproduct');
            window.location.reload();
        } else {
            throw new Error(response.data?.message || 'Failed to add product');
        }
    } catch (err) {
        console.error('Error saving product:', err);
        
        // Handle specific error cases
        if (err.response?.data?.message) {
            const errorMessage = err.response.data.message;
            
            if (errorMessage.includes('duplicate key error') && errorMessage.includes('sku')) {
                toast.error('This SKU already exists. Please use a different SKU.');
            } else if (errorMessage.includes('Barcode already exists')) {
                toast.error('This barcode is already registered to another product.');
            } else if (errorMessage.includes('Missing required fields')) {
                toast.error('Please ensure all required fields are filled correctly.');
            } else if (errorMessage.includes('Cannot read properties')) {
                toast.error('There was an issue processing your form data. Please try again.');
            } else {
                toast.error(errorMessage);
            }
        } else {
            toast.error(err.message || 'Error saving product. Please try again.');
        }
        
        // Log the actual request data for debugging
        if (err.response?.data) {
            console.log('Server response:', err.response.data);
        }
    } finally {
        setLoading(false);
    }
};

    // Add barcode scanner initialization
    useEffect(() => {
        if (showScanner) {
            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: scannerRef.current,
                    constraints: {
                        facingMode: "environment"
                    },
                },
                decoder: {
                    readers: ["ean_reader", "ean_8_reader", "code_128_reader", "code_39_reader", "upc_reader", "upc_e_reader"]
                }
            }, function(err) {
                if (err) {
                    console.error(err);
                    toast.error('Error initializing barcode scanner');
                } else {
                    Quagga.start();
                }
            });

            Quagga.onDetected((result) => {
                const code = result.codeResult.code;
                setFormData(prev => ({
                    ...prev,
                    barcode: code
                }));
                setShowScanner(false);
                Quagga.stop();
                toast.success('Barcode scanned successfully');
            });
        }

        return () => {
            if (showScanner) {
                Quagga.stop();
            }
        };
    }, [showScanner]);

    // Add barcode scanner toggle function
    const toggleScanner = () => {
        setShowScanner(!showScanner);
    };

  return (
        <div className="add-product-container">
            <ToastContainer position="top-right" autoClose={3000} />
            
            <div className="add-product-header">
                <h1>{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                <button className="back-btn" onClick={() => navigate('/shopkeeper/')}>
                    Back to Products
                </button>
            </div>
            
            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            ) : (
                <form className="product-form" onSubmit={handleSubmit}>
                    <div className="form-layout">
                        <div className="form-left">
                            <div className="form-group">
                                <label htmlFor="name">Product Name*</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="sku">SKU (Stock Keeping Unit)*</label>
                                    <input
                                        type="text"
                                        id="sku"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        placeholder="Enter unique product SKU"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="barcode">Barcode</label>
                                    <div className="barcode-input-container">
                                        <input
                                            type="text"
                                            id="barcode"
                                            name="barcode"
                                            value={formData.barcode}
                                            onChange={handleChange}
                                            placeholder="Enter or scan barcode"
                                            readOnly={showScanner}
                                        />
                                        <button
                                            type="button"
                                            className="scan-btn"
                                            onClick={toggleScanner}
                                        >
                                            {showScanner ? 'Stop Scanning' : 'Scan Barcode'}
                                        </button>
                                    </div>
                                    {showScanner && (
                                        <div className="scanner-container" ref={scannerRef}>
                                            <div className="scanner-overlay">
                                                <div className="scanner-line"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="description">Description*</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    required
                                    placeholder="Enter detailed product description"
                                />
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="price">Price (₹)*</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="quantity">Quantity*</label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="category">Category*</label>
        <select 
          id="category" 
          name="category" 
                                        value={formData.category}
          onChange={handleChange} 
          required
        >
                                        <option value="">Select Category</option>
                                        <option value="Vegetables">Vegetables</option>
                                        <option value="Fruits">Fruits</option>
          <option value="Dairy">Dairy</option>
          <option value="Bakery">Bakery</option>
                                        <option value="Beverages">Beverages</option>
          <option value="Snacks">Snacks</option>
          <option value="Other">Other</option>
        </select>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="discount">Discount (%)</label>
                                    <input
                                        type="number"
                                        id="discount"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-right">
                            <div className="form-group">
                                <label>Product Image</label>
                                <div className="form-group">
                                    <label htmlFor="imageUrl">Image URL</label>
                                    <input
                                        type="url"
                                        id="imageUrlInput"
                                        name="imageUrlInput"
                                        value={formData.imageUrlInput}
                                        onChange={handleImageUrlChange}
                                        placeholder="Enter image URL"
                                        className="image-url-input"
                                    />
                                </div>
                                <div className="separator">
                                    <span>OR</span>
                                </div>
                                <div className="image-upload-container">
                                    {imagePreview ? (
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Product Preview" />
                                            <button 
                                                type="button" 
                                                className="remove-image"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        imageFile: null,
                                                        imageUrl: '',
                                                        imageUrlInput: ''
                                                    }));
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <i className="upload-icon">📷</i>
                                            <p>Click to upload image</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="productImage"
                                        name="productImage"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className={imagePreview ? "has-preview" : ""}
                                    />
                                </div>
                                <small>Recommended size: 800x600px. Max file size: 5MB</small>
                                <small>Supported formats: JPG, PNG, WebP</small>
                            </div>
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="cancel-btn"
                            onClick={() => navigate('/shopkeeper/')}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="save-btn"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Add Product'}
                        </button>
                    </div>
      </form>
            )}
    </div>
  );
};

export default AddProduct;