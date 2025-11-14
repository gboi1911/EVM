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
import { deliveriedOrder, finisheddOrder } from "../../api/car.js";
import { useAuth } from "../../context/AuthContext.jsx";

const statusColors = {
  PENDING: "orange",
  APPROVED: "cyan",
  IN_DELIVERY: "blue",
  COMPLETED: "green",
  REJECTED: "red",
  CANCELLED: "gray",
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

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activities, setActivities] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch all orders
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
      if (!isManager) baseParams.staffId = user.id;

      const responses = await Promise.all(
        statuses.map((status) => getListOrders({ ...baseParams, status }))
      );

      const newOrders = {};
      responses.forEach((res, idx) => {
        newOrders[statuses[idx]] = res.data || res || [];
      });

      setOrders(newOrders);
    } catch (e) {
      message.error("Không tải được danh sách đơn hàng: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) fetchAllOrders();
  }, [authLoading, user]);

  // Open modal
  const openDetail = async (record) => {
    if (!user) return;
    setOpen(true);
    setModalLoading(true);
    setSelected(record);
    setActivities([]);

    try {
      const [detailRes, activityRes] = await Promise.all([
        getOrderById(record.id),
        getOrderActivities(record.id),
      ]);
      setSelected(detailRes.data || detailRes);
      setActivities(
        activityRes.data?.activities || activityRes.activities || []
      );
    } catch {
      message.error("Lỗi khi lấy chi tiết đơn");
    } finally {
      setModalLoading(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateOrder(id, { status: newStatus });
      message.success(`Đơn hàng #${id} đã được chuyển sang ${newStatus}`);
      fetchAllOrders();
      setOpen(false);
    } catch (err) {
      message.error("Cập nhật trạng thái thất bại: " + (err.message || "Lỗi"));
    }
  };

  // Delivered / Finished
  const handleDelivered = async () => {
    if (!selected) return;
    try {
      await deliveriedOrder(selected.id, selected.carDetail.carId);
      message.success("Đã xác nhận đơn hàng đã giao!");
      fetchAllOrders();
      setOpen(false);
    } catch (err) {
      message.error("Lỗi khi cập nhật trạng thái: " + (err.message || "Lỗi"));
    }
  };

  const handleFinished = async () => {
    if (!selected) return;
    try {
      await finisheddOrder(selected.id, selected.carDetail.carId);
      message.success("Đơn hàng đã hoàn thành!");
      fetchAllOrders();
      setOpen(false);
    } catch (err) {
      message.error("Lỗi khi cập nhật trạng thái: " + (err.message || "Lỗi"));
    }
  };

  // Columns
  const getBaseColumns = () => [
    { title: "Mã đơn", dataIndex: "id" },
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
      title: "Tổng tiền (₫)",
      dataIndex: "totalAmount",
      render: (v) => (v ? v.toLocaleString() : 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => <Tag color={statusColors[s] || "default"}>{s}</Tag>,
    },
  ];

  const getColumns = (tabKey, isManager) => {
    const baseColumns = getBaseColumns();
    const actionColumn = {
      title: "Thao tác",
      render: (_, record) => (
        <Space size="small">
          <Button type="link" onClick={() => openDetail(record)}>
            Xem
          </Button>
          {isManager && (tabKey === "APPROVED" || tabKey === "IN_DELIVERY") && (
            <Popconfirm
              title="Bạn chắc chắn muốn HỦY đơn này?"
              onConfirm={() => handleUpdateStatus(record.id, "CANCELLED")}
              okText="Đúng, hủy"
              cancelText="Không"
            >
              <Button type="link" danger>
                Hủy
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    };

    if (tabKey === "PENDING") {
      return [
        ...baseColumns,
        {
          title: "Thao tác",
          render: (_, record) => (
            <Space size="small">
              <Button type="link" onClick={() => openDetail(record)}>
                Xem
              </Button>
              {isManager && (
                <>
                  <Popconfirm
                    title="Bạn chắc chắn muốn TỪ CHỐI?"
                    onConfirm={() => handleUpdateStatus(record.id, "REJECTED")}
                    okText="Đúng, từ chối"
                    cancelText="Không"
                  >
                    <Button type="link" danger>
                      Từ chối
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Bạn chắc chắn muốn HỦY?"
                    onConfirm={() => handleUpdateStatus(record.id, "CANCELLED")}
                    okText="Đúng, hủy"
                    cancelText="Không"
                  >
                    <Button type="link" danger>
                      Hủy
                    </Button>
                  </Popconfirm>
                </>
              )}
            </Space>
          ),
        },
      ];
    }

    return [...baseColumns, actionColumn];
  };

  const pendingColumns = useMemo(
    () => getColumns("PENDING", isManager),
    [isManager]
  );
  const approvedColumns = useMemo(
    () => getColumns("APPROVED", isManager),
    [isManager]
  );
  const inDeliveryColumns = useMemo(
    () => getColumns("IN_DELIVERY", isManager),
    [isManager]
  );
  const completedColumns = useMemo(
    () => getColumns("COMPLETED", isManager),
    [isManager]
  );
  const rejectedColumns = useMemo(
    () => getColumns("REJECTED", isManager),
    [isManager]
  );
  const cancelledColumns = useMemo(
    () => getColumns("CANCELLED", isManager),
    [isManager]
  );

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

  // Tab items
  const tabItems = [
    {
      key: "PENDING",
      label: `Chờ duyệt (${orders.PENDING.length})`,
      children: (
        <Spin spinning={loading}>
          <Table
            columns={pendingColumns}
            dataSource={orders.PENDING}
            rowKey="id"
          />
        </Spin>
      ),
    },
    {
      key: "APPROVED",
      label: `Đã duyệt (${orders.APPROVED.length})`,
      children: (
        <Spin spinning={loading}>
          <Table
            columns={approvedColumns}
            dataSource={orders.APPROVED}
            rowKey="id"
          />
        </Spin>
      ),
    },
    {
      key: "IN_DELIVERY",
      label: `Đang giao (${orders.IN_DELIVERY.length})`,
      children: (
        <Spin spinning={loading}>
          <Table
            columns={inDeliveryColumns}
            dataSource={orders.IN_DELIVERY}
            rowKey="id"
          />
        </Spin>
      ),
    },
    {
      key: "COMPLETED",
      label: `Hoàn thành (${orders.COMPLETED.length})`,
      children: (
        <Spin spinning={loading}>
          <Table
            columns={completedColumns}
            dataSource={orders.COMPLETED}
            rowKey="id"
          />
        </Spin>
      ),
    },
    {
      key: "REJECTED",
      label: `Bị từ chối (${orders.REJECTED.length})`,
      children: (
        <Spin spinning={loading}>
          <Table
            columns={rejectedColumns}
            dataSource={orders.REJECTED}
            rowKey="id"
          />
        </Spin>
      ),
    },
    {
      key: "CANCELLED",
      label: `Đã hủy (${orders.CANCELLED.length})`,
      children: (
        <Spin spinning={loading}>
          <Table
            columns={cancelledColumns}
            dataSource={orders.CANCELLED}
            rowKey="id"
          />
        </Spin>
      ),
    },
  ];

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
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Quản lý đơn hàng
        </h2>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
          title="Chi tiết đơn hàng"
          width={700}
        >
          {modalLoading ? (
            <Spin />
          ) : (
            selected && (
              <>
                <Row gutter={24}>
                  <Col span={12}>
                    <h4>Thông tin chính</h4>
                    <p>
                      <b>Mã đơn:</b> {selected.id}
                    </p>
                    <p>
                      <b>Khách hàng:</b> {selected.customer?.fullName}
                    </p>
                    <p>
                      <b>Liên hệ (KH):</b> {selected.customer?.phone}
                    </p>
                    <p>
                      <b>Xe:</b>{" "}
                      {selected.carDetail?.carName ||
                        selected.carModelGetDetailDto?.carModelName ||
                        "N/A"}
                    </p>
                    <p>
                      <b>Nhân viên phụ trách:</b> {selected.staff?.fullName}
                    </p>
                    <p>
                      <b>Tổng tiền:</b> {selected.totalAmount?.toLocaleString()}{" "}
                      ₫
                    </p>
                    <p>
                      <b>Trạng thái:</b>{" "}
                      <Tag color={statusColors[selected.status] || "default"}>
                        {selected.status}
                      </Tag>
                    </p>
                  </Col>

                  <Col span={12}>
                    <h4>Lịch sử đơn hàng</h4>
                    <Timeline
                      items={activities.map((act) => ({
                        color: statusColors[act.status] || "gray",
                        children: `${act.status} - ${new Date(
                          act.changedAt
                        ).toLocaleString("vi-VN")}`,
                      }))}
                    />

                    <Space
                      direction="vertical"
                      style={{ marginTop: 24, width: "100%" }}
                    >
                      <Button
                        icon={<FilePdfOutlined />}
                        href={selected.quotationUrl}
                        target="_blank"
                        disabled={!selected.quotationUrl}
                      >
                        Xem Báo giá
                      </Button>

                      <Button
                        icon={<FilePdfOutlined />}
                        href={selected.contractUrl}
                        target="_blank"
                        disabled={!selected.contractUrl}
                      >
                        Xem Hợp đồng
                      </Button>
                    </Space>
                  </Col>
                </Row>

                <div style={{ marginTop: 24, textAlign: "right" }}>
                  {selected.status === "IN_DELIVERY" && (
                    <Button type="primary" onClick={handleDelivered}>
                      Xác nhận đã giao
                    </Button>
                  )}

                  {selected.status === "DELIVERED" && (
                    <Button
                      type="primary"
                      style={{ backgroundColor: "#10b981" }}
                      onClick={handleFinished}
                    >
                      Xác nhận hoàn thành
                    </Button>
                  )}
                </div>
              </>
            )
          )}
        </Modal>
      </div>
    </div>
  );
}
