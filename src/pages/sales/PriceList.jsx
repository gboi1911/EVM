import React, { useState, useEffect } from "react";
import { Table, Card, Typography, Tag, Modal, Spin, notification } from "antd";
import { useAuth } from "../../context/AuthContext";
import { getPriceListByLevel } from "../../api/price";
import moment from "moment";

const { Title } = Typography;

export default function PriceList() {
  const [loading, setLoading] = useState(false);
  const [pricePrograms, setPricePrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.level) {
      fetchPricePrograms(user.level);
    }
  }, [user]);

  const fetchPricePrograms = async (level) => {
    setLoading(true);
    try {
      const data = await getPriceListByLevel(level);
      setPricePrograms(data);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tải bảng giá",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (program) => {
    setSelectedProgram(program);
    setModalVisible(true);
  };

  const columns = [
    {
      title: "Mã chương trình",
      dataIndex: "priceProgramId",
      key: "priceProgramId",
    },
    {
      title: "Cấp đại lý",
      dataIndex: "dealerHierarchy",
      key: "dealerHierarchy",
      render: (level) => <Tag color="blue">Cấp {level}</Tag>,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <a onClick={() => handleViewDetails(record)}>Xem chi tiết</a>
      ),
    },
  ];

  const detailColumns = [
    {
      title: "Mẫu xe",
      dataIndex: "carModelName",
      key: "carModelName",
    },
    {
      title: "Giá tối thiểu",
      dataIndex: "minPrice",
      key: "minPrice",
      render: (price) =>
        price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Giá đề xuất",
      dataIndex: "suggestedPrice",
      key: "suggestedPrice",
      render: (price) =>
        price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Giá tối đa",
      dataIndex: "maxPrice",
      key: "maxPrice",
      render: (price) =>
        price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="shadow-sm">
        <Title level={4} className="text-emerald-700 mb-4">
          Bảng giá theo cấp đại lý
        </Title>
        <Table
          loading={loading}
          columns={columns}
          dataSource={pricePrograms}
          rowKey="priceProgramId"
          pagination={{ pageSize: 10 }}
          className="bg-white"
        />
      </Card>

      <Modal
        title={
          <span className="text-emerald-700">
            Chi tiết bảng giá - Cấp {selectedProgram?.dealerHierarchy}
          </span>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1000}
        className="bg-white"
      >
        {selectedProgram && (
          <Table
            columns={detailColumns}
            dataSource={selectedProgram.programDetails}
            rowKey="id"
            pagination={false}
            className="bg-white"
          />
        )}
      </Modal>
    </div>
  );
}
