// src/pages/sales/BookingPage.jsx
import { Table, Button, Tag } from "antd";

const bookingData = [
  { id: "BK001", model: "VF9", quantity: 3, date: "2025-10-10", status: "Đã gửi yêu cầu" },
  { id: "BK002", model: "VF7", quantity: 1, date: "2025-10-12", status: "Đang xử lý" },
];

export default function BookingPage() {
  const columns = [
    { title: "Mã đặt xe", dataIndex: "id" },
    { title: "Mẫu xe", dataIndex: "model" },
    { title: "Số lượng", dataIndex: "quantity" },
    { title: "Ngày đặt", dataIndex: "date" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "Đã gửi yêu cầu" ? "green" : "blue"}>{status}</Tag>
      ),
    },
    {
      title: "Thao tác",
      render: () => <Button type="primary">Chi tiết</Button>,
    },
  ];

  return (
    // 1. Div bọc ngoài cùng
    <div style={{ backgroundColor: "#1f2937", minHeight: "100vh", padding: 40 }}>
      {/* 2. Div khung chứa nội dung chính */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 12,
          padding: 24,
        }}
      >
        {/* 3. Tiêu đề cập nhật */}
        <h2
          style={{
              fontSize: 25,
          fontWeight: 700,
            color: "#059669",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Đặt xe từ hãng
        </h2>
        <Table dataSource={bookingData} columns={columns} rowKey="id" />
      </div>
    </div>
  );
}