import { Table, Tag, Timeline } from "antd";

const deliveryData = [
  {
    id: "DH001",
    customer: "Nguyễn Văn A",
    car: "VF8",
    deliveryDate: "2025-10-10",
    status: "Đang vận chuyển",
    progress: [
      { color: "green", text: "Đơn hàng đã xác nhận" },
      { color: "blue", text: "Xe đang được vận chuyển" },
      { color: "gray", text: "Chờ bàn giao cho khách" },
    ],
  },
  {
    id: "DH002",
    customer: "Trần Thị B",
    car: "Tesla Model 3",
    deliveryDate: "2025-10-12",
    status: "Đã giao",
    progress: [
      { color: "green", text: "Đơn hàng đã xác nhận" },
      { color: "green", text: "Xe đã được vận chuyển" },
      { color: "green", text: "Đã bàn giao cho khách" },
    ],
  },
];

export default function DeliveryTrackingPage() {
  const columns = [
    { title: "Mã đơn", dataIndex: "id" },
    { title: "Khách hàng", dataIndex: "customer" },
    { title: "Xe", dataIndex: "car" },
    { title: "Ngày dự kiến giao", dataIndex: "deliveryDate" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => <Tag color={s === "Đã giao" ? "green" : "blue"}>{s}</Tag>,
    },
    {
      title: "Tiến độ giao xe",
      dataIndex: "progress",
      render: (steps) => (
        <Timeline
          items={steps.map((item) => ({
            color: item.color,
            children: item.text,
          }))}
          style={{ margin: 0, padding: 0 }}
        />
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: "#1f2937", minHeight: "100vh", padding: 40 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2
          style={{
            fontWeight: 700,
            color: "#059669",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Theo dõi giao xe
        </h2>
        <Table
          columns={columns}
          dataSource={deliveryData}
          rowKey="id"
          pagination={false}
        />
      </div>
    </div>
  );

}
