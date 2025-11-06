const API_BASE = "http://localhost:8000/evdealer/api/v1";

export const getPriceListByLevel = async (level) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_BASE}/price-program/hierarchy?level=${level}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch price list");
  }
  return await response.json();
};

export const getPriceDetailsById = async (priceId) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/price-program/detail/${priceId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch price details");
  }
  return await response.json();
};

export const updatePriceById = async (priceId, priceData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/price-program/${priceId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(priceData),
  });
  if (!response.ok) {
    throw new Error("Failed to update price");
  }
  return await response.json();
};

export const createPrice = async (priceData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/price-program`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(priceData),
  });
  if (!response.ok) {
    throw new Error("Failed to create price");
  }
  return await response.json();
};

export const deletePriceById = async (priceId) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/price-program/${priceId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to delete price");
  }
  return true;
};
