
import { useState } from "react";
import { Outlet } from "react-router-dom";

import PartnerOfficerSidebar from "../pages/PartnerOfficer/PartnerOfficerSidebar";
import PartnerOfficerTopbar from "../pages/PartnerOfficer/PartnerOfficerTopbar";

const PartnerOfficerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#eff5f7]">

      <PartnerOfficerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen min-w-0 lg:ml-[264px]">

        <PartnerOfficerTopbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-h-[calc(100vh-66px)] min-w-0 bg-[#eff5f7]">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default PartnerOfficerLayout;
