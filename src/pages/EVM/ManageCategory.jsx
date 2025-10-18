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
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  removeCategory,
} from "../../api/category";

export default function ManageCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // ✅ Load categories from backend
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetchCategories();
      setCategories(response.carInfoGetDtos || []);
    } catch (err) {
      notification.error({
        message: "Lỗi tải danh mục",
        description: "Không thể tải dữ liệu từ máy chủ.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ✅ Open modal for Add / Edit
  const openModal = (record = null) => {
    setEditing(record);
    setModalOpen(true);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
  };

  // ✅ Add / Update category
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editing) {
        await updateCategory(editing.id, values);
        notification.success({ message: "Cập nhật danh mục thành công!" });
      } else {
        await addCategory(values);
        notification.success({ message: "Thêm danh mục thành công!" });
      }

      // ✅ Refresh list after action
      await loadData();

      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    } catch (err) {
      notification.error({
        message: "Lỗi khi lưu danh mục",
        description: "Vui lòng kiểm tra lại thông tin hoặc thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Remove category
  const handleRemove = async (id) => {
    setLoading(true);
    try {
      await removeCategory(id);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      notification.success({ message: "Xóa danh mục thành công!" });
    } catch {
      notification.error({ message: "Xóa danh mục thất bại!" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Table columns
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Tên danh mục", dataIndex: "categoryName", key: "categoryName" },
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
            Quản lý danh mục xe
          </h2>
          <div className="flex gap-2">
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              className="text-emerald-700 border-emerald-700"
            >
              Tải lại
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Thêm mới
            </Button>
          </div>
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
            label="Tên danh mục"
            name="categoryName"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục!" }]}
          >
            <Input placeholder="Nhập tên danh mục (VD: Sedan, SUV...)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
