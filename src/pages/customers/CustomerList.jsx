// src/pages/customers/CustomerList.jsx
import { Table, Button, Spin, message, Modal, Form, Input } from "antd";
import { useEffect, useState } from "react";
import {
  listCustomers,
  createCustomer,
  updateCustomerInfo,
} from "../../api/customer";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormLoading, setCreateFormLoading] = useState(false);
  const [createForm] = Form.useForm();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm] = Form.useForm();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await listCustomers({ pageNo: 0, pageSize: 20 });
      setCustomers(response.data.customerDetailGetDtos || []);
    } catch (e) {
      message.error("Lỗi tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateCustomer = async (values) => {
    try {
      setCreateFormLoading(true);
      // Gửi 'null' nếu người dùng không nhập (thay vì '""')
      const payload = {
        fullName: values.fullName,
        phone: values.phone,
        email: values.email || null,
        address: values.address || null,
      };
      await createCustomer(payload);
      message.success("Tạo khách hàng thành công!");
      setIsCreateModalOpen(false);
      createForm.resetFields();
      fetchCustomers();
    } catch (e) {
      message.error("Tạo khách hàng thất bại: " + e.message);
    } finally {
      setCreateFormLoading(false);
    }
  };

  const handleOpenEditModal = (record) => {
    setEditingCustomer(record);
    editForm.setFieldsValue(record);
    setIsEditModalOpen(true);
  };

  // ❗️ SỬA LỖI 500 (Theo yêu cầu BE):
  // Chỉ gửi các trường (field) đã thực sự thay đổi.
  const handleUpdateCustomer = async (newValues) => {
    if (!editingCustomer) return;

    const payload = {}; // Dữ liệu 'payload' chỉ chứa các thay đổi

    // 1. So sánh giá trị mới (newValues) với giá trị cũ (editingCustomer)
    Object.keys(newValues).forEach((key) => {
      const oldValue = editingCustomer[key];
      let newValue = newValues[key];

      // 2. Xử lý (normalize) giá trị:
      // Nếu newValue là '""' (chuỗi rỗng), gửi 'null' (Backend dễ xử lý hơn)
      if (newValue === "") newValue = null;

      // 3. Chỉ thêm vào 'payload' nếu giá trị đã thay đổi
      if (newValue !== oldValue) {
        payload[key] = newValue;
      }
    });

    // 4. Kiểm tra xem có gì thay đổi không
    if (Object.keys(payload).length === 0) {
      message.info("Không có thay đổi nào được ghi nhận.");
      setIsEditModalOpen(false); // Chỉ cần đóng Modal
      return;
    }

    // 5. Gửi 'payload' (chỉ chứa các thay đổi) lên server
    try {
      setEditFormLoading(true);
      await updateCustomerInfo(editingCustomer.id, payload); // Gửi 'payload', không phải 'newValues'
      message.success("Cập nhật khách hàng thành công!");
      setIsEditModalOpen(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (e) {
      // (Lỗi 500 do BE vẫn crash khi nhận 'Bearer Token' vẫn có thể xảy ra ở đây)
      message.error("Cập nhật thất bại: " + e.message);
    } finally {
      setEditFormLoading(false);
    }
  };

  const columns = [
    {
      title: "Mã KH",
      dataIndex: "id",
      width: 100,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    { title: "Số điện thoại", dataIndex: "phone" },
    { title: "Email", dataIndex: "email" },
    { title: "Địa chỉ", dataIndex: "address" },
    {
      title: "Thao tác",
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleOpenEditModal(record)}
        >
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: "#fff", minHeight: "100vh", padding: 40 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "#f3f0f0ff",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2
          style={{
            fontSize: 25,
            fontWeight: 700,
            color: "#059669",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Hồ sơ khách hàng
        </h2>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
          style={{ marginBottom: 24 }}
        >
          Tạo khách hàng mới
        </Button>

        <Spin spinning={loading}>
          <Table dataSource={customers} columns={columns} rowKey="id" />
        </Spin>
      </div>

      {/* Modal để TẠO khách hàng (Giữ nguyên 'required: true') */}
      <Modal
        title="Tạo khách hàng mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsCreateModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={createFormLoading}
            onClick={() => createForm.submit()}
          >
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateCustomer}
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập tên khách hàng" },
            ]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="Nhập email (ví dụ: user@gmail.com)" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal để SỬA khách hàng */}
      <Modal
        title={`Cập nhật Khách hàng: ${editingCustomer?.fullName || ""}`}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsEditModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={editFormLoading}
            onClick={() => editForm.submit()}
          >
            Lưu thay đổi
          </Button>,
        ]}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdateCustomer}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              { required: true, message: "Vui lòng nhập tên khách hàng" },
            ]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            // (Bỏ 'rules')
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Email không hợp lệ" }]}
          >
            <Input placeholder="Nhập email (ví dụ: user@gmail.com)" />
          </Form.Item>
          <Form.Item name="address" label="Địa chỉ">
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
