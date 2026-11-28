import { useState } from "react";
import { Outlet } from "react-router-dom";
import PartnerOfficerSidebar from "../pages/PartnerOfficer/PartnerOfficerSidebar";
import PartnerOfficerTopbar from "../pages/PartnerOfficer/PartnerOfficerTopbar";

const PartnerOfficerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#EFF6F7]">
      <PartnerOfficerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <PartnerOfficerTopbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#EFF6F7]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PartnerOfficerLayout;
