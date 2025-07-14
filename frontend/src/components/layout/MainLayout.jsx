import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => (
  <div className="main-layout">
    <Header />
    <div className="main-content">
      <Sidebar />
      <section className="page-content">{children}</section>
    </div>
  </div>
);

export default MainLayout;