
import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../pages/ResourceManager/Sidebar";
import Topbar from "../pages/ResourceManager/Topbar";

interface ResourceManagerLayoutProps {
  children?: ReactNode;
  activePage?: string;
}

export default function ResourceManagerLayout({
  children,
  activePage = "Resource Dashboard",
}: ResourceManagerLayoutProps) {

  return (
    <div className="min-h-screen bg-[#eef4f6]">

      {/* Resource Manager Sidebar */}
      <Sidebar
        activePage={activePage}
      />

      {/* Main Content */}
      <main className="ml-[293px] min-h-screen">

        {/* Resource Manager Topbar */}
        <Topbar />

        {/* Page Content */}
        <div className="min-h-[calc(100vh-74px)] p-6">
          {children ?? <Outlet />}
        </div>

      </main>
    </div>
  );
}
