// src/pages/sales/PriceListPage.jsx
import React, { useState, useEffect } from "react";
import { Table, Card, Typography, Tag, Modal, notification, Image, Spin, Space } from "antd";
import { useAuth } from "../../context/AuthContext";
import { getCurrentAndUpcomingPricePrograms } from "../../api/price"; 
import moment from "moment";

const { Title } = Typography;

// Map ảnh xe (Cập nhật key theo tên model trong JSON nếu cần)
const CAR_IMAGES = {
  "EV_MODEL_A": "https://digitalassets.tesla.com/tesla-contents/image/upload/h_1800,w_2880,c_fit,f_auto,q_auto:best/Model-X-Main-Hero-Desktop-RHD",
  "EV_MODEL_B": "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-S-Main-Hero-Desktop-LHD.jpg",
  "EV_MODEL_C": "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-3-Main-Hero-Desktop-LHD.jpg",
  "EV_MODEL_D": "https://digitalassets.tesla.com/tesla-contents/image/upload/h_1800,w_2880,c_fit,f_auto,q_auto:best/Model-Y-Main-Hero-Desktop-Global",
  "EV_MODEL_E": "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-3-Main-Hero-Desktop-LHD.jpg",
};

export default function PriceList() {
  const [loading, setLoading] = useState(false);
  const [pricePrograms, setPricePrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchPricePrograms = async () => {
      setLoading(true);
      try {
        // 2️⃣ Gọi API mới: current-and-upcoming
        const data = await getCurrentAndUpcomingPricePrograms();
        setPricePrograms(data);
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải bảng giá hiện tại",
        });
        setPricePrograms([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      fetchPricePrograms();
    }
  }, [authLoading, user]);

  const handleViewDetails = (program) => {
    setSelectedProgram(program);
    setModalVisible(true);
  };

  // 3️⃣ Cấu hình cột bảng chính (Dựa trên JSON mới)
  const columns = [
    {
      title: "Mã CT",
      dataIndex: "priceProgramId",
      key: "priceProgramId",
      width: 80,
      align: 'center',
    },
    {
      title: "Tên chương trình",
      dataIndex: "priceProgramName", // Trường mới trong JSON
      key: "priceProgramName",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: "Ngày hiệu lực",
      dataIndex: "effectiveDate", // Trường mới thay cho startDate
      key: "effectiveDate",
      render: (date) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (active) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Đang hoạt động" : "Ngưng hoạt động"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: 'center',
      render: (_, record) => (
        <a onClick={() => handleViewDetails(record)} style={{ color: "#059669", fontWeight: 500, cursor: "pointer" }}>
          Xem chi tiết
        </a>
      ),
    },
  ];

  // 4️⃣ Cấu hình cột bảng chi tiết trong Modal (Dựa trên programDetails)
  const detailColumns = [
    {
      title: "Hình ảnh",
      key: "image",
      width: 120,
      render: (_, record) => (
        <Image
          width={80}
          src={CAR_IMAGES[record.carModelName] || "https://via.placeholder.com/150?text=No+Image"} 
          alt={record.carModelName}
          style={{ borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Mẫu xe",
      dataIndex: "carModelName",
      key: "carModelName",
      render: (text) => <span style={{ fontWeight: "bold", fontSize: 15 }}>{text}</span>
    },
    {
      title: "Loại màu",
      dataIndex: "isSpecialColor", // Trường mới
      key: "isSpecialColor",
      render: (isSpecial) => (
        <Tag color={isSpecial ? "purple" : "default"}>
          {isSpecial ? "Màu đặc biệt" : "Tiêu chuẩn"}
        </Tag>
      )
    },
    {
      title: "Giá niêm yết",
      dataIndex: "listedPrice", // Trường mới thay cho minPrice/maxPrice
      key: "listedPrice",
      align: 'right',
      render: (price) =>
        <span style={{ color: "#059669", fontWeight: "bold", fontSize: 16 }}>
            {price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
        </span>,
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
            Bảng giá hiện tại
          </Title>
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={pricePrograms}
          rowKey="priceProgramId"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Không có chương trình giá nào." }}
        />
      </Card>

      {/* Modal hiển thị chi tiết */}
      <Modal
        title={
          <Space direction="vertical" size={0}>
            <span style={{ color: "#059669", fontSize: 18, fontWeight: "bold" }}>
               Chi tiết bảng giá
            </span>
            <span style={{ fontSize: 14, color: '#666', fontWeight: 'normal' }}>
               {selectedProgram?.priceProgramName}
            </span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        {selectedProgram && (
          <Table
            columns={detailColumns}
            // Dữ liệu lấy từ mảng programDetails trong JSON
            dataSource={selectedProgram.programDetails} 
            rowKey="id"
            pagination={false}
            scroll={{ y: 500 }} 
            bordered
          />
        )}
      </Modal>
    </div>
  );
}