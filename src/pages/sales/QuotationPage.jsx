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
import { createOrder } from "../../api/order.js"; 
// ❗️ SỬA LỖI: Import từ 'cars.js' (thêm 's')
import { getCarModelsForSale } from "../../api/cars.js"; 
import { useAuth } from "../../context/AuthContext.jsx"; 

const { Text } = Typography;

export default function QuotationPage() {
  const [carList, setCarList] = useState([]);
  const [carLoading, setCarLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [carSelectionError, setCarSelectionError] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  const { user } = useAuth(); 

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setCarLoading(true);
        const carModelList = await getCarModelsForSale(); 

        const allCarsForSale = [];
        carModelList.forEach(model => {
          model.carDetails.forEach(detail => {
            if (detail.carStatus === "FOR_SALE") {
              allCarsForSale.push({
                ...detail,
                carModelName: model.carModelName,
                carModelId: model.id, 
              });
            }
          });
        });

        const formattedCarList = allCarsForSale.map((car) => ({
          key: car.carDetailId, 
          modelId: car.carModelId, 
          modelName: `${car.carModelName} - ${car.carName}`,
          price: 0, 
        }));

        setCarList(formattedCarList);
      } catch (err) {
        message.error(
          "Lỗi: Không tải được danh sách xe. " + err.message
        );
      } finally {
        setCarLoading(false);
      }
    };

    fetchCars();
  }, []);

  const onFinish = async (values) => {
    if (!selectedCar) {
      message.error("Vui lòng chọn xe (Bắt buộc)!");
      setCarSelectionError(true);
      return;
    }
    setCarSelectionError(false);

    try {
      setLoading(true);
      
      const finalTotalAmount = values.totalAmount;
      if (!finalTotalAmount || finalTotalAmount <= 0) {
          message.error("Vui lòng nhập Tổng tiền!");
          setLoading(false);
          return;
      }

      // Khớp với API (Block 1)
      const payload = {
        carModelId: selectedCar.modelId, 
        customerPhone: values.customerPhone,
        customerName: values.customerName, 
        totalAmount: finalTotalAmount,
      };
      
      const response = await createOrder(payload);
      
      const orderDetail = response.data || response; 
      
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
  
  useEffect(() => {
    if(user && user.fullName) {
      form.setFieldsValue({ staffName: user.fullName });
    }
  }, [user, form]);


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
            fontSize: 25, fontWeight: 700, color: "#059669",
            margin: 0, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
          }}
        >
          Tạo báo giá / Đơn hàng
        </h2>

        <Row gutter={24}>
          <Col span={12}>
            <Card
              title="1. Chọn Mẫu xe"
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
                    { title: "Mẫu xe - Tên xe", dataIndex: "modelName" },
                    {
                      title: "Giá (₫)",
                      dataIndex: "price",
                      render: (price) => <b style={{ color: "red" }}>LIÊN HỆ</b>,
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
                  scroll={{ y: 400 }}
                />
              </Spin>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="2. Thông tin đơn hàng">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onValidateFailed}
              >
                 <Form.Item
                  label="Tên Khách hàng"
                  name="customerName"
                  rules={[
                    { required: true, message: "Vui lòng nhập Tên khách!" },
                  ]}
                >
                  <Input placeholder="Nhập tên khách hàng (ví dụ: Nguyen Van A)" />
                </Form.Item>
                
                <Form.Item
                  label="SĐT Khách hàng"
                  name="customerPhone"
                  rules={[
                    { required: true, message: "Vui lòng nhập SĐT khách!" },
                  ]}
                >
                  <Input placeholder="Nhập SĐT (ví dụ: 0901234567)" />
                </Form.Item>

                {selectedCar && (
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
                        `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\₫\s?|(,*)/g, "")}
                      placeholder="Nhập tổng tiền (ví dụ: 50000)"
                    />
                  </Form.Item>
                )}
                
                <Form.Item
                  label="Nhân viên phụ trách"
                  name="staffName"
                >
                  <Input disabled />
                </Form.Item>

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
                  disabled={!selectedCar} 
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