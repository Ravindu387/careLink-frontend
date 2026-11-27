import { useLocation, useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home, LogOut, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  formatRoleLabel,
  getDashboardPathForRoles,
} from "../../constants/roles";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const stateInfo = (location.state as any) || {};
  const attemptedPath = stateInfo?.from?.pathname;
  const denialReason = stateInfo?.reason || user?.accountStatus;

  const authorizedDashboard = getDashboardPathForRoles(user?.roles);

  const handleReturnDashboard = () => {
    if (isAuthenticated && authorizedDashboard) {
      navigate(authorizedDashboard, { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getDenialDescription = () => {
    if (
      denialReason === "PendingApproval" ||
      denialReason === "AdditionalInfoRequested"
    ) {
      return "Your Partner Organisation account is currently pending administrator verification. Protected operational modules remain restricted until an administrator approves your registration.";
    }
    if (denialReason === "Rejected") {
      return `Your registration was not approved by an administrator.${
        user?.rejectionReason ? ` Reason: ${user.rejectionReason}` : ""
      }`;
    }
    if (denialReason === "Disabled" || denialReason === "AccountInactive") {
      return "Your account is currently disabled or inactive. Please contact a CareLink System Administrator.";
    }
    if (denialReason === "MissingRoleClaims") {
      return "Your account does not have an active role assignment. Please contact a System Administrator.";
    }
    return "Your account does not have the required role authorization or operational permissions to access this workspace.";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#EFF6F7] px-4 py-12 text-slate-800">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
        <div className="mx-auto mb-4 flex justify-center">
          <CareLinkLogo size="header" />
        </div>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
          <ShieldAlert className="h-9 w-9" />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
          <Lock size={12} />
          HTTP 403 · Access Restricted
        </span>

        <h1 className="text-2xl sm:text-[28px] lg:text-[30px] mt-4 font-bold tracking-tight text-[#123B5C]">
          Unauthorized Workspace Access
        </h1>

        <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-slate-600">
          {getDenialDescription()}
        </p>

        {attemptedPath && (
          <p className="mt-2.5 rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm text-slate-600">
            Restricted Route: {attemptedPath}
          </p>
        )}

        {user && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-left text-sm">
            <div className="flex justify-between py-1">
              <span className="font-medium text-slate-500">
                Authenticated user:
              </span>
              <span className="font-semibold text-slate-800">
                {user.fullName || user.email}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium text-slate-500">
                Assigned role:
              </span>
              <span className="font-semibold text-[#123B5C]">
                {user.roles && user.roles.length > 0
                  ? user.roles.map((r) => formatRoleLabel(r)).join(", ")
                  : "Unassigned"}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="font-medium text-slate-500">
                Account status:
              </span>
              <span className="font-semibold text-slate-700">
                {user.accountStatus || (user.isActive ? "Active" : "Inactive")}
              </span>
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleReturnDashboard}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123B5C] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D5F8A]"
          >
            <Home className="h-4 w-4" />
            {isAuthenticated && authorizedDashboard
              ? "Return to My Authorized Dashboard"
              : "Return to Sign In"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Public Home Page
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-1 flex w-full items-center justify-center gap-1.5 py-1.5 text-sm font-medium text-slate-500 hover:text-rose-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
