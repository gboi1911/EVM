import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Divider,
  Typography,
  notification,
  Spin,
} from "antd";
import { getProfile, updateProfile, changePassword, getCurrentDealerInfo } from "../api/authen";


const { Title, Text } = Typography;

export default function Profile() {
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const [profile, setProfile] = useState(null);
  const [dealer, setDealer] = useState(null);

  const [profileForm] = Form.useForm();
  const [passForm] = Form.useForm();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoadingProfile(true);
      try {
        const p = await getProfile();
        const d = await getCurrentDealerInfo();

        if (!mounted) return;

        setProfile(p);
        setDealer(d);

        profileForm.setFieldsValue({
          fullName: p.fullName,
          email: p.email,
          phone: p.phone,
        });
      } catch (err) {
        notification.error({
          message: "Không thể tải hồ sơ",
          description: err?.message || "",
        });
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };

    fetchData();
    return () => (mounted = false);
  }, []);

  const onSaveProfile = async (values) => {
    if (!profile) return;
    setSavingProfile(true);
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
      };

      await updateProfile(profile.userId, payload);
      notification.success({ message: "Cập nhật hồ sơ thành công" });

      const refreshed = await getProfile();
      setProfile(refreshed);

      profileForm.setFieldsValue({
        fullName: refreshed.fullName,
        email: refreshed.email,
        phone: refreshed.phone,
      });
    } catch (err) {
      notification.error({
        message: "Cập nhật thất bại",
        description: err?.message || "",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (values) => {
    setChangingPass(true);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      notification.success({ message: "Đổi mật khẩu thành công" });
      passForm.resetFields();
    } catch (err) {
      notification.error({
        message: "Đổi mật khẩu thất bại",
        description: err?.message || "",
      });
    } finally {
      setChangingPass(false);
    }
  };

  if (loadingProfile || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin />
      </div>
    );
  }

  return (
      <div className="p-6 bg-white min-h-screen">
    <Card className="shadow-sm">
     <Row gutter={16}>
  {/* Cột trái */}
  <Col xs={24} md={12}>
    {dealer && (
      <Card size="small" title="Thông tin đại lý" bordered>
        <div><Text strong>Tên đại lý: </Text> {dealer.dealerName}</div>
        <div><Text strong>Điện thoại: </Text> {dealer.phone}</div>
        <div><Text strong>Cấp độ đại lý: </Text> {dealer.dealerLevel}</div>
        <div><Text strong>Địa chỉ: </Text> {dealer.location}</div>
        <Divider />
        <div>
          <Text strong>📄 Hợp đồng đại lý: </Text>
          <a href={dealer.contractFileUrl} target="_blank" rel="noopener noreferrer">Xem hợp đồng PDF</a>
        </div>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">Người đại diện ký kết: <Text strong>{profile.fullName}</Text> ({profile.role})</Text>
        </div>
      </Card>
    )}

    <Divider />

    <Card size="small" title="Cập nhật hồ sơ cá nhân" bordered>
      <Form form={profileForm} layout="vertical" onFinish={onSaveProfile}>
        <Form.Item label="Họ & tên" name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email" }, { type: "email", message: "Email không hợp lệ" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={savingProfile}>Lưu hồ sơ</Button>
        </Form.Item>
      </Form>
    </Card>
  </Col>

  {/* Cột phải */}
  <Col xs={24} md={12}>
    <Card size="small" title="Thông tin đăng nhập" bordered>
      <div><Text strong>Username: </Text> {profile.username}</div>
      <div><Text strong>Vai trò: </Text> {profile.role}</div>
      <div><Text strong>Trạng thái: </Text> {profile.isActive ? "Hoạt động" : "Không hoạt động"}</div>
    </Card>

    <Divider />

    <Card size="small" title="Đổi mật khẩu" bordered>
      <Form form={passForm} layout="vertical" onFinish={onChangePassword}>
        <Form.Item label="Mật khẩu hiện tại" name="currentPassword" rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item label="Mật khẩu mới" name="newPassword" rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới" }, { min: 6, message: "Mật khẩu mới ít nhất 6 ký tự" }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item label="Xác nhận mật khẩu mới" name="confirm" dependencies={["newPassword"]} rules={[{ required: true, message: "Vui lòng xác nhận mật khẩu mới" }, ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
            return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
          },
        })]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={changingPass}>Đổi mật khẩu</Button>
        </Form.Item>
      </Form>
    </Card>
  </Col>
</Row>
    </Card>
  </div>
);
}
