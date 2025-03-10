import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddProduct.css';
import axios from 'axios';

const AddProduct = ({ products, setProducts }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    price: '',
    discount: '',
    manufactureDate: '',
    expiryDate: '',
    imageUrl: '',
    imageFile: null
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      imageFile: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setIsSubmitting(true);
    // setError('');
    setShowSuccessAlert(false);
  
    try {
      // Validate that the expiry date is after the manufacture date
      if (new Date(formData.expiryDate) <= new Date(formData.manufactureDate)) {
        // setError('Expiry date must be after the manufacture date.');
        // setIsSubmitting(false);
        return;
      }
  
      // Check if a file has been selected
      let imageUrl = formData.imageUrl;
      
      // Only try to upload if a file was selected
      // if (selectedFile) {
      //   // Create FormData for file upload
      //   const uploadData = new FormData();
      //   uploadData.append('file', selectedFile);
  
        // Upload the file if one is selected
        // try {
        //   // Replace this with your actual file upload API call
        //   const uploadResponse = await axios.post('http://localhost:3000/api/upload', uploadData);
        //   imageUrl = uploadResponse.data.fileUrl; // Get URL from upload response
        // } catch (uploadError) {
        //   console.error('Error uploading file:', uploadError);
        //   // Fall back to text URL if provided, otherwise show error
        //   if (!imageUrl) {
        //     setError('Failed to upload image. Please try again or provide an image URL.');
        //     setIsSubmitting(false);
        //     return;
        //   }
        // }
      // }
  
      // Prepare product data
      const productData = {
        name: formData.name,
        category: formData.category || 'Other', // Default to 'Other' if not provided
        description: formData.description || '',
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        discount: parseInt(formData.discount) || 0,
        manufactureDate: formData.manufactureDate,
        expiryDate: formData.expiryDate,
        imageUrl: imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'
      };
  
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        // setError('Authentication required. Please log in again.');
        // setIsSubmitting(false);
        navigate('/login');
        return;
      }
  
      // Send product data to API
      const response = await axios.post(
        'http://localhost:3000/api/products/add', 
        productData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data.success) {
        // Reset form
        setFormData({
          name: '',
          category: '',
          description: '',
          price: '',
          quantity: '',
          discount: '0',
          manufactureDate: '',
          expiryDate: '',
          imageUrl: ''
        });
        // setSelectedFile(null);
        
        // Check if product will expire soon
        const expiryDate = new Date(formData.expiryDate);
        const today = new Date();
        const daysToExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        // if (daysToExpiry <= 30) {
        //   setShowExpiryWarning(true);
        // }
        
        setShowSuccessAlert(true);
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccessAlert(false), 3000);
      }
    } catch (err) {
      console.error('Error adding product:', err);
      // setError(err.response?.data?.message || 'Failed to add product. Please try again.');
    } 
  };

  return (
    <div className="add-product">
      {showSuccessAlert && (
        <div className="success-alert">
          <p>Product added successfully! Warning: This product will expire soon.</p>
        </div>
      )}
      
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Product Name:</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />

        <label htmlFor="category">Category:</label>
        <select 
          id="category" 
          name="category" 
          value={formData.category || ''} 
          onChange={handleChange} 
          required
        >
          <option value="" disabled>Select a category</option>
          <option value="Groceries">Groceries</option>
          <option value="Dairy">Dairy</option>
          <option value="Bakery">Bakery</option>
          <option value="Snacks">Snacks</option>
          <option value="Beverages">Beverages</option>
          <option value="Other">Other</option>
        </select>

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

        <label htmlFor="imageUrl">Image URL:</label>
        <input type="text" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />

        <label htmlFor="imageFile">Or Upload Image:</label>
        <input type="file" id="imageFile" name="imageFile" onChange={handleFileChange} />

        <button type="submit">Add Product</button>
      </form>
    </div>
  );
};

export default AddProduct;