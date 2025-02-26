import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddProduct.css';
import axios from 'axios';

const AddProduct = ({ products, setProducts }) => {


  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    discount: '',
    manufactureDate: '',
    expiryDate: '',
    imageUrl: '',
    imageFile: null
  });

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

  const handleSubmit =async (e) => {
    e.preventDefault();
    // const newProduct = {
    //   id: products.length + 1,
    //   name: formData.name,
    //   quantity: formData.quantity,
    //   price: parseFloat(formData.price), // Ensure price is a number
    //   discount: formData.discount,
    //   manufactureDate: formData.manufactureDate,
    //   expiryDate: formData.expiryDate,
    //   image: formData.imageUrl || URL.createObjectURL(formData.imageFile)
    // };
    // setProducts([...products, newProduct]);
    // navigate('/');
    const res=await axios.post('http://localhost:3000/api/products/add',formData);
    console.log(res.data)
  };

  return (
    <div className="add-product">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Product Name:</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />

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