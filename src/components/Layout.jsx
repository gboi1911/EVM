import React from "react";
import Navbar from "./Navbar";
import NavbarEVM from "./NavbarEVM";
import AppFooter from "./Footer";
import { Outlet, useLocation } from "react-router-dom";

const MainLayout = () => {
  const location = useLocation();

  // Choose navbar based on path
  let NavbarComponent = Navbar;
  if (
    location.pathname.startsWith("/homeEVM") ||
    location.pathname.startsWith("/evm/")
  ) {
    NavbarComponent = NavbarEVM;
  }

  return (
    <div>
      <NavbarComponent />
      <main>
        <Outlet />
      </main>
      <AppFooter />
    </div>
  );
};

export default MainLayout;
