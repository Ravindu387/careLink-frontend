import { useState } from "react";
import { Outlet } from "react-router-dom";
import EmergencySidebar from "../pages/Emegency Coordinator/EmergencySidebar";
import EmergencyTopbar from "../pages/Emegency Coordinator/EmergencyTopbar";

export default function EmergencyCoordinatorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#EFF6F7]">
      <EmergencySidebar
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <EmergencyTopbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#EFF6F7] p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
