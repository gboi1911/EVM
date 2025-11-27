// src/pages/sales/DeliveryTrackingPage.jsx
import React, { useState, useEffect, useMemo } from "react"; 
import { 
  Spin, message, Tag, Card, Steps, Button, Modal, Form, InputNumber, Select 
} from "antd";
import { 
  UserOutlined, DollarOutlined, CheckCircleOutlined,
  FileTextOutlined, TruckOutlined, HomeOutlined, SmileOutlined, PlusOutlined,
  ShopOutlined 
} from "@ant-design/icons";
import { getListOrders, addPaymentToOrder, updateOrder } from "../../api/order";
import { useAuth } from "../../context/AuthContext"; 

const { Step } = Steps;

// 1. VIỆT HÓA & CẬP NHẬT TIMELINE (Thêm đầy đủ các bước)
const deliverySteps = [
  { title: "Chờ duyệt", description: "Đơn hàng mới tạo", icon: <FileTextOutlined />, status: "PENDING" },
  { title: "Đã duyệt", description: "Đã xác nhận đơn", icon: <CheckCircleOutlined />, status: "APPROVED" },
  { title: "Đang vận chuyển", description: "Xe đang trên đường giao", icon: <TruckOutlined />, status: "IN_DELIVERY" },
  { title: "Đã giao tới đại lý", description: "Xe đã tới kho", icon: <HomeOutlined />, status: "DELIVERED" },
  { title: "Về đại lý", description: "Sẵn sàng bàn giao", icon: <ShopOutlined />, status: "IN_DEALER" }, 
  { title: "Hoàn tất", description: "Quy trình kết thúc", icon: <SmileOutlined />, status: "COMPLETED" }
];

const paymentStatusMap = {
  PENDING: { color: "#ef4444", text: "Chưa thanh toán" },
  DEPOSIT_PAID: { color: "#f59e0b", text: "Đã đặt cọc" },
  PARTIAL: { color: "#f59e0b", text: "Thanh toán một phần" },
  PAID: { color: "#10b981", text: "Đã thanh toán đủ" },
  FINISHED: { color: "#10b981", text: "Đã thanh toán đủ" }, 
};

const orderStatusMap = {
  PENDING: { text: "Chờ duyệt", color: "orange" },   
  APPROVED: { text: "Đã duyệt", color: "cyan" },     
  IN_DELIVERY: { text: "Đang vận chuyển", color: "blue" }, 
  DELIVERED: { text: "Đã giao tới đại lý", color: "geekblue" }, 
  IN_DEALER: { text: "Đã về đại lý", color: "purple" },
  COMPLETED: { text: "Hoàn tất", color: "green" },   
  REJECTED: { text: "Đã từ chối", color: "red" },
  CANCELLED: { text: "Đã hủy", color: "gray" }
};

// 2. ACTION MAP: Chỉ định rõ trạng thái nào Dealer được thao tác
const nextStepMap = {
 
  PENDING:null, 
  
  // Các bước ở giữa do bộ phận khác lo, Dealer không bấm được
  APPROVED: null, 
  IN_DELIVERY: null, 
  DELIVERED: null,   

  // Dealer bấm nút này để Hoàn tất đơn hàng
  IN_DEALER: { next: "COMPLETED", text: "Bàn giao & Hoàn tất", icon: <SmileOutlined /> },
  
  COMPLETED: null,
  CANCELLED: null,
  REJECTED: null
};

export default function DeliveryTrackingPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentFormLoading, setPaymentFormLoading] = useState(false);
  const [paymentForm] = Form.useForm();

  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  
  const { user, loading: authLoading } = useAuth();
  const isManager = useMemo(() => user && user.role === "DEALER_MANAGER", [user]);

  // --- LẤY DANH SÁCH ĐƠN HÀNG (FULL STATUS) ---
  const fetchAllOrders = async () => {
    if (!user) return; 
    try {
      setLoading(true);
      // Lấy tất cả trạng thái để hiển thị đầy đủ
      const statuses = [
        "PENDING", "APPROVED", "IN_DELIVERY", 
        "DELIVERED", "IN_DEALER", "COMPLETED", 
        "CANCELLED", "REJECTED"
      ];
      
      const baseParams = {};
      if (user.role === "DEALER_STAFF") {
        baseParams.staffId = user.userId; 
      }
      
      const responses = await Promise.all(
        statuses.map(status => {
           const params = { ...baseParams, status };
           return getListOrders(params); 
        })
      );

      const allOrders = responses.flatMap(res => res.data || res || []);
      
      const filteredOrders = isManager 
        ? allOrders 
        : allOrders.filter(order => order.staff?.id == user.userId); 

      const uniqueOrders = [...new Map(filteredOrders.map(item => [item.id, item])).values()];
      const sortedOrders = uniqueOrders.sort((a, b) => a.id - b.id);
      
      setOrders(sortedOrders);

      if (selectedOrder) {
        const updatedSelected = sortedOrders.find(o => o.id === selectedOrder.id);
        setSelectedOrder(updatedSelected);
      } else if (sortedOrders.length > 0) {
        setSelectedOrder(sortedOrders[0]);
      }
      
    } catch(err) {
      message.error("Không tải được dữ liệu giao xe: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) { 
      fetchAllOrders();
    }
  }, [authLoading, user]); 

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
      const statusText = orderStatusMap[newStatus]?.text || newStatus;
      message.success(`Đã cập nhật trạng thái: ${statusText}`);
      await fetchAllOrders();
    } catch (err) {
      message.error("Cập nhật trạng thái thất bại: " + err.message);
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const OrderListItem = ({ order, isSelected, onClick }) => {
    const img = order.carDetail?.carImages?.[0]?.fileUrl;
    const statusInfo = orderStatusMap[order.status] || { text: order.status, color: "#6b7280" };
    const carName = order.carDetail?.carName || order.carModelGetDetailDto?.carModelName || "N/A";

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
            <img src={img} alt={carName}
              style={{ width: 60, height: 45, objectFit: "cover", borderRadius: 6, background: "#f3f4f6" }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {carName}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
              <UserOutlined style={{ fontSize: 10 }} />
              {order.customer?.fullName || "N/A"}
            </div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>ID: #{order.id}</div>
          </div>
          <Tag color={statusInfo.color} style={{ fontSize: 10, margin: 0 }}>
            {statusInfo.text}
          </Tag>
        </div>
      </Card>
    );
  };

  const OrderDetailView = ({ order }) => {
    if (!order) return <Card><p>Chọn một đơn hàng để xem chi tiết</p></Card>;

    const img = order.carDetail?.carImages?.[0]?.fileUrl;

    const paid = order.amountPaid || 0;
    const total = order.totalAmount || 0;
    const paymentPercent = total > 0 ? ((paid / total) * 100).toFixed(0) : 0;
    const isFullyPaid = paid >= total && total > 0;

    let payInfo;
    if (isFullyPaid) {
      payInfo = { text: "Đã thanh toán đủ", color: "#10b981" };
    } else {
      payInfo = paymentStatusMap[order.paymentStatus] || { text: order.paymentStatus, color: "#6b7280" };
    }

    let progressColor = payInfo.color;
    if (isFullyPaid) progressColor = "#10b981";

    const currentStep = getCurrentStep(order.status);
    const statusInfo = orderStatusMap[order.status] || { text: order.status, color: "#6b7280" };
    
    // Lấy action dựa trên status hiện tại (Theo Map đã cấu hình ở trên)
    const nextAction = nextStepMap[order.status];
    const carName = order.carDetail?.carName || order.carModelGetDetailDto?.carModelName || "N/A";

    // --- ĐÃ BỎ CHECK: !isFullyPaid ---
    // Cho phép hoàn tất đơn hàng bất kể trạng thái thanh toán
    // Backend sẽ tự xử lý công nợ

    return (
      <Card style={{ borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          {img && (
            <img src={img} alt={carName}
              style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8, background: "#f3f4f6" }}
            />
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#1f2937" }}>{carName}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <UserOutlined style={{ color: "#6b7280" }} />
              <span style={{ color: "#6b7280" }}>{order.customer?.fullName}</span>
            </div>
            <div style={{ color: "#9ca3af", fontSize: 14 }}>Mã đơn: #{order.id}</div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <Steps current={currentStep} size="small">
            {deliverySteps.map((step, index) => (
              <Step key={step.title} title={step.title} icon={step.icon}
                status={index < currentStep ? "finish" : index === currentStep ? "process" : "wait"}
              />
            ))}
          </Steps>
        </div>

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
              <div style={{ height: "100%", width: `${paymentPercent}%`, background: progressColor, transition: "width 0.3s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span>{paid.toLocaleString()} ₫</span>
              <span style={{ color: "#9ca3af" }}>/ {total.toLocaleString()} ₫</span>
            </div>
          </div>
          <Tag style={{ fontSize: 12, border: "none", borderRadius: 4, padding: "4px 8px" }} color={progressColor}>
            {payInfo.text}
          </Tag>
        </Card>

        {/* Chỉ hiển thị nút hành động nếu nextAction != null */}
        {nextAction && (
          <Card title="Hành động" size="small">
            <p>Đơn hàng đang ở trạng thái: <b>{statusInfo.text}</b>.</p>
            {/* Đã bỏ cảnh báo chữ đỏ ở đây */}
            
            <Button
              type="primary"
              icon={nextAction.icon}
              loading={statusUpdateLoading}
              onClick={() => handleUpdateStatus(order.id, nextAction.next)}
              // Nút luôn bấm được (trừ khi đang loading)
              disabled={statusUpdateLoading} 
            >
              {nextAction.text}
            </Button>
          </Card>
        )}
      </Card>
    );
  };

  if (authLoading) return <Spin size="large" style={{display: 'block', margin: '100px auto'}} />;

  return (
    <div style={{ backgroundColor: "#f3f4f6", minHeight: "100vh", padding: "24px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ background: "white", borderRadius: 12, padding: "20px 24px", marginBottom: 20, textAlign: "center" }}>
          <h2 style={{ fontSize: 25, fontWeight: 700, color: "#059669", margin: 0 }}>Theo dõi giao xe</h2>
        </div>

        {loading ? (
          <Spin size="large" style={{display: 'block', margin: '50px auto'}} />
        ) : orders.length === 0 ? (
          <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center" }}>
            <p style={{ color: "#6b7280" }}>Chưa có đơn giao xe nào</p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ width: 320 }}>
              <Card title={`Đơn hàng (${orders.length})`} style={{ borderRadius: 12 }}>
                <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                  {orders.map(order => (
                    <OrderListItem key={order.id} order={order}
                      isSelected={selectedOrder?.id === order.id} onClick={() => setSelectedOrder(order)}
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

      <Modal
        title={`Ghi nhận thanh toán cho Đơn #${selectedOrder?.id}`}
        open={paymentModalOpen}
        onCancel={() => {setPaymentModalOpen(false); paymentForm.resetFields();}}
        footer={null}
      >
        <Form form={paymentForm} layout="vertical" onFinish={handlePaymentSubmit}>
          <Form.Item name="amount" label="Số tiền thanh toán" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: "100%" }} 
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫'}
              parser={(value) => value.replace(/\s?₫|(,*)/g, '')} />
          </Form.Item>
          <Form.Item name="type" label="Hình thức" rules={[{ required: true }]}>
            <Select placeholder="Chọn hình thức">
              <Select.Option value="IN_FULL">Trả thẳng</Select.Option>
              <Select.Option value="INSTALLMENT">Trả góp</Select.Option>
            </Select>
          </Form.Item>
          <div style={{textAlign: 'right'}}>
             <Button onClick={() => setPaymentModalOpen(false)} style={{marginRight: 8}}>Hủy</Button>
             <Button type="primary" htmlType="submit" loading={paymentFormLoading}>Lưu</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}