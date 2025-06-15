// API Base URL
export const API_BASE_URL = 'http://localhost:3000/api';

// API Endpoints
export const API_ENDPOINTS = {
    users: {
        register: `${API_BASE_URL}/users/register`,
        login: `${API_BASE_URL}/users/login`,
        profile: `${API_BASE_URL}/users/profile`
    }
};

// Auth Header Helper
export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}; 