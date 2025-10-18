import { Table, Tag, Statistic, Row, Col, Card } from "antd";

const paymentData = [
  { id: "DH001", customer: "Nguyễn Văn A", amount: 950000000, type: "Trả thẳng" },
  { id: "DH002", customer: "Trần Thị B", amount: 300000000, type: "Trả góp" },
];

export default function PaymentPage() {
  const total = paymentData.reduce((a, b) => a + b.amount, 0);
  const installments = paymentData.filter((p) => p.type === "Trả góp").length;

  const columns = [
    { title: "Mã đơn", dataIndex: "id" },
    { title: "Khách hàng", dataIndex: "customer" },
    { title: "Số tiền (₫)", dataIndex: "amount", render: (v) => v.toLocaleString() },
    { title: "Hình thức", dataIndex: "type", render: (t) => <Tag color={t === "Trả góp" ? "blue" : "green"}>{t}</Tag> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 700, color: "#059669" }}>Thanh toán & công nợ</h2>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}><Card><Statistic title="Tổng doanh thu" value={total} suffix="₫" /></Card></Col>
        <Col span={8}><Card><Statistic title="Số đơn trả góp" value={installments} /></Card></Col>
        <Col span={8}><Card><Statistic title="Số đơn trả thẳng" value={paymentData.length - installments} /></Card></Col>
      </Row>
      <Table columns={columns} dataSource={paymentData} rowKey="id" />
    </div>
  );
}
