import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, Row, Col, Button, Image, Spin, message } from "antd";
import axios from "axios";

export default function CarCompare() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const ids = params.get("ids")?.split(",").map(Number) || [];
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const responses = await Promise.all(
          ids.map((id) => axios.get(`/api/v1/car/${id}/detail`))
        );
        setCars(responses.map((r) => r.data));
      } catch (err) {
        message.error("Không thể tải dữ liệu so sánh");
      } finally {
        setLoading(false);
      }
    };
    if (ids.length === 2) fetchCars();
  }, [ids]);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
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
    <div style={{ padding: 24 }}>
      <h2>So sánh xe điện</h2>
      <Row gutter={32}>
        {cars.map((car) => (
          <Col span={12} key={car.id}>
            <Card title={car.carName} bordered>
              <Image
                src={car.carImages?.[0]?.fileUrl}
                width={220}
                style={{ marginBottom: 12 }}
              />
              <p><b>Giá bán:</b> {car.price.toLocaleString()} ₫</p>
              <p><b>Loại dẫn động:</b> {car.driveType}</p>
              <p><b>Năm sản xuất:</b> {car.year}</p>
              <p><b>Quãng đường:</b> {car.performanceDetailGetDto?.rangeMiles} miles</p>
              <p><b>Tốc độ tối đa:</b> {car.performanceDetailGetDto?.topSpeedMph} mph</p>
              <p><b>Màu sắc:</b> {car.color?.colorName}</p>
              <p><b>Pin:</b> {car.performanceDetailGetDto?.battery?.chemistryType}</p>
              <p><b>Động cơ:</b> {car.performanceDetailGetDto?.motor?.motorType}</p>
            </Card>
          </Col>
        ))}
      </Row>
      <Button style={{ marginTop: 24 }} onClick={() => navigate(-1)}>
        Quay lại danh mục xe
      </Button>
    </div>
  );
}
