// src/pages/sales/QuotationPage.jsx
import { useState, useEffect } from "react";
import {
  Row, Col, Card, Table, Form, Input, InputNumber, Button,
  message, Modal, Tag, Typography, Space, Spin, Switch,
} from "antd";
import {
  SendOutlined, FilePdfOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
} from "@ant-design/icons";
import { createOrder } from "../../api/order.js";
import { getCarModelsForSale } from "../../api/cars.js";
import { getCurrentAndUpcomingPricePrograms } from "../../api/price.js";
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
  const [pricePrograms, setPricePrograms] = useState([]);

  const { user } = useAuth();

  // 1. Load car list
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setCarLoading(true);
        const carModelList = await getCarModelsForSale();
        const allCarsForSale = [];
        carModelList.forEach((model) => {
          model.carDetails.forEach((detail) => {
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
          carName: car.carName,
          carModelName: car.carModelName,
          modelName: `${car.carModelName} - ${car.carName}`,
          price: 0,
        }));
        setCarList(formattedCarList);
      } catch (err) {
        message.error("Lỗi: Không tải được danh sách xe. " + err.message);
      } finally {
        setCarLoading(false);
      }
    };
    fetchCars();
  }, []);

  // 2. Load price programs (Lấy mảng Active)
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await getCurrentAndUpcomingPricePrograms();
        // Lấy tất cả chi tiết của các chương trình đang active
        const activeDetails = data
            .filter(p => p.isActive)
            .flatMap(p => p.programDetails || []);
        setPricePrograms(activeDetails);
      } catch (err) {
        console.error("Lỗi tải bảng giá:", err);
      }
    };
    fetchPrices();
  }, []);

  const onFinish = async (values) => {
    if (!selectedCar) {
      message.error("Vui lòng chọn xe!");
      setCarSelectionError(true);
      return;
    }
    setCarSelectionError(false);

    const enteredAmount = Number(values.totalAmount);
    if (!enteredAmount || enteredAmount <= 0) {
      message.error("Vui lòng nhập Tổng tiền!");
      return;
    }

    

    try {
      setLoading(true);

      const payload = {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        orderStatus: "PENDING",
        carModelId: selectedCar.modelId ? Number(selectedCar.modelId) : 0,
        isSpecialColor: !!values.isSpecialColor,
        totalAmount: enteredAmount,
        // --- FIX: Lấy đúng ID của xe đã chọn (Fix lỗi 500) ---
        carDetailId: selectedCar.key ? Number(selectedCar.key) : null, 
        note: values.note || null,
      };

      console.log("Submitting Order:", payload); // Debug log

      const response = await createOrder(payload);
      const orderDetail = response.data || response;

      message.success(`Tạo đơn hàng #${orderDetail.id} thành công`);
      form.resetFields();
      setSelectedCar(null);
      setCarSelectionError(false);
      form.setFieldsValue({ 
        isSpecialColor: false, 
        staffName: user?.fullName 
      });
      setSuccessData(orderDetail);
      setIsSuccessModalOpen(true);

    } catch (err) {
      console.error("❌ Create order failed:", err);
      
      // Xử lý lỗi từ Backend trả về
      const errorMsg = err.response?.data?.message || err.message || "Lỗi không xác định";

      // Nếu lỗi liên quan đến giá hoặc validate từ backend
      if (errorMsg.includes("not valid for car model") || errorMsg.includes("Total amount")) {
          Modal.error({
            title: "Lỗi giá bán từ hệ thống",
            content: (
                <div>
                    <p style={{color: 'red'}}>{errorMsg}</p>
                    <p>Vui lòng kiểm tra lại bảng giá hiện hành.</p>
                </div>
            )
          });
      } else {
          message.error("Tạo đơn thất bại: " + errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const onValidateFailed = () => {
    message.error("Vui lòng điền đầy đủ thông tin!");
    if (!selectedCar) setCarSelectionError(true);
  };

  const handleCarSelect = (selectedRow) => {
    setSelectedCar(selectedRow);
    setCarSelectionError(false);
   
  };

  const handleColorChange = (checked) => {
    
  };

  // Hàm này chỉ gợi ý giá (fill vào ô input), không chặn submit
  const updateSuggestedPrice = (car, isSpecial) => {
      if (car && pricePrograms.length > 0) {
        // Tìm cấu hình giá phù hợp (Logic đơn giản: lấy cái đầu tiên tìm thấy)
        const config = pricePrograms.find(
            (p) => p.carModelName === car.carModelName && p.isSpecialColor === (isSpecial || false)
        );
        if (config) {
            form.setFieldsValue({ totalAmount: config.suggestedPrice });
        } else {
            form.setFieldsValue({ totalAmount: null });
        }
      }
  };

  useEffect(() => {
    if (user && user.fullName) {
      form.setFieldsValue({ staffName: user.fullName });
    }
    form.setFieldsValue({ isSpecialColor: false });
  }, [user, form]);

  return (
    <div style={{ backgroundColor: "#1f2937", minHeight: "100vh", padding: 40 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", background: "#fff", borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: 25, fontWeight: 700, color: "#059669", margin: "0 0 24px 0", textAlign: "center" }}>
          Tạo báo giá / Đơn hàng
        </h2>

        <Row gutter={24}>
          <Col span={10}>
            <Card
              title="1. Chọn Mẫu xe"
              style={carSelectionError ? { border: "1px solid #ff4d4f" } : {}}
              headStyle={{ backgroundColor: "#f9fafb" }}
            >
              <Spin spinning={carLoading}>
                <Table
                  dataSource={carList}
                  columns={[
                    { title: "Mẫu xe - Tên xe", dataIndex: "modelName" },
                    { title: "Giá", width: 80, render: () => <Tag color="red">LIÊN HỆ</Tag> },
                  ]}
                  rowSelection={{
                    type: "radio",
                    selectedRowKeys: selectedCar ? [selectedCar.key] : [],
                    onChange: (_, r) => handleCarSelect(r[0]),
                  }}
                  pagination={false}
                  scroll={{ y: 400 }}
                  size="small"
                />
              </Spin>
            </Card>
          </Col>

          <Col span={14}>
            <Card title="2. Thông tin đơn hàng">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onValidateFailed}
                initialValues={{ isSpecialColor: false }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Tên Khách hàng" name="customerName" rules={[{ required: true, message: "Nhập tên khách!" }]}>
                      <Input placeholder="Nguyen Van A" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="SĐT Khách hàng" name="customerPhone" rules={[{ required: true, message: "Nhập SĐT!" }]}>
                      <Input placeholder="090xxxxxxx" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Tuỳ chọn màu" style={{ marginBottom: 12 }}>
                  <Form.Item name="isSpecialColor" valuePropName="checked" noStyle>
                    <Switch
                      checkedChildren="Màu đặc biệt (Special)"
                      unCheckedChildren="Màu tiêu chuẩn (Standard)"
                      onChange={handleColorChange}
                    />
                  </Form.Item>
                </Form.Item>

                {selectedCar && (
                  <Form.Item
                    label="Tổng tiền chốt (Total Amount)"
                    name="totalAmount"
                    extra="Giá bán thực tế đàm phán với khách hàng."
                    rules={[{ required: true, message: "Vui lòng nhập tổng tiền!" }]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: "100%" }}
                      formatter={(value) => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={(value) => value.replace(/\₫\s?|(,*)/g, "")}
                      size="large"
                      placeholder="Nhập giá chốt với khách"
                    />
                  </Form.Item>
                )}

                <Form.Item label="Nhân viên phụ trách" name="staffName">
                  <Input disabled />
                </Form.Item>

                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea rows={2} />
                </Form.Item>

                <Button type="primary" icon={<SendOutlined />} htmlType="submit" loading={loading} disabled={!selectedCar} block size="large" style={{ marginTop: 10 }}>
                  Tạo Đơn Hàng
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title={<div style={{ color: "#059669" }}><CheckCircleOutlined /> Tạo thành công</div>}
        open={isSuccessModalOpen}
        onCancel={() => setIsSuccessModalOpen(false)}
        footer={<Button type="primary" onClick={() => setIsSuccessModalOpen(false)}>Đóng</Button>}
      >
        {successData && (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text>Đơn hàng <b>#{successData.id}</b> đã được tạo.</Text>
            <Text>Khách hàng: <b>{successData.customer?.fullName}</b></Text>
            <Text>Trạng thái: <Tag color="orange">{successData.status}</Tag></Text>
            <Space style={{ marginTop: 16, borderTop: "1px solid #eee", paddingTop: 16, width: "100%" }}>
              <Button icon={<FilePdfOutlined />} href={successData.quotationUrl} target="_blank">Xem Báo giá</Button>
              <Button icon={<FilePdfOutlined />} href={successData.contractUrl} target="_blank">Xem Hợp đồng</Button>
            </Space>
          </Space>
        )}
      </Modal>
    </div>
  );
}