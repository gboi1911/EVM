import { Tabs, Table, Tag } from "antd";

const contracts = [
  { id: "HD001", order: "DH001", customer: "Nguyễn Văn A", status: "Đang hiệu lực", value: 950000000 },
  { id: "HD002", order: "DH002", customer: "Trần Thị B", status: "Đã thanh lý", value: 1800000000 },
];

export default function ContractPage() {
  const columns = [
    { title: "Mã HĐ", dataIndex: "id" },
    { title: "Đơn hàng", dataIndex: "order" },
    { title: "Khách hàng", dataIndex: "customer" },
    { title: "Giá trị (₫)", dataIndex: "value", render: (v) => v.toLocaleString() },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "Đang hiệu lực" ? "green" : s === "Hết hạn" ? "orange" : "red"}>
          {s}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 700, color: "#059669" }}>Quản lý hợp đồng bán hàng</h2>
      <Tabs
        defaultActiveKey="1"
        items={[
          { key: "1", label: "Đang hiệu lực", children: <Table columns={columns} dataSource={contracts.filter(c => c.status === "Đang hiệu lực")} /> },
          { key: "2", label: "Hết hạn", children: <Table columns={columns} dataSource={contracts.filter(c => c.status === "Hết hạn")} /> },
          { key: "3", label: "Đã thanh lý", children: <Table columns={columns} dataSource={contracts.filter(c => c.status === "Đã thanh lý")} /> },
        ]}
      />
    </div>
  );
}
