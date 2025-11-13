import { API_BASE } from "../config/api";

export const getWarehouseListByStatus = async (
  warehouseCarStatus = "",
  pageNo = 0,
  pageSize = 10
) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_BASE}/warehouse-cars/admin//warehouse-car-status?warehouseCarStatus=${warehouseCarStatus}&pageNo=${pageNo}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch warehouse car list");
  }
  return await response.json();
};

export const getWarehouseList = async (pageNo = 0, pageSize = 10) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_BASE}/warehouse-cars/admin/warehouse-cars?pageNo=${pageNo}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch warehouse car list");
  }
  return await response.json();
};

export const updateWarehouseCar = async (carId, warehouseData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_BASE}/warehouse-cars/admin/warehouse-car/${carId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(warehouseData),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to update warehouse car");
  }
  return await response.json();
};
