// src/pages/sales/PaymentPage.jsx
import { Table, Tag, Statistic, Row, Col, Card, Spin, message } from "antd";
import { useEffect, useState } from "react";
// THAY ĐỔI 1: Import hàm API và hook
import { getListOrders } from "../../api/order";

export default function PaymentPage() {
  // THAY ĐỔI 2: Thêm state cho loading và orders
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // THAY ĐỔI 3: Gọi API khi trang được tải
  useEffect(() => {
    const fetchCompletedOrders = async () => {
      try {
        setLoading(true);
        // Gọi API để lấy các đơn đã hoàn thành
        const response = await getListOrders({ status: 'COMPLETED' }); 
        setOrders(response.data);
      } catch (e) {
        message.error("Không tải được danh sách thanh toán");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedOrders();
  }, []);

  // THAY ĐỔI 4: Tính toán thống kê từ state 'orders'
  const total = orders.reduce((a, b) => a + b.totalAmount, 0);
  
  // (Giả sử bạn có 1 trường 'paymentType' trong API)
  // Vì API không có 'type' (Trả góp/Trả thẳng), tôi sẽ tạm ẩn 2 thống kê này
  // const installments = orders.filter((p) => p.paymentType === "Trả góp").length;

  // THAY ĐỔI 5: Cập nhật Cột (columns) để khớp với API
  const columns = [
    { title: "Mã đơn", dataIndex: "id" },
    { 
      title: "Khách hàng", 
      dataIndex: ["customer", "fullName"], // Lấy lồng
    },
    { 
      title: "Số tiền (₫)", 
      dataIndex: "totalAmount", // Dùng totalAmount
      render: (v) => v.toLocaleString() 
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus", // Dùng paymentStatus
      render: (t) => <Tag color={t === "PAID" ? "green" : "red"}>{t}</Tag>
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 12, margin: 40, maxWidth: 1200, margin: '40px auto' }}>
      <h2 style={{ fontWeight: 700, color: "#059669", textAlign: 'center', marginBottom: 24 }}>
        Thanh toán & Doanh thu (Đơn đã hoàn thành)
      </h2>
      
      {/* THAY ĐỔI 6: Thêm Spin/Loading */}
      {loading ? (
        <Spin style={{ display: 'block', margin: 'auto' }} />
      ) : (
        <>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card>
                <Statistic title="Tổng doanh thu (Completed)" value={total} suffix="₫" />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Tổng số đơn (Completed)" value={orders.length} />
              </Card>
            </Col>
            {/* Ẩn đi vì không có dữ liệu
            <Col span={8}><Card><Statistic title="Số đơn trả góp" value={installments} /></Card></Col>
            <Col span={8}><Card><Statistic title="Số đơn trả thẳng" value={orders.length - installments} /></Card></Col>
            */}
          </Row>
          
          {/* THAY ĐỔI 7: Cập nhật dataSource */}
          <Table columns={columns} dataSource={orders} rowKey="id" />
        </>
      )}
    </div>
  );
}