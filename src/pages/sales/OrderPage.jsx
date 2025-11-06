// src/pages/sales/OrderPage.jsx
import {
  Table, Button, Tag, Modal, Spin, message, Space, Popconfirm, Timeline, Row, Col,
  Form, Input // THÊM MỚI: Thêm Form và Input cho Modal
} from "antd";
import { useEffect, useState } from "react";
import {
  getListOrders,
  getOrderById,
  updateOrder, // Dùng 'updateOrder' cho tất cả
  // cancelOrder, // Bỏ 'cancelOrder'
  getOrderActivities
} from "../../api/order";

const { TextArea } = Input;

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null); // Dùng cho cả 2 modal
  const [activities, setActivities] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // THÊM MỚI: State cho Modal "Lý do"
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonModalAction, setReasonModalAction] = useState(null); // "CANCELLED" or "REJECTED"
  const [reasonFormLoading, setReasonFormLoading] = useState(false);
  const [reasonForm] = Form.useForm();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getListOrders({ status: "PENDING" });
      setOrders(response.data);
    } catch (e) {
      message.error("Không tải được danh sách đơn");
    } finally {
      setLoading(false);
    }
  };

  // Mở Modal xem chi tiết
  const openDetail = async (record) => {
    setOpen(true);
    setModalLoading(true);
    setSelected(record); // Lưu đơn hàng đang chọn
    setActivities([]);

    try {
      const [detailResponse, activityResponse] = await Promise.all([
        getOrderById(record.id),
        getOrderActivities(record.id)
      ]);
      setSelected(detailResponse.data);
      setActivities(activityResponse.data.activities || []);
    } catch {
      message.error("Lỗi khi lấy chi tiết đơn");
    } finally {
      setModalLoading(false);
    }
  };

  // CẬP NHẬT: Hàm xử lý cập nhật (thêm 'note')
  const handleUpdateStatus = async (id, newStatus, note = "") => {
    try {
      // Gửi payload có cả status và note (lý do)
      const payload = { 
        status: newStatus, 
        note: note 
      };
      await updateOrder(id, payload);
      
      message.success(`Đơn hàng #${id} đã được chuyển sang ${newStatus}`);
      fetchOrders(); // Tải lại danh sách
    } catch (err) {
      message.error("Cập nhật trạng thái thất bại: " + err.message);
      // Ném lỗi để onFinish của Form biết
      throw err; 
    }
  };

  // --- (MỚI) Xử lý Modal "Lý do" ---
  const openReasonModal = (record, action) => {
    setSelected(record); // Lưu đơn hàng đang xử lý
    setReasonModalAction(action); // Lưu hành động (CANCELLED/REJECTED)
    setReasonModalOpen(true);
  };

  const handleReasonModalCancel = () => {
    setReasonModalOpen(false);
    reasonForm.resetFields();
    setSelected(null);
    setReasonModalAction(null);
  };

  // Khi submit Form Lý do
  const handleReasonSubmit = async (values) => {
    const { note } = values;
    const orderId = selected.id;
    const newStatus = reasonModalAction;
    
    setReasonFormLoading(true);
    try {
      // Gọi hàm update đã được cập nhật
      await handleUpdateStatus(orderId, newStatus, note);
      handleReasonModalCancel(); // Đóng modal nếu thành công
    } catch {
      // Lỗi đã được hiển thị bởi handleUpdateStatus
    } finally {
      setReasonFormLoading(false);
    }
  };
  // --- Hết phần xử lý Modal "Lý do" ---

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns = [
    { title: "Mã đơn", dataIndex: "id" },
    { title: "Khách hàng", dataIndex: ["customer", "fullName"] },
    { title: "Tên xe", dataIndex: ["car", "carName"] },
    {
      title: "Tổng tiền ($)",
      dataIndex: "totalAmount",
      render: (v) => v?.toLocaleString(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => <Tag color="orange">{s}</Tag>,
    },
    {
      title: "Thao tác",
      // CẬP NHẬT: Thay Popconfirm bằng Button
      render: (_, record) => (
        <Space size="small">
          <Button type="link" onClick={() => openDetail(record)}>
            Xem
          </Button>
          <Button
            type="link"
            style={{ color: "green" }}
            onClick={() => handleUpdateStatus(record.id, "APPROVED")} // Duyệt (không cần lý do)
          >
            Duyệt
          </Button>
          {/* MỚI: Nút Từ chối */}
          <Button
            type="link"
            danger
            onClick={() => openReasonModal(record, "REJECTED")}
          >
            Từ chối
          </Button>
          {/* SỬA: Nút Hủy */}
          <Button
            type="link"
            danger
            onClick={() => openReasonModal(record, "CANCELLED")}
          >
            Hủy
          </Button>
        </Space>
      ),
    },
  ];

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
          Quản lý đơn hàng (Chờ duyệt)
        </h2>

        {loading ? (
          <Spin style={{ display: "block", margin: "auto" }} />
        ) : (
          <Table columns={columns} dataSource={orders} rowKey="id" />
        )}

        {/* Modal Xem Chi Tiết (Không thay đổi) */}
        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
          title="Chi tiết đơn hàng"
          width={700}
        >
          {modalLoading ? <Spin /> : (
            <Row gutter={24}>
              <Col span={12}>
                <h4>Thông tin chính</h4>
                <p><b>Mã đơn:</b> {selected?.id}</p>
                <p><b>Khách hàng:</b> {selected?.customer.fullName}</p>
                <p><b>Liên hệ (KH):</b> {selected?.customer.phone}</p>
                <p><b>Xe:</b> {selected?.car.carName}</p>
                <p><b>Nhân viên phụ trách:</b> {selected?.staff.fullName}</p>
                <p><b>Tổng tiền:</b> {selected?.totalAmount?.toLocaleString()} $</p>
                <p><b>Trạng thái:</b> <Tag color="orange">{selected?.status}</Tag></p>
              </Col>
              <Col span={12}>
                <h4>Lịch sử đơn hàng</h4>
                <Timeline
                  items={activities.map(act => ({
                    color: act.status === 'PENDING' ? 'orange' : 'green',
                    children: `${act.status} - ${new Date(act.changedAt).toLocaleString('vi-VN')}`
                  }))}
                />
              </Col>
            </Row>
          )}
        </Modal>
        
        {/* THÊM MỚI: Modal Nhập Lý do */}
        <Modal
          title={reasonModalAction === "CANCELLED" ? "Lý do Hủy đơn" : "Lý do Từ chối"}
          open={reasonModalOpen}
          onCancel={handleReasonModalCancel}
          // Gắn nút OK của Modal vào Form
          footer={[
            <Button key="back" onClick={handleReasonModalCancel}>
              Đóng
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              danger 
              loading={reasonFormLoading}
              onClick={() => reasonForm.submit()} // Kích hoạt onFinish
            >
              Xác nhận
            </Button>,
          ]}
        >
          <Form
            form={reasonForm}
            layout="vertical"
            onFinish={handleReasonSubmit}
          >
            <p>Bạn đang {reasonModalAction === "CANCELLED" ? "Hủy" : "Từ chối"} đơn hàng <b>#{selected?.id}</b>.</p>
            <Form.Item
              name="note"
              label="Lý do (Bắt buộc)"
              rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}
            >
              <TextArea 
                rows={4} 
                placeholder="Ví dụ: Khách hàng đổi ý, hết xe trong kho..." 
              />
            </Form.Item>
          </Form>
        </Modal>

      </div>
    </div>
  );
}