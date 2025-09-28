import React from "react";
import Navbar from "./Navbar";
import AppFooter from "./Footer";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
};

export default MainLayout;
