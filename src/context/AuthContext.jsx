// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Spin } from 'antd';
// THAY ĐỔI QUAN TRỌNG:
// Import 2 hàm TỪ FILE CÓ SẴN CỦA BẠN (dùng fetch)
import { login as apiLogin, getProfile } from '../api/authen.js'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Sẽ chứa { fullName, role, ... }
  const [loading, setLoading] = useState(true); 

  // Tự động kiểm tra login khi tải lại trang
  useEffect(() => {
    const fetchUserOnLoad = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Dùng hàm getProfile (fetch) của bạn
          const profile = await getProfile();
          setUser(profile); // Lưu profile (chứa role)
        } catch (e) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };
    fetchUserOnLoad();
  }, []);

  // Hàm đăng nhập
  const login = async (username, password) => {
    try {
      // 1. Gọi API login (fetch) của bạn
      // (Hàm này tự lưu token vào localStorage)
      await apiLogin(username, password); 
      
      // 2. Gọi API getProfile (fetch) của bạn
      const profile = await getProfile();
      setUser(profile); // Lưu profile vào state
      
      return profile;
    } catch (err) {
      setUser(null);
      throw err; 
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login'; 
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh
export const useAuth = () => {
  return useContext(AuthContext);
};