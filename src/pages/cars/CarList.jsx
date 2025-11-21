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
} from "antd";
import {
  ThunderboltOutlined,
  CarOutlined,
  BgColorsOutlined,
  SearchOutlined,
  LeftOutlined,
  RightOutlined,
  SwapOutlined, // Thêm icon cho nút so sánh
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { getAllCars, getCarDetails } from "../../api/cars";

export default function CarList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCars, setSelectedCars] = useState([]);
  const [compareModal, setCompareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [detailCar, setDetailCar] = useState(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  const navigate = useNavigate();
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await getAllCars({ pageNo: 0, pageSize: 50 });
        console.log("CAR API RESPONSE:", res);

        const carsWithPrice = (res.carInfoGetDtos || []).map((car) => ({
          ...car,
          price: 0,
        }));

        setCars(carsWithPrice);
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
      // Nếu chưa chọn đủ 2 xe, báo lỗi nhẹ thay vì mở modal rỗng
      message.warning("Vui lòng chọn đủ 2 xe để so sánh!");
    }
  };

  const handleViewDetail = async (carId) => {
    try {
      setFetchingDetail(true);
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
      <div style={{ textAlign: "center", padding: 80, backgroundColor: "#fff" }}>
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

      {/* --- PHẦN THANH TÌM KIẾM VÀ NÚT SO SÁNH (ĐÃ CHỈNH SỬA) --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between", // Tách 2 phần sang 2 bên
          alignItems: "center",
          marginBottom: 24,
          background: "#f9fafb",
          padding: 16,
          borderRadius: 8,
          flexWrap: "wrap", // Để responsive tốt trên mobile
          gap: 16,
        }}
      >
        {/* Ô tìm kiếm */}
        <Input
          placeholder="Tìm theo tên xe..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ maxWidth: 400, width: "100%" }}
          size="large"
        />

        {/* Nút so sánh - Đặt ngay cạnh thanh tìm kiếm */}
        <Button
          type="primary"
          size="large"
          icon={<SwapOutlined />}
          disabled={selectedCars.length !== 2}
          onClick={handleCompare}
          style={{
            backgroundColor: selectedCars.length === 2 ? "#1890ff" : undefined,
            fontWeight: 600
          }}
        >
          So sánh ({selectedCars.length}/2)
        </Button>
      </div>

      {/* Danh sách xe */}
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
                    border: isSelected ? "2px solid #10b981" : "1px solid #e5e7eb",
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
                          transition: "transform 0.3s ease",
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
            Không tìm thấy xe phù hợp với bộ lọc.
          </p>
        )}
      </Row>

      {/* (Đã xóa nút so sánh ở dưới đáy) */}

      {/* Modal Chi tiết xe */}
      <Modal
        open={!!detailCar}
        onCancel={() => setDetailCar(null)}
        title={`Chi tiết xe: ${detailCar?.carName || ""}`}
        footer={null}
        width={700}
      >
        {fetchingDetail ? (
          <Spin />
        ) : (
          detailCar && (
            <div style={{ position: "relative" }}>
              <Carousel ref={carouselRef} autoplay dots style={{ marginBottom: 16 }}>
                {detailCar.carImages?.map((img, index) => (
                  <div key={index}>
                    <Image
                      src={img.fileUrl}
                      alt={`${detailCar.carName} - ${index}`}
                      height={300}
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

              <div style={{ marginTop: 16 }}>
                <p>
                  <ThunderboltOutlined /> Công suất:{" "}
                  {detailCar.performanceDetailGetDto?.motor?.powerKw || "N/A"} kW
                </p>
                <p>
                  <CarOutlined /> Quãng đường:{" "}
                  {detailCar.performanceDetailGetDto?.rangeMiles || "N/A"} miles
                </p>
                <p>
                  <BgColorsOutlined /> Màu:{" "}
                  {detailCar.color?.colorName || "N/A"}
                </p>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}