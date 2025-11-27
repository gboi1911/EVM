import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Card,
  Tag,
  Space,
  Carousel,
  Descriptions,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { getWarehouseHistory } from "../../api/warehouse";

export default function ManageInventory() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getWarehouseHistory();
      setData(res || []);
    } catch {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const columns = [
    {
      title: "Model",
      dataIndex: ["car", "carModelName"],
    },
    {
      title: "Tên xe",
      dataIndex: ["car", "carName"],
    },
    {
      title: "Màu",
      dataIndex: ["car", "color"],
      render: (color) => <Tag color="blue">{color}</Tag>,
    },
    {
      title: "Nhập từ",
      dataIndex: "fromLocation",
    },
    {
      title: "Xuất đến",
      dataIndex: "toLocation",
    },
    {
      title: "Ngày",
      dataIndex: "createdOn",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          type="link"
          onClick={() => {
            setSelectedCar(record.car);
            setOpen(true);
          }}
        >
          Xem xe
        </Button>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex flex-col items-center">
      <Card className="w-full max-w-6xl shadow">
        <h2 className="text-xl font-bold mb-4">Lịch sử Xuất – Nhập Kho</h2>

        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title="Chi tiết xe"
        footer={null}
        width={900}
      >
        {selectedCar && (
          <div className="p-2">
            {/* CAROUSEL IMAGES */}
            <Carousel autoplay>
              {selectedCar.carImages?.map((img, i) => (
                <div key={i}>
                  <img
                    src={img.fileUrl}
                    alt="car"
                    className="w-full h-80 object-cover rounded"
                  />
                </div>
              ))}
            </Carousel>

            <Descriptions
              bordered
              column={2}
              title="Thông tin xe"
              className="mt-4"
            >
              <Descriptions.Item label="Model">
                {selectedCar.carModelName}
              </Descriptions.Item>
              <Descriptions.Item label="Tên xe">
                {selectedCar.carName}
              </Descriptions.Item>
              <Descriptions.Item label="Màu">
                {selectedCar.color}
              </Descriptions.Item>
              <Descriptions.Item label="VIN">
                {selectedCar.vinNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Số máy">
                {selectedCar.engineNumber}
              </Descriptions.Item>
            </Descriptions>

            {/* DIMENSIONS */}
            <Descriptions
              bordered
              column={2}
              title="Kích thước"
              className="mt-4"
            >
              <Descriptions.Item label="Số ghế">
                {selectedCar.dimension.seatNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Cân nặng (lbs)">
                {selectedCar.dimension.weightLbs}
              </Descriptions.Item>
              <Descriptions.Item label="Khoảng sáng gầm (in)">
                {selectedCar.dimension.groundClearanceIn}
              </Descriptions.Item>
              <Descriptions.Item label="Chiều rộng gập gương (in)">
                {selectedCar.dimension.widthFoldedIn}
              </Descriptions.Item>
              <Descriptions.Item label="Chiều rộng mở gương (in)">
                {selectedCar.dimension.widthExtendedIn}
              </Descriptions.Item>
              <Descriptions.Item label="Chiều cao (in)">
                {selectedCar.dimension.heightIn}
              </Descriptions.Item>
              <Descriptions.Item label="Chiều dài (mm)">
                {selectedCar.dimension.lengthMm}
              </Descriptions.Item>
              <Descriptions.Item label="Mâm xe (cm)">
                {selectedCar.dimension.wheelsSizeCm}
              </Descriptions.Item>
            </Descriptions>

            {/* PERFORMANCE */}
            <Descriptions
              bordered
              column={2}
              title="Thông số vận hành"
              className="mt-4"
            >
              <Descriptions.Item label="Cự li (miles)">
                {selectedCar.performanceDetailGetDto.rangeMiles}
              </Descriptions.Item>
              <Descriptions.Item label="0-60 mph (s)">
                {selectedCar.performanceDetailGetDto.accelerationSec}
              </Descriptions.Item>
              <Descriptions.Item label="Tốc độ tối đa (mph)">
                {selectedCar.performanceDetailGetDto.topSpeedMph}
              </Descriptions.Item>
              <Descriptions.Item label="Mã lực (lbs)">
                {selectedCar.performanceDetailGetDto.towingLbs}
              </Descriptions.Item>
              <Descriptions.Item label="Pin">
                {selectedCar.performanceDetailGetDto.battery}
              </Descriptions.Item>
              <Descriptions.Item label="Động cơ">
                {selectedCar.performanceDetailGetDto.motor}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
}
