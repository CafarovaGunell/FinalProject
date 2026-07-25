import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5123/api', // Sənin backend portun
});

// Hər sorğuqabağı localStorage-dən tokeni oxuyub header-ə əlavə edirik
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;