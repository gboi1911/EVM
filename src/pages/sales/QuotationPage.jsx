// src/pages/sales/QuotationPage.jsx
import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Modal,
  Tag,
  Typography,
  Space,
  Spin,
} from "antd";
import {
  SendOutlined,
  FilePdfOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { createOrder } from "../../api/order";
// THAY ĐỔI 1: Sửa tên hàm import
import { getAllCars } from "../../api/car";

const { Text } = Typography;

export default function QuotationPage() {
  const [carList, setCarList] = useState([]);
  const [carLoading, setCarLoading] = useState(true);
  // (Các state khác giữ nguyên)
  const [selectedCar, setSelectedCar] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [carSelectionError, setCarSelectionError] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setCarLoading(true);
        // THAY ĐỔI 2: Sửa tên hàm gọi
        const response = await getAllCars(); // Gọi API thật

        // API (fetch) trả về { carInfoGetDtos: [...] }
        const carsFromApi = response.carInfoGetDtos || [];

        const formattedCarList = carsFromApi.map((car) => ({
          key: car.carId,
          model: car.carName,
          price: car.price,
        }));

        setCarList(formattedCarList);
      } catch (err) {
        message.error(
          "Lỗi: Không tải được danh sách xe. Vui lòng kiểm tra API '/car/all'."
        );
      } finally {
        setCarLoading(false);
      }
    };

    fetchCars();
  }, []);

  // (Hàm onFinish và phần còn lại giữ nguyên)
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
      let finalTotalAmount;

      if (!price || price === 0) {
        finalTotalAmount = values.totalAmount;
        if (!finalTotalAmount || finalTotalAmount <= 0) {
          message.error("Vui lòng nhập Tổng tiền cho xe LIÊN HỆ!");
          setLoading(false);
          return;
        }
      } else {
        const quantity = values.quantity || 1;
        const discount = values.discount || 0;
        finalTotalAmount = price * quantity * (1 - discount / 100);
      }

      const payload = {
        carId: selectedCar.key,
        customerPhone: values.customerPhone,
        totalAmount: finalTotalAmount,
      };

      console.log("✅ Đang gửi payload lên API:", payload);

      const response = await createOrder(payload);
      const orderDetail = response.data; // Giả sử createOrder (dùng apiClient) trả về { data: ... }
      message.success(`Tạo đơn hàng #${orderDetail.id} thành công`);
      form.resetFields();
      setSelectedCar(null);
      setCarSelectionError(false);
      setSuccessData(orderDetail);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("❌ Create order failed:", err);
      if (err.response) {
        message.error(
          `Tạo thất bại: ${err.response.data?.message || err.message}`
        );
      } else if (err.errorFields) {
        message.error("Vui lòng điền đầy đủ thông tin!");
      } else {
        message.error(
          "Tạo order thất bại. " + (err.message || "Kiểm tra backend")
        );
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

  const handleCarSelect = (selectedRow) => {
    setSelectedCar(selectedRow);
    setCarSelectionError(false);
    form.resetFields(["quantity", "discount", "totalAmount"]);
  };

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh", padding: 40 }}>
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          background: "#f3f0f0ff",
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
            <Card
              title="1. Chọn xe (Bắt buộc)"
              style={
                carSelectionError
                  ? { border: "1px solid #ff4d4f", borderRadius: "8px" }
                  : {}
              }
              headStyle={carSelectionError ? { color: "#ff4f4f" } : {}}
            >
              <Spin spinning={carLoading}>
                <Table
                  dataSource={carList}
                  columns={[
                    { title: "Mẫu xe", dataIndex: "model" },
                    {
                      title: "Giá ($)",
                      dataIndex: "price",
                      render: (price) =>
                        price === 0 ? (
                          <b style={{ color: "red" }}>LIÊN HỆ</b>
                        ) : (
                          price.toLocaleString()
                        ),
                    },
                  ]}
                  rowSelection={{
                    type: "radio",
                    selectedRowKeys: selectedCar ? [selectedCar.key] : [],
                    onChange: (_, r) => {
                      handleCarSelect(r[0]);
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
                  rules={[
                    { required: true, message: "Vui lòng nhập SĐT khách!" },
                  ]}
                >
                  <Input placeholder="Nhập SĐT (ví dụ: 0901234567)" />
                </Form.Item>

                {selectedCar && selectedCar.price > 0 && (
                  <>
                    <Form.Item
                      label="Số lượng"
                      name="quantity"
                      initialValue={1}
                      rules={[
                        { required: true, message: "Vui lòng nhập số lượng!" },
                      ]}
                    >
                      <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                      label="Chiết khấu (%)"
                      name="discount"
                      initialValue={0}
                      rules={[
                        {
                          required: true,
                          message:
                            "Vui lòng nhập chiết khấu (nhập 0 nếu không có)",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </>
                )}

                {selectedCar && selectedCar.price === 0 && (
                  <Form.Item
                    label="Tổng tiền (Do giá LIÊN HỆ)"
                    name="totalAmount"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tổng tiền đã chốt",
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      placeholder="Nhập tổng tiền (ví dụ: 50000)"
                    />
                  </Form.Item>
                )}

                <Form.Item
                  label="Ghi chú"
                  name="note"
                  rules={[{ required: false }]}
                >
                  <Input.TextArea rows={3} placeholder="Thông tin thêm..." />
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

      {/* Modal thành công */}
      <Modal
        title={
          <div
            style={{ display: "flex", alignItems: "center", color: "#059669" }}
          >
            <CheckCircleOutlined
              style={{ fontSize: "22px", marginRight: 10, color: "#059669" }}
            />
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>
              Tạo đơn hàng thành công!
            </span>
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
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Text>
              Đơn hàng <b>#{successData.id}</b> đã được tạo.
            </Text>
            <Text>
              Khách hàng: <b>{successData.customer?.fullName}</b>
            </Text>
            <Text>
              Trạng thái: <Tag color="orange">{successData.status}</Tag>
            </Text>

            <div
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #f0f0f0",
                width: "100%",
              }}
            >
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
