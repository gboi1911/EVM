import { Table, Button, Tag, Modal } from "antd";
import { useState } from "react";

const sampleOrders = [
  { id: "DH001", customer: "Nguyễn Văn A", date: "2025-10-03", status: "Chờ duyệt", total: 950000000 },
  { id: "DH002", customer: "Trần Thị B", date: "2025-10-04", status: "Đang giao", total: 1800000000 },
];

export default function OrderPage() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const columns = [
    { title: "Mã đơn", dataIndex: "id" },
    { title: "Khách hàng", dataIndex: "customer" },
    { title: "Ngày tạo", dataIndex: "date" },
    { title: "Tổng tiền", dataIndex: "total", render: (v) => v.toLocaleString() + " ₫" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "Chờ duyệt" ? "orange" : s === "Đang giao" ? "blue" : "green"}>{s}</Tag>
      ),
    },
    {
      title: "Thao tác",
      render: (_, r) => (
        <Button type="link" onClick={() => { setSelected(r); setOpen(true); }}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 700, color: "#059669" }}>Quản lý đơn hàng</h2>
      <Table columns={columns} dataSource={sampleOrders} rowKey="id" />

      <Modal open={open} onCancel={() => setOpen(false)} footer={null} title="Chi tiết đơn hàng">
        {selected ? (
          <>
            <p><b>Mã đơn:</b> {selected.id}</p>
            <p><b>Khách hàng:</b> {selected.customer}</p>
            <p><b>Tổng tiền:</b> {selected.total.toLocaleString()} ₫</p>
            <p><b>Trạng thái:</b> {selected.status}</p>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
        