import { useState } from "react";
import { Outlet } from "react-router-dom";
import VolunteerSidebar from "../pages/VolunteerCoordinator/VolunteerSidebar";
import VolunteerTopbar from "../pages/VolunteerCoordinator/VolunteerTopbar";



export default function VolunteerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#EFF6F7]">

      {/* COMMON SIDEBAR */}
      <VolunteerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* RIGHT CONTENT AREA */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">

        {/* COMMON TOPBAR */}
        <VolunteerTopbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* PAGE CONTENT CHANGES HERE */}
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>

      </div>
    </div>
  );
}