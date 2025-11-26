// src/api/cars.js
// const API_BASE = "http://3.26.198.116:8000/evdealer/api/v1";
import { API_BASE } from "../config/api";

export const getCarDetails = async (carId) => {
  const token = localStorage.getItem("access_token");

  // Sửa endpoint (để hết lỗi CORS)
  const response = await fetch(`${API_BASE}/carDetail/${carId}/detail`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch car details");
  }
  return await response.json();
};

export const getAllCars = async (params) => {
  const { pageNo = 0, pageSize = 10 } = params || {};
  const token = localStorage.getItem("access_token");

  // Sửa endpoint (để hết lỗi CORS)
  const response = await fetch(
    `${API_BASE}/carDetail/all?pageNo=${pageNo}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch cars");
  }
  return await response.json();
};

// HÀM MỚI (để sửa lỗi SyntaxError)
export const getCarModelsForSale = async () => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_BASE}/carDetail-model/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch car models for sale");
  }
  return await response.json();
};

// (Các hàm còn lại giữ nguyên)
export const createCar = async (carData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/carDetail/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(carData),
  });
  if (!response.ok) {
    throw new Error("Car creation failed");
  }
  return await response.json();
};

export const updateCar = async (carId, carData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/carDetail/${carId}/update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(carData),
  });
  if (!response.ok) {
    throw new Error("Car update failed");
  }
  return await response.json();
};

export const postImageForCar = async (carId, files) => {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const response = await fetch(`${API_BASE}/carDetail/${carId}/upload/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  return await response.json();
};
