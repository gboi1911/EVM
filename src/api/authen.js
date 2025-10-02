const API_BASE = "http://localhost:8000/evdealer/api/v1";

export const login = async (username, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  if (response.status === 401) {
    throw new Error("401");
  }
  if (!response.ok) {
    throw new Error("Login failed");
  }
  const data = await response.json();
  console.log("Login response status:", response.status);
  // Store tokens in localStorage
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  return data;
};

export const createAccount = async (accountData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(accountData),
  });
  if (!response.ok) {
    throw new Error("Account creation failed");
  }
  return await response.json();
};
