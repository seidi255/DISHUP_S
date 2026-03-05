import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div
        className="flex-grow-1 p-4"
        style={{ backgroundColor: "#f8f9fa", transition: "0.3s" }}
      >
        <Outlet />
      </div>
    </div>
  );
}
