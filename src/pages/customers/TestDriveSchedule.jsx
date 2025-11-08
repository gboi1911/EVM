// src/pages/customers/TestDriveSchedule.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  List,
  Card,
  Button,
  Typography,
  Spin,
  Modal,
  Table,
  Tag,
  message,
  Popconfirm,
  Space,
  Empty, 
  Form, // Dùng cho Form đặt chỗ
  Input, // Dùng cho Form đặt chỗ
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined, // Icon cho nút đặt chỗ
} from "@ant-design/icons";
import {
  getAllSlots,
  getBookingsForSlot,
  cancelBooking,
  deleteSlot, 
  bookTestDrive, // API đặt chỗ
} from "../../api/testDrive.js"; 
import { listCustomers, createCustomer } from "../../api/customer.js"; // THÊM MỚI: Import createCustomer
import { useAuth } from "../../context/AuthContext.jsx"; 
import moment from 'moment'; 
import 'moment/locale/vi'; 

const { Title, Text } = Typography;
moment.locale('vi'); 

export default function TestDriveSchedule() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerMap, setCustomerMap] = useState(new Map());
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [currentSlot, setCurrentSlot] = useState(null); 
  const [bookings, setBookings] = useState([]); 

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingForm] = Form.useForm(); 
  
  // THÊM MỚI: State để kiểm tra khách mới
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const { user } = useAuth(); 
  const isManager = user && user.role === 'DEALER_MANAGER';

  // Tải cả Slot và Khách hàng
  const fetchData = async () => {
    setLoading(true);
    try {
      const [slotRes, customerRes] = await Promise.all([
        getAllSlots(), 
        listCustomers({ pageNo: 0, pageSize: 500 }) // (Đã sửa)
      ]);

      setSlots(slotRes.data || []);

      const newMap = new Map();
      const customerList = customerRes.data?.customerDetailGetDtos || []; // (Đã sửa)
      customerList.forEach(customer => {
        if(customer.phone && customer.fullName) {
          newMap.set(customer.phone, customer.fullName);
        }
      });
      setCustomerMap(newMap);

    } catch (err) {
      message.error("Lỗi khi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // (Nhóm slot giữ nguyên)
  const groupedSlots = useMemo(() => {
    const sortedSlots = [...slots].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    return sortedSlots.reduce((acc, slot) => {
      const dayKey = moment(slot.startTime).format('dddd, DD/MM/YYYY');
      if (!acc[dayKey]) { acc[dayKey] = []; }
      acc[dayKey].push(slot);
      return acc;
    }, {});
  }, [slots]);

  // (Hàm xem chi tiết, hủy, xóa... giữ nguyên)
  const handleViewDetails = async (slot) => {
    setViewModalOpen(true);
    setModalLoading(true);
    setCurrentSlot(slot);
    setBookings([]);
    try {
      const res = await getBookingsForSlot(slot.id);
      setBookings(res.data || []);
    } catch (err) { message.error("Không tải được danh sách người đặt"); }
    finally { setModalLoading(false); }
  };
  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      message.success("Hủy đặt chỗ thành công!");
      handleViewDetails(currentSlot); 
      fetchData(); 
    } catch (err) { message.error("Hủy đặt chỗ thất bại"); }
  };
  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteSlot(slotId);
      message.success("Xóa slot thành công!");
      fetchData(); 
    } catch (err) { message.error("Xóa slot thất bại"); }
  };
  
  // Hàm mở Modal đặt chỗ
  const handleOpenBookingModal = (slot) => {
    if (slot.bookedCount >= slot.amount) {
      message.warning("Slot này đã đầy. Không thể đặt thêm.");
      return;
    }
    setCurrentSlot(slot); 
    setBookingModalOpen(true);
    setIsNewCustomer(false); // Reset
    bookingForm.resetFields(); 
  };
  
  // Hàm xử lý Form đặt chỗ (ĐÃ NÂNG CẤP)
  const onFinishBooking = async (values) => {
    setBookingLoading(true);
    try {
      // BƯỚC 1: Nếu là khách mới, tạo khách hàng trước
      if (isNewCustomer) {
        await createCustomer({
          fullName: values.customerName,
          phone: values.customerPhone,
          email: "", // Email/Address có thể tùy chọn
          address: ""
        });
      }
      
      // BƯỚC 2: Đặt lịch (API này chỉ cần SĐT)
      const payload = {
        slotId: currentSlot.id,
        customerPhone: values.customerPhone,
      };
      await bookTestDrive(payload); 
      
      message.success(`Đặt chỗ thành công cho SĐT: ${values.customerPhone}`);
      setBookingModalOpen(false); 
      fetchData(); // Tải lại (để cập nhật 2/5 -> 3/5 VÀ cập nhật "từ điển" khách hàng)
      
    } catch (err) {
      message.error("Đặt chỗ thất bại: " + err.message);
    } finally {
      setBookingLoading(false);
    }
  };
  
  // THÊM MỚI: Hàm "thông minh" tự động điền tên
  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    if (phone && customerMap.has(phone)) {
      // Nếu SĐT tồn tại -> Tự điền tên, khóa ô tên
      bookingForm.setFieldsValue({ customerName: customerMap.get(phone) });
      setIsNewCustomer(false);
    } else {
      // Nếu SĐT không tồn tại -> Mở khóa ô tên
      bookingForm.setFieldsValue({ customerName: '' });
      setIsNewCustomer(true);
    }
  };


  // Định dạng ngày giờ
  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    return moment(isoString).format('HH:mm [ngày] DD/MM/YYYY');
  };

  // Cột cho Modal XEM (giữ nguyên)
  const bookingColumns = [
    { title: "Mã đặt", dataIndex: "id" },
    { 
      title: "Tên khách",
      dataIndex: "customerPhone",
      render: (phone) => (customerMap.get(phone) || <Tag>Khách vãng lai</Tag>)
    },
    { title: "SĐT Khách", dataIndex: "customerPhone" },
    {
      title: "Thao tác", key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Hủy đặt chỗ của khách này?"
          onConfirm={() => handleCancelBooking(record.id)}
        >
          <Button type="link" danger>Hủy</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", backgroundColor: "#f3f4f6" }}>
      <Title level={3} style={{ color: "#059669", textAlign: "center", marginBottom: 24 }}>
        Quản lý Lịch hẹn Lái thử
      </Title>

      <Spin spinning={loading}>
        {Object.keys(groupedSlots).length === 0 ? (
          <Card style={{ borderRadius: 12 }}>
            <Empty description="Chưa có slot lái thử nào được tạo" />
          </Card>
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {Object.entries(groupedSlots).map(([day, slotsForDay]) => (
              <div key={day}>
                <Title level={4} style={{ color: '#1f2937', marginBottom: 16 }}>
                  {day}
                </Title>
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                  dataSource={slotsForDay}
                  renderItem={(slot) => (
                    <List.Item>
                      <Card
                        hoverable
                        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                        actions={[
                          <Button
                            type="primary"
                            ghost
                            icon={<PlusOutlined />}
                            onClick={() => handleOpenBookingModal(slot)}
                            disabled={slot.bookedCount >= slot.amount} 
                          >
                            Đặt chỗ
                          </Button>,
                          <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(slot)}
                          >
                            Xem
                          </Button>,
                          isManager && (
                            <Popconfirm
                              title="Xóa toàn bộ slot này?"
                              onConfirm={() => handleDeleteSlot(slot.id)}
                            >
                              <Button type="link" danger icon={<DeleteOutlined />}>
                                Xóa Slot
                              </Button>
                            </Popconfirm>
                          ),
                        ].filter(Boolean)} 
                      >
                        <Card.Meta
                          title={<span style={{ color: "#059669" }}>{slot.carName}</span>}
                        />
                        <div style={{ marginTop: 16, color: "#555" }}>
                          <Space direction="vertical" size="small">
                            <Text><CalendarOutlined style={{ marginRight: 8 }} /><b>Bắt đầu:</b> {formatDateTime(slot.startTime)}</Text>
                            <Text><CalendarOutlined style={{ marginRight: 8 }} /><b>Kết thúc:</b> {formatDateTime(slot.endTime)}</Text>
                            <Text><UserOutlined style={{ marginRight: 8 }} /><b>Đã đặt:</b> 
                              <Tag 
                                color={slot.bookedCount >= slot.amount ? "red" : "blue"}
                                style={{ marginLeft: 8, fontSize: 14 }}
                              >
                                {slot.bookedCount} / {slot.amount}
                              </Tag>
                            </Text>
                          </Space>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              </div>
            ))}
          </Space>
        )}
      </Spin>

      {/* Modal 1: XEM chi tiết (Giữ nguyên) */}
      <Modal
        title={`Slot: ${currentSlot?.carName} (${formatDateTime(currentSlot?.startTime)})`}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[ <Button key="close" onClick={() => setViewModalOpen(false)}>Đóng</Button> ]}
        width={600} 
      >
        <Spin spinning={modalLoading}>
          <Table
            columns={bookingColumns}
            dataSource={bookings}
            rowKey="id"
            pagination={false}
          />
        </Spin>
      </Modal>

      {/* NÂNG CẤP - Modal 2: ĐẶT CHỖ (Form thông minh) */}
      <Modal
        title={`Đặt chỗ cho slot: ${currentSlot?.carName}`}
        open={bookingModalOpen}
        onCancel={() => setBookingModalOpen(false)}
        confirmLoading={bookingLoading}
        footer={[
          <Button key="back" onClick={() => setBookingModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" loading={bookingLoading} onClick={() => bookingForm.submit()}>
            Xác nhận đặt
          </Button>,
        ]}
      >
        <p><b>Thời gian:</b> {formatDateTime(currentSlot?.startTime)}</p>
        <Form 
          form={bookingForm} 
          layout="vertical" 
          onFinish={onFinishBooking} 
          style={{marginTop: 24}}
        >
          <Form.Item
            name="customerPhone"
            label="Số điện thoại khách hàng"
            rules={[{ required: true, message: "Vui lòng nhập SĐT!" }]}
          >
            <Input 
              placeholder="Nhập SĐT (ví dụ: 0901234567)" 
              onChange={handlePhoneChange} // Tự động tra cứu
            />
          </Form.Item>
          
          <Form.Item
            name="customerName"
            label="Họ và tên Khách hàng"
            rules={[{ 
              required: isNewCustomer, // Chỉ bắt buộc nếu là khách mới
              message: "Vui lòng nhập tên khách hàng mới!" 
            }]}
          >
            <Input 
              placeholder="Tên sẽ tự động điền nếu SĐT đã tồn tại" 
              disabled={!isNewCustomer} // Khóa lại nếu là khách cũ
            />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}