
import apiClient from './apiClient'; 
// GET /api/v1/orders/reports/customer-debts
export const getCustomerDebts = () => {
  return apiClient.get('/orders/reports/customer-debts');
};

// GET /api/v1/orders/reports/revenue/staff
export const getStaffRevenue = (params) => {
  // params có thể là { staffId: 4 }
  return apiClient.get('/orders/reports/revenue/staff', { params });
};

