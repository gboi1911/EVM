import React, { useState, useEffect } from "react";
import { Table, Card, Typography, Tag, Modal, Select, notification, Image } from "antd";
import { useAuth } from "../../context/AuthContext";
import { getPriceListByLevel } from "../../api/price";
import moment from "moment";

const { Title } = Typography;
const { Option } = Select;

// 1. KHẮC PHỤC LỖI ẢNH: Tạo map ánh xạ từ carModelName sang link ảnh
// Bạn có thể thay thế các link này bằng link thật hoặc import ảnh từ assets
const CAR_IMAGES = {
  "TESLA_MODEL_X": "https://digitalassets.tesla.com/tesla-contents/image/upload/h_1800,w_2880,c_fit,f_auto,q_auto:best/Model-X-Main-Hero-Desktop-RHD",
  "TESLA_MODEL_S": "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-S-Main-Hero-Desktop-LHD.jpg",
  "TESLA_MODEL_3": "https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-3-Main-Hero-Desktop-LHD.jpg",
  "TESLA_MODEL_Y": "https://digitalassets.tesla.com/tesla-contents/image/upload/h_1800,w_2880,c_fit,f_auto,q_auto:best/Model-Y-Main-Hero-Desktop-Global",
  "TESLA_MODEL_Z": "https://example.com/placeholder-car.jpg", // Ảnh mặc định nếu chưa có
};

export default function PriceList() {
  const [loading, setLoading] = useState(false);
  const [pricePrograms, setPricePrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // State cho Staff chọn level
  const [selectedLevel, setSelectedLevel] = useState(null);
  
  const { user } = useAuth();

  // Kiểm tra xem user có phải là Staff không (giả sử role là 'STAFF' hoặc 'ADMIN')
  // Bạn hãy điều chỉnh điều kiện này theo đúng logic role của dự án bạn
  const isStaff = user?.role === 'STAFF' || user?.role === 'ADMIN' || !user?.level;

  useEffect(() => {
    // Logic mới:
    // 1. Nếu là Dealer (có user.level): Fetch theo user.level
    // 2. Nếu là Staff: Chỉ fetch khi họ đã chọn selectedLevel
    if (user?.level) {
      fetchPricePrograms(user.level);
    } else if (isStaff && selectedLevel) {
      fetchPricePrograms(selectedLevel);
    }
  }, [user, selectedLevel]); // Chạy lại khi user đổi hoặc Staff chọn level mới

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
      setPricePrograms([]); // Clear data nếu lỗi
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
        <a onClick={() => handleViewDetails(record)} className="text-emerald-600 hover:text-emerald-800">
          Xem chi tiết
        </a>
      ),
    },
  ];

  const detailColumns = [
    {
      title: "Hình ảnh",
      key: "image",
      render: (_, record) => (
        // Sử dụng mapping CAR_IMAGES để hiển thị ảnh
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
      render: (text) => <span className="font-semibold">{text}</span>
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
      className: "text-emerald-600 font-medium",
      render: (price) =>
        price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Giá tối đa",
      dataIndex: "maxPrice",
      key: "maxPrice",
      render: (price) =>
        price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="text-emerald-700 m-0">
            Bảng giá theo cấp đại lý
          </Title>
          
          {/* 2. TÍNH NĂNG CHO STAFF: Dropdown chọn cấp độ */}
          {isStaff && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Xem theo cấp:</span>
              <Select
                placeholder="Chọn cấp đại lý"
                style={{ width: 200 }}
                onChange={(value) => setSelectedLevel(value)}
                value={selectedLevel}
              >
                <Option value={1}>Đại lý Cấp 1</Option>
                <Option value={2}>Đại lý Cấp 2</Option>
                <Option value={3}>Đại lý Cấp 3</Option>
              </Select>
            </div>
          )}
        </div>

        <Table
          loading={loading}
          columns={columns}
          dataSource={pricePrograms}
          rowKey="priceProgramId"
          pagination={{ pageSize: 10 }}
          className="bg-white"
          locale={{ emptyText: isStaff && !selectedLevel ? "Vui lòng chọn cấp đại lý để xem dữ liệu" : "Không có dữ liệu" }}
        />
      </Card>

      <Modal
        title={
          <span className="text-emerald-700 text-lg font-bold">
            Chi tiết bảng giá - Cấp {selectedProgram?.dealerHierarchy}
          </span>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1000}
        className="bg-white top-10"
      >
        {selectedProgram && (
          <Table
            columns={detailColumns}
            dataSource={selectedProgram.programDetails}
            rowKey="id"
            pagination={false}
            className="bg-white"
            scroll={{ y: 400 }} // Thêm scroll nếu danh sách dài
          />
        )}
      </Modal>
    </div>
  );
}