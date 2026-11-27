import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/ResourceManager/Sidebar";

interface ResourceManagerLayoutProps {
  children?: ReactNode;
  activePage?: string;
}

export default function ResourceManagerLayout({
  children,
  activePage,
}: ResourceManagerLayoutProps) {
  return (
    <div className="min-h-screen bg-[#EFF6F7] lg:[&>div>aside]:hidden">
      <Sidebar activePage={activePage} />
      {children ?? <Outlet />}
    </div>
  );
}
