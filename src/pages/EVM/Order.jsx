import React, { useEffect, useState } from "react";
import { Table, Button, Modal, message, Tag, Descriptions, Tabs } from "antd";
import { getOrderPending, getOrderByStatus } from "../../api/order";
import {
  getRandomCarByModel,
  approveOrder,
  deliveryOrder,
} from "../../api/car";

const { TabPane } = Tabs;

const OrderPage = () => {
  // ---------------- STATE ----------------
  const [pendingOrders, setPendingOrders] = useState([]);
  const [approvedOrders, setApprovedOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [randomCar, setRandomCar] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // ---------------- FETCH ----------------
  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrderPending();
      setPendingOrders(data.data.orderDetailDtos || []);
    } catch {
      message.error("Không thể tải danh sách đơn chờ duyệt!");
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrderByStatus("APPROVED");
      setApprovedOrders(data.data.orderDetailDtos || []);
    } catch {
      message.error("Không thể tải danh sách đơn chờ giao hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    fetchApprovedOrders();
  }, []);

  // ---------------- APPROVE MODAL ----------------
  const handleApproveClick = async (order) => {
    try {
      setSelectedOrder(order);
      const car = await getRandomCarByModel(
        order.carModelGetDetailDto.carModelId,
        "FOR_SALE"
      );
      setRandomCar(car);
      setModalOpen(true);
    } catch {
      message.error("Không thể lấy xe ngẫu nhiên!");
    }
  };

  const handleConfirmApprove = async () => {
    if (!selectedOrder || !randomCar) return;
    setConfirming(true);
    try {
      await approveOrder(
        selectedOrder.id,
        randomCar.carDetailId || randomCar.id
      );

      message.success("Đã duyệt đơn thành công!");
      setModalOpen(false);

      fetchPendingOrders();
      fetchApprovedOrders(); // cập nhật tab 2
    } catch {
      message.error("Duyệt đơn thất bại!");
    } finally {
      setConfirming(false);
    }
  };

  // ---------------- START DELIVERY ----------------
  const handleStartDelivery = async (order) => {
    try {
      await deliveryOrder(order.id, order.carDetail.carId);
      message.success("Bắt đầu giao hàng!");

      fetchApprovedOrders();
    } catch {
      message.error("Không thể cập nhật trạng thái giao hàng!");
    }
  };

  // ---------------- TABLE COLUMNS ----------------
  const pendingColumns = [
    { title: "Mã đơn", dataIndex: "id", width: 80 },
    {
      title: "Mẫu xe",
      dataIndex: ["carModelGetDetailDto", "carModelName"],
    },
    {
      title: "Khách hàng",
      dataIndex: ["customer", "fullName"],
    },
    {
      title: "Nhân viên đại lý",
      dataIndex: ["staff", "fullName"],
    },
    {
      title: "Số tiền",
      dataIndex: "totalAmount",
      render: (v) => v.toLocaleString("vi-VN"),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      render: (val) => (
        <Tag color={val === "DEPOSIT_PAID" ? "blue" : "orange"}>{val}</Tag>
      ),
    },
    {
      title: "Hành động",
      render: (_, record) =>
        record.paymentStatus == "PENDING" ? null : (
          <Button type="primary" onClick={() => handleApproveClick(record)}>
            Duyệt đơn
          </Button>
        ),
    },
  ];

  const approvedColumns = [
    { title: "Mã đơn", dataIndex: "id", width: 80 },
    {
      title: "Mẫu xe",
      dataIndex: ["carModelGetDetailDto", "carModelName"],
    },
    {
      title: "Tên xe",
      dataIndex: ["carDetail", "carName"],
    },
    {
      title: "Khách hàng",
      dataIndex: ["customer", "fullName"],
    },
    {
      title: "Số tiền",
      dataIndex: "totalAmount",
      render: (v) => v.toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: () => <Tag color="green">APPROVED</Tag>,
    },
    {
      title: "Giao hàng",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleStartDelivery(record)}>
          Bắt đầu giao hàng
        </Button>
      ),
    },
  ];

  return (
    <>
      <Tabs defaultActiveKey="1">
        {/* ---------------- Tab 1 ---------------- */}
        <TabPane tab="Đơn hàng chờ duyệt" key="1">
          <Table
            dataSource={pendingOrders}
            columns={pendingColumns}
            rowKey="id"
            loading={loading}
            bordered
          />
        </TabPane>

        {/* ---------------- Tab 2 ---------------- */}
        <TabPane tab="Danh sách đơn hàng chờ giao hàng" key="2">
          <Table
            dataSource={approvedOrders}
            columns={approvedColumns}
            rowKey="id"
            loading={loading}
            bordered
          />
        </TabPane>
      </Tabs>

      {/* ----------- APPROVE MODAL ----------- */}
      <Modal
        open={modalOpen}
        title="Xác nhận duyệt đơn hàng"
        onCancel={() => setModalOpen(false)}
        onOk={handleConfirmApprove}
        confirmLoading={confirming}
        okText="Xác nhận duyệt"
        cancelText="Hủy"
      >
        {selectedOrder && randomCar && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Mã đơn">
              {selectedOrder.id}
            </Descriptions.Item>
            <Descriptions.Item label="Mẫu xe">
              {selectedOrder.carModelGetDetailDto.carModelName}
            </Descriptions.Item>
            <Descriptions.Item label="Mã xe">
              {randomCar.carDetailId || randomCar.id}
            </Descriptions.Item>
            <Descriptions.Item label="Tên xe">
              {randomCar.carName}
            </Descriptions.Item>
            <Descriptions.Item label="Số khung">
              {randomCar.vinNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Số máy">
              {randomCar.engineNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {selectedOrder.customer.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              {selectedOrder.totalAmount.toLocaleString("vi-VN")} VND
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
};

export default OrderPage;
