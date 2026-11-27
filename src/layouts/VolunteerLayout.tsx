import { useState } from "react";
import { Outlet } from "react-router-dom";
import VolunteerSidebar from "../pages/VolunteerCoordinator/VolunteerSidebar";
import VolunteerTopbar from "../pages/VolunteerCoordinator/VolunteerTopbar";
import CareLinkChatbot from "../components/chatbot/CareLinkChatbot";

export default function VolunteerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#EFF6F7]">
      <VolunteerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <VolunteerTopbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#EFF6F7]">
          <Outlet />
        </main>
      </div>

      <CareLinkChatbot forcedRole="Volunteer" />
    </div>
  );
}
