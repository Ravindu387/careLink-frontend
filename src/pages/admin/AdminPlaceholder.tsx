import { useParams, Link } from "react-router-dom";
import { LayoutDashboard, ArrowLeft, Clock } from "lucide-react";

const titles: Record<string, string> = {
  users: "User Management",
  roles: "Roles & Permissions",
  organisations: "Organisation Management",
  integrations: "Integration Health",
  "security-events": "Security Events",
  "audit-logs": "Audit Logs",
  notifications: "Notifications",
  settings: "Settings",
};

export default function AdminPlaceholder() {
  const { tab = "" } = useParams<{ tab: string }>();
  const title = titles[tab] || tab.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Admin Workspace";

  return (
    <div className="font-sans text-[#123B5C]">
      {/* Breadcrumb */}
      <div className="flex h-8 items-center gap-2 border-b border-[#64C9AD] bg-white px-6 text-[10px] text-slate-500">
        <Link to="/admin/dashboard" className="hover:text-[#123B5C]">Operations</Link>
        <span>/</span>
        <span className="font-semibold text-[#123B5C]">{title}</span>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-3 text-[#1D5F8A] shadow-sm border border-slate-200">
          <Clock size={28} />
        </div>
        <span className="inline-block rounded-md bg-white border border-[#B9DED7] px-3 py-1 text-[11px] font-semibold text-[#1D5F8A]">
          ADMIN WORKSPACE
        </span>
        <h1 className="mt-3 text-2xl font-semibold text-[#123B5C]">{title}</h1>
        <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto">
          This section is currently under development. You can navigate back to the operational dashboard or view active assistance requests.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-[#123B5C] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#1D5F8A] transition"
          >
            <LayoutDashboard size={14} />
            System Overview
          </Link>
          <Link
            to="/admin/requests"
            className="inline-flex items-center gap-2 rounded-lg border border-[#1D5F8A] bg-white px-4 py-2.5 text-xs font-semibold text-[#1D5F8A] hover:bg-[#EFF6F7] transition"
          >
            <ArrowLeft size={14} />
            Assistance Requests
          </Link>
        </div>
      </div>
    </div>
  );
}

