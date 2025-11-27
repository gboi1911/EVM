// src/api/customer.js
import apiClient from "../api/apiClient";

/**
 * Lấy danh sách khách hàng (có phân trang)
 * API: GET /api/v1/dealer/customers
 */
export const listCustomers = (params) => {
  // params có thể là { pageNo: 0, pageSize: 10 }
  return apiClient.get("/dealer/customers", { params });
};

/**
 * Tạo một khách hàng mới
 * API: POST /api/v1/dealer/customers
 */
export const createCustomer = (customerData) => {
  // customerData là: { fullName: "string", email: "string", phone: "string", address: "string" }
  return apiClient.post("/dealer/customers", customerData);
};

/**
 * Cập nhật thông tin khách hàng
 * API: PATCH /api/v1/dealer/customers/{customerId}/update-info
 */
export const updateCustomer = (customerId, customerData) => {
  // customerData là: { fullName: "string", email: "string", phone: "string", address: "string" }
  return apiClient.patch(
    `/dealer/customers/${customerId}/update-info`,
    customerData
  );
};

/**
 * Lấy thông tin khách hàng bằng SĐT
 * API: GET /api/v1/dealer/customers/by-phone
 */
export const getCustomerByPhone = (phone) => {
  // API này có thể nhận SĐT qua query param
  return apiClient.get("/dealer/customers/by-phone", { params: { phone } });
};

/**
 * Cập nhật thông tin khách hàng bằng SĐT
 * API: PATCH /api/v1/dealer/customers/update-info/by-phone
 */
export const updateCustomerByPhone = (phone, customerData) => {
  return apiClient.patch(
    "/dealer/customers/update-info/by-phone",
    customerData,
    {
      params: { phone }, // Gửi SĐT qua query param
    }
  );
};

/**
 * Cập nhật thông tin khách hàng
 * API: PATCH /api/v1/dealer/customers/{customerId}/update-info
 */
export const updateCustomerInfo = (customerId, updateData) => {
  // updateData: { fullName, phone, email, address }
  return apiClient.patch(
    `/dealer/customers/${customerId}/update-info`,
    updateData
  );
};

export const getCustomerList = async (pageNo = 0, pageSize = 10) => {
  return apiClient.get("/user/customer-list");
};
