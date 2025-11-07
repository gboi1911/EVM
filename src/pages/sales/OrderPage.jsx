// src/pages/sales/OrderPage.jsx
import {
  Table, Button, Tag, Modal, Spin, message, Space, Timeline, Row, Col,
  Tabs, Popconfirm
} from "antd";
import { useEffect, useState } from "react";
import {
  getListOrders,
  getOrderById,
  updateOrder,
  getOrderActivities,
} from "../../api/order.js"; // Thêm .js
import { useAuth } from "../../context/AuthContext.jsx"; // 1. IMPORT HOOK PHÂN QUYỀN

const { TabPane } = Tabs;

export default function OrderPage() {
  const { user } = useAuth(); // 2. LẤY THÔNG TIN USER ĐANG ĐĂNG NHẬP
  const isManager = user && user.role === 'DEALER_MANAGER'; // 3. KIỂM TRA QUYỀN

  // State cho 3 danh sách
  const [pendingOrders, setPendingOrders] = useState([]);
  const [rejectedOrders, setRejectedOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); 

  // State cho Modal chi tiết
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null); 
  const [activities, setActivities] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Tải dữ liệu cho cả 3 tab
  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const [pendingRes, rejectedRes, cancelledRes] = await Promise.all([
        getListOrders({ status: "PENDING" }),
        getListOrders({ status: "REJECTED" }),
        getListOrders({ status: "CANCELLED" }),
      ]);
      
      // Giả sử API của bạn trả về { data: [...] } nếu dùng apiClient
      // Nếu dùng fetch (như file authen.js), nó có thể trả về mảng trực tiếp
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
    fetchAllOrders();
  }, []);

  // Mở Modal xem chi tiết
  const openDetail = async (record) => {
    setOpen(true);
    setModalLoading(true);
    setSelected(record); 
    setActivities([]);

    try {
      // Giả sử các hàm này trả về { data: ... } nếu dùng apiClient
      const [detailResponse, activityResponse] = await Promise.all([
        getOrderById(record.id),
        getOrderActivities(record.id),
      ]);
      setSelected(detailResponse.data || detailResponse);
      setActivities(activityResponse.data.activities || activityResponse.activities || []);
    } catch {
      message.error("Lỗi khi lấy chi tiết đơn");
    } finally {
      setModalLoading(false);
    }
  };

  // Hàm cập nhật trạng thái (không cần 'note')
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const payload = { status: newStatus }; // Chỉ gửi status
      await updateOrder(id, payload);
      
      message.success(`Đơn hàng #${id} đã được chuyển sang ${newStatus}`);
      fetchAllOrders(); // Tải lại dữ liệu cho cả 3 tab
    } catch (err) {
      message.error("Cập nhật trạng thái thất bại: " + (err.message || "Lỗi"));
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
              {/* 4. PHÂN QUYỀN HIỂN THỊ */}
              {isManager && (
                <>
                  <Button
                    type="link"
                    style={{ color: "green" }}
                    onClick={() => handleUpdateStatus(record.id, "APPROVED")} 
                  >
                    Duyệt
                  </Button>
                  <Popconfirm
                    title="Bạn chắc chắn muốn TỪ CHỐI?"
                    onConfirm={() => handleUpdateStatus(record.id, "REJECTED")}
                    okText="Đúng, từ chối"
                    cancelText="Không"
                  >
                    <Button type="link" danger>Từ chối</Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Bạn chắc chắn muốn HỦY?"
                    onConfirm={() => handleUpdateStatus(record.id, "CANCELLED")}
                    okText="Đúng, hủy"
                    cancelText="Không"
                  >
                    <Button type="link" danger>Hủy</Button>
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
        // Đã xóa cột "Ghi chú"
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
        // Đã xóa cột "Ghi chú"
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
          {modalLoading ? (
            <Spin />
          ) : (
            selected && <Row gutter={24}>
              <Col span={12}>
                <h4>Thông tin chính</h4>
                <p><b>Mã đơn:</b> {selected.id}</p>
                <p><b>Khách hàng:</b> {selected.customer?.fullName}</p>
                <p><b>Liên hệ (KH):</b> {selected.customer?.phone}</p>
                <p><b>Xe:</b> {selected.car?.carName}</p>
                <p><b>Nhân viên phụ trách:</b> {selected.staff?.fullName}</p>
                <p><b>Tổng tiền:</b> {selected.totalAmount?.toLocaleString()} $</p>
                <p><b>Trạng thái:</b> <Tag color="orange">{selected.status}</Tag></p>
                {/* Đã xóa dòng Ghi chú */}
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
        
        {/* Đã xóa Modal "Lý do" */}

      </div>
    </div>
  );
}