
import { useState } from "react";
import { Outlet } from "react-router-dom";
import FundingSidebar from "../pages/Funding_Officer/FundingSidebar";
import FundingTopbar from "../pages/Funding_Officer/FundingTopbar";



export default function FundingOfficerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#edf4f6]">

      <div className="flex h-full">

        {/* SIDEBAR */}

        <FundingSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* MAIN APPLICATION AREA */}

        <div className="flex-1 min-w-0 h-full flex flex-col lg:ml-[290px]">

          {/* COMMON TOPBAR */}

          <FundingTopbar
            onMenuClick={() => setSidebarOpen(true)}
          />

          {/* PAGE CONTENT - INDEPENDENT SCROLL */}

          <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">

            <Outlet />

          </main>

        </div>

      </div>

    </div>
  );
}
