import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  notification,
  Card,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

// Dummy API functions (replace with your real API)
const fetchCategories = async () => [
  { id: 1, type: "SUV" },
  { id: 2, type: "Sedan" },
  { id: 3, type: "Hatchback" },
];
const addCategory = async (data) => ({
  ...data,
  id: Math.floor(Math.random() * 1000),
});
const updateCategory = async (id, data) => ({ id, ...data });
const removeCategory = async (id) => true;

export default function ManageCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // Load categories
  useEffect(() => {
    setLoading(true);
    fetchCategories()
      .then(setCategories)
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

  // Add or update category
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editing) {
        const updated = await updateCategory(editing.id, values);
        setCategories((prev) =>
          prev.map((cat) => (cat.id === editing.id ? updated : cat))
        );
        notification.success({ message: "Cập nhật thành công!" });
      } else {
        const added = await addCategory(values);
        setCategories((prev) => [...prev, added]);
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

  // Remove category
  const handleRemove = async (id) => {
    setLoading(true);
    await removeCategory(id);
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    notification.success({ message: "Xóa thành công!" });
    setLoading(false);
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Loại danh mục", dataIndex: "type", key: "type" },
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
            Quản lý danh mục xe điện
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
          dataSource={categories}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
      <Modal
        title={editing ? "Cập nhật danh mục" : "Thêm mới danh mục"}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText={editing ? "Cập nhật" : "Thêm mới"}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Loại danh mục"
            name="type"
            rules={[
              { required: true, message: "Vui lòng nhập loại danh mục!" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
