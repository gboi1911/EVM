// src/pages/sales/OrderPage.jsx
import {
  Table,
  Button,
  Tag,
  Modal,
  Spin,
  message,
  Space,
  Timeline,
  Row,
  Col,
  Tabs,
  Popconfirm,
} from "antd";
import { useEffect, useState, useMemo } from "react";
import { FilePdfOutlined } from "@ant-design/icons";
import {
  getListOrders,
  getOrderById,
  updateOrder,
  getOrderActivities,
} from "../../api/order.js";
import { useAuth } from "../../context/AuthContext.jsx";

const { TabPane } = Tabs;

// Các nhãn tiếng Việt cho Trạng thái Đơn hàng
const statusLabels = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  IN_DELIVERY: "Đang vận chuyển",
  COMPLETED: "Hoàn tất",
  REJECTED: "Đã từ chối",
  CANCELLED: "Đã hủy",
};

const statusColors = {
  PENDING: "orange",
  APPROVED: "cyan",
  IN_DELIVERY: "blue",
  COMPLETED: "green",
  REJECTED: "red",
  CANCELLED: "gray",
};

const paymentStatusColors = {
  PENDING: "red",
  DEPOSIT_PAID: "orange",
  PAID: "green",
  FINISHED: "green",
};

// Các nhãn tiếng Việt cho Trạng thái Thanh toán
const paymentStatusLabels = {
  PENDING: "Chưa thanh toán",
  DEPOSIT_PAID: "Đã cọc",
  PAID: "Đã thanh toán",
  FINISHED: "Đã thanh toán",
};

export default function OrderPage() {
  const { user, loading: authLoading } = useAuth();
  const isManager = useMemo(
    () => user && user.role === "DEALER_MANAGER",
    [user]
  );

  const [orders, setOrders] = useState({
    PENDING: [],
    APPROVED: [],
    IN_DELIVERY: [],
    COMPLETED: [],
    REJECTED: [],
    CANCELLED: [],
  });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");

  // Modal Xem chi tiết
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activities, setActivities] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // 1. Lấy danh sách đơn hàng
  const fetchAllOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const statuses = [
        "PENDING",
        "APPROVED",
        "IN_DELIVERY",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
      ];

      const baseParams = {};
      // STAFF chỉ xem đơn của mình (dùng userId), MANAGER xem hết
      if (!isManager) {
        baseParams.staffId = user.userId;
      }

      const responses = await Promise.all(
        statuses.map((status) => {
          const params = { ...baseParams, status };
          return getListOrders(params);
        })
      );

      // Gộp và lọc lại phía Client để chắc chắn
      const allOrders = responses.flatMap((res) => res.data || res || []);

      const filteredOrders = isManager
        ? allOrders
        : allOrders.filter((order) => order.staff?.id == user.userId);

      const newOrders = {
        PENDING: [],
        APPROVED: [],
        IN_DELIVERY: [],
        COMPLETED: [],
        REJECTED: [],
        CANCELLED: [],
      };

      filteredOrders.forEach((order) => {
        if (newOrders[order.status]) {
          newOrders[order.status].push(order);
        }
      });

      // Sắp xếp mới nhất lên đầu
      Object.keys(newOrders).forEach((key) => {
        newOrders[key].sort((a, b) => b.id - a.id);
      });

      setOrders(newOrders);
    } catch (e) {
      message.error("Không tải được danh sách đơn hàng: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchAllOrders();
    }
  }, [authLoading, user]);

  // --- XỬ LÝ XEM CHI TIẾT ---
  const handleOpenDetail = async (record) => {
    setOpenDetailModal(true);
    setDetailLoading(true);
    setSelectedOrder(record);
    setActivities([]);

    try {
      const [detailResponse, activityResponse] = await Promise.all([
        getOrderById(record.id),
        getOrderActivities(record.id),
      ]);
      setSelectedOrder(detailResponse.data || detailResponse);
      setActivities(
        activityResponse.data?.activities || activityResponse.activities || []
      );
    } catch {
      message.error("Lỗi khi lấy chi tiết đơn");
    } finally {
      setDetailLoading(false);
    }
  };

  // --- XỬ LÝ CẬP NHẬT TRẠNG THÁI ---
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const payload = { status: newStatus };
      await updateOrder(id, payload);
      message.success(`Cập nhật trạng thái đơn #${id} thành công!`);
      fetchAllOrders();
    } catch (err) {
      message.error("Cập nhật thất bại: " + err.message);
    }
  };

  // --- CẤU HÌNH CỘT BẢNG ---
  const getBaseColumns = () => [
    { title: "Mã đơn", dataIndex: "id", width: 80 },
    { title: "Khách hàng", dataIndex: ["customer", "fullName"] },
    {
      title: "Tên xe",
      render: (record) =>
        record.carDetail?.carName ||
        record.carModelGetDetailDto?.carModelName ||
        "N/A",
    },
    { title: "Nhân viên", dataIndex: ["staff", "fullName"] },
    {
      title: "Tổng tiền ($)",
      dataIndex: "totalAmount",
      render: (v) => (v ? v.toLocaleString() : 0),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      // ❗️ SỬA LỖI: Hiển thị tiếng Việt cho trạng thái thanh toán
      render: (s) => (
        <Tag color={paymentStatusColors[s] || "default"}>
          {paymentStatusLabels[s] || s}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      // ❗️ SỬA LỖI: Hiển thị tiếng Việt cho trạng thái đơn hàng
      render: (s) => (
        <Tag color={statusColors[s] || "default"}>{statusLabels[s] || s}</Tag>
      ),
    },
  ];

  const getColumns = (tabKey) => {
    const baseColumns = getBaseColumns();

    const actionRender = (_, record) => (
      <Space size="small">
        <Button type="link" onClick={() => handleOpenDetail(record)}>
          Xem
        </Button>

        {/* LOGIC CHO MANAGER */}
        {isManager && (
          <>
            {/* Tab PENDING: Chỉ được Từ chối hoặc Hủy */}
            {tabKey === "PENDING" && (
              <>
                <Popconfirm
                  title="Từ chối đơn hàng này?"
                  onConfirm={() => handleUpdateStatus(record.id, "REJECTED")}
                  okText="Đúng"
                  cancelText="Không"
                >
                  <Button type="link" danger>
                    Từ chối
                  </Button>
                </Popconfirm>

                <Popconfirm
                  title="Hủy đơn hàng này?"
                  onConfirm={() => handleUpdateStatus(record.id, "CANCELLED")}
                  okText="Đúng"
                  cancelText="Không"
                >
                  <Button type="link" danger>
                    Hủy
                  </Button>
                </Popconfirm>
              </>
            )}

            {/* Các Tab khác: Có thể Hủy nếu cần */}
            {(tabKey === "APPROVED" || tabKey === "IN_DELIVERY") && (
              <Popconfirm
                title="Hủy đơn hàng này?"
                onConfirm={() => handleUpdateStatus(record.id, "CANCELLED")}
                okText="Đúng"
                cancelText="Không"
              >
                <Button type="link" danger>
                  Hủy
                </Button>
              </Popconfirm>
            )}
          </>
        )}
      </Space>
    );

    return [...baseColumns, { title: "Thao tác", render: actionRender }];
  };

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
    <div
      style={{ backgroundColor: "#1f2937", minHeight: "100vh", padding: 40 }}
    >
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
          Quản lý đơn hàng
        </h2>

        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
          {Object.keys(orders).map((status) => (
            <TabPane
              tab={`${statusLabels[status]} (${orders[status].length})`}
              key={status}
            >
              <Spin spinning={loading}>
                <Table
                  columns={getColumns(status)}
                  dataSource={orders[status]}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                />
              </Spin>
            </TabPane>
          ))}
        </Tabs>

        {/* MODAL: XEM CHI TIẾT */}
        <Modal
          open={openDetailModal}
          onCancel={() => setOpenDetailModal(false)}
          footer={null}
          title="Chi tiết đơn hàng"
          width={700}
        >
          {detailLoading ? (
            <Spin />
          ) : (
            selectedOrder && (
              <Row gutter={24}>
                <Col span={12}>
                  <h4>Thông tin chính</h4>
                  <p>
                    <b>Mã đơn:</b> {selectedOrder.id}
                  </p>
                  <p>
                    <b>Khách hàng:</b> {selectedOrder.customer?.fullName}
                  </p>
                  <p>
                    <b>Xe:</b>{" "}
                    {selectedOrder.carDetail?.carName ||
                      selectedOrder.carModelGetDetailDto?.carModelName}
                  </p>
                  <p>
                    <b>Tổng tiền:</b>{" "}
                    {selectedOrder.totalAmount?.toLocaleString()} $
                  </p>
                  <p>
                    <b>Trạng thái:</b>{" "}
                    <Tag color={statusColors[selectedOrder.status]}>
                      {statusLabels[selectedOrder.status]}
                    </Tag>
                  </p>

                  {selectedOrder.carDetail?.vinNumber && (
                    <p>
                      <b>Số khung:</b> {selectedOrder.carDetail.vinNumber}
                    </p>
                  )}

                  {/* Kiểm tra xem có carDetail và engineNumber không thì mới hiển thị */}
                  {selectedOrder.carDetail?.engineNumber && (
                    <p>
                      <b>Số máy:</b> {selectedOrder.carDetail.engineNumber}
                    </p>
                  )}
                </Col>
                <Col span={12}>
                  <h4>Lịch sử</h4>
                  <Timeline
                    items={activities.map((act) => ({
                      color: "gray",
                      children: `${
                        statusLabels[act.status] || act.status
                      } - ${new Date(act.changedAt).toLocaleString("vi-VN")}`,
                    }))}
                  />
                  <Space
                    direction="vertical"
                    style={{ width: "100%", marginTop: 10 }}
                  >
                    <Button
                      icon={<FilePdfOutlined />}
                      href={selectedOrder.quotationUrl}
                      target="_blank"
                      disabled={!selectedOrder.quotationUrl}
                    >
                      Báo giá
                    </Button>
                    <Button
                      icon={<FilePdfOutlined />}
                      href={selectedOrder.contractUrl}
                      target="_blank"
                      disabled={!selectedOrder.contractUrl}
                    >
                      Hợp đồng
                    </Button>
                  </Space>
                </Col>
              </Row>
            )
          )}
        </Modal>
      </div>
    </div>
  );
}
