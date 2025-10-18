import { Table, Tag } from "antd";

const feedbacks = [
  { id: 1, name: "Nguyễn Văn A", type: "Phản hồi", content: "Dịch vụ tốt", status: "Đã xử lý" },
  { id: 2, name: "Trần Thị B", type: "Khiếu nại", content: "Xe giao chậm", status: "Đang xử lý" },
];

export default function FeedbackManagement() {
  const columns = [
    { title: "Mã phản hồi", dataIndex: "id" },
    { title: "Khách hàng", dataIndex: "name" },
    { title: "Loại", dataIndex: "type" },
    { title: "Nội dung", dataIndex: "content" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "Đã xử lý" ? "green" : "orange"}>{s}</Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 700, color: "#059669" }}>Phản hồi & Khiếu nại</h2>
      <Table columns={columns} dataSource={feedbacks} rowKey="id" />
    </div>
  );
}
