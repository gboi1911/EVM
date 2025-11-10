// const API_BASE = "http://3.26.198.116:8000/evdealer/api/v1";
import { API_BASE } from "../config/api";

export const getCarDetails = async (carId) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/car/${carId}/detail`, {
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

export const getAllCars = async (pageNo = 0, pageSize = 10) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_BASE}/car/all?pageNo=${pageNo}&pageSize=${pageSize}`,
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

export const createCar = async (carData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/car/create`, {
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
  const response = await fetch(`${API_BASE}/car/${carId}/update`, {
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

  // files: array of File objects
  files.forEach((f) => formData.append("files", f));

  const response = await fetch(`${API_BASE}/car/${carId}/upload/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // không set Content-Type, browser tự set
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  return await response.json();
};

// export const deleteCar = async (carId) => {
//     const token = localStorage.getItem("access_token");
//     const response = await fetch(`${API_BASE}/car/${carId}/delete`, {
//     method: "DELETE",
//     headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//     },
//     });
//     if (!response.ok) {
//     throw new Error("Car deletion failed");
//     }
//     return await response.json();
// };
