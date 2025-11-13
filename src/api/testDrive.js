// src/api/testDrive.js
import apiClient from "../api/apiClient";

// === SLOT CONTROLLER ===

/**
 * Lấy tất cả các slot lái thử đã được tạo
 * API: GET /api/v1/slot/all
 */
export const getAllSlots = () => {
  return apiClient.get("/slot/all");
};

/**
 * Lấy chi tiết 1 slot (dùng cho trang Edit)
 * API: GET /api/v1/slot/detail/{slotId}
 */
export const getSlotById = (slotId) => {
  return apiClient.get(`/slot/detail/${slotId}`);
};

/**
 * (Dành cho Admin/Manager) Tạo một slot lái thử mới
 * API: POST /api/v1/slot/create
 */
export const createSlot = (slotData) => {
  // slotData: { dealerStaffId, carModelInSlotPostDto, numCustomers, startTime, endTime }
  return apiClient.post("/slot/create", slotData);
};

/**
 * (Dành cho Admin/Manager) Cập nhật slot
 * API: PATCH /api/v1/slot/update/{slotId}
 */
export const updateSlot = (slotId, updateData) => {
  // updateData: { newNumCustomers, newStartTime, newEndTime }
  return apiClient.patch(`/slot/update/${slotId}`, updateData);
};

/**
 * (Dành cho Admin/Manager) Xóa một slot
 * API: DELETE /api/v1/slot/delete/{id}
 */
export const deleteSlot = (id) => {
  return apiClient.delete(`/slot/delete/${id}`);
};

// === BOOKING CONTROLLER ===

/**
 * (Dành cho Khách/Nhân viên) Đặt một lịch hẹn lái thử
 * API: POST /api/v1/booking/create
 */
export const bookTestDrive = (bookingData) => {
  // bookingData: { slotId, customerName, customerPhone }
  return apiClient.post("/booking/create", bookingData);
};

/**
 * Lấy danh sách khách hàng đã đặt của 1 slot cụ thể
 * API: GET /api/v1/booking/slot/{slotId}
 */
export const getBookingsForSlot = (slotId) => {
  return apiClient.get(`/booking/slot/${slotId}`);
};

/**
 * Hủy một lịch hẹn lái thử
 * API: DELETE /api/v1/booking/{bookingId}
 */
export const cancelBooking = (bookingId) => {
  return apiClient.delete(`/booking/${bookingId}`);
};

export const getTrialCarModels = () => {
  return apiClient.get("/carDetail-model/get-trial-model-carDetail");
};
