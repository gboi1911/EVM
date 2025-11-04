import { Table, Button, Tag, Select } from "antd";
import { useState } from "react";

const promoData = [
  { id: 1, name: "Giảm 5% cho VF8", type: "Chiết khấu", from: "2025-09-01", to: "2025-12-31", status: "Đang áp dụng" },
  { id: 2, name: "Tặng bảo hiểm 1 năm", type: "Quà tặng", from: "2025-08-15", to: "2025-11-15", status: "Hết hạn" },
];

export default function PromotionPage() {
  const [filter, setFilter] = useState(null);

  const columns = [
    { title: "Tên chương trình", dataIndex: "name" },
    { title: "Loại", dataIndex: "type" },
    { title: "Thời gian", render: (_, r) => `${r.from} → ${r.to}` },
    { title: "Trạng thái", dataIndex: "status", render: (s) => <Tag color={s === "Đang áp dụng" ? "green" : "red"}>{s}</Tag> },
    { title: "Hành động", render: () => <Button type="link">Chỉnh sửa</Button> },
  ];

  const filtered = filter ? promoData.filter((p) => p.type === filter) : promoData;

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
            fontWeight: 700,
            color: "#059669",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Quản lý khuyến mãi & chiết khấu
        </h2>
        <Select
          placeholder="Lọc theo loại"
          allowClear
          onChange={setFilter}
          options={[
            { value: "Chiết khấu", label: "Chiết khấu" },
            { value: "Quà tặng", label: "Quà tặng" },
          ]}
          style={{ marginBottom: 16, width: 200 }} // Thêm width để select đẹp hơn
        />
        <Table columns={columns} dataSource={filtered} rowKey="id" />
      </div>
    </div>
  );
}