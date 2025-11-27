import React, { useEffect, useState } from "react";
import { Table, message, Tag, Button, Card } from "antd";
import { getDealerInfo } from "../../api/authen";

const DealerPage = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch dealer info
  const fetchDealers = async () => {
    setLoading(true);
    try {
      const res = await getDealerInfo();
      console.log(res);
      setDealers(res || []);
    } catch (error) {
      message.error("Không thể tải danh sách đại lý!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const columns = [
    { title: "ID", dataIndex: "dealerInfoId", width: 80 },
    { title: "Tên đại lý", dataIndex: "dealerName" },
    { title: "Số điện thoại", dataIndex: "phone" },
    {
      title: "Cấp đại lý",
      dataIndex: "dealerLevel",
      render: (level) =>
        level === 1 ? (
          <Tag color="blue">Cấp 1</Tag>
        ) : (
          <Tag color="green">Cấp 2</Tag>
        ),
    },
    { title: "Địa chỉ", dataIndex: "location" },
    {
      title: "Hợp đồng",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => window.open(record.contractFileUrl, "_blank")}
        >
          Xem hợp đồng
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center">
      <Card className="w-full max-w-6xl shadow">
        <h2 className="text-xl font-bold mb-4">Danh sách đại lý</h2>

        <Table
          dataSource={dealers}
          columns={columns}
          rowKey="dealerInfoId"
          loading={loading}
          bordered
        />
      </Card>
    </div>
  );
};

export default DealerPage;
