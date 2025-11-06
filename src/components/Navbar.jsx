import { Layout, Menu, Dropdown, Avatar, Button } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import logo from "../assets/logo.png";
import { getProfile } from "../api/authen";

const { Header } = Layout;

export default function Navbar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await getProfile();
        if (mounted) setUsername(profile.username || profile.fullName || "");
      } catch (err) {
        // ignore, user may not be logged in
      }
    })();
    return () => (mounted = false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    // Clear auth info here if needed
    navigate("/login");
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

  return (
    <Header className="flex items-center bg-emerald-700 px-6">
      {/* Logo */}
      <Link to="/home" className="flex items-center mr-10">
        <img src={logo} alt="EV Logo" className="h-10 w-auto" />
        <span className="ml-2 text-white text-xl font-bold">EVD SYSTEM </span>
      </Link>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="horizontal"
        className="flex-1 bg-emerald-700"
        defaultSelectedKeys={["home"]}
        items={[
          {
            key: "vehicles",
            icon: <CarOutlined />,
            label: "Xe",
            children: [
              { key: "view", label: <Link to="/vehicles">Danh mục xe</Link> },
              {
                key: "compare",
                label: <Link to="/vehicles/compare">So sánh mẫu xe</Link>,
              },
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
              // {
              //   key: "contracts",
              //   label: <Link to="/sales/contracts">Hợp đồng</Link>,
              // },
              // {
              //   key: "promotions",
              //   label: <Link to="/sales/promotions">Khuyến mãi</Link>,
              // },
              // {
              //   key: "booking",
              //   label: <Link to="/sales/booking">Đặt xe từ hãng</Link>,
              // },
              {
                key: "delivery",
                label: <Link to="/sales/delivery">Theo dõi giao xe</Link>,
              },
              {
                key: "payments",
                label: <Link to="/sales/payments">Thanh toán</Link>,
              },
            ],
          },
          {
            key: "customers",
            icon: <UserOutlined />,
            label: "Khách hàng",
            children: [
              {
                key: "profile",
                label: <Link to="/customers">Hồ sơ khách hàng</Link>,
              },
              {
                key: "test-drive",
                label: <Link to="/customers/test-drive">Lịch hẹn lái thử</Link>,
              },
              // {
              //   key: "feedback",
              //   label: (
              //     <Link to="/customers/feedback">Phản hồi & khiếu nại</Link>
              //   ),
              // },
            ],
          },
          {
            key: "reports",
            icon: <BarChartOutlined />,
            label: "Báo cáo",
            children: [
              {
                key: "sales-report",
                label: <Link to="/reports/sales">Doanh số nhân viên</Link>,
              },
              {
                key: "debt-report",
                label: <Link to="/reports/debt">Công nợ khách & hãng</Link>,
              },
            ],
          },
        ]}
      />

      {/* User avatar + dropdown */}
      <div className="flex items-center gap-4">
        <Dropdown overlay={userMenu} trigger={["click"]}>
          <div className="flex items-center cursor-pointer text-white">
            <Avatar style={{ backgroundColor: "#87d068" }} size="small">
              {username ? username.charAt(0).toUpperCase() : "U"}
            </Avatar>
            <span className="ml-2">{username || "User"}</span>
          </div>
        </Dropdown>
      </div>

      {/* Logout Button
      <Button
        type="text"
        icon={<LogoutOutlined />}
        className="ml-4 !text-white"
        style={{ color: "#fff" }}
        onClick={handleLogout}
      >
        Đăng xuất
      </Button> */}
    </Header>
  );
} 
