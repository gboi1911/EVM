import { useState } from "react";
import "./App.css";
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/Layout";

// Lazy load pages
const Home = React.lazy(() => import("./pages/HomeDealer"));
const HomeEVM = React.lazy(() => import("./pages/HomeEVM"));
const Login = React.lazy(() => import("./pages/Login"));
const ManageAccount = React.lazy(() => import("./pages/EVM/ManageAccount"));
// Trang quản lý xe
const CarList = React.lazy(() => import("./pages/cars/CarList"));
const CarCompare = React.lazy(() => import("./pages/cars/CarCompare"));

// Trang quản lý bán hàng
const QuotationPage = React.lazy(() => import("./pages/sales/QuotationPage"));
const OrderPage = React.lazy(() => import("./pages/sales/OrderPage"));
const ContractPage = React.lazy(() => import("./pages/sales/ContractPage"));
const PromotionPage = React.lazy(() => import("./pages/sales/PromotionPage"));
const DeliveryTrackingPage = React.lazy(() => import("./pages/sales/DeliveryTrackingPage"));
const PaymentPage = React.lazy(() => import("./pages/sales/PaymentPage"));
const BookingPage = React.lazy(() => import("./pages/sales/BookingPage"));

// Trang khách hàng
const CustomerList = React.lazy(() => import("./pages/customers/CustomerList"));
const TestDriveSchedule = React.lazy(() => import("./pages/customers/TestDriveSchedule"));
const FeedbackManagement = React.lazy(() => import("./pages/customers/FeedbackManagement"));

// Báo cáo
const SalesReport = React.lazy(() => import("./pages/reports/SalesReport"));
const DebtReport = React.lazy(() => import("./pages/reports/DebtReport"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes with layout */}
          <Route path="/" element={<MainLayout />}>
            {/* Alias cho logo hiện tại (/home) */}
            <Route path="home" element={<Navigate to="/homeDealer" replace />} />
            <Route path="homeDealer" element={<Home />} />
            <Route path="homeEVM" element={<HomeEVM />} />
            <Route path="manage-account" element={<ManageAccount />} />

            {/* Vehicles menu (Navbar) */}
            <Route path="vehicles" element={<CarList />} />
            <Route path="vehicles/compare" element={<CarCompare />} />

           

            {/* Quản lý bán hàng - khớp Navbar */}
            <Route path="sales/quotes" element={<QuotationPage />} />
            <Route path="sales/orders" element={<OrderPage />} />
            <Route path="sales/contracts" element={<ContractPage />} />
            <Route path="sales/promotions" element={<PromotionPage />} />
            <Route path="sales/delivery" element={<DeliveryTrackingPage />} />
            <Route path="sales/payments" element={<PaymentPage />} />
<Route path="sales/booking" element={<BookingPage />} />

             {/* Khách hàng */}
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/test-drive" element={<TestDriveSchedule />} />
            <Route path="customers/feedback" element={<FeedbackManagement />} />

            {/* Báo cáo */}
            <Route path="reports/sales" element={<SalesReport />} />
            <Route path="reports/debt" element={<DebtReport />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/homeDealer" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
