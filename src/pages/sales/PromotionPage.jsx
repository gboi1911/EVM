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
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 700, color: "#059669" }}>Quản lý khuyến mãi & chiết khấu</h2>
      <Select
        placeholder="Lọc theo loại"
        allowClear
        onChange={setFilter}
        options={[
          { value: "Chiết khấu", label: "Chiết khấu" },
          { value: "Quà tặng", label: "Quà tặng" },
        ]}
        style={{ marginBottom: 16 }}
      />
      <Table columns={columns} dataSource={filtered} rowKey="id" />
    </div>
  );
}
