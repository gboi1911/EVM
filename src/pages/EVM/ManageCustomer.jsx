import React, { useEffect, useState } from "react";
import { Table, message, Card } from "antd";
import { getCustomerList } from "../../api/customer";

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch customer list
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomerList();
      // Kiểm tra cấu trúc response
      console.log("Customer API response:", res);
      setCustomers(res.data.customerDetailGetDtos || []);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách khách hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const columns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "Tên khách hàng", dataIndex: "fullName" },
    { title: "Email", dataIndex: "email" },
    { title: "Số điện thoại", dataIndex: "phone" },
    { title: "Địa chỉ", dataIndex: "address" },
    { title: "Đại lý tạo", dataIndex: "createdBy" },
    {
      title: "Ngày tạo",
      dataIndex: "createdOn",
      render: (val) => new Date(val).toLocaleString("vi-VN"),
    },
    { title: "Người sửa gần nhất", dataIndex: "lastModifiedBy" },
    {
      title: "Ngày sửa gần nhất",
      dataIndex: "lastModifiedOn",
      render: (val) => new Date(val).toLocaleString("vi-VN"),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center">
      <Card className="w-full max-w-6xl shadow">
        <h2 className="text-xl font-bold mb-4">Danh sách khách hàng</h2>

        <Table
          dataSource={customers}
          columns={columns}
          rowKey="id"
          loading={loading}
          bordered
        />
      </Card>
    </div>
  );
};

export default CustomerPage;
