import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Table,
  Select,
  DatePicker,
  Space,
  notification,
  Divider,
  Typography,
} from "antd";
import { filterAccountsByRole } from "../../api/authen";
import { getInventory, getSalesSpeed } from "../../api/inventory";
import { getCarDetails } from "../../api/car";
import { getWarehouseList } from "../../api/warehouse";
import moment from "moment";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function ManageInventoryAndSales() {
  // States for Inventory section
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryPagination, setInventoryPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // cache car names to avoid repeated API calls
  const carNameCacheRef = useRef({});

  // States for Sales Speed section
  const [salesData, setSalesData] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const response = await filterAccountsByRole("DEALER_MANAGER");
      if (response && response.userInfoGetDtos) {
        const dealerOptions = response.userInfoGetDtos
          .filter((dealer) => dealer.isActive) // Only get active dealers
          .map((dealer) => ({
            label: `${dealer.fullName} (${dealer.username})`, // Show full name and username
            value: dealer.userId,
            city: dealer.city, // Additional info if needed
          }));

        setDealers(dealerOptions);

        if (dealerOptions.length > 0) {
          setSelectedDealer(dealerOptions[0].value);
          fetchInventory(dealerOptions[0].value);
        }
      }
    } catch (error) {
      notification.error({
        message: "Lỗi tải danh sách đại lý",
        description: error.message,
      });
    }
  };

  const fetchInventory = async (dealerId, page = 1, pageSize = 10) => {
    setInventoryLoading(true);
    try {
      const response = await getWarehouseList(page - 1, pageSize);

      const items = response.inventoryInfoGetDtos || [];

      // Transform API data to match table columns
      const mapped = items.map((item, index) => {
        const car = item.carDetail || {};
        return {
          id: item.id,
          carId: car.carDetailId || "-",
          carName: car.carName || car.carModelName || "N/A",
          quantity: item.quantity ?? 0,
          warehouseCarStatus: item.warehouseCarStatus || "UNKNOWN",
        };
      });

      setInventoryData(mapped);
      setInventoryPagination({
        current: (response.pageNo || 0) + 1,
        pageSize: response.pageSize || pageSize,
        total: response.totalElements || mapped.length,
      });
    } catch (error) {
      notification.error({
        message: "Lỗi tải dữ liệu kho",
        description: error.message,
      });
    } finally {
      setInventoryLoading(false);
    }
  };

  const fetchSalesSpeed = async (startTime, endTime) => {
    setSalesLoading(true);
    try {
      const response = await getSalesSpeed(startTime, endTime);
      setSalesData(Array.isArray(response) ? response : []);
    } catch (error) {
      notification.error({
        message: "Lỗi tải dữ liệu tốc độ bán",
        description: error.message,
      });
    } finally {
      setSalesLoading(false);
    }
  };

  const handleDealerChange = (value) => {
    setSelectedDealer(value);
    fetchInventory(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);

    if (dates?.[0] && dates?.[1]) {
      const startTime = dates[0].format("YYYY-MM-DDTHH:mm:ss");
      const endTime = dates[1].format("YYYY-MM-DDTHH:mm:ss");

      fetchSalesSpeed(startTime, endTime);
    }
  };

  const inventoryColumns = [
    { title: "STT", dataIndex: "id", key: "id", width: 80 },
    { title: "Mã xe", dataIndex: "carId", key: "carId" },
    { title: "Tên xe", dataIndex: "carName", key: "carName" }, // new column
    { title: "Tổng số lượng", dataIndex: "quantity", key: "quantity" },
    // {
    //   title: "Đã đặt trước",
    //   dataIndex: "reservedQuantity",
    //   key: "reservedQuantity",
    // },
    // {
    //   title: "Còn trống",
    //   dataIndex: "availableQuantity",
    //   key: "availableQuantity",
    // },
    {
      title: "Trạng thái",
      dataIndex: "warehouseCarStatus",
      key: "status",
      render: (status) => (status === "IN_STOCK" ? "Còn hàng" : "Hết hàng"),
    },
    // { title: "Ghi chú", dataIndex: "note", key: "note" },
  ];

  const salesColumns = [
    { title: "Mã đại lý", dataIndex: "dealerId", key: "dealerId" },
    {
      title: "Tốc độ bán (xe/tháng)",
      dataIndex: "salesPerMonth",
      key: "salesPerMonth",
      render: (value) => value?.toFixed(2) || "0.00",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <Card title={<Title level={4}>Quản lý kho</Title>}>
        <Space className="mb-4">
          {/* <Select
            placeholder="Chọn đại lý"
            options={dealers}
            value={selectedDealer}
            onChange={handleDealerChange}
            style={{ width: 300 }}
            showSearch
            optionFilterProp="label"
          /> */}
        </Space>
        <Table
          columns={inventoryColumns}
          dataSource={inventoryData}
          rowKey="id"
          loading={inventoryLoading}
          pagination={inventoryPagination}
          onChange={({ current, pageSize }) =>
            fetchInventory(selectedDealer, current, pageSize)
          }
        />
      </Card>

      <Divider />

      <Card title={<Title level={4}>Phân tích tốc độ bán</Title>}>
        <Space className="mb-4">
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            onChange={handleDateRangeChange}
            value={dateRange}
            placeholder={["Từ ngày", "Đến ngày"]}
          />
        </Space>
        <Table
          columns={salesColumns}
          dataSource={salesData}
          rowKey="dealerId"
          loading={salesLoading}
          pagination={false}
        />
      </Card>
    </div>
  );
}
