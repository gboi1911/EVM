// src/api/order.js
import apiClient from "./apiClient.js"; // <-- Sửa đường dẫn

// === API ĐƠN HÀNG CƠ BẢN ===

export const getListOrders = (params) => {
  return apiClient.get("/orders", { params });
};

export const getOrderById = (id) => {
  return apiClient.get(`/orders/${id}`);
};

export const createOrder = (orderData) => {
  return apiClient.post("/orders", orderData);
};

export const updateOrder = (id, payload) => {
  return apiClient.patch(`/orders/${id}`, payload);
};

export const cancelOrder = (id) => {
  return apiClient.delete(`/orders/${id}`);
};

// === API THANH TOÁN (Payments) ===

export const getOrderPayments = (id) => {
  return apiClient.get(`/orders/${id}/payments`);
};

export const addPaymentToOrder = (id, paymentData) => {
  return apiClient.post(`/orders/${id}/payments`, paymentData);
};

// === API THEO DÕI (Activities) ===

export const getOrderActivities = (orderId) => {
  return apiClient.get(`/orders/${orderId}/activities`);
};

// === API DUYỆT ĐƠN HÀNG (Shipments) ===
export const getOrderPending = () => {
  return apiClient.get("/orders/pending");
};

export const getOrderByStatus = (status) => {
  return apiClient.get(
    `/orders/status?orderStatus=${status}&pageNo=0&pageSize=10`
  );
};
export const getOrdersByDealer = () => {
  return apiClient.get("/orders/dealer");
};
// export const approveOrder = (orderId, carDetailId, orderStatus) => {
//   return apiClient.patch("/orders/approve-order");
// };
