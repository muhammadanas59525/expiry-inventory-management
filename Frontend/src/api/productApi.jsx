import axios from 'axios';

// Backend Base URL
const BASE_URL = 'http://localhost:3000';

export const addProduct = async (productData) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/products`, productData);
        return response.data;
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
};

export const fetchProducts = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/api/products`);
        return response.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};