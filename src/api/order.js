// src/api/order.js
import apiClient from './apiClient'; 

// === API ĐƠN HÀNG CƠ BẢN ===

/**
 * GET /api/v1/orders
 * Lấy danh sách, có thể lọc theo status
 */
export const getListOrders = (params) => {
  // params có thể là { status: 'PENDING' } hoặc { status: 'COMPLETED' }
  return apiClient.get('/orders', { params });
};

/**
 * GET /api/v1/orders/{id}
 * Lấy chi tiết 1 đơn
 */
export const getOrderById = (id) => {
  return apiClient.get(`/orders/${id}`);
};

/**
 * POST /api/v1/orders
 * Tạo đơn hàng mới
 */
export const createOrder = (orderData) => {
  // orderData là { carId: 1, customerPhone: "...", totalAmount: ... }
  return apiClient.post('/orders', orderData);
};

/**
 * PATCH /api/v1/orders/{id}
 * Cập nhật trạng thái (hoặc thông tin khác)
 */
export const updateOrder = (id, payload) => {
  // payload ví dụ: { "status": "APPROVED" }
  return apiClient.patch(`/orders/${id}`, payload);
};

/**
 * DELETE /api/v1/orders/{id}
 * Hủy đơn -> (Backend sẽ set status là CANCELLED)
 */
export const cancelOrder = (id) => {
  return apiClient.delete(`/orders/${id}`);
};

// === API THANH TOÁN (Payments) ===

/**
 * GET /api/v1/orders/{id}/payments
 * Lấy lịch sử thanh toán của đơn
 */
export const getOrderPayments = (id) => {
  return apiClient.get(`/orders/${id}/payments`);
};

/**
 * POST /api/v1/orders/{id}/payments
 * Thêm 1 lần thanh toán
 */
export const addPaymentToOrder = (id, paymentData) => {
  // paymentData là { amount: ..., type: "..." }
  return apiClient.post(`/orders/${id}/payments`, paymentData);
};

// === API THEO DÕI (Activities) ===

/**
 * GET /api/v1/orders/{orderId}/activities
 * Lấy lịch sử thay đổi trạng thái của đơn hàng
 */
export const getOrderActivities = (orderId) => {
  return apiClient.get(`/orders/${orderId}/activities`);
};