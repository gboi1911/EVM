import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Card,
  Table,
  Space,
  Tag,
  Modal,
} from "antd";
import {
  createAccount,
  getAllAccounts,
  banAccount,
  unbanAccount,
} from "../../api/authen";
import {
  ReloadOutlined,
  LockOutlined,
  UnlockOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { App as AntdApp } from "antd";

const roleOptions = [
  { label: "Đại lý", value: "DEALER_MANAGER" },
  { label: "Nhân viên đại lý", value: "DEALER_STAFF" },
  { label: "Nhân viên công ty", value: "EVM_STAFF" },
  { label: "Admin công ty", value: "EVM_ADMIN" },
];

export default function ManageAccount() {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const { notification } = AntdApp.useApp();

  // Load accounts
  const loadAccounts = async () => {
    setTableLoading(true);
    try {
      const data = await getAllAccounts(0, 100);
      setAccounts(data.userInfoGetDtos || []);
    } catch (err) {
      notification.error({
        message: "Tải danh sách tài khoản thất bại!",
      });
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = { ...values };

      if (payload.role !== "DEALER_STAFF") {
        delete payload.parentPhone;
      }

      await createAccount(payload);
      notification.success({
        message: "Tạo tài khoản thành công!",
      });

      loadAccounts();
      form.resetFields();
      setModalOpen(false);
    } catch (error) {
      notification.error({
        message: "Tạo tài khoản thất bại!",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanAccount = async (userId) => {
    await banAccount(userId);
    loadAccounts();
    notification.success({ message: "Vô hiệu hóa tài khoản thành công" });
  };

  const handleUnbanAccount = async (userId) => {
    await unbanAccount(userId);
    loadAccounts();
    notification.success({ message: "Kích hoạt tài khoản thành công" });
  };

  const columns = [
    { title: "Tên đăng nhập", dataIndex: "username", key: "username" },
    { title: "Họ và tên", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "SĐT cá nhân", dataIndex: "phone", key: "phone" },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const colorMap = {
          DEALER_MANAGER: "green",
          DEALER_STAFF: "blue",
          EVM_STAFF: "volcano",
          EVM_ADMIN: "purple",
        };
        const textMap = {
          DEALER_MANAGER: "Đại lý",
          DEALER_STAFF: "Nhân viên đại lý",
          EVM_STAFF: "Nhân viên công ty",
          EVM_ADMIN: "Admin công ty",
        };
        return <Tag color={colorMap[role]}>{textMap[role]}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active) =>
        active ? (
          <Tag color="success">Hoạt động</Tag>
        ) : (
          <Tag color="error">Vô hiệu</Tag>
        ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.isActive ? (
            <Button
              danger
              icon={<LockOutlined />}
              onClick={() => handleBanAccount(record.userId)}
            >
              Lock
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<UnlockOutlined />}
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleUnbanAccount(record.userId)}
            >
              Unlock
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-8 gap-8">
      <Card
        className="w-full max-w-6xl mx-auto shadow"
        title={
          <div className="flex justify-between items-center">
            <span className="text-emerald-700 font-semibold">
              Danh sách tài khoản
            </span>
            <div className="flex gap-3">
              <Button
                icon={<ReloadOutlined />}
                onClick={loadAccounts}
                className="text-emerald-700 border-emerald-700"
              >
                Tải lại
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setModalOpen(true)}
              >
                Tạo tài khoản
              </Button>
            </div>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="username"
          loading={tableLoading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      <Modal
        title="Tạo tài khoản người dùng"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText="Tạo"
        confirmLoading={loading}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          initialValues={{ isActive: true }}
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true }, { type: "email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="SĐT cá nhân"
            name="phone"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Thành phố" name="city" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Vai trò" name="role" rules={[{ required: true }]}>
            <Select options={roleOptions} />
          </Form.Item>

          <Form.Item
            shouldUpdate={(prev, cur) => prev.role !== cur.role}
            noStyle
          >
            {({ getFieldValue }) =>
              getFieldValue("role") === "DEALER_STAFF" ? (
                <Form.Item
                  label="SĐT cấp trên (parentPhone)"
                  name="parentPhone"
                  rules={[{ required: true }]}
                >
                  <Input placeholder="Số điện thoại Dealer Manager" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item name="level" label="Level" rules={[{ required: true }]}>
            <Input type="number" placeholder="VD: 0" />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" label="Trạng thái">
            <Checkbox>Hoạt động</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
