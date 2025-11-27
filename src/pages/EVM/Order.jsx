import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  message,
  Tag,
  Descriptions,
  Tabs,
  Select,
} from "antd";
import { getOrderPending, getOrderByStatus } from "../../api/order";
import {
  getRandomCarByModel,
  approveOrder,
  deliveryOrder,
  deliveriedOrder,
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
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [inDeliveryOrders, setInDeliveryOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);

  const carColors = ["Đỏ", "Xanh dương", "Trắng", "Đen", "Bạc"];

  const fetchPendingOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrderByStatus("PENDING");
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

  const fetchInDeliveryOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrderByStatus("IN_DELIVERY");
      setInDeliveryOrders(data.data.orderDetailDtos || []);
    } catch {
      message.error("Không thể tải danh sách đơn đang giao hàng!");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveredOrders = async () => {
    setLoading(true);
    try {
      const data = await getOrderByStatus("DELIVERED");
      setDeliveredOrders(data.data.orderDetailDtos || []);
    } catch {
      message.error("Không thể tải danh sách đơn đã giao hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    fetchApprovedOrders();
    fetchInDeliveryOrders();
    fetchDeliveredOrders();
  }, []);

  // ---------------- APPROVE MODAL ----------------
  const handleApproveClick = (order) => {
    setSelectedOrder(order);
    setColorModalOpen(true);
  };

  const handleSelectColor = async () => {
    if (!selectedColor) {
      return message.warning("Vui lòng chọn màu xe!");
    }
    const colorEncoded = encodeURIComponent(selectedColor);
    try {
      const car = await getRandomCarByModel(
        selectedOrder.carModelGetDetailDto.carModelId,
        "FOR_SALE",
        selectedColor
      );

      setRandomCar(car);
      setColorModalOpen(false);
      setModalOpen(true); // mở modal xác nhận duyệt đơn
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

  const handletDelivered = async (order) => {
    try {
      await deliveriedOrder(order.id, order.carDetail.carId);
      message.success("Xác nhận đã giao hàng!");

      fetchInDeliveryOrders();
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
      title: "Trạng thái",
      dataIndex: "status",
      render: (val) => (
        <Tag color={val === "PENDING" ? "orange" : "blue"}>{val}</Tag>
      ),
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
      render: (_, record) => {
        return record.paymentStatus === "DEPOSIT_PAID" ? (
          <Button type="primary" onClick={() => handleApproveClick(record)}>
            Duyệt đơn
          </Button>
        ) : null;
      },
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

  const inDeliveryColumns = [
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
      render: () => <Tag color="blue">IN DELIVERY</Tag>,
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handletDelivered(record)} // API bạn import sẵn
        >
          Xác nhận giao xong
        </Button>
      ),
    },
  ];

  const deliveredColumns = [
    { title: "Mã đơn", dataIndex: "id", width: 80 },
    { title: "Mẫu xe", dataIndex: ["carModelGetDetailDto", "carModelName"] },
    { title: "Tên xe", dataIndex: ["carDetail", "carName"] },
    { title: "Khách hàng", dataIndex: ["customer", "fullName"] },
    {
      title: "Số tiền",
      dataIndex: "totalAmount",
      render: (v) => v.toLocaleString("vi-VN"),
    },
    { title: "Trạng thái", render: () => <Tag color="green">DELIVERED</Tag> },
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

        <TabPane tab="Đơn hàng đang vận chuyển" key="3">
          <Table
            dataSource={inDeliveryOrders}
            columns={inDeliveryColumns}
            rowKey="id"
            loading={loading}
            bordered
          />
        </TabPane>

        <TabPane tab="Đơn hàng đã giao" key="4">
          <Table
            dataSource={deliveredOrders}
            columns={deliveredColumns}
            rowKey="id"
            loading={loading}
            bordered
          />
        </TabPane>
      </Tabs>

      {/* ----------- APPROVE MODAL ----------- */}
      <Modal
        open={colorModalOpen}
        title="Chọn màu xe trước khi duyệt đơn"
        onCancel={() => setColorModalOpen(false)}
        onOk={handleSelectColor}
        okText="Lấy xe"
        cancelText="Hủy"
      >
        <div>Vui lòng chọn màu màu xe phù hợp cho đơn hàng:</div>
        <br />

        <Select
          style={{ width: "100%" }}
          placeholder="Chọn màu xe"
          value={selectedColor}
          onChange={(value) => setSelectedColor(value)}
        >
          {carColors.map((c) => (
            <Select.Option key={c} value={c}>
              {c}
            </Select.Option>
          ))}
        </Select>
      </Modal>

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
