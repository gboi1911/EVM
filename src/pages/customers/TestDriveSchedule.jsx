// ✅ Updated Unified Layout (Same as OrderPage.jsx)
// src/pages/customers/TestDriveSchedule.jsx

import {
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  message,
  Space,
  List,
  Typography,
  Popconfirm,
  Card,
  Row,
  Col,
} from "antd";
import { useEffect, useState } from "react";
import {
  getAllSlots,
  bookTestDrive,
  getBookingsForSlot,
  cancelBooking,
} from "../../api/testDrive";
import { EyeOutlined, UserDeleteOutlined, LockOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

const formatDateTime = (dateTimeString) => {
  return new Date(dateTimeString).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

export default function TestDriveSchedule() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form] = Form.useForm();

  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [manageModalLoading, setManageModalLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await getAllSlots();
      setSlots(response.data);
    } catch {
      message.error("Không tải được danh sách slot");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const openBookingModal = (slot) => {
    setSelectedSlot(slot);
    setIsBookModalOpen(true);
  };

  const handleBookingModalCancel = () => {
    setIsBookModalOpen(false);
    setSelectedSlot(null);
    form.resetFields();
  };

  const handleBooking = async (values) => {
    const payload = {
      slotId: selectedSlot.id,
      customerPhone: values.customerPhone,
    };

    try {
      setFormLoading(true);
      await bookTestDrive(payload);
      message.success("Đặt lịch thành công!");
      handleBookingModalCancel();
      fetchSlots();
    } catch {
      message.error("Đặt lịch thất bại");
    } finally {
      setFormLoading(false);
    }
  };

  const fetchBookingsForSlot = async (slotId) => {
    try {
      setManageModalLoading(true);
      const response = await getBookingsForSlot(slotId);
      setBookings(response.data);
    } catch {
      message.error("Lỗi tải danh sách booking");
    } finally {
      setManageModalLoading(false);
    }
  };

  const openManageModal = (slot) => {
    setSelectedSlot(slot);
    setIsManageModalOpen(true);
    fetchBookingsForSlot(slot.id);
  };

  const handleManageModalCancel = () => {
    setIsManageModalOpen(false);
    setSelectedSlot(null);
    setBookings([]);
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      message.success(`Đã hủy booking #${bookingId}`);
      fetchBookingsForSlot(selectedSlot.id);
      fetchSlots();
    } catch {
      message.error("Hủy booking thất bại");
    }
  };

  return (
    <div style={{ backgroundColor: "#1f2937", minHeight: "100vh", padding: 40 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2
          style={{
              fontSize: 25,
          fontWeight: 700,
            color: "#059669",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Lịch hẹn lái thử
        </h2>

        <Spin spinning={loading}>
          <Row gutter={[20, 20]}>
            {slots.map((slot) => {
              const isFull = slot.bookedCount >= slot.amount;
              return (
                <Col xs={24} sm={12} md={8} key={slot.id}>
                  <Card
                    hoverable={!isFull}
                    style={{
                      borderRadius: 12,
                      border: isFull ? "1px solid #ff4d4f" : "1px solid #e5e7eb",
                      background: isFull ? "#fff5f5" : "#ffffff",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <Title level={4} style={{ marginBottom: 4, color: "#111" }}>
                      {slot.carName}
                    </Title>
                    <Text type="secondary" style={{ display: "block" }}>
                      {formatDateTime(slot.startTime)} — {formatDateTime(slot.endTime)}
                    </Text>

                    <div style={{ marginTop: 12 }}>
                      <Tag color={isFull ? "red" : "green"}>
                        {isFull ? "Đã đầy" : "Còn chỗ"} ({slot.bookedCount}/{slot.amount})
                      </Tag>
                    </div>

                    <Space style={{ marginTop: 16 }}>
                      {!isFull ? (
                        <Button type="primary" onClick={() => openBookingModal(slot)}>
                          Đặt lịch
                        </Button>
                      ) : (
                        <Button disabled icon={<LockOutlined />}>
                          Slot Full
                        </Button>
                      )}

                      <Button icon={<EyeOutlined />} onClick={() => openManageModal(slot)}>
                        Xem
                      </Button>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Spin>
      </div>

      {/* Modal Booking */}
      <Modal
        title={`Đặt lịch lái thử xe: ${selectedSlot?.carName}`}
        open={isBookModalOpen}
        onCancel={handleBookingModalCancel}
        footer={[
          <Button key="cancel" onClick={handleBookingModalCancel}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" loading={formLoading} onClick={() => form.submit()}>
            Xác nhận đặt
          </Button>,
        ]}
      >
        <p>
          Thời gian:{" "}
          <b>{formatDateTime(selectedSlot?.startTime)}</b> —{" "}
          <b>{formatDateTime(selectedSlot?.endTime)}</b>
        </p>
        <Form form={form} layout="vertical" onFinish={handleBooking}>
          <Form.Item
            name="customerPhone"
            label="SĐT Khách hàng"
            rules={[{ required: true, message: "Nhập SĐT" }]}
          >
            <Input placeholder="0901234567" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Manage Bookings */}
      <Modal
        title={`Booking Slot #${selectedSlot?.id} — ${selectedSlot?.carName}`}
        open={isManageModalOpen}
        onCancel={handleManageModalCancel}
        footer={<Button onClick={handleManageModalCancel}>Đóng</Button>}
      >
        <Spin spinning={manageModalLoading}>
          <List
            header={<b>Danh sách khách đã đặt:</b>}
            bordered
            dataSource={bookings}
            locale={{ emptyText: "Chưa có ai đặt" }}
            renderItem={(b) => (
              <List.Item
                actions={[
                  <Popconfirm
                    title="Hủy booking?"
                    onConfirm={() => handleCancelBooking(b.id)}
                    okText="Hủy"
                    cancelText="Không"
                  >
                    <Button danger icon={<UserDeleteOutlined />} type="link" />
                  </Popconfirm>,
                ]}
              >
                <Text>
                  Booking #{b.id} — <b>{b.customerPhone}</b>
                </Text>
              </List.Item>
            )}
          />
        </Spin>
      </Modal>
    </div>
  );
}
