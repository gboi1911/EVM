import React, { useEffect, useState } from "react";
import { Table, Button, Modal, message, Tag, Descriptions } from "antd";
import { getOrderPending } from "../../api/order";
import { getRandomCarByModel, approveOrder } from "../../api/car";

const OrderPendingPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [randomCar, setRandomCar] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrderPending();
      setOrders(data.data.orderDetailDtos || []);
    } catch (err) {
      message.error("Không thể tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
      // ✅ Correct body request
      const body = {
        orderId: selectedOrder.id,
        carDetailId: randomCar.id || randomCar.carDetailId,
        orderStatus: "APPROVED",
      };

      await approveOrder(body.orderId, body.carDetailId);

      message.success("Đã duyệt đơn hàng thành công!");
      setModalOpen(false);
      fetchOrders();
    } catch {
      message.error("Duyệt đơn thất bại!");
    } finally {
      setConfirming(false);
    }
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Mẫu xe",
      dataIndex: ["carModelGetDetailDto", "carModelName"],
      key: "carModelName",
    },
    {
      title: "Khách hàng",
      dataIndex: ["customer", "fullName"],
      key: "customerName",
    },
    {
      title: "Nhân viên đại lý",
      dataIndex: ["staff", "fullName"],
      key: "staffName",
    },
    {
      title: "Số tiền (VND)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (val) => val.toLocaleString("vi-VN"),
    },
    {
      title: "Thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (val) => (
        <Tag color={val === "DEPOSIT_PAID" ? "blue" : "orange"}>{val}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Button type="primary" onClick={() => handleApproveClick(record)}>
          Duyệt đơn
        </Button>
      ),
    },
  ];

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">
        Danh sách đơn hàng chờ duyệt
      </h2>
      <Table
        dataSource={orders}
        columns={columns}
        rowKey="id"
        loading={loading}
        bordered
      />

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
            <Descriptions.Item label="Mã xe được gán">
              {randomCar.carDetailId || randomCar.id || "(Không rõ mã xe)"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên xe được gán">
              {randomCar.carName || randomCar.vin || "(Không rõ tên xe)"}
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

export default OrderPendingPage;
