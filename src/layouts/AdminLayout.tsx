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

      <div className="min-w-0 flex-1">
        <AdminTopbar
          onMenu={() => setSidebarOpen(true)}
        />

        <Outlet />
      </div>
    </div>
  );
}
