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
          Quản lý hợp đồng bán hàng
        </h2>
        <Tabs
          defaultActiveKey="1"
          items={[
            { key: "1", label: "Đang hiệu lực", children: <Table columns={columns} dataSource={contracts.filter(c => c.status === "Đang hiệu lực")} /> },
            { key: "2", label: "Hết hạn", children: <Table columns={columns} dataSource={contracts.filter(c => c.status === "Hết hạn")} /> },
            { key: "3", label: "Đã thanh lý", children: <Table columns={columns} dataSource={contracts.filter(c => c.status === "Đã thanh lý")} /> },
          ]}
        />
      </div>
    </div>
  );
}