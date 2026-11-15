
import { useState } from "react";
import { Outlet } from "react-router-dom";

import ShelterSidebar from "../pages/Shelter_Administrator/ShelterSidebar";
import ShelterTopbar from "../pages/Shelter_Administrator/ShelterTopbar";

export default function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#edf4f6]">

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden h-full shrink-0 lg:block">
        <ShelterSidebar />
      </aside>

      {/* MOBILE SIDEBAR */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">

          <div className="h-full">
            <ShelterSidebar onClose={closeMobileMenu} />
          </div>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={closeMobileMenu}
            className="flex-1 bg-black/40"
          />
        </div>
      )}

      {/* MAIN AREA */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

        {/* TOPBAR */}
        <ShelterTopbar
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* PAGE CONTENT */}
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#edf4f6]">
          <div className="min-h-full p-4 sm:p-5 lg:p-6">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}
