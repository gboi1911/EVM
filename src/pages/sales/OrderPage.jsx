// src/pages/sales/OrderPage.jsx
import {
  Table, Button, Tag, Modal, Spin, message, Space, Timeline, Row, Col,
  Tabs, Popconfirm
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
  const isManager = useMemo(() => user && user.role === "DEALER_MANAGER", [user]);

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

  // ❗️ SỬA LỖI 403 (Theo yêu cầu BE)
  const fetchAllOrders = async () => {
    if (!user) return; // Chờ user load xong
    
    setLoading(true);
    try {
      const statuses = ["PENDING", "APPROVED", "IN_DELIVERY", "COMPLETED", "REJECTED", "CANCELLED"];
      
      // 1. Tạo param cơ sở
      const baseParams = {};
      if (!isManager) {
        // Gán staffId nếu là Staff
        // (Giả sử user object từ useAuth() có 'id' khớp với 'staff.id' trong API)
        baseParams.staffId = user.id; 
      }
      
      const responses = await Promise.all(
        statuses.map(status => {
          // 2. Gộp status và staffId
          const params = { ...baseParams, status };
          return getListOrders(params); // Gửi API với params
        })
      );

      const newOrders = {};
      responses.forEach((res, index) => {
        const status = statuses[index];
        newOrders[status] = res.data || res || []; 
      });
      
      setOrders(newOrders);

    } catch (e) {
      // (Lỗi 403 sẽ hiển thị ở đây cho đến khi BE sửa)
      message.error("Không tải được danh sách đơn hàng: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchAllOrders();
    }
  }, [authLoading, user]); // Chạy lại khi user load

  const openDetail = async (record) => {
    if (!user) return;
    setOpen(true);
    setModalLoading(true);
    setSelected(record);
    setActivities([]);

    try {
      const [detailResponse, activityResponse] = await Promise.all([
        getOrderById(record.id),
        getOrderActivities(record.id),
      ]);
      setSelected(detailResponse.data || detailResponse);
      setActivities(
        activityResponse.data?.activities ||
          activityResponse.activities ||
          []
      );
    } catch {
      message.error("Lỗi khi lấy chi tiết đơn");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const payload = { status: newStatus };
      await updateOrder(id, payload);
      message.success(`Đơn hàng #${id} đã được chuyển sang ${newStatus}`);
      fetchAllOrders(); 
      setOpen(false); 
    } catch (err) {
      message.error("Cập nhật trạng thái thất bại: " + (err.message || "Lỗi"));
    }
  };

  // (Sửa lỗi N/A từ tin nhắn trước)
  const getBaseColumns = () => [
    { title: "Mã đơn", dataIndex: "id" },
    { title: "Khách hàng", dataIndex: ["customer", "fullName"] },
    { 
      title: "Tên xe", 
      // Đọc 'carDetail' (cho đơn đã gán xe) HOẶC 'carModelGetDetailDto' (cho đơn báo giá)
      render: (record) => 
        record.carDetail?.carName || record.carModelGetDetailDto?.carModelName || "N/A"
    }, 
    { title: "Nhân viên", dataIndex: ["staff", "fullName"] }, 
    {
      title: "Tổng tiền ($)",
      dataIndex: "totalAmount",
      render: (v) => (v ? v.toLocaleString() : 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => <Tag color={statusColors[s] || 'default'}>{s}</Tag>,
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
                onConfirm={() =>
                  handleUpdateStatus(record.id, "CANCELLED")
                }
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
                  <Button
                    type="link"
                    style={{ color: "green" }}
                    onClick={() =>
                      handleUpdateStatus(record.id, "APPROVED")
                    }
                  >
                    Duyệt
                  </Button>
                  <Popconfirm
                    title="Bạn chắc chắn muốn TỪ CHỐI?"
                    onConfirm={() =>
                      handleUpdateStatus(record.id, "REJECTED")
                    }
                    okText="Đúng, từ chối"
                    cancelText="Không"
                  >
                    <Button type="link" danger>
                      Từ chối
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Bạn chắc chắn muốn HỦY?"
                    onConfirm={() =>
                      handleUpdateStatus(record.id, "CANCELLED")
                    }
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

  // (Memo các cột)
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
            fontWeight: 700,
            color: "#059669",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Quản lý đơn hàng
        </h2>

        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
          <TabPane
            tab={`Chờ duyệt (${orders.PENDING.length})`}
            key="PENDING"
          >
            <Spin spinning={loading}>
              <Table
                columns={pendingColumns}
                dataSource={orders.PENDING}
                rowKey="id"
              />
            </Spin>
          </TabPane>
          <TabPane
            tab={`Đã duyệt (${orders.APPROVED.length})`}
            key="APPROVED"
          >
            <Spin spinning={loading}>
              <Table
                columns={approvedColumns}
                dataSource={orders.APPROVED}
                rowKey="id"
              />
            </Spin>
          </TabPane>
           <TabPane
            tab={`Đang giao (${orders.IN_DELIVERY.length})`}
            key="IN_DELIVERY"
          >
            <Spin spinning={loading}>
              <Table
                columns={inDeliveryColumns}
                dataSource={orders.IN_DELIVERY}
                rowKey="id"
              />
            </Spin>
          </TabPane>
           <TabPane
            tab={`Hoàn thành (${orders.COMPLETED.length})`}
            key="COMPLETED"
          >
            <Spin spinning={loading}>
              <Table
                columns={completedColumns}
                dataSource={orders.COMPLETED}
                rowKey="id"
              />
            </Spin>
          </TabPane>
          <TabPane
            tab={`Bị từ chối (${orders.REJECTED.length})`}
            key="REJECTED"
          >
            <Spin spinning={loading}>
              <Table
                columns={rejectedColumns}
                dataSource={orders.REJECTED}
                rowKey="id"
              />
            </Spin>
          </TabPane>
          <TabPane
            tab={`Đã hủy (${orders.CANCELLED.length})`}
            key="CANCELLED"
          >
            <Spin spinning={loading}>
              <Table
                columns={cancelledColumns}
                dataSource={orders.CANCELLED}
                rowKey="id"
              />
            </Spin>
          </TabPane>
        </Tabs>

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
              <Row gutter={24}>
                <Col span={12}>
                  <h4>Thông tin chính</h4>
                  <p><b>Mã đơn:</b> {selected.id}</p>
                  <p><b>Khách hàng:</b> {selected.customer?.fullName}</p>
                  <p><b>Liên hệ (KH):</b> {selected.customer?.phone}</p>
                  <p><b>Xe:</b> {selected.carDetail?.carName || selected.carModelGetDetailDto?.carModelName || "N/A"}</p> 
                  <p><b>Nhân viên phụ trách:</b> {selected.staff?.fullName}</p>
                  <p><b>Tổng tiền:</b> {selected.totalAmount?.toLocaleString()} $</p>
                  <p><b>Trạng thái:</b> <Tag color={statusColors[selected.status] || 'default'}>{selected.status}</Tag></p>
                </Col>

                <Col span={12}>
                  <h4>Lịch sử đơn hàng</h4>
                  <Timeline
                    items={activities.map((act) => ({
                      color: statusColors[act.status] || 'gray',
                      children: `${act.status} - ${new Date(act.changedAt).toLocaleString("vi-VN")}`,
                    }))}
                  />
                  <Space direction="vertical" style={{ marginTop: 24, width: "100%" }}>
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
            )
          )}
        </Modal>
      </div>
    </div>
  );
}