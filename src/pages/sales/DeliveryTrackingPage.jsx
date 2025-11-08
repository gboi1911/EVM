// src/pages/sales/DeliveryTrackingPage.jsx
import React, { useState, useEffect } from "react";
import { 
  Spin, message, Tag, Card, Steps, Button, Modal, Form, InputNumber, Select 
} from "antd";
import { 
  CarOutlined, UserOutlined, DollarOutlined, CheckCircleOutlined,
  FileTextOutlined, TruckOutlined, HomeOutlined, SmileOutlined, PlusOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import { getListOrders, addPaymentToOrder, updateOrder } from "../../api/order";

const { Step } = Steps;

// Timeline các bước giao xe
const deliverySteps = [
  { title: "Đã tạo đơn", description: "Đơn hàng được tạo", icon: <FileTextOutlined />, status: "PENDING" },
  { title: "Đã duyệt", description: "Đã phê duyệt", icon: <CheckCircleOutlined />, status: "APPROVED" },
  { title: "Đang vận chuyển", description: "Xe đang được giao", icon: <TruckOutlined />, status: "IN_DELIVERY" },
  { title: "Đã giao", description: "Giao xe thành công", icon: <HomeOutlined />, status: "DELIVERED" },
  { title: "Hoàn tất", description: "Đơn hàng hoàn tất", icon: <SmileOutlined />, status: "COMPLETED" }
];

// Payment status map
const paymentStatusMap = {
  PENDING: { color: "#ef4444", text: "Chưa thanh toán" },
  DEPOSIT_PAID: { color: "#f59e0b", text: "Đã cọc" },
  PARTIAL: { color: "#f59e0b", text: "Thanh toán 1 phần" },
  PAID: { color: "#10b981", text: "Đã thanh toán đủ" },
};

// Order status map
const orderStatusMap = {
  PENDING: { text: "Đã tạo đơn", color: "#6b7280" },
  APPROVED: { text: "Đã duyệt", color: "#3b82f6" },
  IN_DELIVERY: { text: "Đang vận chuyển", color: "#f59e0b" },
  DELIVERED: { text: "Đã giao", color: "#10b981" },
  COMPLETED: { text: "Hoàn tất", color: "#059669" }
};

// Hành động tiếp theo dựa theo trạng thái
const nextStepMap = {
  PENDING: { next: "APPROVED", text: "Duyệt đơn", icon: <CheckCircleOutlined /> },
  APPROVED: { next: "IN_DELIVERY", text: "Bắt đầu Giao hàng", icon: <TruckOutlined /> },
  IN_DELIVERY: { next: "DELIVERED", text: "Xác nhận Đã giao", icon: <HomeOutlined /> },
  DELIVERED: { next: "COMPLETED", text: "Hoàn tất đơn", icon: <SmileOutlined /> },
  COMPLETED: null
};

export default function DeliveryTrackingPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentFormLoading, setPaymentFormLoading] = useState(false);
  const [paymentForm] = Form.useForm();

  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  // Lấy tất cả đơn hàng
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

  const handlePaymentSubmit = async (values) => {
    const payload = { amount: values.amount, type: values.type };
    
    try {
      setPaymentFormLoading(true);
      await addPaymentToOrder(selectedOrder.id, payload);
      message.success("Ghi nhận thanh toán thành công!");
      setPaymentModalOpen(false);
      paymentForm.resetFields();
      await fetchAllOrders();
    } catch (err) {
      message.error("Ghi nhận thanh toán thất bại: " + err.message);
    } finally {
      setPaymentFormLoading(false);
    }
  };
  
  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusUpdateLoading(true);
    try {
      await updateOrder(orderId, { status: newStatus });
      message.success(`Đã cập nhật trạng thái sang: ${newStatus}`);
      await fetchAllOrders();
    } catch (err) {
      message.error("Cập nhật trạng thái thất bại: " + err.message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  // Component Item List
  const OrderListItem = ({ order, isSelected, onClick }) => {
    const img = order.car?.carImages?.[0]?.fileUrl;
    const statusInfo = orderStatusMap[order.status] || { text: order.status, color: "#6b7280" };

    return (
      <Card
        hoverable onClick={onClick}
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
            <img src={img} alt={order.car?.carName}
              style={{ width: 60, height: 45, objectFit: "cover", borderRadius: 6, background: "#f3f4f6" }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {order.car?.carName || "N/A"}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
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

  // Component Detail
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

    // 🔹 Fix màu thanh khi 100%
    let progressColor = payInfo.color;
    if (paymentPercent >= 100) progressColor = "#10b981";

    const currentStep = getCurrentStep(order.status);
    const statusInfo = orderStatusMap[order.status] || { text: order.status, color: "#6b7280" };
    const isFullyPaid = paymentPercent >= 100;

    const nextAction = nextStepMap[order.status];

    return (
      <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          {img && (
            <img src={img} alt={order.car?.carName}
              style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8, background: "#f3f4f6" }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>{order.car?.carName}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <UserOutlined style={{ color: "#6b7280" }} />
              <span style={{ color: "#6b7280" }}>{order.customer?.fullName}</span>
            </div>
            <div style={{ color: "#9ca3af", fontSize: 14 }}>Mã đơn: #{order.id}</div>
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
              <Button
                type="primary" icon={<PlusOutlined />} size="small"
                onClick={() => setPaymentModalOpen(true)}
                disabled={isFullyPaid || order.status === 'COMPLETED'}
              >
                Ghi nhận
              </Button>
            </span>
          }
          size="small" style={{ marginBottom: 16 }}
        >
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ color: "#6b7280" }}>Tiến độ thanh toán</span>
              <span style={{ fontWeight: 600, color: progressColor }}>{paymentPercent}%</span>
            </div>
            <div style={{ height: 6, background: "#e5e7eb", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
              <div
                style={{
                  height: "100%", width: `${paymentPercent}%`,
                  background: progressColor,
                  transition: "width 0.3s",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span>${order.amountPaid.toLocaleString()}</span>
              <span style={{ color: "#9ca3af" }}>/ ${order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
          <Tag style={{ fontSize: 12, border: "none", borderRadius: 4, padding: "4px 8px" }} color={progressColor}>
            {payInfo.text}
          </Tag>
        </Card>

        {/* Actions */}
        {nextAction && (
          <Card title="Hành động" size="small">
            <p>Đơn hàng đang ở trạng thái: <b>{statusInfo.text}</b>.</p>
            <Button
              type="primary"
              icon={nextAction.icon}
              loading={statusUpdateLoading}
              onClick={() => handleUpdateStatus(order.id, nextAction.next)}
            >
              {nextAction.text}
            </Button>
          </Card>
        )}
        
      </Card>
    );
  };

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

            <div style={{ flex: 1 }}>
              <OrderDetailView order={selectedOrder} />
            </div>
          </div>
        )}
      </div>

      {/* Modal Ghi nhận thanh toán */}
      <Modal
        title={`Ghi nhận thanh toán cho Đơn #${selectedOrder?.id}`}
        open={paymentModalOpen}
        onCancel={() => {setPaymentModalOpen(false); paymentForm.resetFields();}}
        footer={[
          <Button key="back" onClick={() => {setPaymentModalOpen(false); paymentForm.resetFields();}}>
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
              <Select.Option value="IN_FULL">Trả thẳng (In Full)</Select.Option>
              <Select.Option value="INSTALLMENT">Trả góp (Installment)</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
}
