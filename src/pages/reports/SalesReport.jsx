// src/pages/reports/SalesReport.jsx

import { Table, Statistic, Card, Spin, message } from "antd";
import { useEffect, useState } from "react";
// THAY ĐỔI 1: Sửa tên hàm import cho đúng
import { getStaffRevenue } from "../../api/reports"; 

export default function SalesReport() {
  const [data, setData] = useState([]); // Khởi tạo là mảng rỗng []
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const response = await getStaffRevenue(); // Gọi API

        // THAY ĐỔI 2: Gán 'response.data' (mảng) thay vì 'response' (object)
        setData(response.data); 

      } catch (e) {
        message.error("Không tải được báo cáo doanh thu");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []); // Chạy 1 lần khi load trang

  // Dòng này (trước đây là dòng 21) sẽ hoạt động vì 'data' là mảng
  const total = data.reduce((total, currentItem) => total + currentItem.revenue, 0);

  const columns = [
    { title: "Mã NV", dataIndex: "staffId" },
    { title: "Tên nhân viên", dataIndex: "staffName" },
    {
      title: "Doanh thu (₫)",
      dataIndex: "revenue",
      render: (v) => v.toLocaleString(),
      sorter: (a, b) => a.revenue - b.revenue, // Thêm sắp xếp
    },
  ];

  return (
    <div style={{ backgroundColor: "#1f2937", minHeight: "100vh", padding: 40 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <h2
          style={{
            fontSize: 25,
          fontWeight: 700,
            color: "#059669",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Báo cáo doanh thu (Theo nhân viên)
        </h2>

        {loading ? (
          <Spin style={{ display: "block", margin: "auto" }} />
        ) : (
          <>
            <Card style={{ marginBottom: 24 }}>
              <Statistic
                title="Tổng doanh thu"
                value={total}
                suffix="₫"
                valueStyle={{ color: '#059669' }}
              />
            </Card>
            <Table columns={columns} dataSource={data} rowKey="staffId" />
          </>
        )}
      </div>
    </div>
  );
}