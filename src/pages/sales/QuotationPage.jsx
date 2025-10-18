import { useState } from "react";
import { Row, Col, Card, Table, Form, Input, InputNumber, Button, Select, Divider, message } from "antd";
import { FilePdfOutlined, SaveOutlined, SendOutlined } from "@ant-design/icons";

const carData = [
  { key: 1, model: "VinFast VF8", price: 950000000 },
  { key: 2, model: "Tesla Model 3", price: 1800000000 },
  { key: 3, model: "BYD Atto 3", price: 890000000 },
];

export default function QuotationPage() {
  const [selectedCar, setSelectedCar] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    { title: "Mẫu xe", dataIndex: "model" },
    { title: "Giá niêm yết (₫)", dataIndex: "price", render: (v) => v.toLocaleString() },
  ];

  const handleSaveDraft = () => message.success("Đã lưu báo giá nháp!");
  const handleSend = () => message.success("Đã gửi phê duyệt báo giá!");
  const handleExportPDF = () => message.info("Đang xuất file PDF...");

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: 700, color: "#059669" }}>Tạo báo giá</h2>
      <Divider />
      <Row gutter={24}>
        <Col span={12}>
          <Card title="Danh sách xe" bordered={false}>
            <Table
              dataSource={carData}
              columns={columns}
              rowSelection={{
                type: "radio",
                onChange: (_, rows) => setSelectedCar(rows[0]),
              }}
              pagination={false}
            />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Thông tin báo giá" bordered={false}>
            <Form form={form} layout="vertical">
              <Form.Item label="Khách hàng" name="customer" rules={[{ required: true }]}>
                <Input placeholder="Nhập tên khách hàng" />
              </Form.Item>

              <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Chiết khấu (%)" name="discount">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item label="Ghi chú" name="note">
                <Input.TextArea rows={3} />
              </Form.Item>

              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Button icon={<SaveOutlined />} onClick={handleSaveDraft}>
                  Lưu nháp
                </Button>
                <Button type="primary" icon={<SendOutlined />} onClick={handleSend}>
                  Gửi phê duyệt
                </Button>
                <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
                  Xuất PDF
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
