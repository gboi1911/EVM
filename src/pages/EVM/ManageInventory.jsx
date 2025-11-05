import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Popconfirm,
  notification,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
} from "@ant-design/icons";

// Dummy API functions (replace with your real API)
const fetchInventory = async () => [
  {
    id: 1,
    model: "VF e34",
    version: "Premium",
    color: "Trắng",
    quantity: 20,
    dealer: "Đại lý Hà Nội",
  },
  {
    id: 2,
    model: "VF 8",
    version: "Eco",
    color: "Đen",
    quantity: 10,
    dealer: "Đại lý Hồ Chí Minh",
  },
  {
    id: 3,
    model: "VF 9",
    version: "Plus",
    color: "Xanh",
    quantity: 5,
    dealer: "Đại lý Đà Nẵng",
  },
];
const addInventory = async (data) => ({
  ...data,
  id: Math.floor(Math.random() * 1000),
});
const updateInventory = async (id, data) => ({ id, ...data });
const removeInventory = async (id) => true;

const modelOptions = [
  { label: "VF e34", value: "VF e34" },
  { label: "VF 8", value: "VF 8" },
  { label: "VF 9", value: "VF 9" },
];
const versionOptions = [
  { label: "Eco", value: "Eco" },
  { label: "Plus", value: "Plus" },
  { label: "Premium", value: "Premium" },
];
const colorOptions = [
  { label: "Trắng", value: "Trắng" },
  { label: "Đen", value: "Đen" },
  { label: "Xanh", value: "Xanh" },
  { label: "Đỏ", value: "Đỏ" },
  { label: "Bạc", value: "Bạc" },
];
const dealerOptions = [
  { label: "Đại lý Hà Nội", value: "Đại lý Hà Nội" },
  { label: "Đại lý Hồ Chí Minh", value: "Đại lý Hồ Chí Minh" },
  { label: "Đại lý Đà Nẵng", value: "Đại lý Đà Nẵng" },
];

export default function ManageInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // Load inventory
  useEffect(() => {
    setLoading(true);
    fetchInventory()
      .then(setInventory)
      .finally(() => setLoading(false));
  }, []);

  // Open modal for add/update
  const openModal = (record = null) => {
    setEditing(record);
    setModalOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  // Add or update inventory
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editing) {
        const updated = await updateInventory(editing.id, values);
        setInventory((prev) =>
          prev.map((item) => (item.id === editing.id ? updated : item))
        );
        notification.success({ message: "Cập nhật thành công!" });
      } else {
        const added = await addInventory(values);
        setInventory((prev) => [...prev, added]);
        notification.success({ message: "Thêm mới thành công!" });
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      // Validation error
    } finally {
      setLoading(false);
    }
  };

  // Remove inventory
  const handleRemove = async (id) => {
    setLoading(true);
    await removeInventory(id);
    setInventory((prev) => prev.filter((item) => item.id !== id));
    notification.success({ message: "Xóa thành công!" });
    setLoading(false);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Mẫu xe", dataIndex: "model", key: "model" },
    { title: "Phiên bản", dataIndex: "version", key: "version" },
    { title: "Màu sắc", dataIndex: "color", key: "color" },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    { title: "Đại lý", dataIndex: "dealer", key: "dealer" },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            type="link"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleRemove(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 py-8 px-0 flex items-center justify-center">
      <Card
        className="w-full h-full max-w-7xl mx-auto shadow"
        style={{ minHeight: "80vh", width: "100%" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-emerald-700">
            Quản lý tồn kho tổng & điều phối xe cho đại lý
          </h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Thêm mới
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={inventory}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
      <Modal
        title={editing ? "Cập nhật tồn kho" : "Thêm mới tồn kho"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText={editing ? "Cập nhật" : "Thêm mới"}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mẫu xe"
            name="model"
            rules={[{ required: true, message: "Vui lòng chọn mẫu xe!" }]}
          >
            <Select options={modelOptions} placeholder="Chọn mẫu xe" />
          </Form.Item>
          <Form.Item
            label="Phiên bản"
            name="version"
            rules={[{ required: true, message: "Vui lòng chọn phiên bản!" }]}
          >
            <Select options={versionOptions} placeholder="Chọn phiên bản" />
          </Form.Item>
          <Form.Item
            label="Màu sắc"
            name="color"
            rules={[{ required: true, message: "Vui lòng chọn màu sắc!" }]}
          >
            <Select options={colorOptions} placeholder="Chọn màu sắc" />
          </Form.Item>
          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
          >
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item
            label="Đại lý"
            name="dealer"
            rules={[{ required: true, message: "Vui lòng chọn đại lý!" }]}
          >
            <Select options={dealerOptions} placeholder="Chọn đại lý" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
