import { useState } from "react";
import "./App.css";
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout";

const Home = React.lazy(() => import("./pages/HomeDealer"));
const HomeEVM = React.lazy(() => import("./pages/HomeEVM"));
const Login = React.lazy(() => import("./pages/Login"));
const ManageAccount = React.lazy(() => import("./pages/EVM/ManageAccount"));
const ManageCategory = React.lazy(() => import("./pages/EVM/ManageCategory"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route path="homeDealer" element={<Home />} />
            <Route path="homeEVM" element={<HomeEVM />}>
              <Route path="manage-account" element={<ManageAccount />} />
              <Route path="manage-category" element={<ManageCategory />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
