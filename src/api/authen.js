const API_BASE = "http://3.26.198.116:8000/evdealer/api/v1";

export const login = async (username, password) => {
  const basicAuth = btoa(`${username}:${password}`);

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      Accept: "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.status === 401) {
    throw new Error("Unauthorized: Invalid username or password");
  }
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();
  console.log("Login success:", data);

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);

  return data;
};

export const createAccount = async (accountData) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/user/create`, {
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

export const getAllAccounts = async (pageNo = 0, pageSize = 10) => {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `http://localhost:8000/evdealer/api/v1/user/all?pageNo=${pageNo}&pageSize=${pageSize}`,
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
    throw new Error(`Failed to fetch accounts: ${errorText}`);
  }

  return await response.json();
};

export const getProfile = async () => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/auth/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  return await response.json();
};

export const updateProfile = async (userIdOrProfileData, profileData) => {
  // support two signatures:
  // updateProfile(userId, profileData)
  // updateProfile(profileData) where profileData.id is used
  let userId;
  let payload;
  if (profileData === undefined) {
    payload = userIdOrProfileData;
    userId = payload?.id;
  } else {
    userId = userIdOrProfileData;
    payload = profileData;
  }

  if (!userId) {
    throw new Error(
      "updateProfile requires a userId (or profileData with an id property)"
    );
  }

  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/user/${userId}/update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Profile update failed: ${response.status} ${errorText}`);
  }
  return await response.json();
};

export const changePassword = async (oldPassword, newPassword) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/user/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Password change failed: ${response.status} ${errorText}`);
  }
  return await response.json();
};

export const banAccount = async (userId) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/user/${userId}/ban`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Account banning failed");
  }
  return await response.json();
};

export const unbanAccount = async (userId) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE}/user/${userId}/unban`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Account unbanning failed");
  }
  return await response.json();
};

export const filterAccountsByRole = async (role, pageNo = 0, pageSize = 10) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(
    `${API_BASE}/user/filter-by-role?role=${role}&pageNo=${pageNo}&pageSize=${pageSize}`,
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
    throw new Error(`Failed to filter accounts: ${errorText}`);
  }
  return await response.json();
};
