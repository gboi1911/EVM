const API_BASE = "http://3.26.198.116:8000/evdealer/api/v1";

export const getRevenueByDealer = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/orders/reports/revenue/dealer`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch revenue report: ${errorText}`);
  }
  return await response.json();
};

export const getRevenueByCity = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/orders/reports/revenue/city`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch revenue report: ${errorText}`);
  }
  return await response.json();
};
