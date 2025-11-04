// src/pages/sales/QuotationPage.jsx
import { useState } from "react";
import { Row, Col, Card, Table, Form, Input, InputNumber, Button, message } from "antd";
import { SaveOutlined, SendOutlined } from "@ant-design/icons";
import { createOrder } from "../../api/order"; // Import này đã đúng

// Dữ liệu xe (Giả sử lấy từ API sau)
const carData = [
  { key: 1, model: "VinFast VF8", price: 950000000 },
  { key: 2, model: "Tesla Model 3", price: 1800000000 },
  { key: 3, model: "BYD Atto 3", price: 890000000 },
];

export default function QuotationPage() {
  const [selectedCar, setSelectedCar] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false); // Thêm state loading

  const handleSubmit = async (/* Bỏ status vì API example ko cần */) => {
    if (!selectedCar) return message.error("Hãy chọn mẫu xe");

    try {
      setLoading(true);
      const values = await form.validateFields(); // values = { customerPhone, quantity, discount, note }

      // THAY ĐỔI 1: Tính toán tổng tiền từ Form
      const price = selectedCar.price;
      const quantity = values.quantity || 1;
      const discount = values.discount || 0;
      const calculatedTotal = (price * quantity) * (1 - (discount / 100));

      // THAY ĐỔI 2: Payload khớp với API Example
      const payload = {
        carId: selectedCar.key,
        customerPhone: values.customerPhone,
        totalAmount: calculatedTotal,
        // Ghi chú: Dựa trên API example, chỉ cần 3 trường này.
        // Backend sẽ tự động gán status=PENDING khi tạo mới.
        // Nếu backend CÓ HỖ TRỢ nhận 'note' hoặc 'status', bạn có thể thêm lại:
        // note: values.note || "",
        // status: status, 
      };

      console.log("✅ Payload gửi BE:", payload);

      await createOrder(payload); // Lời gọi API này đã đúng
      message.success("Tạo order thành công");
      form.resetFields();
      setSelectedCar(null);
    } catch (err) {
      console.error("❌ Create order failed:", err);
      // Bắt lỗi CORS/Auth từ trước
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         message.error("Lỗi xác thực. Vui lòng đăng nhập lại hoặc kiểm tra token.");
      } else {
         message.error("Tạo order thất bại. " + (err.message || "Kiểm tra backend"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#1f2937", minHeight: "100vh", padding: 40 }}>
      <div
        style={{
          maxWidth: 1400,
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
          Tạo báo giá / Đơn hàng
        </h2>

        <Row gutter={24}>
          <Col span={12}>
            <Card title="1. Chọn xe">
              <Table
                dataSource={carData}
                columns={[
                  { title: "Mẫu xe", dataIndex: "model" },
                  {
                    title: "Giá (₫)",
                    dataIndex: "price",
                    render: (v) => v.toLocaleString(),
                  },
                ]}
                rowSelection={{
                  type: "radio",
                  onChange: (_, r) => setSelectedCar(r[0]),
                }}
                pagination={false}
              />
            </Card>
          </Col>

          <Col span={12}>
            <Card title="2. Thông tin đơn hàng">
              <Form form={form} layout="vertical">
                {/* THAY ĐỔI 3: Sửa thành customerPhone */}
                <Form.Item
                  label="SĐT Khách hàng"
                  name="customerPhone"
                  rules={[{ required: true, message: "Vui lòng nhập SĐT khách!" }]}
                >
                  <Input placeholder="Nhập SĐT (ví dụ: 0902345678)" />
                </Form.Item>

                <Form.Item
                  label="Số lượng"
                  name="quantity"
                  initialValue={1}
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  label="Chiết khấu (%)"
                  name="discount"
                  initialValue={0}
                >
                  <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={3} placeholder="Thông tin thêm..." />
                </Form.Item>

                <div style={{ display: "flex", gap: 8 }}>
                  {/* Cập nhật: Chỉ cần 1 nút tạo Order */}
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={() => handleSubmit()} // Bỏ tham số status
                    loading={loading} // Thêm trạng thái loading
                  >
                    Tạo Đơn Hàng
                  </Button>
                  {/* Nếu bạn muốn giữ 2 nút, hãy đảm bảo backend hỗ trợ nhận 'status'
                    <Button icon={<SaveOutlined />} onClick={() => handleSubmit("PENDING")} loading={loading}>
                      Lưu nháp
                    </Button>
                    <Button type="primary" icon={<SendOutlined />} onClick={() => handleSubmit("APPROVED")} loading={loading}>
                      Gửi phê duyệt
                    </Button>
                  */}
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}