import React, { useEffect, useState } from "react";
import { Card, Tabs, Spin } from "antd";
import { Bar } from "react-chartjs-2";
import { getRevenueByCity, getRevenueByDealer } from "../../api/report";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function SalesByAreaAndDealer() {
  const [loadingDealer, setLoadingDealer] = useState(false);
  const [loadingCity, setLoadingCity] = useState(false);
  const [dealerData, setDealerData] = useState([]);
  const [cityData, setCityData] = useState([]);

  useEffect(() => {
    fetchDealerRevenue();
    fetchCityRevenue();
  }, []);

  const fetchDealerRevenue = async () => {
    setLoadingDealer(true);
    try {
      const res = await getRevenueByDealer();
      setDealerData(res || []);
    } finally {
      setLoadingDealer(false);
    }
  };

  const fetchCityRevenue = async () => {
    setLoadingCity(true);
    try {
      const res = await getRevenueByCity();
      setCityData(res || []);
    } finally {
      setLoadingCity(false);
    }
  };

  const dealerChartData = {
    labels: dealerData.map((d) => d.dealerName),
    datasets: [
      {
        label: "Doanh số (VNĐ)",
        data: dealerData.map((d) => d.revenue),
        backgroundColor: "#10b981",
      },
    ],
  };

  const cityChartData = {
    labels: cityData.map((c) => c.city),
    datasets: [
      {
        label: "Doanh số (VNĐ)",
        data: cityData.map((c) => c.revenue),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <Card title="So sánh doanh số">
      <Tabs
        defaultActiveKey="dealer"
        items={[
          {
            key: "dealer",
            label: "Theo đại lý",
            children: loadingDealer ? (
              <Spin />
            ) : (
              <div style={{ height: 320, maxWidth: "100%" }}>
                <Bar
                  data={dealerChartData}
                  height={320}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: true, text: "Doanh số theo đại lý" },
                    },
                  }}
                />
              </div>
            ),
          },
          {
            key: "city",
            label: "Theo thành phố",
            children: loadingCity ? (
              <Spin />
            ) : (
              <div style={{ height: 320, maxWidth: "100%" }}>
                <Bar
                  data={cityChartData}
                  height={320}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: true, text: "Doanh số theo thành phố" },
                    },
                  }}
                />
              </div>
            ),
          },
        ]}
      />
    </Card>
  );
}
