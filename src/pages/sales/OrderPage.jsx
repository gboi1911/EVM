// src/pages/sales/OrderPage.jsx
import {
  Table, Button, Tag, Modal, Spin, message, Space, Timeline, Row, Col,
  Tabs, Popconfirm // THAY ĐỔI: Đã xóa Form, Input
} from "antd";
import { useEffect, useState } from "react";
import {
  getListOrders,
  getOrderById,
  updateOrder,
  getOrderActivities
} from "../../api/order";

const { TabPane } = Tabs;

export default function OrderPage() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); 

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null); 
  const [activities, setActivities] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // THAY ĐỔI: Đã xóa state của Modal "Lý do"

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const [pendingRes, rejectedRes, cancelledRes] = await Promise.all([
        getListOrders({ status: "PENDING" }),
        getListOrders({ status: "REJECTED" }),
        getListOrders({ status: "CANCELLED" }),
      ]);
      
      setPendingOrders(pendingRes.data);
      setRejectedOrders(rejectedRes.data);
      setCancelledOrders(cancelledRes.data);

    } catch (e) {
      message.error("Không tải được danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const openDetail = async (record) => {
    setOpen(true);
    setModalLoading(true);
    setSelected(record); 
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

  // THAY ĐỔI: Hàm update đơn giản (không 'note')
  // Hàm này gọi API PATCH /api/v1/orders/{id}
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const payload = { status: newStatus }; // Chỉ gửi status
      await updateOrder(id, payload);
      
      message.success(`Đơn hàng #${id} đã được chuyển sang ${newStatus}`);
      fetchAllOrders(); // Tải lại dữ liệu cho cả 3 tab
    } catch (err) {
      message.error("Cập nhật trạng thái thất bại: " + err.message);
    }
  };

  // Hàm render cột (columns)
  const getColumns = (tabKey) => {
    // Cột cơ bản
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
    
    // Cột xem chung
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
              <Button
                type="link"
                style={{ color: "green" }}
                onClick={() => handleUpdateStatus(record.id, "APPROVED")} 
              >
                Duyệt
              </Button>
              {/* THAY ĐỔI: Xóa 'description' (lý do) */}
              <Popconfirm
                title="Bạn chắc chắn muốn TỪ CHỐI?"
                onConfirm={() => handleUpdateStatus(record.id, "REJECTED")}
                okText="Đúng, từ chối"
                cancelText="Không"
              >
                <Button type="link" danger>Từ chối</Button>
              </Popconfirm>
              {/* THAY ĐỔI: Xóa 'description' (lý do) */}
              <Popconfirm
                title="Bạn chắc chắn muốn HỦY?"
                onConfirm={() => handleUpdateStatus(record.id, "CANCELLED")}
                okText="Đúng, hủy"
                cancelText="Không"
              >
                <Button type="link" danger>Hủy</Button>
              </Popconfirm>
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
        // THAY ĐỔI: Đã xóa cột "Ghi chú"
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
        // THAY ĐỔI: Đã xóa cột "Ghi chú"
        actionColumn,
      ];
    }
    
    return baseColumns;
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
            fontWeight: 700,
            color: "#059669",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Quản lý đơn hàng
        </h2>

        {/* Tabs */}
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
          <TabPane tab={`Chờ duyệt (${pendingOrders.length})`} key="PENDING">
            <Spin spinning={loading}>
              <Table 
                columns={getColumns("PENDING")} 
                dataSource={pendingOrders} 
                rowKey="id" 
              />
            </Spin>
          </TabPane>
          <TabPane tab={`Bị từ chối (${rejectedOrders.length})`} key="REJECTED">
            <Spin spinning={loading}>
              <Table 
                columns={getColumns("REJECTED")} 
                dataSource={rejectedOrders} 
                rowKey="id" 
              />
            </Spin>
          </TabPane>
          <TabPane tab={`Đã hủy (${cancelledOrders.length})`} key="CANCELLED">
            <Spin spinning={loading}>
              <Table 
                columns={getColumns("CANCELLED")} 
                dataSource={cancelledOrders} 
                rowKey="id" 
              />
            </Spin>
          </TabPane>
        </Tabs>

        {/* Modal Xem Chi Tiết */}
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
                {/* THAY ĐỔI: Đã xóa dòng Ghi chú */}
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
        
        {/* THAY ĐỔI: Đã xóa Modal "Lý do" */}

      </div>
    </div>
  );
}