import { useEffect, useState, useMemo, useRef } from "react";
import {
  Tag,
  Card,
  Button,
  Row,
  Col,
  Image,
  Modal,
  Input,
  Select,
  Slider,
  Space,
  Spin,
  Carousel,
  message,
} from "antd";
import {
  DollarOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  CarOutlined,
  BgColorsOutlined,
  SearchOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Option } = Select;

export default function CarList() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCars, setSelectedCars] = useState([]);
  const [compareModal, setCompareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [sortOption, setSortOption] = useState(null);
  const [detailCar, setDetailCar] = useState(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  const navigate = useNavigate();
  const carouselRef = useRef(null);

  // 🟢 Fetch danh sách xe
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/evdealer/api/v1/car/all?pageNo=0&pageSize=50"
        );
        console.log("CAR API RESPONSE:", res.data);
        setCars(res.data.carInfoGetDtos || []);
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
      setCompareModal(true);
    }
  };

  // 🟡 Fetch chi tiết khi bấm “Chi tiết”
  const handleViewDetail = async (carId) => {
    try {
      setFetchingDetail(true);
      const res = await axios.get(
        `http://localhost:8000/evdealer/api/v1/car/${carId}/detail`
      );
      console.log("DETAIL API RESPONSE:", res.data);
      setDetailCar(res.data);
    } catch (err) {
      console.error("DETAIL FETCH ERROR:", err);
      message.error("Không thể tải chi tiết xe");
    } finally {
      setFetchingDetail(false);
    }
  };

  // 🧠 Lọc, tìm kiếm, sắp xếp
  const filteredCars = useMemo(() => {
    let filtered = cars.filter((car) => {
      const matchesSearch = car.carName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesPrice =
        car.price >= priceRange[0] && car.price <= priceRange[1];
      return matchesSearch && matchesPrice;
    });

    if (sortOption === "priceAsc") filtered.sort((a, b) => a.price - b.price);
    else if (sortOption === "priceDesc")
      filtered.sort((a, b) => b.price - a.price);

    return filtered;
  }, [cars, searchTerm, priceRange, sortOption]);

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

      {/* Bộ lọc */}
      <Space
        direction="vertical"
        size="middle"
        style={{
          display: "flex",
          marginBottom: 24,
          background: "#f9fafb",
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Input
          placeholder="Tìm theo tên xe..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <label style={{ fontWeight: 600 }}>Sắp xếp theo:</label>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn tiêu chí sắp xếp"
              allowClear
              value={sortOption}
              onChange={(value) => setSortOption(value)}
            >
              <Option value="priceAsc">Giá: Thấp → Cao</Option>
              <Option value="priceDesc">Giá: Cao → Thấp</Option>
            </Select>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <label style={{ fontWeight: 600 }}>Khoảng giá (₫):</label>
            <Slider
              range
              min={0}
              max={100000000}
              step={1000000}
              value={priceRange}
              tooltip={{
                formatter: (v) => v.toLocaleString() + " ₫",
              }}
              onChange={(value) => setPriceRange(value)}
            />
          </Col>
        </Row>
      </Space>

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
                    maxWidth: 280,
                    borderRadius: 12,
                    border: isSelected ? "2px solid #10b981" : "none",
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                  cover={
                    <Image
                      alt={car.carName}
                      src={car.carImages?.[0]?.fileUrl}
                      height={180}
                      style={{
                        objectFit: "cover",
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                      }}
                      preview={false}
                    />
                  }
                >
                  <h3 style={{ fontSize: "15px" }}>{car.carName}</h3>
                  <p style={{ color: "#059669", fontWeight: 600 }}>
                    {car.price.toLocaleString()} ₫
                  </p>

                  <div style={{ display: "flex", gap: 6 }}>
                    <Button
                      type={isSelected ? "primary" : "default"}
                      block
                      onClick={() => handleSelectCar(car.carId)}
                    >
                      {isSelected ? "Đã chọn" : "Chọn so sánh"}
                    </Button>
                    <Button
                      onClick={() => handleViewDetail(car.carId)}
                      style={{ borderColor: "#2563eb", color: "#2563eb" }}
                    >
                      Chi tiết
                    </Button>
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

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Button
          type="primary"
          size="large"
          disabled={selectedCars.length !== 2}
          onClick={handleCompare}
        >
          So sánh 2 xe đã chọn
        </Button>
      </div>

      {/* Modal Chi tiết xe */}
      <Modal
        open={!!detailCar}
        onCancel={() => setDetailCar(null)}
        title={`Chi tiết xe: ${detailCar?.carName || ""}`}
        footer={null}
      >
        {fetchingDetail ? (
          <Spin />
        ) : (
          detailCar && (
            <div style={{ position: "relative" }}>
              <Carousel
                ref={carouselRef}
                autoplay
                dots
                style={{ marginBottom: 16 }}
              >
                {detailCar.carImages?.map((img, index) => (
                  <div key={index}>
                    <Image
                      src={img.fileUrl}
                      alt={`${detailCar.carName} - ${index}`}
                      height={250}
                      width="100%"
                      style={{ objectFit: "cover", borderRadius: 8 }}
                      preview={false}
                    />
                  </div>
                ))}
              </Carousel>

              {/* Mũi tên điều hướng */}
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />

              <p>
                <ThunderboltOutlined /> Công suất:{" "}
                {detailCar.performanceDetailGetDto?.motor?.powerKw} kW
              </p>
              <p>
                <CarOutlined /> Quãng đường:{" "}
                {detailCar.performanceDetailGetDto?.rangeMiles} miles
              </p>
              <p>
                <BgColorsOutlined /> Màu:{" "}
                {detailCar.color?.colorName || "N/A"}
              </p>
            </div>
          )
        )}
      </Modal>
    </div>
  );
}
