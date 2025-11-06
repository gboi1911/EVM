import apiClient from "../api/apiClient";

// === SLOT CONTROLLER ===

/**
 * Lấy tất cả các slot lái thử đã được tạo
 * API: GET /api/v1/slot/all
 */
export const getAllSlots = () => {
  return apiClient.get('/slot/all');
};

/**
 * (Dành cho Admin/Manager) Tạo một slot lái thử mới
 * API: POST /api/v1/slot/create
 */
export const createSlot = (slotData) => {
  // slotData: { carId, amount, startTime, endTime }
  return apiClient.post('/slot/create', slotData);
};

/**
 * (Dành cho Admin/Manager) Cập nhật slot
 * API: PATCH /api/v1/slot/update
 */
export const updateSlot = (updateData) => {
  // updateData: { slotId, newStartTime, newEndTime, newAmount }
  return apiClient.patch('/slot/update', updateData);
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
 * (Dành cho Khách/Nhân viên) Đặt một lịch hẹn
 * API: POST /api/v1/booking/create
 */
export const bookTestDrive = (bookingData) => {
  // bookingData: { slotId, customerPhone }
  return apiClient.post('/booking/create', bookingData);
};

/**
 * Lấy danh sách ai đã đặt cho 1 slot cụ thể
 * API: GET /api/v1/booking/slot/{slotId}
 */
export const getBookingsForSlot = (slotId) => {
  return apiClient.get(`/booking/slot/${slotId}`);
};

/**
 * Hủy một lịch hẹn
 * API: DELETE /api/v1/booking/{bookingId}
 */
export const cancelBooking = (bookingId) => {
  return apiClient.delete(`/booking/${bookingId}`);
};