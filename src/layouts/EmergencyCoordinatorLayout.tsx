
import { useState } from "react";
import { Outlet } from "react-router-dom";
import EmergencySidebar from "../pages/Emegency Coordinator/EmergencySidebar";
import EmergencyTopbar from "../pages/Emegency Coordinator/EmergencyTopbar";



export default function EmergencyCoordinatorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#edf4f7]">

      <EmergencySidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:ml-[248px]">

        <EmergencyTopbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-h-[calc(100vh-64px)] p-4 sm:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}
