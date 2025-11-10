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

export default function OrderPage() {
  const { user, loading: authLoading } = useAuth();

  // ✅ Memo check role
  const isManager = useMemo(() => user && user.role === "DEALER_MANAGER", [user]);

  const [pendingOrders, setPendingOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [activities, setActivities] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const [pendingRes, rejectedRes, cancelledRes] = await Promise.all([
        getListOrders({ status: "PENDING" }),
        getListOrders({ status: "REJECTED" }),
        getListOrders({ status: "CANCELLED" }),
      ]);

      setPendingOrders(pendingRes.data || pendingRes);
      setRejectedOrders(rejectedRes.data || rejectedRes);
      setCancelledOrders(cancelledRes.data || cancelledRes);
    } catch (e) {
      message.error("Không tải được danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchAllOrders();
    }
  }, [authLoading, user]);

  const openDetail = async (record) => {
    // ✅ Check user trước khi mở modal
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
    } catch (err) {
      message.error("Cập nhật trạng thái thất bại: " + (err.message || "Lỗi"));
    }
  };

  const getColumns = (tabKey, isManager) => {
    const baseColumns = [
      { title: "Mã đơn", dataIndex: "id" },
      { title: "Khách hàng", dataIndex: ["customer", "fullName"] },
      { title: "Tên xe", dataIndex: ["car", "carName"] },
      {
        title: "Tổng tiền ($)",
        dataIndex: "totalAmount",
        render: (v) => v.toLocaleString(),
      },
    ];

    const actionColumn = {
      title: "Thao tác",
      render: (_, record) => (
        <Button type="link" onClick={() => openDetail(record)}>
          Xem
        </Button>
      ),
    };

    if (tabKey === "PENDING") {
      return [
        ...baseColumns,
        {
          title: "Trạng thái",
          dataIndex: "status",
          render: (s) => <Tag color="orange">{s}</Tag>,
        },
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

    if (tabKey === "REJECTED") {
      return [
        ...baseColumns,
        {
          title: "Trạng thái",
          dataIndex: "status",
          render: (s) => <Tag color="red">{s}</Tag>,
        },
        actionColumn,
      ];
    }

    if (tabKey === "CANCELLED") {
      return [
        ...baseColumns,
        {
          title: "Trạng thái",
          dataIndex: "status",
          render: (s) => <Tag color="gray">{s}</Tag>,
        },
        actionColumn,
      ];
    }

    return baseColumns;
  };

  const pendingColumns = useMemo(
    () => getColumns("PENDING", isManager),
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
            tab={`Chờ duyệt (${pendingOrders.length})`}
            key="PENDING"
          >
            <Spin spinning={loading}>
              <Table
                columns={pendingColumns}
                dataSource={pendingOrders}
                rowKey="id"
              />
            </Spin>
          </TabPane>
          <TabPane
            tab={`Bị từ chối (${rejectedOrders.length})`}
            key="REJECTED"
          >
            <Spin spinning={loading}>
              <Table
                columns={rejectedColumns}
                dataSource={rejectedOrders}
                rowKey="id"
              />
            </Spin>
          </TabPane>
          <TabPane
            tab={`Đã hủy (${cancelledOrders.length})`}
            key="CANCELLED"
          >
            <Spin spinning={loading}>
              <Table
                columns={cancelledColumns}
                dataSource={cancelledOrders}
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
                  <p><b>Xe:</b> {selected.car?.carName}</p>
                  <p><b>Nhân viên phụ trách:</b> {selected.staff?.fullName}</p>
                  <p><b>Tổng tiền:</b> {selected.totalAmount?.toLocaleString()} $</p>
                  <p><b>Trạng thái:</b> <Tag color="orange">{selected.status}</Tag></p>
                </Col>

                <Col span={12}>
                  <h4>Lịch sử đơn hàng</h4>
                  <Timeline
                    items={activities.map((act) => ({
                      color: act.status === "PENDING" ? "orange" : "green",
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
