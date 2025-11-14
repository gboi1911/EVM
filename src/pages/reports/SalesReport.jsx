// src/pages/reports/SalesReport.jsx

import { Table, Statistic, Card, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { getStaffRevenue } from "../../api/reports";
// 1. THÊM MỚI: Import hook để lấy user và điều hướng
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function SalesReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. THÊM MỚI: Lấy thông tin user và hook điều hướng
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // 3. THÊM MỚI: Kiểm tra và chuyển hướng nếu là Staff
  useEffect(() => {
    // Nếu đã xác thực xong VÀ user tồn tại
    if (!authLoading && user) {
      // Nếu là Staff
      if (user.role === "DEALER_STAFF") {
        message.error("Bạn không có quyền truy cập trang Báo cáo.");
        navigate("/"); // Chuyển về trang chủ
      }
    }
  }, [user, authLoading, navigate]); // Chạy lại khi user thay đổi

  // 4. THAY ĐỔI: Chỉ tải dữ liệu nếu là Manager
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await getStaffRevenue(); 
        setData(response.data);
      } catch (e) {
        message.error("Không tải được báo cáo doanh thu");
      } finally {
        setLoading(false);
      }
    };

    // Chỉ gọi API khi đã xác thực VÀ user là MANAGER
    if (!authLoading && user && user.role === "DEALER_MANAGER") {
      fetchReport();
    } else if (!authLoading && !user) {
      // Nếu không có user (ví dụ: bị logout), dừng loading
      setLoading(false);
    }
    // Nếu là Staff, component sẽ tiếp tục loading cho đến khi bị chuyển hướng
  }, [authLoading, user]); 

  const total = data.reduce(
    (total, currentItem) => total + currentItem.revenue,
    0
  );

  const columns = [
    { title: "Mã NV", dataIndex: "staffId" },
    { title: "Tên nhân viên", dataIndex: "staffName" },
    {
      title: "Doanh thu (₫)",
      dataIndex: "revenue",
      render: (v) => v.toLocaleString(),
      sorter: (a, b) => a.revenue - b.revenue,
    },
  ];

  // 5. THÊM MỚI: Hiển thị Spin/Loading trong khi chờ xác thực hoặc chuyển hướng
  if (authLoading || !user || user.role === "DEALER_STAFF") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#fff" }}>
        <Spin size="large" />
      </div>
    );
  }
  
  // (Chỉ Manager mới thấy được giao diện bên dưới)
  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh", padding: 40 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "#f3f0f0ff",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2
          style={{
            fontSize: 25,
            fontWeight: 700,
            color: "#059669",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Báo cáo doanh thu (Theo nhân viên)
        </h2>

        {/* Bỏ 'loading' ở đây vì chúng ta đã xử lý ở trên, 
          nhưng vẫn giữ 'loading' của Bảng
        */}
        <Spin spinning={loading}>
            <Card style={{ marginBottom: 24 }}>
              <Statistic
                title="Tổng doanh thu"
                value={total}
                suffix="₫"
                valueStyle={{ color: "#059669" }}
              />
            </Card>
            <Table columns={columns} dataSource={data} rowKey="staffId" />
        </Spin>
      </div>
    </div>
  );
}