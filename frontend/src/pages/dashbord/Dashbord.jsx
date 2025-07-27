import React from "react";
import Sidebar from "../../components/dashboard/sidebar";
import { Outlet } from "react-router-dom";
import "./dashboard.css"; // ← link your CSS

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
