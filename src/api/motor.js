const API_BASE = "http://3.26.198.116:8000/evdealer/api/v1";

export const getMotors = async (pageNo = 0, pageSize = 10) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_BASE}/motor/all?pageNo=${pageNo}&pageSize=${pageSize}`,
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
    throw new Error(`Failed to fetch motors: ${errorText}`);
  }
  return await response.json();
};

export const getMotorById = async (motorId) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/motor/${motorId}/detail`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch motor details: ${errorText}`);
  }
  return await response.json();
};

export const createMotor = async (motorData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/motor/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(motorData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create motor: ${errorText}`);
  }
  return await response.json();
};

export const updateMotor = async (motorId, motorData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/motor/${motorId}/update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(motorData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update motor: ${errorText}`);
  }
  return await response.json();
};

export const deleteMotor = async (motorId) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/motor/${motorId}/remove`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete motor: ${errorText}`);
  }
  return await response.json();
};
