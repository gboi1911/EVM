import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Row, Col, Button, Image, Spin, Carousel, message } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import axios from "axios";

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
        const responses = await Promise.all(
          ids.map((id) =>
            axios.get(`http://localhost:8000/evdealer/api/v1/car/${id}/detail`)
          )
        );
        setCars(responses.map((r) => r.data));
      } catch (err) {
        console.error("FETCH ERROR:", err);
        message.error("Không thể tải dữ liệu so sánh");
      } finally {
        setLoading(false);
      }
    };
    if (ids.length === 2) fetchCars();
  }, [ids]);

  if (loading)
    return (
      <div
        style={{ textAlign: "center", padding: 60, backgroundColor: "#fff" }}
      >
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
          fontSize: 25,
          color: "#059669",
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        So sánh xe điện
      </h2>
      <Row gutter={32}>
        {cars.map((car, index) => (
          <Col span={12} key={car.id}>
            <Card
              title={car.carName}
              bordered
              style={{
                borderRadius: 12,
                overflow: "hidden",
                border: "1px solid #059669",
              }}
              headStyle={{
                backgroundColor: "#059669", // <-- Thêm dòng này
                color: "#fff", // <-- Thêm dòng này để chữ màu trắng
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
                          height={250}
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

                {/* Nút điều hướng Carousel */}
                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  onClick={() => carouselRefs.current[index]?.prev()}
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
                  onClick={() => carouselRefs.current[index]?.next()}
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

              <p>
                <b>Giá bán:</b>{" "}
                {car.price
                  ? Number(car.price).toLocaleString() + " ₫"
                  : "Đang cập nhật"}
              </p>

              <p>
                <b>Loại dẫn động:</b> {car.driveType || "N/A"}
              </p>
              <p>
                <b>Năm sản xuất:</b> {car.year || "N/A"}
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
                <b>Màu sắc:</b> {car.color?.colorName || "N/A"}
              </p>
              <p>
                <b>Pin:</b>{" "}
                {car.performanceDetailGetDto?.battery?.chemistryType || "N/A"}
              </p>
              <p>
                <b>Động cơ:</b>{" "}
                {car.performanceDetailGetDto?.motor?.motorType || "N/A"}
              </p>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Button onClick={() => navigate(-1)}>Quay lại danh mục xe</Button>
      </div>
    </div>
  );
}
