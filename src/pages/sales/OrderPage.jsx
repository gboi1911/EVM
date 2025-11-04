// src/pages/sales/OrderPage.jsx
import { Table, Button, Tag, Modal, Spin, message } from "antd";
import { useEffect, useState } from "react";
// THAY ĐỔI 1: Tên hàm import chính xác
import { getListOrders, getOrderById } from "../../api/order";

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // THAY ĐỔI 2: Gọi đúng hàm và lấy response.data
      const response = await getListOrders({ status: "PENDING" }); // Lấy các đơn PENDING như ví dụ
      setOrders(response.data); // Dữ liệu nằm trong .data
    } catch (e) {
      message.error("Không tải được danh sách đơn");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (r) => {
    setOpen(true);
    setSelected(null); // Reset để hiển thị Spin khi tải
    try {
      // THAY ĐỔI 3: Gọi đúng hàm và lấy response.data
      const response = await getOrderById(r.id);
      setSelected(response.data); // Dữ liệu nằm trong .data
    } catch {
      message.error("Lỗi khi lấy chi tiết đơn");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // THAY ĐỔI 4: Cập nhật 'columns' để khớp với dữ liệu API
  const columns = [
    { title: "Mã đơn", dataIndex: "id" },
    {
      title: "Khách hàng",
      dataIndex: ["customer", "fullName"], // Lấy lồng dữ liệu
    },
    {
      title: "Tên xe",
      dataIndex: ["car", "carName"], // Thêm cột tên xe
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (v) => v?.toLocaleString() + " ₫",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) => (
        <Tag
          color={
            {
              PENDING: "orange",
              APPROVED: "blue",
              COMPLETED: "green",
              CANCELLED: "red",
              REJECTED: "volcano",
            }[s]
          }
        >
          {s}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      render: (_, r) => (
        <Button type="link" onClick={() => openDetail(r)}>
          Xem chi tiết
        </Button>
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
            fontWeight: 700,
            color: "#059669",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Quản lý đơn hàng
        </h2>

        {loading ? (
          <Spin style={{ display: "block", margin: "auto" }} />
        ) : (
          <Table columns={columns} dataSource={orders} rowKey="id" />
        )}

        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          footer={null}
          title="Chi tiết đơn hàng"
        >
          {/* THAY ĐỔI 5: Cập nhật dữ liệu trong Modal */}
          {selected ? (
            <>
              <p>
                <b>Mã đơn:</b> {selected.id}
              </p>
              <p>
                <b>Khách hàng:</b> {selected.customer.fullName}
              </p>
              <p>
                <b>Liên hệ (KH):</b> {selected.customer.phone}
              </p>
              <p>
                <b>Xe:</b> {selected.car.carName}
              </p>
              <p>
                <b>Nhân viên phụ trách:</b> {selected.staff.fullName}
              </p>
              <p>
                <b>Tổng tiền:</b> {selected.totalAmount?.toLocaleString()} ₫
              </p>
              <p>
                <b>Trạng thái:</b> {selected.status}
              </p>
            </>
          ) : (
            <Spin />
          )}
        </Modal>
      </div>
    </div>
  );
}