import { Table, Tag } from "antd";

const scheduleData = [
  { id: "LD001", name: "Nguyễn Văn A", car: "VF8", date: "2025-10-15", status: "Đã xác nhận" },
  { id: "LD002", name: "Trần Thị B", car: "VF9", date: "2025-10-18", status: "Chờ xác nhận" },
];

export default function TestDriveSchedule() {
  const columns = [
    { title: "Mã lịch", dataIndex: "id" },
    { title: "Khách hàng", dataIndex: "name" },
    { title: "Xe lái thử", dataIndex: "car" },
    { title: "Ngày hẹn", dataIndex: "date" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => <Tag color={s === "Đã xác nhận" ? "green" : "gold"}>{s}</Tag>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 700, color: "#059669" }}>Lịch hẹn lái thử</h2>
      <Table columns={columns} dataSource={scheduleData} rowKey="id" />
    </div>
  );
}
