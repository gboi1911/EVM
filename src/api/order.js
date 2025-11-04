// src/api/order.js
import apiClient from './apiClient'; // ✅ THAY ĐỔI: Import apiClient trung tâm

// 🛑 BỎ ĐI:
// import axios from 'axios'; 
// const apiClient = axios.create({ ... });

// --- Các hàm export giữ nguyên ---

// GET /api/v1/orders
export const getListOrders = (params) => {
  // params có thể là { status: 'PENDING' }
  return apiClient.get('/orders', { params });
};

// GET /api/v1/orders/{id}
export const getOrderById = (id) => {
  return apiClient.get(`/orders/${id}`);
};

// POST /api/v1/orders
export const createOrder = (orderData) => {
  // orderData là { carId: 1, customerPhone: "...", totalAmount: ... }
  return apiClient.post('/orders', orderData);
};

// POST /api/v1/orders/{id}/payments
export const addPaymentToOrder = (id, paymentData) => {
  // paymentData là { amount: ..., type: "..." }
  return apiClient.post(`/orders/${id}/payments`, paymentData);
};

// DELETE /api/v1/orders/{id}
export const cancelOrder = (id) => {
  return apiClient.delete(`/orders/${id}`);
};