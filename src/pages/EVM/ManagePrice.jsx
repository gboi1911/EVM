import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Input,
  Space,
  Popconfirm,
  notification,
  Card,
  Select,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

// 🧩 Dummy API (replace later with real API calls)
const fetchPrices = async () => [
  {
    id: 1,
    dealer: "Đại lý Hà Nội",
    model: "VF 8",
    wholesalePrice: 900000000,
    discount: 5,
    promotion: "Giảm 10 triệu tháng 10",
  },
  {
    id: 2,
    dealer: "Đại lý TP.HCM",
    model: "VF e34",
    wholesalePrice: 700000000,
    discount: 3,
    promotion: "Tặng bảo hiểm 1 năm",
  },
];

const addPrice = async (data) => ({
  ...data,
  id: Math.floor(Math.random() * 10000),
});
const updatePrice = async (id, data) => ({ id, ...data });
const removePrice = async (id) => true;

const dealerOptions = [
  { label: "Đại lý Hà Nội", value: "Đại lý Hà Nội" },
  { label: "Đại lý TP.HCM", value: "Đại lý TP.HCM" },
  { label: "Đại lý Đà Nẵng", value: "Đại lý Đà Nẵng" },
];
const modelOptions = [
  { label: "VF e34", value: "VF e34" },
  { label: "VF 8", value: "VF 8" },
  { label: "VF 9", value: "VF 9" },
];

export default function ManagePrice() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    setLoading(true);
    fetchPrices()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const openModal = (record = null) => {
    setEditing(record);
    setModalOpen(true);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editing) {
        const updated = await updatePrice(editing.id, values);
        setData((prev) =>
          prev.map((item) => (item.id === editing.id ? updated : item))
        );
        notification.success({ message: "Cập nhật thành công!" });
      } else {
        const added = await addPrice(values);
        setData((prev) => [...prev, added]);
        notification.success({ message: "Thêm mới thành công!" });
      }
      setModalOpen(false);
      setEditing(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    setLoading(true);
    await removePrice(id);
    setData((prev) => prev.filter((item) => item.id !== id));
    notification.success({ message: "Xóa thành công!" });
    setLoading(false);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Đại lý", dataIndex: "dealer", key: "dealer" },
    { title: "Mẫu xe", dataIndex: "model", key: "model" },
    {
      title: "Giá sỉ (VNĐ)",
      dataIndex: "wholesalePrice",
      key: "wholesalePrice",
      render: (value) => value.toLocaleString("vi-VN"),
    },
    { title: "Chiết khấu (%)", dataIndex: "discount", key: "discount" },
    { title: "Khuyến mãi", dataIndex: "promotion", key: "promotion" },
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
    <div className="min-h-screen w-full bg-gray-50 py-8 flex items-center justify-center">
      <Card
        className="w-full max-w-7xl mx-auto shadow"
        style={{ minHeight: "80vh", width: "100%" }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-emerald-700">
            Quản lý giá sỉ, chiết khấu, khuyến mãi theo đại lý
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
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 6 }}
        />
      </Card>

      <Modal
        title={
          editing ? "Cập nhật thông tin giá" : "Thêm mới giá sỉ / khuyến mãi"
        }
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText={editing ? "Cập nhật" : "Thêm mới"}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Đại lý"
            name="dealer"
            rules={[{ required: true, message: "Vui lòng chọn đại lý!" }]}
          >
            <Select options={dealerOptions} placeholder="Chọn đại lý" />
          </Form.Item>

          <Form.Item
            label="Mẫu xe"
            name="model"
            rules={[{ required: true, message: "Vui lòng chọn mẫu xe!" }]}
          >
            <Select options={modelOptions} placeholder="Chọn mẫu xe" />
          </Form.Item>

          <Form.Item
            label="Giá sỉ (VNĐ)"
            name="wholesalePrice"
            rules={[{ required: true, message: "Vui lòng nhập giá sỉ!" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/,/g, "")}
              placeholder="Nhập giá sỉ"
            />
          </Form.Item>

          <Form.Item label="Chiết khấu (%)" name="discount">
            <InputNumber
              min={0}
              max={100}
              style={{ width: "100%" }}
              placeholder="%"
            />
          </Form.Item>

          <Form.Item label="Khuyến mãi" name="promotion">
            <Input placeholder="Nhập mô tả khuyến mãi (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
