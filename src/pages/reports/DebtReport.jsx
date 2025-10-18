import { Table, Tag } from "antd";

const debts = [
  { id: 1, name: "Nguyễn Văn A", type: "Khách hàng", amount: 300000000, status: "Còn nợ" },
  { id: 2, name: "VinFast HN", type: "Hãng xe", amount: -50000000, status: "Đã thanh toán" },
];

export default function DebtReport() {
  const columns = [
    { title: "Mã", dataIndex: "id" },
    { title: "Đối tượng", dataIndex: "name" },
    { title: "Loại", dataIndex: "type" },
    {
      title: "Số tiền (VNĐ)",
      dataIndex: "amount",
      render: (a) => a.toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => <Tag color={s === "Đã thanh toán" ? "green" : "red"}>{s}</Tag>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 700, color: "#059669" }}>Báo cáo công nợ</h2>
      <Table columns={columns} dataSource={debts} rowKey="id" />
    </div>
  );
}
