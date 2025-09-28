import { useState } from "react";
import "./App.css";
import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout";

const Home = React.lazy(() => import("./pages/HomeDealer"));
const Login = React.lazy(() => import("./pages/Login"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<MainLayout />}>
            <Route path="home" element={<Home />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
