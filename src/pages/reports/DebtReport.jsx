// src/pages/reports/DebtReport.jsx
import { Table, Tag, Spin, message } from "antd";
import { useEffect, useState, useMemo } from "react"; // 1. THÊM MỚI: Import useMemo
import { getCustomerDebts } from "../../api/reports";
import { useAuth } from "../../context/AuthContext"; // 2. THÊM MỚI: Import useAuth

export default function DebtReport() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3. THÊM MỚI: Lấy user và quyền
  const { user, loading: authLoading } = useAuth();
  const isManager = useMemo(() => user && user.role === "DEALER_MANAGER", [user]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!user) return; // Chờ user load
      try {
        setLoading(true);

        // 4. THÊM MỚI: Logic gán staffId (theo yêu cầu BE)
        const params = {};
        if (!isManager) {
          // Gán staffId nếu là Staff
          // (Giả sử user.id là ID của Staff)
          params.staffId = user.id; 
        }
        
        // 5. THAY ĐỔI: Gửi params đi
        const response = await getCustomerDebts(params); 
        
        setDebts(response.data || response || []); // (Sửa lỗi response.data)
      } catch (e) {
        console.error("Lỗi tải công nợ:", e);
        message.error("Không tải được công nợ: " + e.message);
      } finally {
        setLoading(false);
      }
    };
    
    // 6. THAY ĐỔI: Chỉ gọi khi user đã sẵn sàng
    if (!authLoading) {
        fetchReport();
    }

  }, [authLoading, user, isManager]); // Thêm dependency

  const columns = [
    { title: "Mã KH", dataIndex: "customerId" },
    { title: "Tên Khách hàng", dataIndex: "customerName" },
    {
      title: "Số tiền nợ (VNĐ)",
      dataIndex: "debt", 
      render: (a) => (a ? a.toLocaleString("vi-VN") : 0),
    },
    {
      title: "Trạng thái",
      render: () => <Tag color="red">CHƯA THANH TOÁN</Tag>,
    },
  ];

  // 7. THÊM MỚI: Loading khi Auth chưa sẵn sàng
  if (authLoading) {
     return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#ffff", minHeight: "100vh", padding: 40 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          background: "#f3f0f0ff",
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
          Báo cáo công nợ
        </h2>

        {loading ? (
          <Spin style={{ display: "block", margin: "auto" }} />
        ) : (
          <Table columns={columns} dataSource={debts} rowKey="customerId" />
        )}
      </div>
    </div>
  );
}