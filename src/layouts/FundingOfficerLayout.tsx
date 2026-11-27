import { useState } from "react";
import { Outlet } from "react-router-dom";
import FundingSidebar from "../pages/Funding_Officer/FundingSidebar";
import FundingTopbar from "../pages/Funding_Officer/FundingTopbar";

export default function FundingOfficerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#EFF6F7]">
      <FundingSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <FundingTopbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#EFF6F7]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
