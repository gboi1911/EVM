import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Card,
  Descriptions,
  notification,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  getMotors,
  getMotorById,
  updateMotor,
  createMotor,
  deleteMotor,
} from "../../api/motor";

export default function ManageMotor() {
  const [motors, setMotors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMotor, setSelectedMotor] = useState(null);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'
  const [form] = Form.useForm();

  const loadMotors = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const res = await getMotors(page - 1, pageSize);
      setMotors(res.motorDetailGetDtos || []);
      setPagination({
        current: (res.pageNo ?? 0) + 1,
        pageSize: res.pageSize ?? pageSize,
        total: res.totalElements ?? 0,
      });
    } catch (err) {
      notification.error({
        message: "Không thể tải động cơ",
        description: err?.message || "",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMotors();
  }, []);

  const handleTableChange = (pg) => {
    loadMotors(pg.current, pg.pageSize);
  };

  const openView = async (id) => {
    setLoading(true);
    try {
      const m = await getMotorById(id);
      setSelectedMotor(m);
      setViewModalOpen(true);
    } catch (err) {
      notification.error({
        message: "Không thể tải chi tiết",
        description: err?.message || "",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setMode("create");
    form.resetFields();
    setSelectedMotor(null);
    setEditModalOpen(true);
  };

  const openEdit = async (id) => {
    setLoading(true);
    try {
      const m = await getMotorById(id);
      setSelectedMotor(m);
      form.setFieldsValue({
        motorType: m.motorType,
        serialNumber: m.serialNumber,
        powerKw: m.powerKw,
        torqueNm: m.torqueNm,
        maxRpm: m.maxRpm,
        coolingType: m.coolingType,
        voltageRangeV: m.voltageRangeV,
      });
      setMode("edit");
      setEditModalOpen(true);
    } catch (err) {
      notification.error({
        message: "Không thể tải để chỉnh sửa",
        description: err?.message || "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (typeof deleteMotor !== "function") {
        notification.error({
          message: "API deleteMotor không được định nghĩa",
        });
        return;
      }
      await deleteMotor(id);
      notification.success({ message: "Xóa thành công" });

      // if currently viewing or editing the deleted item, close modals and clear state
      if (selectedMotor?.motorId === id) {
        setViewModalOpen(false);
        setEditModalOpen(false);
        setSelectedMotor(null);
        form.resetFields();
        setMode("create");
      }

      // refetch list with current pagination
      await loadMotors(pagination.current, pagination.pageSize);
    } catch (err) {
      notification.error({
        message: "Xóa thất bại",
        description: err?.message || "",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (mode === "create") {
        await createMotor(values);
        notification.success({ message: "Tạo động cơ thành công" });
      } else if (mode === "edit" && selectedMotor) {
        await updateMotor(selectedMotor.motorId, values);
        notification.success({ message: "Cập nhật động cơ thành công" });
      }
      // close modal and reset state on success
      setEditModalOpen(false);
      setViewModalOpen(false);
      setSelectedMotor(null);
      form.resetFields(); // clear all form fields after success
      setMode("create"); // reset mode to create by default
      // reload list
      loadMotors(pagination.current, pagination.pageSize);
    } catch (err) {
      notification.error({
        message: "Lưu thất bại",
        description: err?.message || "",
      });
    }
  };

  const columns = [
    { title: "Motor ID", dataIndex: "motorId", key: "motorId", width: 100 },
    { title: "Loại động cơ", dataIndex: "motorType", key: "motorType" },
    { title: "Serial", dataIndex: "serialNumber", key: "serialNumber" },
    {
      title: "Công suất (kW)",
      dataIndex: "powerKw",
      key: "powerKw",
      width: 140,
    },
    {
      title: "Mô-men (Nm)",
      dataIndex: "torqueNm",
      key: "torqueNm",
      width: 120,
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => openView(record.motorId)}
          >
            Xem
          </Button>
          <Button
            icon={<EditOutlined />}
            type="primary"
            onClick={() => openEdit(record.motorId)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa?"
            onConfirm={() => handleDelete(record.motorId)}
          >
            <Button icon={<DeleteOutlined />} danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="Quản lý động cơ">
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Tạo xe mới
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={motors}
          rowKey="motorId"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="Chi tiết"
        open={viewModalOpen}
        footer={null}
        onCancel={() => setViewModalOpen(false)}
        width={700}
      >
        {selectedMotor ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">
              {selectedMotor.motorId}
            </Descriptions.Item>
            <Descriptions.Item label="Loại">
              {selectedMotor.motorType}
            </Descriptions.Item>
            <Descriptions.Item label="Serial">
              {selectedMotor.serialNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Công suất (kW)">
              {selectedMotor.powerKw}
            </Descriptions.Item>
            <Descriptions.Item label="Mô-men (Nm)">
              {selectedMotor.torqueNm}
            </Descriptions.Item>
            <Descriptions.Item label="Max RPM">
              {selectedMotor.maxRpm}
            </Descriptions.Item>
            <Descriptions.Item label="Giảm nhiệt">
              {selectedMotor.coolingType}
            </Descriptions.Item>
            <Descriptions.Item label="Điện áp (V)">
              {selectedMotor.voltageRangeV}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>

      <Modal
        title={mode === "create" ? "Thêm xe động cơ" : "Chỉnh sửa thông tin"}
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleSubmit}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="motorType"
            label="Loại động cơ"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="serialNumber"
            label="Số serial"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="powerKw"
            label="Công suất (kW)"
            rules={[{ required: true, type: "number" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="torqueNm"
            label="Mô-men xoắn (Nm)"
            rules={[{ required: true, type: "number" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="maxRpm"
            label="Max RPM"
            rules={[{ required: true, type: "number" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="coolingType"
            label="Loại giảm nhiệt"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="voltageRangeV"
            label="Điện áp (V)"
            rules={[{ required: true, type: "number" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
