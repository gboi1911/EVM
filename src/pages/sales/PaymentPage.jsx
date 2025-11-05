// src/pages/sales/PaymentPage.jsx
import { Table, Tag, Statistic, Row, Col, Card, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { getListOrders } from "../../api/order";

// THÊM MỚI: Bộ "từ điển" để dịch PaymentStatus
const paymentStatusMap = {
  PENDING: { color: "red", text: "Chưa thanh toán" },
  DEPOSIT_PAID: { color: "orange", text: "Đã cọc" },
  PARTIAL: { color: "orange", text: "Thanh toán 1 phần" },
  PAID: { color: "green", text: "Đã thanh toán đủ" },
};

export default function PaymentPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        setLoading(true);
        // Trang này hiển thị các đơn đã COMPLETED
        const response = await getListOrders({ status: "COMPLETED" });
        setOrders(response.data);
      } catch (e) {
        message.error("Không tải được danh sách thanh toán");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedOrders();
  }, []);

  // Tính toán thống kê từ state 'orders'
  const total = orders.reduce((a, b) => a + b.totalAmount, 0);

  const columns = [
    { title: "Mã đơn", dataIndex: "id" },
    {
      title: "Khách hàng",
      dataIndex: ["customer", "fullName"],
    },
    {
      title: "Số tiền ($)", // Sửa thành $
      dataIndex: "totalAmount",
      render: (v) => v.toLocaleString(),
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      // CẬP NHẬT: Dùng paymentStatusMap
      render: (status) => {
        const statusInfo = paymentStatusMap[status] || { color: "gray", text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
  ];

  return (
    // Cập nhật style
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
            <Col xs={24} md={12}> {/* Sửa thành 12 để hiển thị 2 cột */}
              <Card>
                <Statistic
                  title="Tổng doanh thu (Completed)"
                  value={total}
                  suffix="$" // Sửa thành $
                />
              </Card>
            </Col>
            <Col xs={24} md={12}> {/* Sửa thành 12 để hiển thị 2 cột */}
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