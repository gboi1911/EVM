import { Layout } from "antd";
import logo from "../assets/logo.png";
import {
  PhoneOutlined,
  MailOutlined,
  FacebookFilled,
  YoutubeFilled,
} from "@ant-design/icons";
const { Footer } = Layout;

export default function AppFooter() {
  return (
    <Footer className="bg-gray-100 text-gray-700 text-sm pt-10 pb-4 mt-auto border-t border-gray-200">
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:justify-between gap-8">
        {/* Left - Logo & Company Info */}
        <div className="md:w-1/3 flex flex-col gap-3">
          <div className="flex items-center mb-2">
            <img src={logo} alt="EV Logo" className="h-10 w-auto mr-2" />
            <span className="font-bold text-xl tracking-wide">EVD SYSTEM</span>
          </div>
          <div>
            <div className="font-semibold">
              CÔNG TY TNHH KINH DOANH THƯƠNG MẠI VÀ DỊCH VỤ EVFAST
            </div>
            <div>
              MST/MSDN: 0108926276 do Sở KHĐT TP Hà Nội cấp lần đầu ngày
              01/10/2019 và các lần thay đổi tiếp theo.
            </div>
            <div>
              <span className="font-semibold">Địa chỉ trụ sở chính:</span> Số 7,
              Đường Bằng Lăng 1, Khu đô thị Vinhomes Riverside, Phường Việt
              Hưng, Thành phố Hà Nội, Việt Nam.
            </div>
          </div>
        </div>

        {/* Middle - Navigation & Contact */}
        <div className="md:w-1/3 flex flex-col gap-4">
          <div>
            <div className="font-semibold mb-2">HOTLINE</div>
            <div className="flex items-center gap-2">
              <PhoneOutlined className="text-base text-blue-700" />
              <a
                href="tel:1900232389"
                className="hover:underline text-blue-700 font-medium"
              >
                1900 23 23 89
              </a>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <MailOutlined className="text-base text-blue-700" />
              <a
                href="mailto:support@evfastauto.com"
                className="hover:underline text-blue-700 font-medium"
              >
                support@evfastauto.com
              </a>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2">LIÊN HỆ</div>
            <div className="flex gap-3">
              <a href="#" className="hover:text-blue-700">
                <FacebookFilled className="text-2xl" />
              </a>
              <a href="#" className="hover:text-blue-700">
                <YoutubeFilled className="text-2xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Right - Newsletter */}
        <div className="md:w-1/3">
          <div className="font-semibold mb-2">ĐĂNG KÝ NHẬN THÔNG TIN</div>
          <div className="mb-2">
            Đăng ký nhận thông tin chương trình khuyến mãi, dịch vụ EVFAST
          </div>
          <form className="flex gap-2 mb-2">
            <input
              type="email"
              placeholder="Nhập email của quý khách"
              className="border border-gray-300 rounded px-3 py-1 flex-1"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
              Đăng ký
            </button>
          </form>
          <div className="flex items-start gap-2 text-xs">
            <input type="checkbox" className="mt-1" />
            <span>
              Tôi đồng ý cho phép Công ty TNHH Kinh doanh Thương mại và Dịch vụ
              EVFAST xử lý dữ liệu cá nhân của tôi và các thông tin khác do tôi
              cung cấp cho mục đích và theo phương thức được nêu tại chi tiết
              tại{" "}
              <a href="#" className="text-blue-700 underline">
                Chính sách Bảo vệ Dữ liệu cá nhân
              </a>
              .
            </span>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 flex flex-col md:flex-row justify-between items-center border-t border-gray-200 pt-4 text-xs text-gray-500">
        <div>
          Hệ sinh thái &nbsp;
          <a href="#" className="hover:underline">
            EV Dealer
          </a>
          ,&nbsp;
          <a href="#" className="hover:underline">
            EV Fast
          </a>
          ,&nbsp;
          <a href="#" className="hover:underline">
            EV Service
          </a>
        </div>
        <div className="mt-2 md:mt-0">
          EVFAST. All rights reserved.© Copyright {new Date().getFullYear()}
        </div>
      </div>
    </Footer>
  );
}
