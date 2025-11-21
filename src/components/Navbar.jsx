// src/components/Navbar.jsx (Hoặc file Navmain của bạn)
import { Layout, Menu, Dropdown, Avatar, Button } from "antd";
import React from "react"; 
import { Link, useNavigate } from "react-router-dom";
import {
  CarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BarChartOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext.jsx";

const { Header } = Layout;

export default function Navbar() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const isManager = user && user.role === "DEALER_MANAGER";
  const username = user?.username || user?.fullName || "User";

  const handleLogout = () => {
    logout();
  };

  const userMenu = (
    <Menu
      onClick={(e) => {
        if (e.key === "profile") navigate("/profile");
        if (e.key === "logout") handleLogout();
      }}
      items={[
        { key: "profile", label: "Hồ sơ" },
        { key: "logout", label: "Đăng xuất" },
      ]}
    />
  );

  const customerMenuItems = [
    {
      key: "profile",
      label: <Link to="/customers">Hồ sơ khách hàng</Link>,
    },
    {
      key: "test-drive",
      label: <Link to="/customers/test-drive">Lịch hẹn lái thử</Link>,
    },
    isManager && {
      key: "create-test-drive",
      label: (
        <Link to="/customers/test-drive/create">Quản lý Slot Lái Thử</Link>
      ),
    },
  ].filter(Boolean); 

  // (Di chuyển 'items' ra ngoài)
  const mainMenuItems = [
    {
      key: "vehicles",
      icon: <CarOutlined />,
      label: "Xe",
      children: [
        { key: "view", label: <Link to="/vehicles">Danh mục xe</Link> },
        // {
        //   key: "compare",
        //   label: <Link to="/vehicles/compare">So sánh</Link>,
        // },
      ],
    },
    {
      key: "sales",
      icon: <ShoppingCartOutlined />,
      label: "Bán hàng",
      children: [
        {
          key: "quote",
          label: <Link to="/sales/quotes">Tạo báo giá</Link>,
        },
        {
          key: "orders",
          label: <Link to="/sales/orders">Đơn hàng</Link>,
        },
        {
          key: "delivery",
          label: <Link to="/sales/delivery">Giao xe</Link>,
        },
        {
          key: "payments",
          label: <Link to="/sales/payments">Thanh toán</Link>,
        },
        {
          key: "price-list",
          label: <Link to="/sales/price-list">Bảng giá</Link>,
        },
      ],
    },
    {
      key: "customers",
      icon: <UserOutlined />,
      label: "Khách hàng",
      children: customerMenuItems,
    },
    
    // ❗️ SỬA LỖI: Hiển thị "Báo cáo" cho cả 2 vai trò
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo",
      children: [
        // Chỉ Manager thấy "Doanh số"
        isManager && {
          key: "sales-report",
          label: <Link to="/reports/sales">Doanh số</Link>,
        },
        // Cả Staff và Manager đều thấy "Công nợ"
        {
          key: "debt-report",
          label: <Link to="/reports/debt">Công nợ</Link>,
        },
      ].filter(Boolean), // Lọc bỏ 'false' (Doanh số) nếu là Staff
    },
  ].filter(Boolean); // Lọc chính (không cần thiết nữa, nhưng giữ lại)

  return (
    <Header className="flex items-center bg-emerald-700 px-6">
      <Link to="/home" className="flex items-center mr-10">
        <img src={logo} alt="EV Logo" className="h-10 w-auto" />
        <span className="ml-2 text-white text-xl font-bold">EVD SYSTEM </span>
      </Link>

      <Menu
        theme="dark"
        mode="horizontal"
        className="flex-1 bg-emerald-700"
        defaultSelectedKeys={["home"]}
        items={mainMenuItems} 
      />

      {/* User avatar */}
      <div className="flex items-center gap-4">
        <Dropdown overlay={userMenu} trigger={["click"]}>
          <div className="flex items-center cursor-pointer text-white">
            <Avatar style={{ backgroundColor: "#87d068" }} size="small">
              {username ? username.charAt(0).toUpperCase() : "U"}
            </Avatar>
            <span className="ml-2">{username}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}