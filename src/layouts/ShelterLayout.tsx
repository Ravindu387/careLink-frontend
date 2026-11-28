import { useState } from "react";
import { Outlet } from "react-router-dom";
import ShelterSidebar from "../pages/Shelter_Administrator/ShelterSidebar";
import ShelterTopbar from "../pages/Shelter_Administrator/ShelterTopbar";

export default function ShelterLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#EFF6F7]">
      <ShelterSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ShelterTopbar onMenuClick={() => setMobileMenuOpen(true)} />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#EFF6F7]">
          <div className="min-h-full p-4 sm:p-5 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
