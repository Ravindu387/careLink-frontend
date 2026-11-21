
import { useState, type ReactNode } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../pages/Citizen/Sidebar";
import Topbar from "../pages/Citizen/Topbar";

interface CitizenLayoutProps {
  children?: ReactNode;
  activePage?: string;
}

export default function CitizenLayout({
  children,
  activePage = "Home",
}: CitizenLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#eef4f6]">

      {/* Citizen Sidebar */}
      <Sidebar
        activePage={activePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="min-h-screen lg:ml-[295px]">

        {/* Citizen Topbar */}
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <div className="min-h-[calc(100vh-74px)] p-5 lg:p-6">
          {children ?? <Outlet />}
        </div>

      </main>
    </div>
  );
}
