// src/api/car.js
import apiClient from './apiClient';

/**
 * Lấy danh sách tất cả các xe (để bán)
 * API: GET /api/v1/car/all
 */
export const getListCars = (params) => {
  // Thêm params phân trang mặc định
  const defaultParams = { pageNo: 0, pageSize: 20 };
  return apiClient.get('/car/all', { 
    params: { ...defaultParams, ...params } 
  });
};


export const getCarDetail = (carId) => {
  return apiClient.get(`/car/${carId}/detail`);
};
