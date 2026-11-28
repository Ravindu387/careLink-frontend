import { useState } from "react";
import { Outlet } from "react-router-dom";
import CaseManagerSidebar from "../pages/CaseManager/CaseManagerSidebar";
import CaseManagerTopbar from "../pages/CaseManager/CaseManagerTopbar";

export default function CaseManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#EFF6F7]">
      <CaseManagerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <CaseManagerTopbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#EFF6F7]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
