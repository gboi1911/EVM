import { useState } from "react";
import "./App.css";
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/Layout";
import { App as AntdApp } from "antd";

const Home = React.lazy(() => import("./pages/HomeDealer"));
const HomeEVM = React.lazy(() => import("./pages/HomeEVM"));
const Login = React.lazy(() => import("./pages/Login"));
const ManageAccount = React.lazy(() => import("./pages/EVM/ManageAccount"));
const Profile = React.lazy(() => import("./pages/Profile"));
const CarList = React.lazy(() => import("./pages/cars/CarList"));
const PriceList = React.lazy(() => import("./pages/sales/PriceList"));
const CarCompare = React.lazy(() => import("./pages/cars/CarCompare"));
const ManageCar = React.lazy(() => import("./pages/EVM/ManageCar"));
const ManageMotorbike = React.lazy(() => import("./pages/EVM/ManageMotor"));
const QuotationPage = React.lazy(() => import("./pages/sales/QuotationPage"));
const OrderPage = React.lazy(() => import("./pages/sales/OrderPage"));
const DeliveryTrackingPage = React.lazy(() =>
  import("./pages/sales/DeliveryTrackingPage")
);
const PaymentPage = React.lazy(() => import("./pages/sales/PaymentPage"));
const CustomerList = React.lazy(() => import("./pages/customers/CustomerList"));
const ManagerTestDrive = React.lazy(() =>
  import("./pages/customers/ManagerTestDrive")
);
const TestDriveSchedule = React.lazy(() =>
  import("./pages/customers/TestDriveSchedule")
);
const FeedbackManagement = React.lazy(() =>
  import("./pages/customers/FeedbackManagement")
);
const SalesReport = React.lazy(() => import("./pages/reports/SalesReport"));
const DebtReport = React.lazy(() => import("./pages/reports/DebtReport"));
const ManageCategory = React.lazy(() => import("./pages/EVM/ManageCategory"));
const ManageInventory = React.lazy(() => import("./pages/EVM/ManageInventory"));
const ManagePrice = React.lazy(() => import("./pages/EVM/ManagePrice"));
const ManageInventoryAndSalesSpeed = React.lazy(() =>
  import("./pages/EVM/ManageInventory&SpeedSale")
);
const ManageSalesReport = React.lazy(() =>
  import("./pages/EVM/SalesByAreaAndDealer")
);
const ManagePriceDetail = React.lazy(() => import("./pages/EVM/PriceDetail"));

function App() {
  return (
    <AntdApp>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes with layout */}
          <Route path="/" element={<MainLayout />}>
            <Route path="homeDealer" element={<Home />} />
            <Route path="homeEVM" element={<HomeEVM />} />
            <Route path="profile" element={<Profile />} />
            <Route path="manage-account" element={<ManageAccount />} />

            {/* Vehicles menu (Navbar) */}
            <Route path="vehicles" element={<CarList />} />
            <Route path="vehicles/compare" element={<CarCompare />} />

            {/* Quản lý bán hàng - khớp Navbar */}
            <Route path="sales/quotes" element={<QuotationPage />} />
            <Route path="sales/orders" element={<OrderPage />} />
            <Route path="sales/delivery" element={<DeliveryTrackingPage />} />
            <Route path="sales/payments" element={<PaymentPage />} />
            <Route path="sales/price-list" element={<PriceList />} />

            {/* Khách hàng */}
            <Route path="customers" element={<CustomerList />} />
            <Route
              path="customers/test-drive/create"
              element={<ManagerTestDrive />}
            />
            <Route
              path="customers/test-drive"
              element={<TestDriveSchedule />}
            />
            <Route path="customers/feedback" element={<FeedbackManagement />} />

            {/* Báo cáo */}
            <Route path="reports/sales" element={<SalesReport />} />
            <Route path="reports/debt" element={<DebtReport />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/homeDealer" replace />} />

            <Route path="homeEVM" element={<HomeEVM />}>
              <Route path="manage-account" element={<ManageAccount />} />
              <Route path="manage-category" element={<ManageCategory />} />
              <Route path="manage-inventory" element={<ManageInventory />} />
              <Route path="manage-price" element={<ManagePrice />} />
              <Route path="manage-car" element={<ManageCar />} />
              <Route path="manage-motorbike" element={<ManageMotorbike />} />
              <Route
                path="manage-inventory-and-sales-speed"
                element={<ManageInventoryAndSalesSpeed />}
              />
              <Route
                path="manage-sales-report"
                element={<ManageSalesReport />}
              />
              <Route path="price-detail/:id" element={<ManagePriceDetail />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </AntdApp>
  );
}

export default App;
