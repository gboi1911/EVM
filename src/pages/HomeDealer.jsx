import { Carousel } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import banner1 from "../assets/banner1.webp";
import banner2 from "../assets/banner2.jpg";
import banner3 from "../assets/banner3.jpg";

export default function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8">
      {/* Auto move banner */}
      <div className="w-full max-w-4xl mb-8">
        <Carousel autoplay>
          <div>
            <img
              src={banner1}
              alt="Electric Car 1"
              className="w-full h-64 object-cover rounded-xl shadow"
            />
          </div>
          <div>
            <img
              src={banner2}
              alt="Electric Car 2"
              className="w-full h-64 object-cover rounded-xl shadow"
            />
          </div>
          <div>
            <img
              src={banner3}
              alt="Electric Car 3"
              className="w-full h-64 object-cover rounded-xl shadow"
            />
          </div>
        </Carousel>
      </div>

      {/* Information section */}
      <div className="w-full max-w-3xl text-center space-y-6">
        <h1 className="text-3xl font-bold text-emerald-700">
          Chào mừng đến với EVFAST
        </h1>
        <p className="text-lg text-gray-700">
          EVFAST là nền tảng quản lý dịch vụ và kinh doanh xe điện hàng đầu Việt
          Nam. Chúng tôi cung cấp giải pháp toàn diện cho khách hàng và đại lý,
          từ quản lý xe, bán hàng, chăm sóc khách hàng đến báo cáo doanh số.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-8 mt-6">
          <div>
            <h2 className="text-xl font-semibold text-emerald-600">
              Dịch vụ chuyên nghiệp
            </h2>
            <p className="text-gray-600">
              Đội ngũ hỗ trợ tận tâm, quy trình hiện đại, đảm bảo trải nghiệm
              tốt nhất cho khách hàng.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-emerald-600">
              Công nghệ tiên tiến
            </h2>
            <p className="text-gray-600">
              Ứng dụng công nghệ mới nhất trong quản lý và vận hành hệ thống xe
              điện.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-emerald-600">
              Kết nối cộng đồng
            </h2>
            <p className="text-gray-600">
              Xây dựng cộng đồng người dùng xe điện lớn mạnh, chia sẻ và phát
              triển bền vững.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
