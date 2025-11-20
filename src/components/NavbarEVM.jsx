import React, { useEffect, useState } from "react";
import { Layout, Menu, Dropdown, Avatar, Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  AppstoreOutlined,
  CarOutlined,
  ClusterOutlined,
  DollarOutlined,
  ShopOutlined,
  UsergroupAddOutlined,
  FileTextOutlined,
  BarChartOutlined,
  RobotOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { getProfile } from "../api/authen";
import logo from "../assets/logo.png";

const { Header } = Layout;

const items = [
  {
    key: "product",
    icon: <CarOutlined />,
    label: "Quản lý sản phẩm & phân phối",
    children: [
      {
        key: "catalog",
        icon: <AppstoreOutlined />,
        label: "Quản lý danh mục xe điện",
      },
      {
        key: "car",
        icon: <CarOutlined />,
        label: "Quản lý xe điện",
      },
      // {
      //   key: "motorbike",
      //   icon: <DashboardOutlined />,
      //   label: "Quản lý động cơ",
      // },
      {
        key: "inventory",
        icon: <ClusterOutlined />,
        label: "Quản lý tồn kho tổng, điều phối xe",
      },
      {
        key: "pricing",
        icon: <DollarOutlined />,
        label: "Quản lý giá sỉ, chiết khấu, khuyến mãi",
      },
    ],
  },
  {
    key: "dealer",
    icon: <ShopOutlined />,
    label: "Quản lý đại lý",
    children: [
      {
        key: "contract",
        icon: <FileTextOutlined />,
        label: "Quản lý hợp đồng, chỉ tiêu doanh số, công nợ",
      },
      {
        key: "account",
        icon: <UsergroupAddOutlined />,
        label: "Quản lý tài khoản đại lý & nhân viên",
      },
      {
        key: "order",
        icon: <ShopOutlined />,
        label: "Quản lý đơn hàng đại lý",
      },
    ],
  },
  {
    key: "report",
    icon: <BarChartOutlined />,
    label: "Báo cáo & phân tích",
    children: [
      {
        key: "sales",
        icon: <BarChartOutlined />,
        label: "Doanh số theo khu vực, đại lý",
      },
      {
        key: "stock",
        icon: <ClusterOutlined />,
        label: "Tồn kho & tốc độ tiêu thụ",
      },
      {
        key: "AIforecast",
        icon: <RobotOutlined />,
        label: "AI dự báo nhu cầu để lên kế hoạch sản xuất & phân phối",
      },
    ],
  },
];

export default function NavbarEVM() {
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
    navigate("/login");
  };

  const userMenu = (
    <Menu
      onClick={(e) => {
        if (e.key === "profile") navigate("/homeEVM/profile");
        if (e.key === "logout") handleLogout();
      }}
      items={[
        { key: "profile", label: "Hồ sơ" },
        { key: "logout", label: "Đăng xuất" },
      ]}
    />
  );

  const handleMenuClick = (e) => {
    if (e.key === "account") {
      navigate("/homeEVM/manage-account");
    }
    if (e.key === "catalog") {
      navigate("/homeEVM/manage-category");
    }
    if (e.key === "inventory") {
      navigate("/homeEVM/manage-inventory");
    }
    if (e.key === "pricing") {
      navigate("/homeEVM/manage-price");
    }
    if (e.key === "car") {
      navigate("/homeEVM/manage-car");
    }
    if (e.key === "motorbike") {
      navigate("/homeEVM/manage-motorbike");
    }
    if (e.key === "AIforecast") {
      navigate("/homeEVM/AIforecast");
    }
    if (e.key === "stock") {
      navigate("/homeEVM/manage-inventory-and-sales-speed");
    }
    if (e.key === "sales") {
      navigate("/homeEVM/manage-sales-report");
    }
    if (e.key === "order") {
      navigate("/homeEVM/manage-order");
    }
  };

  return (
    <Header
      className="flex items-center bg-emerald-700 px-6 z-50"
      style={{
        position: "sticky",
        top: 0,
        width: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Logo and title */}
      <div className="flex items-center mr-10">
        <img src={logo} alt="EV Logo" className="h-10 w-auto" />
        <span className="ml-2 text-white text-xl font-bold tracking-wide">
          EVM SYSTEM
        </span>
      </div>
      {/* Menu */}
      <Menu
        theme="dark"
        mode="horizontal"
        items={items}
        className="flex-1 bg-emerald-700 border-none"
        onClick={handleMenuClick}
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

        {/* Optional quick logout button (kept for backward compatibility)
        <Button
          type="text"
          icon={<LogoutOutlined />}
          className="ml-4 !text-white"
          style={{ color: "#fff" }}
          onClick={handleLogout}
        >
          Đăng xuất
        </Button> */}
      </div>
    </Header>
  );
}
