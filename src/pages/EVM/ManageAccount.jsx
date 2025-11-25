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
  Divider,
} from "antd";

import {
  getAllAccounts,
  banAccount,
  unbanAccount,
  createAccountForDealer,
  createEvdAccount,
  registryDealer,
  getDealerInfo,
} from "../../api/authen";

import {
  ReloadOutlined,
  LockOutlined,
  UnlockOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { App as AntdApp } from "antd";

export default function ManageAccount() {
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // dealer list
  const [dealerList, setDealerList] = useState([]);

  const { notification } = AntdApp.useApp();

  // ======================= LOAD ACCOUNTS ==========================
  const loadAccounts = async () => {
    setTableLoading(true);
    try {
      const data = await getAllAccounts(0, 100);
      setAccounts(data.userInfoGetDtos || []);
    } catch (err) {
      notification.error({ message: "Tải danh sách tài khoản thất bại!" });
    } finally {
      setTableLoading(false);
    }
  };

  // load accounts on first render
  useEffect(() => {
    loadAccounts();
  }, []);

  // ======================= LOAD DEALER INFO =======================
  const loadDealerInfo = async () => {
    try {
      const data = await getDealerInfo();
      setDealerList(data || []);
    } catch (err) {
      notification.error({
        message: "Không tải được danh sách đại lý!",
      });
    }
  };

  // ======================= SUBMIT FORM ============================
  const onFinish = async (values) => {
    setLoading(true);

    try {
      const type = values.registerType;

      // ========== API 1: Tạo đại lý + account đầu tiên ===========
      if (type === "REGISTRY_DEALER") {
        const payload = {
          dealerInfo: {
            dealerName: values.dealerName,
            dealerPhone: values.dealerPhone,
            dealerLevel: values.dealerLevel,
            location: values.dealerLocation,
          },
          dealerAccount: {
            dealerInfoId: null,
            username: values.username,
            password: values.password,
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            city: values.city,
            isActive: values.isActive,
            role: "DEALER_MANAGER",
          },
        };

        await registryDealer(payload);
      }

      // ========== API 2: Tạo account đại lý ===========
      else if (type === "CREATE_DEALER_ACCOUNT") {
        const payload = {
          dealerInfoId: values.dealerInfoId,
          username: values.username,
          password: values.password,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          city: values.city,
          isActive: values.isActive,
          role: values.role, // DEALER_MANAGER hoặc DEALER_STAFF
        };

        await createAccountForDealer(payload);
      }

      // ========== API 3: Tạo account hãng xe ===========
      else if (type === "CREATE_EVD_ACCOUNT") {
        const payload = {
          username: values.username,
          password: values.password,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          city: values.city,
          isActive: values.isActive,
          role: values.role, // EVD_STAFF hoặc EVD_ADMIN
        };

        await createEvdAccount(payload);
      }

      notification.success({ message: "Tạo tài khoản thành công!" });
      loadAccounts();
      form.resetFields();
      setModalOpen(false);
    } catch (error) {
      console.log("API Error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Đã xảy ra lỗi khi tạo tài khoản!";

      notification.error({
        message: "Tạo tài khoản thất bại!",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================= BAN / UNBAN ============================
  const handleBan = async (userId) => {
    await banAccount(userId);
    loadAccounts();
    notification.success({ message: "Đã vô hiệu hóa" });
  };

  const handleUnban = async (userId) => {
    await unbanAccount(userId);
    loadAccounts();
    notification.success({ message: "Đã kích hoạt" });
  };

  // ======================= TABLE COLUMNS ==========================
  const columns = [
    { title: "Username", dataIndex: "username" },
    { title: "Họ và tên", dataIndex: "fullName" },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phone" },
    {
      title: "Vai trò",
      dataIndex: "role",
      render: (role) => {
        const map = {
          DEALER_MANAGER: "green",
          DEALER_STAFF: "blue",
          EVD_STAFF: "orange",
          EVD_ADMIN: "purple",
          EVM_STAFF: "volcano",
          EVM_ADMIN: "red",
        };
        return <Tag color={map[role]}>{role}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive) =>
        isActive ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Locked</Tag>
        ),
    },
    {
      title: "Hành động",
      render: (_, r) => (
        <Space>
          {r.isActive ? (
            <Button
              danger
              icon={<LockOutlined />}
              onClick={() => handleBan(r.userId)}
            >
              Lock
            </Button>
          ) : (
            <Button
              type="primary"
              className="bg-emerald-600"
              icon={<UnlockOutlined />}
              onClick={() => handleUnban(r.userId)}
            >
              Unlock
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-8">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="text-emerald-700 font-semibold">
              Danh sách tài khoản
            </span>
            <div className="flex gap-3">
              <Button icon={<ReloadOutlined />} onClick={loadAccounts}>
                Tải lại
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-emerald-600"
                onClick={() => {
                  loadDealerInfo();
                  setModalOpen(true);
                }}
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

      {/* ======================== MODAL TẠO ACCOUNT ======================== */}
      <Modal
        title="Tạo tài khoản"
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
          {/* Chọn loại tạo */}
          <Form.Item
            label="Loại đăng ký"
            name="registerType"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                {
                  label: "Đăng ký Đại lý + account đầu tiên",
                  value: "REGISTRY_DEALER",
                },
                {
                  label: "Tạo Account cho Đại lý",
                  value: "CREATE_DEALER_ACCOUNT",
                },
                {
                  label: "Tạo Account cho Hãng xe",
                  value: "CREATE_EVD_ACCOUNT",
                },
              ]}
            />
          </Form.Item>

          {/* ====================== FORM PHỤ THAY ĐỔI THEO TYPE ====================== */}
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const t = getFieldValue("registerType");

              // ========== API 1: Registry Dealer ==========
              if (t === "REGISTRY_DEALER") {
                return (
                  <>
                    <Divider>Thông tin Đại lý</Divider>
                    <Form.Item
                      name="dealerName"
                      label="Tên đại lý"
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="dealerPhone"
                      label="SĐT đại lý"
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name="dealerLevel"
                      label="Cấp đại lý"
                      rules={[{ required: true }]}
                    >
                      <Input type="number" />
                    </Form.Item>
                    <Form.Item
                      name="dealerLocation"
                      label="Địa chỉ"
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>

                    <Divider>Account quản lý đại lý (DEALER_MANAGER)</Divider>
                  </>
                );
              }

              // ========== API 2: Tạo account đại lý ==========
              if (t === "CREATE_DEALER_ACCOUNT") {
                return (
                  <>
                    <Divider>Chọn đại lý</Divider>
                    <Form.Item
                      name="dealerInfoId"
                      label="Đại lý"
                      rules={[{ required: true }]}
                    >
                      <Select
                        options={dealerList.map((d) => ({
                          label: d.dealerName,
                          value: d.dealerInfoId,
                        }))}
                      />
                    </Form.Item>

                    <Divider>Chọn vai trò</Divider>
                    <Form.Item
                      name="role"
                      label="Role"
                      rules={[{ required: true }]}
                    >
                      <Select
                        options={[
                          { label: "DEALER_MANAGER", value: "DEALER_MANAGER" },
                          { label: "DEALER_STAFF", value: "DEALER_STAFF" },
                        ]}
                      />
                    </Form.Item>
                  </>
                );
              }

              // ========== API 3: Tạo account hãng xe ==========
              if (t === "CREATE_EVD_ACCOUNT") {
                return (
                  <>
                    <Divider>Chọn vai trò</Divider>
                    <Form.Item
                      name="role"
                      label="Role"
                      rules={[{ required: true }]}
                    >
                      <Select
                        options={[
                          { label: "EVD_STAFF", value: "EVD_STAFF" },
                          { label: "EVD_ADMIN", value: "EVD_ADMIN" },
                        ]}
                      />
                    </Form.Item>
                  </>
                );
              }

              return null;
            }}
          </Form.Item>

          {/* ====================== FORM DÙNG CHUNG 3 API ====================== */}
          <Divider>Thông tin tài khoản</Divider>

          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ tên"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true }, { type: "email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="city" label="Thành phố" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>Hoạt động</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
