import axios from 'axios';
import { toast } from 'react-toastify';

// Define the API base URL
const API_BASE_URL = 'http://localhost:3000';

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // Increase timeout to 30 seconds
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
    (config) => {
        // Add auth token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Ensure URL starts with /api
        if (!config.url.startsWith('/api/')) {
            config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
        }

        // Set default headers if undefined
        if (!config.headers) {
            config.headers = {};
        }
        
        // Ensure Content-Type is set for POST/PUT/PATCH requests
        if (['post', 'put', 'patch'].includes(config.method?.toLowerCase()) && !config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

        // Log request for debugging
        console.log(`Making ${config.method?.toUpperCase() || 'GET'} request to:`, config.url);
        console.log('Request headers:', config.headers);
        
        // Log request data for POST/PUT/PATCH requests
        if (['post', 'put', 'patch'].includes(config.method?.toLowerCase()) && config.data) {
            console.log('Request data:', config.data);
        }

        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor to handle common errors
axiosInstance.interceptors.response.use(
    (response) => {
        // Log successful response for debugging
        console.log('Response from', response.config?.url, ':', response.data);
        return response;
    },
    (error) => {
        // Log the error for debugging
        console.error('API call failed:', error.config?.url);
        
        if (error.code === 'ECONNABORTED') {
            // Handle timeout error
            toast.error('Request timed out. Please check your connection and try again.');
            return Promise.reject(new Error('Request timed out'));
        }

        if (!error.response) {
            // Network error or server not responding
            toast.error('Unable to connect to server. Please check your connection.');
            return Promise.reject(new Error('Network error'));
        }

        // Log response error details for debugging
        console.error('Error response:', {
            status: error.response.status,
            data: error.response.data,
            url: error.config?.url,
            method: error.config?.method
        });

        // Handle specific HTTP status codes
        switch (error.response.status) {
            case 400:
                // Bad request - often validation errors
                const badRequestMsg = error.response?.data?.message || 'Invalid request data. Please check your input.';
                toast.error(badRequestMsg);
                break;
            case 401:
                localStorage.removeItem('token');
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                break;
            case 403:
                toast.error('You do not have permission to perform this action');
                break;
            case 404:
                toast.error('Resource not found');
                break;
            case 409:
                // Conflict error - often duplicate entries
                const conflictMsg = error.response?.data?.message || 'This item already exists.';
                toast.error(conflictMsg);
                break;
            case 500:
                toast.error('Server error. Please try again later');
                break;
            default:
                // Handle other errors
                const errorMessage = error.response?.data?.message || 'An error occurred';
                toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance; 