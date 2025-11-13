// src/pages/customers/ManagerTestDrive.jsx
import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Select,
  InputNumber,
  DatePicker,
  message,
  Spin,
  Card,
  Typography,
} from "antd";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs"; 
import { useAuth } from "../../context/AuthContext.jsx"; 
import { 
  createSlot, 
  updateSlot, 
  getTrialCarModels, 
  getSlotById
} from "../../api/testDrive.js"; 
import { getDealerStaff } from "../../api/authen.js"; 

const { Title } = Typography;
const { Option } = Select;

export default function ManagerTestDrive() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [carList, setCarList] = useState([]);
  const [carLoading, setCarLoading] = useState(true);
  const [staffList, setStaffList] = useState([]); 
  const navigate = useNavigate();
  const { slotId } = useParams(); 
  const { user } = useAuth(); 

  // Tải cả xe VÀ nhân viên
  useEffect(() => {
    const fetchData = async () => {
      setCarLoading(true);
      try {
        const [carRes, staffRes] = await Promise.all([
          getTrialCarModels(),
          getDealerStaff({ pageNo: 0, pageSize: 100 }) 
        ]);
        
        setCarList(carRes.data || []);
        setStaffList(staffRes.userInfoGetDtos || []); 

      } catch (err) {
        message.error("Không tải được danh sách xe hoặc nhân viên: " + err.message);
      } finally {
        setCarLoading(false);
      }
    };
    fetchData();
  }, []);

  // (Hàm tải data Edit giữ nguyên)
  useEffect(() => {
    if (slotId) {
      const fetchSlot = async () => {
        try {
          const res = await getSlotById(slotId); 
          const slot = res.data;
          
          form.setFieldsValue({
            dealerStaffId: slot.dealerStaffId, 
            carModelId: slot.carModelInSlotDetailDto?.[0]?.carModelId, 
            startTime: slot.startTime ? dayjs(slot.startTime) : null,
            endTime: slot.endTime ? dayjs(slot.endTime) : null,
            numCustomers: slot.numCustomers || 1, 
            maxTrialCar: slot.carModelInSlotDetailDto?.[0]?.maxTrialCar || 1,
          });
        } catch (err) {
          message.error("Không tải được thông tin slot");
        }
      };
      fetchSlot();
    }
  }, [slotId, form]);

  // (Hàm Submit giữ nguyên)
  const onFinish = async (values) => {
    setLoading(true);
    try {
      if (slotId) {
        const updatePayload = {
          newStartTime: values.startTime.toISOString(),
          newEndTime: values.endTime.toISOString(),
          newNumCustomers: values.numCustomers,
        };
        await updateSlot(slotId, updatePayload);
        message.success("Cập nhật slot thành công!");

      } else {
        const payload = {
          dealerStaffId: values.dealerStaffId, 
          startTime: values.startTime.toISOString(),
          endTime: values.endTime.toISOString(),
          numCustomers: values.numCustomers, 
          carModelInSlotPostDto: { 
            carModelId: values.carModelId,
            maxTrialCar: values.maxTrialCar
          }
        };
        await createSlot(payload); 
        message.success("Tạo slot lái thử mới thành công!");
      }

      form.resetFields();
      navigate("/customers/test-drive"); 
    } catch (err) {
      message.error("Thao tác thất bại: " + err.message);
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
          {slotId ? "Chỉnh Sửa Khung Giờ Lái Thử" : "Tạo Khung Giờ Lái Thử Mới"}
        </Title>
        <Spin spinning={carLoading}>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            
            <Form.Item
              name="dealerStaffId"
              label="Chọn nhân viên phụ trách"
              rules={[{ required: true, message: "Vui lòng chọn nhân viên!" }]}
              disabled={!!slotId} 
            >
              <Select placeholder="Chọn nhân viên (DEALER_STAFF)">
                {staffList.map((staff) => (
                  // ❗️ SỬA LỖI Ở ĐÂY: Chỉ hiển thị staff.fullName
                  <Option key={staff.userId} value={staff.userId}>
                    {staff.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="carModelId"
              label="Chọn xe (Model)"
              rules={[{ required: true, message: "Vui lòng chọn xe!" }]}
              disabled={!!slotId} 
            >
              <Select placeholder="Chọn xe được phép lái thử">
                {carList.map((car) => (
                  <Option key={car.id} value={car.id}>
                    {car.carModelName} 
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="startTime"
              label="Thời gian Bắt đầu"
              rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
            >
              <DatePicker showTime style={{ width: "100%" }} format="DD/MM/YYYY HH:mm" />
            </Form.Item>

            <Form.Item
              name="endTime"
              label="Thời gian Kết thúc"
              rules={[{ required: true, message: "Vui lòng chọn thời gian!" }]}
            >
              <DatePicker showTime style={{ width: "100%" }} format="DD/MM/YYYY HH:mm" />
            </Form.Item>
            
            <Form.Item
              name="numCustomers" 
              label="Số lượng khách tối đa (Num of Customers)"
              rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} placeholder="Ví dụ: 5" />
            </Form.Item>

            <Form.Item
              name="maxTrialCar"
              label="Số lượng xe tối đa cho model này (Max Trial Car)"
              rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              disabled={!!slotId} 
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
                {slotId ? "Cập nhật Slot" : "Tạo Slot"}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}