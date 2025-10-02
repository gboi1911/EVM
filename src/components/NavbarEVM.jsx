import { Layout, Menu } from "antd";
import { Button } from "antd";
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
} from "@ant-design/icons";
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
    ],
  },
];

export default function NavbarEVM() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const handleMenuClick = (e) => {
    if (e.key === "account") {
      navigate("/manage-account");
    }
    // Add more navigation logic for other keys if needed
  };

  return (
    <Header className="flex items-center bg-emerald-700 px-6">
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
      <Button
        type="text"
        icon={<LogoutOutlined />}
        className="ml-4 !text-white"
        style={{ color: "#fff" }}
        onClick={handleLogout}
      >
        Đăng xuất
      </Button>
    </Header>
  );
}
