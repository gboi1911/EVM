import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Card,
  notification,
  Table,
  Space,
  Tag,
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
} from "@ant-design/icons";

const roleOptions = [
  { label: "Đại lý", value: "DEALER_MANAGER" },
  { label: "Nhân viên đại lý", value: "DEALER_STAFF" },
  { label: "Nhân viên công ty", value: "EVM_STAFF" },
];

export default function ManageAccount() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // Load accounts from API
  const loadAccounts = async () => {
    setTableLoading(true);
    try {
      const data = await getAllAccounts(0, 10);
      setAccounts(data.userInfoGetDtos || []);
    } catch (err) {
      notification.error({
        message: "Tải danh sách tài khoản thất bại!",
        description: "Không thể lấy danh sách người dùng, vui lòng thử lại.",
        placement: "topRight",
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
      await createAccount(values);
      notification.success({
        message: "Tạo tài khoản thành công!",
        description: `Tài khoản ${values.username} đã được tạo.`,
        placement: "topRight",
      });
      form.resetFields();
      loadAccounts(); // refresh list
    } catch (error) {
      notification.error({
        message: "Tạo tài khoản thất bại!",
        description: "Vui lòng kiểm tra lại thông tin hoặc thử lại sau.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanAccount = async (userId) => {
    try {
      await banAccount(userId);
      notification.success({
        message: "Vô hiệu hóa tài khoản thành công",
        placement: "topRight",
      });
      loadAccounts(); // Refresh list
    } catch (err) {
      notification.error({
        message: "Vô hiệu hóa tài khoản thất bại",
        description: err.message,
        placement: "topRight",
      });
    }
  };

  const handleUnbanAccount = async (userId) => {
    try {
      await unbanAccount(userId);
      notification.success({
        message: "Kích hoạt tài khoản thành công",
        placement: "topRight",
      });
      loadAccounts(); // Refresh list
    } catch (err) {
      notification.error({
        message: "Kích hoạt tài khoản thất bại",
        description: err.message,
        placement: "topRight",
      });
    }
  };

  const columns = [
    { title: "Tên đăng nhập", dataIndex: "username", key: "username" },
    { title: "Họ và tên", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Số điện thoại", dataIndex: "phone", key: "phone" },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: "Đại lý (Dealer Manager)", value: "DEALER_MANAGER" },
        { text: "Nhân viên đại lý (Dealer Staff)", value: "DEALER_STAFF" },
        { text: "Nhân viên công ty (EVM Staff)", value: "EVM_STAFF" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => {
        const colorMap = {
          DEALER_MANAGER: "green",
          DEALER_STAFF: "blue",
          EVM_STAFF: "volcano",
        };
        const textMap = {
          DEALER_MANAGER: "Đại lý",
          DEALER_STAFF: "Nhân viên đại lý",
          EVM_STAFF: "Nhân viên công ty",
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
    <div className="min-h-screen bg-gray-50 flex flex-col p-8">
      <Card className="flex-1 w-full shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-emerald-700 mb-6 text-center">
          Tạo tài khoản người dùng
        </h2>
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ isActive: true, role: "DEALER_MANAGER" }}
        >
          <Form.Item
            label="Tên đăng nhập"
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select options={roleOptions} />
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked" label="Trạng thái">
            <Checkbox>Hoạt động</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Tạo tài khoản
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* ACCOUNTS TABLE */}
      <Card
        className="w-full max-w-6xl mx-auto shadow"
        title={
          <div className="flex justify-between items-center">
            <span className="text-emerald-700 font-semibold">
              Danh sách tài khoản
            </span>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadAccounts}
              className="text-emerald-700 border-emerald-700"
            >
              Tải lại
            </Button>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={accounts}
          rowKey="username"
          loading={tableLoading}
          pagination={false}
        />
      </Card>
    </div>
  );
}
