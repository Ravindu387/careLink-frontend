import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuth();

  const handleReturnDashboard = () => {
    if (hasRole("Admin") || hasRole("SystemAdmin")) {
      navigate("/admin/dashboard");
    } else if (hasRole("EmergencyCoordinator") || hasRole("IncidentManager")) {
      navigate("/coordinator/dashboard");
    } else if (hasRole("PartnerOfficer")) {
      navigate("/partner/dashboard");
    } else if (hasRole("Volunteer") || hasRole("VolunteerCoordinator")) {
      navigate("/volunteer/dashboard");
    } else {
      navigate("/citizen/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12 text-slate-800">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
          <ShieldAlert className="h-9 w-9" />
        </div>

        <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
          HTTP 403 Forbidden
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Access Restricted
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Your account does not have sufficient role authorizations or granular operational permissions
          to view or execute actions on this resource.
        </p>

        {user && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-left text-xs">
            <div className="flex justify-between py-1">
              <span className="font-medium text-slate-500">Authenticated user:</span>
              <span className="font-semibold text-slate-800">{user.fullName || user.email}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium text-slate-500">Assigned role(s):</span>
              <span className="font-semibold text-[#123B5C]">
                {user.roles && user.roles.length > 0 ? user.roles.join(", ") : "Citizen"}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={handleReturnDashboard}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123B5C] py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0E2E48]"
          >
            <Home className="h-4 w-4" />
            Return to Authorized Dashboard
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>

          <button
            onClick={logout}
            className="mt-2 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
