// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { Spin, message } from "antd";
import { login as apiLogin, getProfile } from "../api/authen.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tự động lấy profile khi đã có token (refresh trang vẫn login)
  useEffect(() => {
    const fetchUserOnLoad = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          const profileResponse = await getProfile();
          // Nhiều backend trả dạng { userInfoGetDto: {...} } nên check kỹ
          const profile = profileResponse.userInfoGetDto || profileResponse;
          setUser(profile);
        } catch (err) {
          console.error("⚠️ Token expired or invalid:", err);
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUserOnLoad();
  }, []);

  // 🟢 Hàm login
  const login = async (username, password) => {
    try {
      const loginData = await apiLogin(username, password);
      console.log("✅ Logged in:", loginData);

      const profileResponse = await getProfile();
      const profile = profileResponse.userInfoGetDto || profileResponse;
      setUser(profile);

      message.success("Đăng nhập thành công!");
      return profile;
    } catch (err) {
      console.error("❌ Login error:", err);
      message.error("Sai tài khoản hoặc mật khẩu!");
      setUser(null);
      throw err;
    }
  };

  // 🔴 Hàm logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    message.info("Đã đăng xuất");
    window.location.href = "/login";
  };

  // Loading UI
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook tiện dùng
export const useAuth = () => useContext(AuthContext);
