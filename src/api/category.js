const API_BASE = "http://localhost:8000/evdealer/api/v1";

export const fetchCategories = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/category/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch categories: ${errorText}`);
  }
  return await response.json();
};

export const addCategory = async ({ categoryName }) => {
  const token = localStorage.getItem("access_token");
  const url = `${API_BASE}/category/create?categoryName=${encodeURIComponent(
    categoryName
  )}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to add category");
  }

  return await response.json();
};

export const updateCategory = async (categoryId, categoryData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/category/${categoryId}/rename`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(categoryData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update category: ${errorText}`);
  }
  return await response.json();
};

export const removeCategory = async (categoryId) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/category/${categoryId}/remove`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete category: ${errorText}`);
  }
  return await response.json();
};
