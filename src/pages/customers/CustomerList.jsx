// src/pages/customers/CustomerList.jsx
import { Table, Button, Spin, message, Modal, Form, Input } from "antd";
import { useEffect, useState } from "react";
// Import cả 2 hàm listCustomers và createCustomer
import { listCustomers, createCustomer } from "../../api/customer"; 
import { PlusOutlined } from '@ant-design/icons';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal tạo mới
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form] = Form.useForm();

  // Tách hàm fetch ra để có thể gọi lại sau khi tạo mới
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

  // Gọi API khi trang tải lần đầu
  useEffect(() => {
    fetchCustomers();
  }, []); // Mảng rỗng = chạy 1 lần khi load trang

  // Xử lý khi submit form tạo mới
  const handleCreateCustomer = async (values) => {
    try {
      setFormLoading(true);
      await createCustomer(values); 
      message.success("Tạo khách hàng thành công!");
      setIsModalOpen(false); // Đóng modal
      form.resetFields(); // Xóa dữ liệu form
      fetchCustomers(); // Tải lại danh sách khách hàng
    } catch (e) {
      message.error("Tạo khách hàng thất bại");
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { title: "Mã KH", dataIndex: "id", width: 100, sorter: (a, b) => a.id - b.id },
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
        <Button type="link" onClick={() => console.log('Sửa:', record.id)}>
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: "#1f2937", minHeight: "100vh", padding: 40 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 12,
          padding: 24,
        }}
      >
        {/* THAY ĐỔI: Xóa <div> bọc ngoài và thêm style vào <h2> */}
        <h2
          style={{
               fontSize: 25,
          fontWeight: 700,
            color: "#059669",
            textAlign: 'center', // Thêm thuộc tính này
            marginBottom: 24,   // Thêm thuộc tính này
          }}
        >
          Hồ sơ khách hàng
        </h2>

        {/* Nút "Tạo khách hàng mới" đã bị bạn comment. 
            Nếu muốn dùng lại, hãy bỏ comment và đặt nó ở đây: */}
        {/* <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsModalOpen(true)}
            style={{ marginBottom: 24 }} // Thêm margin
          >
            Tạo khách hàng mới
          </Button> */}
        

        {/* Dùng Spin để bao bọc Table */}
        <Spin spinning={loading}>
          <Table dataSource={customers} columns={columns} rowKey="id" />
        </Spin>
      </div>

      {/* Modal để tạo khách hàng (Giữ nguyên) */}
      <Modal
        title="Tạo khách hàng mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={formLoading} 
            onClick={() => form.submit()}
          >
            Lưu
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCustomer}
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập tên khách hàng" }]}
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
            rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
          >
            <Input placeholder="Nhập email (ví dụ: user@gmail.com)" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input placeholder="Nhập địa chỉ" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}