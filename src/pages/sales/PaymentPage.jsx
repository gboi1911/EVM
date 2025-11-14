// src/pages/sales/PaymentPage.jsx
import { Table, Tag, Statistic, Row, Col, Card, Spin, message } from "antd";
import { useEffect, useState, useMemo } from "react"; // ❗️ Thêm useMemo
import { getListOrders } from "../../api/order";
import { useAuth } from "../../context/AuthContext"; // ❗️ THÊM: Import useAuth

const paymentStatusMap = {
  PENDING: { color: "red", text: "Chưa thanh toán" },
  DEPOSIT_PAID: { color: "orange", text: "Đã cọc" },
  PARTIAL: { color: "orange", text: "Thanh toán 1 phần" },
  PAID: { color: "green", text: "Đã thanh toán đủ" },
  FINISHED: { color: "green", text: "Đã thanh toán đủ" }, // Thêm
};

export default function PaymentPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ❗️ THÊM: Lấy user
  const { user, loading: authLoading } = useAuth();
  const isManager = useMemo(() => user && user.role === "DEALER_MANAGER", [user]);

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      if (!user) return; // Chờ user
      try {
        setLoading(true);
        
        // ❗️ SỬA LỖI 403 (Theo yêu cầu BE)
        const params = { status: "COMPLETED" };
        if (!isManager) {
          params.staffId = user.id; // Gán staffId
        }
        
        const response = await getListOrders(params); // Gửi params
        setOrders(response.data || response || []); // Sửa lỗi 'response.data'
      } catch (e) {
        message.error("Không tải được danh sách thanh toán: " + e.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) { // ❗️ Thêm 'user'
      fetchCompletedOrders();
    }
  }, [authLoading, user]); // ❗️ Thêm 'user'

  const total = orders.reduce((a, b) => a + b.totalAmount, 0);

  const columns = [
    { title: "Mã đơn", dataIndex: "id" },
    {
      title: "Khách hàng",
      dataIndex: ["customer", "fullName"],
    },
    { 
      title: "Tên xe", 
      // ❗️ SỬA LỖI N/A
      render: (record) => 
        record.carDetail?.carName || record.carModelGetDetailDto?.carModelName || "N/A"
    },
    {
      title: "Số tiền ($)",
      dataIndex: "totalAmount",
      render: (v) => (v ? v.toLocaleString() : 0),
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      render: (status) => {
        const statusInfo = paymentStatusMap[status] || { color: "gray", text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
  ];
  
  // ❗️ THÊM: Loading khi Auth chưa sẵn sàng
  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 12, margin: '40px auto', maxWidth: 1200 }}>
      <h2
        style={{
          fontWeight: 700,
          color: "#059669",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Thanh toán & Doanh thu (Đơn đã hoàn thành)
      </h2>

      {loading ? (
        <Spin style={{ display: "block", margin: "auto" }} />
      ) : (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={12}>
              <Card>
                <Statistic
                  title="Tổng doanh thu (Completed)"
                  value={total}
                  suffix="$"
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card>
                <Statistic
                  title="Tổng số đơn (Completed)"
                  value={orders.length}
                />
              </Card>
            </Col>
          </Row>

          <Table columns={columns} dataSource={orders} rowKey="id" />
        </>
      )}
    </div>
  );
}