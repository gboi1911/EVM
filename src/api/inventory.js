const API_BASE = "http://3.26.198.116:8000/evdealer/api/v1";

export const getInventory = async (dealerId, pageNo = 0, pageSize = 10) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_BASE}/inventory/admin/${dealerId}?pageNo=${pageNo}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch inventory: ${errorText}`);
  }
  return await response.json();
};

export const getSalesSpeed = async (startTime, endTime) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_BASE}/orders/sales-speed?startTime=${startTime}&endTime=${endTime}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch sales speed data");
  }
  return await response.json();
};
