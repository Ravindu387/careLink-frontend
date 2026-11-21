import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../pages/admin/AdminSidebar";
import AdminTopbar from "../pages/admin/AdminTopbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#EFF6F7]">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar
          onMenu={() => setSidebarOpen(true)}
        />

        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-[#EFF6F7]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
