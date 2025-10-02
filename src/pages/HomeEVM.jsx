import React from "react";
import { Card, Statistic, Row, Col } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CarOutlined,
  ShopOutlined,
  DollarOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

export default function HomeEVM() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6 text-center">
        Trang quản trị hệ thống xe điện
      </h1>
      <Row gutter={[24, 24]} justify="center">
        <Col xs={24} md={12} lg={6}>
          <Card className="shadow-md" bordered={false}>
            <Statistic
              title="Tổng số mẫu xe"
              value={24}
              prefix={<CarOutlined />}
              valueStyle={{ color: "#10b981" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card className="shadow-md" bordered={false}>
            <Statistic
              title="Số đại lý"
              value={12}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#2563eb" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card className="shadow-md" bordered={false}>
            <Statistic
              title="Tổng doanh số tháng"
              value={120}
              suffix="xe"
              prefix={<DollarOutlined />}
              valueStyle={{ color: "#f59e42" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card className="shadow-md" bordered={false}>
            <Statistic
              title="Tồn kho toàn hệ thống"
              value={350}
              suffix="xe"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#64748b" }}
            />
          </Card>
        </Col>
      </Row>
      <div className="max-w-3xl mx-auto mt-10">
        <Card className="shadow-md" bordered={false}>
          <h2 className="text-xl font-semibold text-emerald-600 mb-2">
            Chào mừng quản trị viên!
          </h2>
          <p className="text-gray-700 mb-2">
            Bạn có thể quản lý sản phẩm, đại lý, tồn kho, doanh số và các báo
            cáo phân tích tại đây.
          </p>
          <ul className="list-disc list-inside text-gray-600">
            <li>Quản lý danh mục xe điện, phiên bản, màu sắc.</li>
            <li>Quản lý tồn kho tổng, điều phối xe cho đại lý.</li>
            <li>Quản lý giá sỉ, chiết khấu, khuyến mãi.</li>
            <li>Quản lý hợp đồng, chỉ tiêu doanh số, công nợ đại lý.</li>
            <li>Báo cáo doanh số, tồn kho, tốc độ tiêu thụ.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
