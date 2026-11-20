import { Outlet } from "react-router-dom";

import CaseManagerSidebar from "../pages/CaseManager/CaseManagerSidebar";
import CaseManagerTopbar from "../pages/CaseManager/CaseManagerTopbar";

export default function CaseManagerLayout() {

  return (

    <div className="min-h-screen bg-[#eff6f8]">

      {/* SIDEBAR */}

      <CaseManagerSidebar />

      {/* MAIN AREA */}

      <div className="ml-[295px] min-h-screen">

        {/* TOPBAR */}

        <CaseManagerTopbar />

        {/* PAGE CONTENT */}

        <main className="min-h-[calc(100vh-75px)]">

          <Outlet />

        </main>

      </div>

    </div>

  );
}