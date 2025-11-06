// src/pages/sales/DeliveryTrackingPage.jsx
import React, { useState, useEffect } from "react";
// THÊM MỚI: Imports cho Modal, Form, Button...
import { 
  Spin, message, Tag, Card, Steps, Button, Modal, Form, InputNumber, Select 
} from "antd";
import { 
  CarOutlined, UserOutlined, DollarOutlined, CheckCircleOutlined,
  FileTextOutlined, TruckOutlined, HomeOutlined, SmileOutlined, PlusOutlined
} from "@ant-design/icons";

// THAY ĐỔI 1: Import API thật
import { getListOrders, addPaymentToOrder } from "../../api/order";

const { Step } = Steps;

// THAY ĐỔI 2: Xóa hàm getListOrders "giả" (mock)

// Các bước trong timeline
const deliverySteps = [
  { title: "Đã tạo đơn", description: "Đơn hàng được tạo", icon: <FileTextOutlined />, status: "PENDING" },
  { title: "Đã duyệt", description: "Đã phê duyệt", icon: <CheckCircleOutlined />, status: "APPROVED" },
  { title: "Đang vận chuyển", description: "Xe đang được giao", icon: <TruckOutlined />, status: "IN_DELIVERY" },
  { title: "Đã giao", description: "Giao xe thành công", icon: <HomeOutlined />, status: "DELIVERED" },
  { title: "Hoàn tất", description: "Đơn hàng hoàn tất", icon: <SmileOutlined />, status: "COMPLETED" }
];

// Từ điển dịch paymentStatus
const paymentStatusMap = {
  PENDING: { color: "#ef4444", text: "Chưa thanh toán" },
  DEPOSIT_PAID: { color: "#f59e0b", text: "Đã cọc" },
  PARTIAL: { color: "#f59e0b", text: "Thanh toán 1 phần" },
  PAID: { color: "#10b981", text: "Đã thanh toán đủ" },
};

// Từ điển dịch order status sang tiếng Việt
const orderStatusMap = {
  PENDING: { text: "Đã tạo đơn", color: "#6b7280" },
  APPROVED: { text: "Đã duyệt", color: "#3b82f6" },
  IN_DELIVERY: { text: "Đang vận chuyển", color: "#f59e0b" },
  DELIVERED: { text: "Đã giao", color: "#10b981" },
  COMPLETED: { text: "Hoàn tất", color: "#059669" }
};

export default function DeliveryTrackingPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // THÊM MỚI: State cho Modal thanh toán
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentFormLoading, setPaymentFormLoading] = useState(false);
  const [paymentForm] = Form.useForm();
  
  // Hàm fetch data (đổi tên để rõ nghĩa)
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const res = await Promise.all([
        getListOrders({ status: "PENDING" }),
        getListOrders({ status: "APPROVED" }),
        getListOrders({ status: "IN_DELIVERY" }),
        getListOrders({ status: "DELIVERED" }),
      ]);

      const allOrders = [...res[0].data, ...res[1].data, ...res[2].data, ...res[3].data];
      const sortedOrders = allOrders.sort((a, b) => a.id - b.id);
      setOrders(sortedOrders);

      // Cập nhật lại selectedOrder nếu nó tồn tại
      if (selectedOrder) {
        const updatedSelected = sortedOrders.find(o => o.id === selectedOrder.id);
        setSelectedOrder(updatedSelected);
      } else if (sortedOrders.length > 0) {
        setSelectedOrder(sortedOrders[0]);
      }
      
    } catch {
      message.error("Không tải được dữ liệu giao xe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const getCurrentStep = (status) => {
    const stepIndex = deliverySteps.findIndex(step => step.status === status);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  // THÊM MỚI: Xử lý submit Modal thanh toán
  const handlePaymentSubmit = async (values) => {
    const payload = {
      amount: values.amount,
      type: values.type,
    };
    
    try {
      setPaymentFormLoading(true);
      // Gọi API
      await addPaymentToOrder(selectedOrder.id, payload);
      message.success("Ghi nhận thanh toán thành công!");
      
      // Đóng modal và reset
      setPaymentModalOpen(false);
      paymentForm.resetFields();
      
      // Tải lại toàn bộ dữ liệu để cập nhật (quan trọng)
      await fetchAllOrders(); 

    } catch (err) {
      message.error("Ghi nhận thanh toán thất bại: " + err.message);
    } finally {
      setPaymentFormLoading(false);
    }
  };


  // Component OrderListItem (Giữ nguyên)
  const OrderListItem = ({ order, isSelected, onClick }) => {
    const img = order.car?.carImages?.[0]?.fileUrl;
    const statusInfo = orderStatusMap[order.status] || { text: order.status, color: "#6b7280" };

    return (
      <Card
        hoverable
        onClick={onClick}
        style={{
          marginBottom: 12, borderRadius: 8,
          border: isSelected ? "2px solid #3b82f6" : "1px solid #e5e7eb",
          background: isSelected ? "#f0f9ff" : "white",
          cursor: "pointer", transition: "all 0.3s",
        }}
        bodyStyle={{ padding: 12 }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {img && (
            <img
              src={img} alt={order.car?.carName}
              style={{
                width: 60, height: 45, objectFit: "cover",
                borderRadius: 6, background: "#f3f4f6",
              }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ 
              fontWeight: 600, fontSize: 13, marginBottom: 2,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>
              {order.car?.carName || "N/A"}
            </div>
            <div style={{ 
              fontSize: 11, color: "#6b7280", display: "flex",
              alignItems: "center", gap: 4, marginBottom: 2
            }}>
              <UserOutlined style={{ fontSize: 10 }} />
              {order.customer?.fullName || "N/A"}
            </div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>
              ID: #{order.id}
            </div>
          </div>
          <Tag color={statusInfo.color} style={{ fontSize: 10, margin: 0 }}>
            {statusInfo.text}
          </Tag>
        </div>
      </Card>
    );
  };

  // Component OrderDetailView (Cập nhật)
  const OrderDetailView = ({ order }) => {
    if (!order) {
      return (
        <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center", padding: 40 }}>
          <p style={{ color: "#6b7280", margin: 0 }}>Chọn một đơn hàng để xem chi tiết</p>
        </Card>
      );
    }

    const img = order.car?.carImages?.[0]?.fileUrl;
    const payInfo = paymentStatusMap[order.paymentStatus] || { text: order.paymentStatus, color: "#6b7280" };
    const paymentPercent = (order.totalAmount > 0) ? ((order.amountPaid / order.totalAmount) * 100).toFixed(0) : 0;
    const currentStep = getCurrentStep(order.status);
    const statusInfo = orderStatusMap[order.status] || { text: order.status, color: "#6b7280" };
    
    // Kiểm tra xem đã thanh toán đủ chưa
    const isFullyPaid = payInfo.text === "Đã thanh toán đủ";

    return (
      <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          {img && (
            <img
              src={img} alt={order.car?.carName}
              style={{
                width: 120, height: 80, objectFit: "cover",
                borderRadius: 8, background: "#f3f4f6",
              }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>
              {order.car?.carName}
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <UserOutlined style={{ color: "#6b7280" }} />
              <span style={{ color: "#6b7280" }}>{order.customer?.fullName}</span>
            </div>
            <div style={{ color: "#9ca3af", fontSize: 14 }}>
              Mã đơn: #{order.id}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: 24 }}>
          <Steps current={currentStep} size="small">
            {deliverySteps.map((step, index) => (
              <Step
                key={step.title}
                title={step.title}
                description={index <= currentStep ? step.description : ""}
                icon={step.icon}
                status={index < currentStep ? "finish" : index === currentStep ? "process" : "wait"}
              />
            ))}
          </Steps>
        </div>

        {/* Payment Info */}
        <Card
          title={
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><DollarOutlined /> Thông tin thanh toán</span>
              {/* THÊM MỚI: Nút Thêm thanh toán */}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="small"
                onClick={() => setPaymentModalOpen(true)}
                disabled={isFullyPaid} // Vô hiệu hóa nếu đã trả đủ
              >
                Ghi nhận
              </Button>
            </span>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <div style={{ marginBottom: 12 }}>
            <div style={{ 
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 8
            }}>
              <span style={{ color: "#6b7280" }}>Tiến độ thanh toán</span>
              <span style={{ fontWeight: 600, color: payInfo.color }}>
                {paymentPercent}%
              </span>
            </div>
            <div style={{ 
              height: 6, background: "#e5e7eb", borderRadius: 3,
              overflow: "hidden", marginBottom: 8
            }}>
              <div
                style={{
                  height: "100%", width: `${paymentPercent}%`,
                  background: payInfo.color, transition: "width 0.3s",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              {/* Sửa đơn vị tiền tệ */}
              <span>${order.amountPaid.toLocaleString()}</span>
              <span style={{ color: "#9ca3af" }}>
                / ${order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
          <Tag style={{ fontSize: 12, border: "none", borderRadius: 4, padding: "4px 8px" }} color={payInfo.color}>
            {payInfo.text}
          </Tag>
        </Card>

        {/* Status Summary */}
        <Card title="Trạng thái hiện tại" size="small">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 12, height: 12, borderRadius: "50%",
              background: statusInfo.color
            }} />
            <span>{statusInfo.text}</span>
          </div>
        </Card>
      </Card>
    );
  };

  // Component Trang chính
  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          background: "white", borderRadius: 12, padding: "20px 24px",
          marginBottom: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}>
          <h2 style={{
            fontSize: 25, fontWeight: 700, color: "#059669",
            margin: 0, display: "flex", alignItems: "center",
            justifyContent: "center", gap: 8,
          }}>
            Theo dõi giao xe
          </h2>
        </div>

        {loading ? (
          <div style={{ background: "white", borderRadius: 12, padding: 60, textAlign: "center" }}>
            <Spin size="large" />
          </div>
        ) : orders.length === 0 ? (
          <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center" }}>
            <p style={{ color: "#6b7280", margin: 0 }}>Chưa có đơn giao xe nào</p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 24 }}>
            {/* Order List */}
            <div style={{ width: 320 }}>
              <Card title={`Đơn hàng (${orders.length})`} style={{ borderRadius: 12 }}>
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  {orders.map(order => (
                    <OrderListItem
                      key={order.id}
                      order={order}
                      isSelected={selectedOrder?.id === order.id}
                      onClick={() => setSelectedOrder(order)}
                    />
                  ))}
                </div>
              </Card>
            </div>

            {/* Order Detail */}
            <div style={{ flex: 1 }}>
              <OrderDetailView order={selectedOrder} />
            </div>
          </div>
        )}
      </div>

      {/* THÊM MỚI: Modal Ghi nhận thanh toán */}
      <Modal
        title={`Ghi nhận thanh toán cho Đơn #${selectedOrder?.id}`}
        open={paymentModalOpen}
        onCancel={() => setPaymentModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setPaymentModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={paymentFormLoading}
            onClick={() => paymentForm.submit()}
          >
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handlePaymentSubmit}
        >
          <Form.Item
            name="amount"
            label="Số tiền thanh toán"
            rules={[{ required: true, message: "Vui lòng nhập số tiền" }]}
          >
            <InputNumber
              min={1}
              style={{ width: "100%" }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Nhập số tiền"
            />
          </Form.Item>
          <Form.Item
            name="type"
            label="Hình thức"
            rules={[{ required: true, message: "Vui lòng chọn hình thức" }]}
          >
            <Select placeholder="Chọn hình thức thanh toán">
              {/* Dựa trên API, bạn có 2 loại */}
              <Select.Option value="IN_FULL">Trả thẳng (In Full)</Select.Option>
              <Select.Option value="INSTALLMENT">Trả góp (Installment)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}