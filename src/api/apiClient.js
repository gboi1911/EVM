// src/api/apiClient.js
import axios from 'axios';
import { message } from 'antd';

const API_BASE = "http://localhost:8000/evdealer/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động thêm Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // Không thêm header cho login
    if (token && !config.url.includes('/auth/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Xử lý lỗi 401 (Token hết hạn)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default apiClient;