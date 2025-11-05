const API_BASE = "http://localhost:8000/evdealer/api/v1";

export const getInventory = async (pageNo = 0, pageSize = 10, dealerId) => {
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
