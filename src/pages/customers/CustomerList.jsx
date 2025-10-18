import { Table, Tag, Button } from "antd";

const customers = [
  { id: 1, name: "Nguyễn Văn A", phone: "0901234567", email: "a@gmail.com", type: "Cá nhân" },
  { id: 2, name: "Công ty Bảo Minh", phone: "0281234567", email: "contact@baominh.vn", type: "Doanh nghiệp" },
];

export default function CustomerList() {
  const columns = [
    { title: "Mã KH", dataIndex: "id" },
    { title: "Họ tên / Công ty", dataIndex: "name" },
    { title: "Số điện thoại", dataIndex: "phone" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Loại khách hàng",
      dataIndex: "type",
      render: (type) => <Tag color={type === "Cá nhân" ? "blue" : "green"}>{type}</Tag>,
    },
    {
      title: "Thao tác",
      render: () => <Button type="link">Xem chi tiết</Button>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 700, color: "#059669" }}>Hồ sơ khách hàng</h2>
      <Table dataSource={customers} columns={columns} rowKey="id" />
    </div>
  );
}
