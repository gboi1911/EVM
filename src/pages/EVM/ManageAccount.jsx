import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Checkbox,
  Card,
  notification,
} from "antd";
import { createAccount } from "../../api/authen";

const roleOptions = [
  { label: "Đại lý", value: "DEALER_MANAGER" },
  { label: "Nhân viên đại lý", value: "DEALER_STAFF" },
  { label: "Nhân viên công ty", value: "EVM_STAFF" },
];

export default function ManageAccount() {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await createAccount(values);
      notification.success({
        message: "Tạo tài khoản thành công!",
        description: `Tài khoản ${values.username} đã được tạo.`,
        placement: "topRight",
      });
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg shadow-lg">
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
          <Form.Item
            name="isActive"
            valuePropName="checked"
            label="Kích hoạt tài khoản"
          >
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
    </div>
  );
}
