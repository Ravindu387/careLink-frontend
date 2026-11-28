import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import CareLinkChatbot from "../components/chatbot/CareLinkChatbot";

interface CitizenLayoutProps {
  children?: ReactNode;
  activePage?: string;
}

export default function CitizenLayout({ children }: CitizenLayoutProps) {
  return (
    <div className="min-h-screen bg-[#EFF6F7] lg:[&_main]:ml-[280px]">
      {children ?? <Outlet />}
      <CareLinkChatbot forcedRole="Citizen" />
    </div>
  );
}
