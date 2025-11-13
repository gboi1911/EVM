// src/pages/cars/CarCompare.jsx
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Image,
  Spin,
  Carousel,
  message,
  Divider,
} from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { getCarDetails } from "../../api/cars.js"; 

export default function CarCompare() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const ids = params.get("ids")?.split(",").map(Number) || [];
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  const carouselRefs = useRef([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const responses = await Promise.all(ids.map((id) => getCarDetails(id)));
        
        // ❗️ SỬA LỖI: API trả về object lồng nhau
        // (JSON (Block 2) không có 'carDetailGetDto', nó là object gốc)
        setCars(responses); 

      } catch (err) {
        console.error("FETCH ERROR:", err);
        message.error("Không thể tải dữ liệu so sánh: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    if (ids.length === 2) fetchCars();
  }, [ids]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 60, backgroundColor: "#fff" }}>
        <Spin tip="Đang tải dữ liệu so sánh..." />
      </div>
    );

  if (cars.length !== 2) {
    return (
      <div style={{ padding: 24 }}>
        <h2>So sánh xe</h2>
        <p>Vui lòng chọn đúng 2 xe để so sánh.</p>
        <Button onClick={() => navigate(-1)}>Quay lại danh mục xe</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, backgroundColor: "#fff" }}>
      <h2
        style={{
          fontWeight: 700,
          fontSize: 28,
          color: "#059669",
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        So sánh xe điện
      </h2>

      <Row gutter={[32, 32]}>
        {cars.map((car, index) => (
          // Dùng carDetailId (từ JSON Block 2)
          <Col span={12} key={car.carDetailId || index}> 
            <Card
              title={car.carName}
              bordered
              style={{
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              headStyle={{
                backgroundColor: "#059669",
                color: "#fff",
                fontSize: 18,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              <div style={{ position: "relative", marginBottom: 16 }}>
                <Carousel
                  ref={(el) => (carouselRefs.current[index] = el)}
                  autoplay
                  dots
                >
                  {car.carImages?.length > 0 ? (
                    car.carImages.map((img, i) => (
                      <div key={i}>
                        <Image
                          src={img.fileUrl}
                          alt={`${car.carName}-${i}`}
                          height={260}
                          width="100%"
                          style={{
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                          preview={false}
                        />
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", padding: 40 }}>
                      <p>Không có hình ảnh</p>
                    </div>
                  )}
                </Carousel>

                {/* Nút điều hướng ảnh */}
                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  onClick={() => carouselRefs.current[index]?.prev()}
                  style={{
                    position: "absolute", top: "45%", left: 10, zIndex: 2,
                    color: "#fff", background: "rgba(0,0,0,0.4)", borderRadius: "50%",
                  }}
                />
                <Button
                  type="text"
                  icon={<RightOutlined />}
                  onClick={() => carouselRefs.current[index]?.next()}
                  style={{
                    position: "absolute", top: "45%", right: 10, zIndex: 2,
                    color: "#fff", background: "rgba(0,0,0,0.4)", borderRadius: "50%",
                  }}
                />
              </div>

              <Divider style={{ margin: "8px 0" }} />

              {/* ❗️ SỬA LỖI N/A: Khớp 100% với JSON (Block 2) */}
              <div style={{ fontSize: 15, lineHeight: "1.8em" }}>
                <p>
                  <b>Giá bán:</b>{" "}
                  <span style={{ color: "#d32f2f", fontWeight: 600 }}>
                    {/* JSON (Block 2) không có 'price' */}
                    LIÊN HỆ
                  </span>
                </p>
                <p>
                  <b>Mẫu xe:</b> {car.carModelName || "N/A"}
                </p>
                <p>
                  <b>Số chỗ ngồi:</b> {car.dimension?.seatNumber || "N/A"}
                </p>
                <p>
                  <b>Cân nặng:</b> {car.dimension?.weightLbs || "N/A"} lbs
                </p>
                 <p>
                  <b>Chiều dài:</b> {car.dimension?.lengthIn || "N/A"} in
                </p>
                <p>
                  <b>Quãng đường:</b>{" "}
                  {car.performanceDetailGetDto?.rangeMiles || "N/A"} miles
                </p>
                <p>
                  <b>Tốc độ tối đa:</b>{" "}
                  {car.performanceDetailGetDto?.topSpeedMph || "N/A"} mph
                </p>
                <p>
                  <b>Tăng tốc (0-60 mph):</b>{" "}
                  {car.performanceDetailGetDto?.accelerationSec || "N/A"} giây
                </p>
                 <p>
                  <b>Khả năng kéo (Towing):</b>{" "}
                  {car.performanceDetailGetDto?.towingLbs || "N/A"} lbs
                </p>
                <p>
                  <b>Loại pin:</b>{" "}
                  {car.performanceDetailGetDto?.battery || "N/A"}
                </p>
                <p>
                  <b>Kiểu động cơ:</b>{" "}
                  {car.performanceDetailGetDto?.motor || "N/A"}
                </p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate(-1)} // Quay lại trang CarList
          style={{
            backgroundColor: "#059669",
            borderColor: "#059669",
            borderRadius: 8,
          }}
        >
          Quay lại danh mục xe
        </Button>
      </div>
    </div>
  );
}