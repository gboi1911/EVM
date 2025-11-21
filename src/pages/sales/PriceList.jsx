// src/pages/sales/PriceListPage.jsx
import React, { useState, useEffect } from "react";
import { Table, Card, Typography, Tag, Modal, notification, Image, Spin } from "antd";
import { useAuth } from "../../context/AuthContext";
import { getPriceListByLevel } from "../../api/price";
import moment from "moment";

const { Title } = Typography;

// Map ảnh xe
const CAR_IMAGES = {
  "TESLA_MODEL_X": "https://digitalassets.tesla.com/tesla-contents/image/upload/h_1800,w_2880,c_fit,f_auto,q_auto:best/Model-X-Main-Hero-Desktop-RHD",
  "TESLA_MODEL_S": "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-S-Main-Hero-Desktop-LHD.jpg",
  "TESLA_MODEL_3": "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-3-Main-Hero-Desktop-LHD.jpg",
  "TESLA_MODEL_Y": "https://digitalassets.tesla.com/tesla-contents/image/upload/h_1800,w_2880,c_fit,f_auto,q_auto:best/Model-Y-Main-Hero-Desktop-Global",
  "TESLA_MODEL_Z": "https://example.com/placeholder-car.jpg",
};

export default function PriceList() {
  const [loading, setLoading] = useState(false);
  const [pricePrograms, setPricePrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Hàm fetch
    const fetchPricePrograms = async () => {
      setLoading(true);
      try {
        // ❗️ LOGIC XỬ LÝ LEVEL QUAN TRỌNG:
        // Nếu user có level (Manager) -> dùng user.level
        // Nếu user không có level (Staff) -> gửi -1 (Backend tự lấy level của cha)
        const levelToSend = (user.level !== null && user.level !== undefined) ? user.level : -1;

        const data = await getPriceListByLevel(levelToSend);
        setPricePrograms(data);
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải bảng giá",
        });
        setPricePrograms([]);
      } finally {
        setLoading(false);
      }
    };

    // Gọi fetch khi đã có user
    if (!authLoading && user) {
      fetchPricePrograms();
    }
  }, [authLoading, user]);

  const handleViewDetails = (program) => {
    setSelectedProgram(program);
    setModalVisible(true);
  };

  // Cấu hình cột bảng chính
  const columns = [
    {
      title: "Mã CT",
      dataIndex: "priceProgramId",
      key: "priceProgramId",
      width: 100,
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
        <a onClick={() => handleViewDetails(record)} style={{ color: "#059669", fontWeight: 500, cursor: "pointer" }}>
          Xem chi tiết
        </a>
      ),
    },
  ];

  // Cấu hình cột bảng chi tiết (Modal)
  const detailColumns = [
    {
      title: "Hình ảnh",
      key: "image",
      render: (_, record) => (
        <Image
          width={100}
          src={CAR_IMAGES[record.carModelName] || "https://via.placeholder.com/150?text=No+Image"} 
          alt={record.carModelName}
          fallback="https://via.placeholder.com/150?text=Error"
        />
      ),
    },
    {
      title: "Mẫu xe",
      dataIndex: "carModelName",
      key: "carModelName",
      render: (text) => <span style={{ fontWeight: "bold" }}>{text}</span>
    },
    {
      title: "Giá tối thiểu",
      dataIndex: "minPrice",
      key: "minPrice",
      render: (price) =>
        price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Giá đề xuất",
      dataIndex: "suggestedPrice",
      key: "suggestedPrice",
      render: (price) =>
        <span style={{ color: "#059669", fontWeight: "bold" }}>
            {price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
        </span>,
    },
    {
      title: "Giá tối đa",
      dataIndex: "maxPrice",
      key: "maxPrice",
      render: (price) =>
        price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
  ];

  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", padding: 24 }}>
      <Card bordered={false} style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Title level={4} style={{ color: "#059669", margin: 0 }}>
            Bảng giá theo cấp đại lý
          </Title>
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={pricePrograms}
          rowKey="priceProgramId"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Không có dữ liệu bảng giá" }}
        />
      </Card>

      <Modal
        title={
          <span style={{ color: "#059669", fontSize: 18, fontWeight: "bold" }}>
            Chi tiết bảng giá - Cấp {selectedProgram?.dealerHierarchy}
          </span>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        {selectedProgram && (
          <Table
            columns={detailColumns}
            dataSource={selectedProgram.programDetails}
            rowKey="id"
            pagination={false}
            scroll={{ y: 400 }} 
          />
        )}
      </Modal>
    </div>
  );
}