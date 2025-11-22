// src/pages/customers/TestDriveSchedule.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
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
  Form,
  Input,
} from "antd";
import {
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getAllSlots,
  getBookingsForSlot,
  cancelBooking,
  deleteSlot,
  bookTestDrive,
} from "../../api/testDrive.js";
import { listCustomers } from "../../api/customer.js";
import { useAuth } from "../../context/AuthContext.jsx";
import moment from "moment";
import "moment/locale/vi";

const { Title } = Typography;
moment.locale("vi");

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

  const { user, loading: authLoading } = useAuth();
  const isManager = user && user.role === "DEALER_MANAGER";

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slotRes, customerRes] = await Promise.all([
        getAllSlots(),
        listCustomers({ pageNo: 0, pageSize: 500 }),
      ]);

      const sortedSlots = (slotRes.data || []).sort(
        (a, b) => new Date(a.startTime) - new Date(b.startTime)
      );
      setSlots(sortedSlots);

      const newCustomerMap = new Map();
      const customerList = customerRes.data?.customerDetailGetDtos || [];
      customerList.forEach((customer) => {
        if (customer.phone && customer.fullName) {
          newCustomerMap.set(customer.phone, customer.fullName);
        }
      });
      setCustomerMap(newCustomerMap);
    } catch (err) {
      message.error("Lỗi khi tải dữ liệu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  // --- CÁC HÀM XỬ LÝ ---
  const handleViewDetails = async (slot) => {
    setViewModalOpen(true);
    setModalLoading(true);
    setCurrentSlot(slot);
    setBookings([]);
    try {
      const res = await getBookingsForSlot(slot.id);
      setBookings(res.data || []);
    } catch (err) {
      message.error("Không tải được danh sách người đặt");
    } finally {
      setModalLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      message.success("Hủy đặt chỗ thành công!");
      setBookings((prev) =>
        prev.filter((booking) => booking.id !== bookingId)
      );
      fetchData();
    } catch (err) {
      message.error("Hủy đặt chỗ thất bại: " + err.message);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteSlot(slotId);
      message.success("Xóa slot thành công!");
      fetchData();
    } catch (err) {
      message.error("Xóa slot thất bại");
    }
  };

  const handleOpenBookingModal = (slot) => {
    if (slot.bookedCount >= slot.numCustomers) {
      message.warning("Slot này đã đầy. Không thể đặt thêm.");
      return;
    }
    setCurrentSlot(slot);
    setBookingModalOpen(true);
    bookingForm.resetFields();
  };

  const onFinishBooking = async (values) => {
    setBookingLoading(true);
    try {
      const customerList = await listCustomers({ pageNo: 0, pageSize: 500 });
      const existing = customerList.data.customerDetailGetDtos.find(
        (c) => c.phone === values.customerPhone
      );

      if (existing && existing.dealerId !== user.dealerId) {
        message.error("Khách hàng này thuộc đại lý khác, không thể đặt chỗ!");
        setBookingLoading(false);
        return;
      }

      await bookTestDrive({
        slotId: currentSlot.id,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
      });

      message.success("Đặt lịch thành công!");
      setBookingModalOpen(false);
      fetchData();
    } catch (err) {
      message.error("Lỗi khi đặt lịch: " + err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  // --- FORMAT NGÀY GIỜ ---
  const formatDate = (isoString) => moment(isoString).format("DD/MM/YYYY");
  const formatTime = (isoString) => moment(isoString).format("HH:mm");
  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    return moment(isoString).format("HH:mm [ngày] DD/MM/YYYY");
  };
  const getCarNameFromSlot = (slot) =>
    slot?.carModelInSlotDetailDto?.[0]?.carModelName || "Xe không xác định";

  // --- CẤU HÌNH CỘT MODAL ---
  const bookingColumns = useMemo(() => {
    const cols = [
      { title: "Mã đặt", dataIndex: "id" },
      { title: "Tên khách", dataIndex: "customerName" },
      { title: "SĐT Khách", dataIndex: "customerPhone" },
    ];
    if (!isManager) {
      cols.push({
        title: "Thao tác",
        key: "action",
        render: (_, record) => (
          <Popconfirm
            title="Hủy đặt chỗ của khách này?"
            onConfirm={() => handleCancelBooking(record.id)}
            okText="OK"
            cancelText="Không"
          >
            <Button type="link" danger>
              Hủy
            </Button>
          </Popconfirm>
        ),
      });
    }
    return cols;
  }, [isManager]);

  // --- CẤU HÌNH CỘT BẢNG CHÍNH ---
 const slotTableColumns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      render: (id) => `Slot ${id}`
    },
    {
      title: "Mẫu Xe",
      key: "carName",
      render: (slot) => getCarNameFromSlot(slot),
    },
    {
      title: "Ngày",
      dataIndex: "startTime",
      key: "date",
      render: (startTime) => formatDate(startTime),
    },
    {
      title: "Bắt đầu",
      dataIndex: "startTime",
      key: "start",
      render: (startTime) => formatTime(startTime),
    },
    {
      title: "Kết thúc",
      dataIndex: "endTime",
      key: "end",
      render: (endTime) => formatTime(endTime),
    },
    {
      title: "Đã đặt (Booked)",
      key: "booked",
      render: (slot) => (
        <Tag
          color={
            slot.bookedCount >= slot.numCustomers ? "red" : "blue"
          }
        >
          {slot.bookedCount} / {slot.numCustomers}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      // 🛠️ ĐÃ SỬA LỖI: Thêm từ khóa 'return' để hiển thị giao diện
      render: (slot) => {
        const isExpired = moment(slot.startTime).isBefore(moment());
        
        return (
          <Space size="small">
            {/* Nút Đặt chỗ (Chỉ Staff thấy) */}
            {!isManager && (
              <Button
                type="primary"
                ghost
                icon={<PlusOutlined />}
                onClick={() => handleOpenBookingModal(slot)}
                disabled={
                  slot.bookedCount >= slot.numCustomers || isExpired
                }
              >
                Đặt chỗ
              </Button>
            )}

            {/* Nút Xem (Cả 2 vai trò) */}
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(slot)}
            >
              Xem
            </Button>

            {/* Nút Xóa Slot (Chỉ Manager thấy) */}
            {isManager && (
              <Popconfirm
                title="Xóa toàn bộ slot này?"
                onConfirm={() => handleDeleteSlot(slot.id)}
                okText="OK"
                cancelText="Không"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                >
                  Xóa Slot
                </Button>
              </Popconfirm>
            )}

            {/* 🔶 LABEL MỚI: Đã quá hạn
                Dùng màu 'orange' để nổi bật nhưng khác màu đỏ của nút xóa
            */}
            {isExpired && (
              <Tag color="orange" style={{ marginLeft: 8 }}>
                Đã quá hạn
              </Tag>
            )}
          </Space>
        );
      },
    },
  ];

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", backgroundColor: "#f3f4f6" }}>
      <Title
        level={3}
        style={{ color: "#059669", textAlign: "center", marginBottom: 24 }}
      >
        Quản lý Lịch hẹn Lái thử
      </Title>

      <Card style={{ borderRadius: 12 }}>
        <Spin spinning={loading}>
          <Table
            columns={slotTableColumns}
            dataSource={slots}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: <Empty description="Chưa có slot lái thử nào được tạo" /> }}
          />
        </Spin>
      </Card>

      {/* Modal xem chi tiết */}
      <Modal
        title={`Slot: ${getCarNameFromSlot(
          currentSlot
        )} (${formatDateTime(currentSlot?.startTime)})`}
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Đóng
          </Button>,
        ]}
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

      {/* Modal đặt chỗ */}
      <Modal
        title={`Đặt chỗ cho slot: ${getCarNameFromSlot(currentSlot)}`}
        open={bookingModalOpen}
        onCancel={() => setBookingModalOpen(false)}
        confirmLoading={bookingLoading}
        footer={[
          <Button key="back" onClick={() => setBookingModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={bookingLoading}
            onClick={() => bookingForm.submit()}
          >
            Xác nhận đặt
          </Button>,
        ]}
      >
        <p>
          <b>Thời gian:</b> {formatDateTime(currentSlot?.startTime)}
        </p>
        <Form
          form={bookingForm}
          layout="vertical"
          onFinish={onFinishBooking}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            name="customerPhone"
            label="Số điện thoại khách hàng"
            rules={[{ required: true, message: "Vui lòng nhập SĐT!" }]}
          >
            <Input placeholder="Nhập SĐT (ví dụ: 0901234567)" />
          </Form.Item>

          <Form.Item
            name="customerName"
            label="Họ và tên Khách hàng"
            rules={[{ required: true, message: "Vui lòng nhập tên khách hàng!" }]}
          >
            <Input placeholder="Nhập họ và tên khách hàng" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}