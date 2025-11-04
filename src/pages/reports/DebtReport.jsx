// src/pages/reports/DebtReport.jsx
import { Table, Tag, Spin, message } from "antd";
import { useEffect, useState } from "react";
import { getCustomerDebts } from "../../api/reports";

export default function DebtReport() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // THAY ĐỔI 1: Dữ liệu trả về nằm trong .data
        const response = await getCustomerDebts();
        setDebts(response.data);
      } catch (e) {
        console.error("Lỗi tải công nợ:", e);
        // Kiểm tra lỗi 401/403 từ interceptor
        if (e.message.includes("Phiên đăng nhập hết hạn")) {
          message.error(e.message);
        } else {
          message.error("Không tải được công nợ");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // THAY ĐỔI 2: Cập nhật 'columns' để khớp với API
  const columns = [
    { title: "Mã KH", dataIndex: "customerId" },
    { title: "Tên Khách hàng", dataIndex: "customerName" },
    {
      title: "Số tiền nợ (VNĐ)",
      dataIndex: "debt", // API trả về 'debt', không phải 'amount'
      render: (a) => (a ? a.toLocaleString("vi-VN") : 0),
    },
    {
      title: "Trạng thái",
      // API này là báo cáo nợ, nên trạng thái luôn là "Chưa thanh toán"
      render: () => <Tag color="red">CHƯA THANH TOÁN</Tag>,
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
            fontWeight: 700,
            color: "#059669",
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Báo cáo công nợ
        </h2>

        {loading ? (
          <Spin style={{ display: "block", margin: "auto" }} />
        ) : (
          // THAY ĐỔI 3: Dùng rowKey="customerId"
          <Table columns={columns} dataSource={debts} rowKey="customerId" />
        )}
      </div>
    </div>
  );
}