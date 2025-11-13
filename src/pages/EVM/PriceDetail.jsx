import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  notification,
  Space,
  Popconfirm,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import {
  getPriceDetailsById,
  addDetailToPriceProgram,
  updateDetailInPriceProgram,
  removeDetailFromPriceProgram,
} from "../../api/price";

export default function ManagePriceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchProgram = async () => {
    setLoading(true);
    try {
      const res = await getPriceDetailsById(id);
      setProgram(res);
    } catch {
      notification.error({ message: "Failed to load program details" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const openModal = (detail = null) => {
    setEditing(detail);
    setModalOpen(true);
    if (detail) form.setFieldsValue(detail);
    else form.resetFields();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editing) {
        await updateDetailInPriceProgram(editing.id, values);
        notification.success({ message: "Updated successfully" });
      } else {
        await addDetailToPriceProgram(id, values);
        notification.success({ message: "Added successfully" });
      }
      setModalOpen(false);
      setEditing(null);
      fetchProgram();
    } catch {
      notification.error({ message: "Operation failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (detailId) => {
    try {
      setLoading(true);
      await removeDetailFromPriceProgram(detailId);
      notification.success({ message: "Deleted successfully" });
      fetchProgram();
    } catch {
      notification.error({ message: "Delete failed" });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Mẫu xe", dataIndex: "carModelName", key: "carModelName" },
    {
      title: "Giá thấp nhất",
      dataIndex: "minPrice",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Giá đề xuất",
      dataIndex: "suggestedPrice",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Giá cao nhất",
      dataIndex: "maxPrice",
      render: (val) => val?.toLocaleString(),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => openModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleRemove(record.id)}
          >
            <Button icon={<DeleteOutlined />} type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center">
      <Card className="w-full max-w-6xl shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              type="text"
            />
            <h2 className="text-xl font-bold text-emerald-700">
              Price Program #{id} - Details
            </h2>
          </div>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => openModal()}
          >
            Thêm giá mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={program?.programDetails || []}
          rowKey="id"
          pagination={false}
          loading={loading}
        />
      </Card>

      <Modal
        title={editing ? "Cập nhật giá" : "Thêm giá mới"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="ID Mẫu xe"
            name="carModelId"
            rules={[{ required: true, message: "Please input car model ID" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Giá thấp nhất"
            name="minPrice"
            rules={[{ required: true, message: "Please input min price" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Giá đề xuất"
            name="suggestedPrice"
            rules={[
              { required: true, message: "Please input suggested price" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Giá cao nhất"
            name="maxPrice"
            rules={[{ required: true, message: "Please input max price" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
