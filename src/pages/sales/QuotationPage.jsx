// src/pages/sales/QuotationPage.jsx
import { useState, useEffect } from "react";
import {
  Row, Col, Card, Table, Form, Input, InputNumber, Button, message, Modal, Tag, Typography, Space, Spin
} from "antd";
import { SendOutlined, FilePdfOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { createOrder } from "../../api/order";
import { getListCars } from "../../api/car"; // Import API xe thật

const { Text } = Typography;

// !! GIẢI PHÁP TẠM THỜI (Vì API trả về price: 0)
// Chúng ta sẽ gán giá thủ công. Khi nào backend sửa API, chúng ta sẽ xóa
const DUMMY_PRICES = {
  1: 35000, // Sedan LX
  2: 45000, // SUV GX
  3: 30000, // Hatchback ZX
  4: 55000, // Electric EV1
  5: 48000, // Hybrid HVX
  6: 60000, // Truck TX
  7: 42000, // Van VX
  8: 65000, // Convertible CVX
  9: 75000, // Sports Car SX
  10: 80000, // Luxury LX
};

export default function QuotationPage() {
  const [carList, setCarList] = useState([]);
  const [carLoading, setCarLoading] = useState(true);

  const [selectedCar, setSelectedCar] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [carSelectionError, setCarSelectionError] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Dùng useEffect để tải danh sách xe khi trang mở
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setCarLoading(true);
        const response = await getListCars(); // Gọi API thật
        
        // API trả về { carInfoGetDtos: [...] }
        const carsFromApi = response.data.carInfoGetDtos || [];

        // Map dữ liệu API và gán giá "giả"
        const formattedCarList = carsFromApi.map(car => ({
          key: car.carId,
          model: car.carName,
          // Gán giá từ DUMMY_PRICES, nếu không có thì dùng giá từ API (là 0)
          price: DUMMY_PRICES[car.carId] || car.price 
        }));
        
        setCarList(formattedCarList);

      } catch (err) {
        message.error("Lỗi: Không tải được danh sách xe. Vui lòng kiểm tra API '/car/all'.");
      } finally {
        setCarLoading(false);
      }
    };
    
    fetchCars();
  }, []); // Mảng rỗng = chạy 1 lần

  const onFinish = async (values) => {
    if (!selectedCar) {
      message.error("Vui lòng chọn xe (Bắt buộc)!");
      setCarSelectionError(true);
      return;
    }
    setCarSelectionError(false);

    try {
      setLoading(true);
      const price = selectedCar.price; 
      
      if (!price || price === 0) {
         message.error(`Lỗi: Xe "${selectedCar.model}" có giá là 0. Không thể tạo đơn hàng.`);
         setLoading(false);
         return;
      }

      const quantity = values.quantity || 1;
      const discount = values.discount || 0;
      const calculatedTotal = (price * quantity) * (1 - (discount / 100));

      const payload = {
        carId: selectedCar.key,
        customerPhone: values.customerPhone,
        totalAmount: calculatedTotal,
      };

      const response = await createOrder(payload);
      const orderDetail = response.data;
      message.success(`Tạo đơn hàng #${orderDetail.id} thành công`);
      form.resetFields();
      setSelectedCar(null);
      setCarSelectionError(false);
      setSuccessData(orderDetail);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("❌ Create order failed:", err);
      if (err.errorFields) {
         message.error("Vui lòng điền đầy đủ thông tin!");
      } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        message.error("Lỗi xác thực. Vui lòng đăng nhập lại.");
      } else {
        message.error("Tạo order thất bại. " + (err.message || "Kiểm tra backend"));
      }
    } finally {
      setLoading(false);
    }
  };

  const onValidateFailed = (errorInfo) => {
    message.error("Vui lòng điền đầy đủ các trường bắt buộc!");
    if (!selectedCar) {
      setCarSelectionError(true);
    }
  };

  return (
    <div style={{ backgroundColor: "#1f2937", minHeight: "100vh", padding: 40 }}>
      <div
        style={{
             fontSize: 25,
          fontWeight: 700,
          // maxWidth: 1400,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2 style={{ fontWeight: 700, color: "#059669", textAlign: "center", marginBottom: 24 }}>
          Tạo báo giá / Đơn hàng
        </h2>

        <Row gutter={24}>
          <Col span={12}>
            <Card
              title="1. Chọn xe (Bắt buộc)"
              style={carSelectionError ? { border: '1px solid #ff4d4f', borderRadius: '8px' } : {}}
              headStyle={carSelectionError ? { color: '#ff4d4f' } : {}}
            >
              <Spin spinning={carLoading}>
                <Table
                  dataSource={carList} // Dùng danh sách xe thật
                  columns={[
                    { title: "Mẫu xe", dataIndex: "model" },
                    { title: "Giá ($)", dataIndex: "price", render: (v) => v.toLocaleString() },
                  ]}
                  rowSelection={{
                    type: "radio",
                    selectedRowKeys: selectedCar ? [selectedCar.key] : [],
                    onChange: (_, r) => {
                      setSelectedCar(r[0]);
                      setCarSelectionError(false);
                    },
                  }}
                  pagination={false}
                />
              </Spin>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="2. Thông tin đơn hàng (Bắt buộc)">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onValidateFailed}
              >
                <Form.Item
                  label="SĐT Khách hàng"
                  name="customerPhone"
                  rules={[{ required: true, message: "Vui lòng nhập SĐT khách!" }]}
                >
                  <Input placeholder="Nhập SĐT (ví dụ: 0901234567)" />
                </Form.Item>
                <Form.Item
                  label="Số lượng"
                  name="quantity"
                  initialValue={1}
                  rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
                >
                  <InputNumber min={1} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  label="Chiết khấu (%)"
                  name="discount"
                  initialValue={0}
                  rules={[{ required: true, message: "Vui lòng nhập chiết khấu (nhập 0 nếu không có)" }]}
                >
                  <InputNumber min={0} max={100} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                  label="Ghi chú"
                  name="note"
                  // rules={[{ required: false, message: "Vui lòng nhập ghi chú (nhập 'Không' nếu không có)" }]}
                >
                  <Input.TextArea rows={3} placeholder="Thông tin thêm, lý do chiết khấu,..." />
                </Form.Item>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  htmlType="submit"
                  loading={loading}
                >
                  Tạo Đơn Hàng
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal thành công (Giữ nguyên) */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', color: '#059669' }}>
            <CheckCircleOutlined style={{ fontSize: '22px', marginRight: 10, color: '#059669' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Tạo đơn hàng thành công!</span>
          </div>
        }
        open={isSuccessModalOpen}
        onCancel={() => setIsSuccessModalOpen(false)}
        footer={
          <Button type="primary" onClick={() => setIsSuccessModalOpen(false)}>
            Đóng
          </Button>
        }
      >
        {successData && (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text>Đơn hàng <b>#{successData.id}</b> đã được tạo.</Text>
            <Text>Khách hàng: <b>{successData.customer?.fullName}</b></Text>
            <Text>Trạng thái: <Tag color="orange">{successData.status}</Tag></Text>
            
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0', width: '100%' }}>
              <Space wrap>
                <Button
                  icon={<FilePdfOutlined />}
                  href={successData.quotationUrl}
                  target="_blank"
                >
                  View Quotation (Xem Báo giá)
                </Button>
                <Button
                  icon={<FilePdfOutlined />}
                  href={successData.contractUrl}
                  target="_blank"
                >
                  View Contract (Xem Hợp đồng)
                </Button>
              </Space>
            </div>
          </Space>
        )}
      </Modal>
    </div>
  );
}