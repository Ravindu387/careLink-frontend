import { useLocation, useNavigate } from "react-router-dom";
import { Compass, Home, ArrowLeft, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPathForRoles } from "../../constants/roles";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const dashboardPath = getDashboardPathForRoles(user?.roles);

  const handlePrimaryNavigation = () => {
    if (isAuthenticated && dashboardPath) {
      navigate(dashboardPath, { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#EFF6F7] px-4 py-12 text-slate-800">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
        <div className="mx-auto mb-4 flex justify-center">
          <CareLinkLogo size="header" />
        </div>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-[#123B5C] ring-8 ring-sky-50/50">
          <Compass className="h-9 w-9" />
        </div>

        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#123B5C]">
          HTTP 404 · Page Not Found
        </span>

        <h1 className="text-2xl sm:text-[28px] lg:text-[30px] mt-4 font-bold tracking-tight text-[#123B5C]">
          Route Not Found
        </h1>

        <p className="mt-2.5 text-sm sm:text-[15px] leading-relaxed text-slate-600">
          The page you requested does not exist or has been moved within the
          CareLink Humanitarian Aid Platform.
        </p>

        <p className="mt-3 rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm text-slate-600">
          {location.pathname}
        </p>

        <div className="mt-7 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handlePrimaryNavigation}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123B5C] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1D5F8A]"
          >
            <Home className="h-4 w-4" />
            {isAuthenticated && dashboardPath
              ? "Return to My Dashboard"
              : "Return to Public Home"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>

          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-1 flex w-full items-center justify-center gap-1.5 py-1.5 text-sm font-semibold text-[#2785B2] hover:underline"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In to CareLink
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
