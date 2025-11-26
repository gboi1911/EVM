// src/pages/cars/CarList.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Image,
  Modal,
  Input,
  Spin,
  Carousel,
  message,
  Descriptions,
  Tag,
  Divider,
} from "antd";
import {
  SearchOutlined,
  LeftOutlined,
  RightOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAllCars, getCarDetails } from "../../api/cars";

export default function CarList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCars, setSelectedCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailCar, setDetailCar] = useState(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  const navigate = useNavigate();
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // Lấy danh sách xe (API rút gọn)
        const res = await getAllCars({ pageNo: 0, pageSize: 50 });
        setCars(res.carInfoGetDtos || []);
      } catch (err) {
        console.error("FETCH ERROR:", err);
        message.error("Không thể tải danh sách xe");
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const handleSelectCar = (id) => {
    setSelectedCars((prev) => {
      if (prev.includes(id)) return prev.filter((c) => c !== id);
      if (prev.length < 2) return [...prev, id];
      return prev;
    });
  };

  const handleCompare = () => {
    if (selectedCars.length === 2) {
      navigate(`/vehicles/compare?ids=${selectedCars.join(",")}`);
    } else {
      message.warning("Vui lòng chọn đủ 2 xe để so sánh!");
    }
  };

  const handleViewDetail = async (carId) => {
    try {
      setFetchingDetail(true);
      // Gọi API chi tiết: /api/v1/carDetail/{carId}/detail
      const res = await getCarDetails(carId);
      console.log("DETAIL API RESPONSE:", res);
      setDetailCar(res);
    } catch (err) {
      console.error("DETAIL FETCH ERROR:", err);
      message.error("Không thể tải chi tiết xe");
    } finally {
      setFetchingDetail(false);
    }
  };

  // Lọc theo tên xe
  const filteredCars = useMemo(() => {
    return cars.filter((car) =>
      car.carName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cars, searchTerm]);

  if (loading)
    return (
      <div
        style={{ textAlign: "center", padding: 80, backgroundColor: "#fff" }}
      >
        <Spin tip="Đang tải danh sách xe..." />
      </div>
    );

  return (
    <div style={{ padding: 24, backgroundColor: "#fff" }}>
      <h2
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: "#059669",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Danh mục xe điện
      </h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          background: "#f9fafb",
          padding: 16,
          borderRadius: 8,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Input
          placeholder="Tìm theo tên xe..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 400, width: "100%" }}
          size="large"
        />

        <Button
          type="primary"
          size="large"
          icon={<SwapOutlined />}
          disabled={selectedCars.length !== 2}
          onClick={handleCompare}
          style={{
            backgroundColor: selectedCars.length === 2 ? "#1890ff" : undefined,
            fontWeight: 600,
          }}
        >
          So sánh ({selectedCars.length}/2)
        </Button>
      </div>

      {/* --- DANH SÁCH XE --- */}
      <Row gutter={[24, 24]} justify="center">
        {filteredCars.length > 0 ? (
          filteredCars.map((car) => {
            const isSelected = selectedCars.includes(car.carId);
            const isDisabled =
              selectedCars.length === 2 && !selectedCars.includes(car.carId);

            return (
              <Col key={car.carId} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                  hoverable
                  style={{
                    width: "100%",
                    borderRadius: 16,
                    border: isSelected
                      ? "2px solid #10b981"
                      : "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    transition: "0.3s",
                    opacity: isDisabled ? 0.6 : 1,
                  }}
                  cover={
                    <div style={{ height: 200, overflow: "hidden" }}>
                      <Image
                        alt={car.carName}
                        src={car.carImages?.[0]?.fileUrl}
                        height={200}
                        width="100%"
                        style={{
                          objectFit: "cover",
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16,
                        }}
                        preview={false}
                      />
                    </div>
                  }
                >
                  <div style={{ textAlign: "center" }}>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        margin: "8px 0",
                        color: "#111827",
                      }}
                    >
                      {car.carName}
                    </h3>
                    <p
                      style={{
                        color: "#d32f2f",
                        fontWeight: 600,
                        fontSize: 15,
                        marginBottom: 16,
                      }}
                    >
                      LIÊN HỆ
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        type={isSelected ? "primary" : "default"}
                        block
                        onClick={() => handleSelectCar(car.carId)}
                      >
                        {isSelected ? "Bỏ chọn" : "So sánh"}
                      </Button>
                      <Button
                        onClick={() => handleViewDetail(car.carId)}
                        style={{
                          borderColor: "#2563eb",
                          color: "#2563eb",
                          width: "100%",
                        }}
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })
        ) : (
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            Không tìm thấy xe phù hợp.
          </p>
        )}
      </Row>

      {/* --- MODAL CHI TIẾT XE --- */}
      <Modal
        open={!!detailCar}
        onCancel={() => setDetailCar(null)}
        title={
          <span style={{ fontSize: 20, fontWeight: "bold", color: "#059669" }}>
            {detailCar?.carName || "Chi tiết xe"}
          </span>
        }
        footer={[
          <Button key="close" onClick={() => setDetailCar(null)}>
            Đóng
          </Button>,
        ]}
        width={800}
        centered
      >
        {fetchingDetail ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin tip="Đang tải thông tin chi tiết..." />
          </div>
        ) : (
          detailCar && (
            <div>
              <div style={{ position: "relative", marginBottom: 24 }}>
                <Carousel ref={carouselRef} autoplay dots>
                  {detailCar.carImages?.map((img, index) => (
                    <div key={index}>
                      <Image
                        src={img.fileUrl}
                        alt={`${detailCar.carName} - ${index}`}
                        height={350}
                        width="100%"
                        style={{ objectFit: "cover", borderRadius: 8 }}
                        preview={false}
                      />
                    </div>
                  ))}
                </Carousel>

                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  onClick={() => carouselRef.current.prev()}
                  style={{
                    position: "absolute",
                    top: "45%",
                    left: 10,
                    zIndex: 2,
                    color: "#fff",
                    background: "rgba(0,0,0,0.4)",
                    borderRadius: "50%",
                  }}
                />
                <Button
                  type="text"
                  icon={<RightOutlined />}
                  onClick={() => carouselRef.current.next()}
                  style={{
                    position: "absolute",
                    top: "45%",
                    right: 10,
                    zIndex: 2,
                    color: "#fff",
                    background: "rgba(0,0,0,0.4)",
                    borderRadius: "50%",
                  }}
                />
              </div>

              {/* --- ĐÃ SỬA: ẨN SỐ KHUNG VÀ SỐ MÁY --- */}
              <Descriptions
                title="Thông tin chung"
                bordered
                column={{ xs: 1, sm: 2 }}
                size="small"
              >
                <Descriptions.Item label="Mẫu xe (Model)">
                  {detailCar.carModelName}
                </Descriptions.Item>
                <Descriptions.Item label="Màu sắc">
                  {detailCar.color}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Descriptions
                title="Hiệu suất (Performance)"
                bordered
                column={{ xs: 1, sm: 2 }}
                size="small"
              >
                <Descriptions.Item label="Quãng đường (Range)">
                  <Tag color="green">
                    {detailCar.performanceDetailGetDto?.rangeMiles} miles
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tốc độ tối đa">
                  {detailCar.performanceDetailGetDto?.topSpeedMph} mph
                </Descriptions.Item>
                <Descriptions.Item label="Tăng tốc (0-60 mph)">
                  {detailCar.performanceDetailGetDto?.accelerationSec} giây
                </Descriptions.Item>
                <Descriptions.Item label="Sức kéo (Towing)">
                  {detailCar.performanceDetailGetDto?.towingLbs} lbs
                </Descriptions.Item>
                <Descriptions.Item label="Động cơ">
                  {detailCar.performanceDetailGetDto?.motor}
                </Descriptions.Item>
                <Descriptions.Item label="Pin">
                  {detailCar.performanceDetailGetDto?.battery}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Descriptions
                title="Kích thước & Trọng lượng"
                bordered
                column={{ xs: 1, sm: 2, md: 3 }}
                size="small"
              >
                <Descriptions.Item label="Số ghế">
                  {detailCar.dimension?.seatNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Trọng lượng">
                  {detailCar.dimension?.weightLbs} lbs
                </Descriptions.Item>
                <Descriptions.Item label="Chiều dài (mm)">
                  {detailCar.dimension?.lengthMm} mm
                </Descriptions.Item>
                <Descriptions.Item label="Chiều dài (in)">
                  {detailCar.dimension?.lengthIn} in
                </Descriptions.Item>
                <Descriptions.Item label="Chiều cao">
                  {detailCar.dimension?.heightIn} in
                </Descriptions.Item>
                <Descriptions.Item label="Chiều rộng (gập)">
                  {detailCar.dimension?.widthFoldedIn} in
                </Descriptions.Item>
                <Descriptions.Item label="Chiều rộng (mở)">
                  {detailCar.dimension?.widthExtendedIn} in
                </Descriptions.Item>
                <Descriptions.Item label="Khoảng sáng gầm">
                  {detailCar.dimension?.groundClearanceIn} in
                </Descriptions.Item>
                <Descriptions.Item label="Kích thước mâm">
                  {detailCar.dimension?.wheelsSizeCm} cm
                </Descriptions.Item>
              </Descriptions>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}