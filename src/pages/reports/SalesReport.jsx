import { Table, Statistic, Card } from "antd";

const data = [
  { id: 1, name: "Nguyễn Văn A", total: 12, revenue: 2500000000 },
  { id: 2, name: "Trần Thị B", total: 8, revenue: 1800000000 },
];

export default function SalesReport() {
  const columns = [
    { title: "Mã NV", dataIndex: "id" },
    { title: "Tên nhân viên", dataIndex: "name" },
    { title: "Số lượng xe bán", dataIndex: "total" },
    {
      title: "Doanh thu (VNĐ)",
      dataIndex: "revenue",
      render: (r) => r.toLocaleString("vi-VN"),
    },
  ];

  const totalRevenue = data.reduce((acc, cur) => acc + cur.revenue, 0);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 700, color: "#059669" }}>Báo cáo doanh số nhân viên</h2>
      <Card style={{ marginBottom: 16 }}>
        <Statistic title="Tổng doanh thu toàn hệ thống" value={totalRevenue} suffix="VNĐ" />
      </Card>
      <Table columns={columns} dataSource={data} rowKey="id" />
    </div>
  );
}
