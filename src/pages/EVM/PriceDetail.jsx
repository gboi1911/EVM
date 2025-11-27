import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Checkbox,
  notification,
  Space,
  Popconfirm,
  Card,
  Select,
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
import { getCarModel } from "../../api/car";
import { App as AntdApp } from "antd";

export default function ManagePriceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notification } = AntdApp.useApp();

  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(null);
  const [carModels, setCarModels] = useState([]);

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

  useEffect(() => {
    fetchProgram();
    fetchCarModels();
  }, [id]);

  const fetchCarModels = async () => {
    try {
      const res = await getCarModel();
      setCarModels(res || []);
    } catch {
      notification.error({ message: "Failed to load car models" });
    }
  };

  // Xử lý nút OK trong modal form
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (editing) {
        setLoading(true);
        try {
          await updateDetailInPriceProgram(editing.id, values);
          notification.success({ message: "Updated successfully" });
          setModalOpen(false);
          setEditing(null);
          fetchProgram();
        } catch {
          notification.error({ message: "Update failed" });
        } finally {
          setLoading(false);
        }
        return;
      }

      // CREATE MODE → lưu formValues và mở confirm modal controlled
      setFormValues(values);
      setConfirmModalOpen(true);
    } catch (e) {
      notification.error({ message: "Validation failed" });
    }
  };

  // Xử lý khi user chọn Đồng Ý / Từ Chối
  const handleConfirm = async (isAutoFilling) => {
    setConfirmModalOpen(false);
    if (!formValues) return;

    setLoading(true);
    try {
      await addDetailToPriceProgram(id, { ...formValues }, isAutoFilling);
      notification.success({
        message: isAutoFilling
          ? "Thêm thành công (tự động bổ sung giá)"
          : "Thêm thành công (không autoFill)",
      });
      setModalOpen(false);
      fetchProgram();
    } catch {
      notification.error({ message: "Operation failed" });
    } finally {
      setLoading(false);
      setFormValues(null); // reset sau khi API xong
    }
  };

  const handleRemove = async (detailId) => {
    setLoading(true);
    try {
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
      title: "Màu đặc biệt",
      dataIndex: "isSpecialColor",
      render: (val) => (val ? "✅" : "❌"),
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

      {/* Modal form */}
      <Modal
        title={editing ? "Cập nhật giá" : "Thêm giá mới"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mẫu xe"
            name="carModelId"
            rules={[{ required: true, message: "Please select a car model" }]}
          >
            <Select placeholder="Chọn mẫu xe">
              {carModels.map((model) => (
                <Select.Option key={model.id} value={model.id}>
                  {model.carModelName}
                </Select.Option>
              ))}
            </Select>
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
          <Form.Item name="isSpecialColor" valuePropName="checked">
            <Checkbox>Màu đặc biệt</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal confirm controlled */}
      <Modal
        title="Cảnh báo thiếu giá bán"
        open={confirmModalOpen}
        onCancel={() => setConfirmModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => handleConfirm(false)}>
            TỪ CHỐI
          </Button>,
          <Button key="ok" type="primary" onClick={() => handleConfirm(true)}>
            ĐỒNG Ý
          </Button>,
        ]}
      >
        Chương trình giá hiện tại chưa có giá cho một số mẫu xe.
        <br />
        Bạn có muốn hệ thống tự bổ sung giá bán từ chương trình gần nhất không?
      </Modal>
    </div>
  );
}
