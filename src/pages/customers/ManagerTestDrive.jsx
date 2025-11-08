// src/pages/customers/CreateTestDriveSlot.jsx
import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Select,
  InputNumber,
  DatePicker, // Sửa: Dùng DatePicker
  message,
  Spin,
  Card,
  Typography,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getAllCars } from "../../api/car.js"; // Lấy danh sách xe
import { createSlot } from "../../api/testDrive.js"; // Import hàm createSlot từ file của bạn
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

export default function CreateTestDriveSlot() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [carList, setCarList] = useState([]);
  const [carLoading, setCarLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Tải danh sách xe để chọn
  useEffect(() => {
    const fetchCars = async () => {
      try {
        // Gọi hàm với object (đã sửa ở các bước trước)
        const res = await getAllCars({ pageNo: 0, pageSize: 50 });
        setCarList(res.carInfoGetDtos || []);
      } catch (err) {
        message.error("Không tải được danh sách xe");
      } finally {
        setCarLoading(false);
      }
    };
    fetchCars();
  }, []);

  // 2. Xử lý khi nhấn nút "Tạo Slot"
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // THAY ĐỔI: Tạo payload khớp với API Swagger
      const payload = {
        carId: values.carId,
        amount: values.amount, // API Swagger dùng "amount"
        
        // API Swagger muốn 1 chuỗi ISO (đầy đủ ngày + giờ)
        startTime: values.startTime.toISOString(), 
        endTime: values.endTime.toISOString(),
      };

      await createSlot(payload); // Gọi hàm từ file testDrive.js
      message.success("Tạo slot lái thử mới thành công!");
      form.resetFields();
      
      // Tùy chọn: Quay lại trang xem lịch
      navigate("/customers/test-drive"); 

    } catch (err) {
      message.error("Tạo slot thất bại: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", padding: 40 }}>
      <Card
        style={{
          maxWidth: 700,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 12,
        }}
      >
        <Title level={3} style={{ color: "#059669", textAlign: "center" }}>
          Tạo Khung Giờ Lái Thử Mới
        </Title>
        <Spin spinning={carLoading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            {/* 1. Car ID */}
            <Form.Item
              name="carId"
              label="Chọn xe"
              rules={[{ required: true, message: "Vui lòng chọn xe!" }]}
            >
              <Select placeholder="Tìm và chọn xe cho buổi lái thử">
                {carList.map(car => (
                  <Option key={car.carId} value={car.carId}>
                    {car.carName} (ID: {car.carId})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* 2. Start Time (THAY ĐỔI) */}
            <Form.Item
              name="startTime"
              label="Thời gian Bắt đầu"
              rules={[{ required: true, message: "Vui lòng chọn ngày giờ bắt đầu!" }]}
            >
              <DatePicker
                showTime // Cho phép chọn cả giờ
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm" // Hiển thị cho thân thiện
              />
            </Form.Item>

            {/* 3. End Time (THAY ĐỔI) */}
            <Form.Item
              name="endTime"
              label="Thời gian Kết thúc"
              rules={[{ required: true, message: "Vui lòng chọn ngày giờ kết thúc!" }]}
            >
              <DatePicker
                showTime // Cho phép chọn cả giờ
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm"
              />
            </Form.Item>

            {/* 4. Amount (THAY ĐỔI) */}
            <Form.Item
              name="amount" // Sửa tên từ "maxSlots" thành "amount"
              label="Số lượng xe tối đa (Amount)"
              rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} placeholder="Ví dụ: 3" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
              
                style={{ width: "100%" }}
              >
                Tạo Slot
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}