import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ClipboardList,
  Box,
  Home,
  ArrowRight,
  TrendingUp,
  Truck,
  Sparkles,
  Package,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  Users,
} from "lucide-react";
import { dashboardService } from "../../services/dashboardService";
import type {
  DashboardData,
  DashboardChartPoint,
  DashboardRequestPreview,
  DashboardActivityItem,
} from "../../types/dashboard";

export default function SystemDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await dashboardService.getDashboardData();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Unable to reach CareLink servers. Please ensure backend is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const summary = data?.summary;
  const chartData = data?.weeklyTrend || [];
  const requests = data?.urgentRequests || [];
  const activities = data?.recentActivities || [];

  const statCards = [
    {
      label: "Open requests",
      value: summary ? summary.openRequestsCount.toLocaleString() : "1,284",
      note: summary ? `+${summary.openRequestsTodayDelta} today` : "+86 today",
      icon: ClipboardList,
      color: "blue",
      onClick: () => navigate("/admin/requests"),
    },
    {
      label: "Critical priority",
      value: summary ? summary.criticalRequestsCount.toLocaleString() : "47",
      note: summary ? `${summary.overdueCriticalCount} overdue` : "12 overdue",
      icon: AlertTriangle,
      color: "red",
      onClick: () => navigate("/admin/requests?priority=Critical"),
    },
    {
      label: "People in shelters",
      value: summary ? summary.peopleInSheltersCount.toLocaleString() : "8,642",
      note: summary ? `${summary.shelterCapacityPercentage}% capacity` : "76% capacity",
      icon: Home,
      color: "orange",
      onClick: () => navigate("/admin/organisations"),
    },
    {
      label: "Resources available",
      value: summary ? `${summary.resourcesAvailablePercentage}%` : "68%",
      note: summary ? `${summary.resourceShortagesCount} shortages` : "3 shortages",
      icon: Box,
      color: "blue",
      onClick: () => navigate("/admin/integrations"),
    },
  ];

  return (
    <div className="font-sans text-[#123B5C]">
      {/* BREADCRUMB */}
      <div className="flex h-9 items-center justify-between border-b border-[#64C9AD]/40 bg-white px-6 text-[10px] text-slate-500">
        <div className="flex items-center gap-2">
          <span>Operations</span>
          <ChevronRight size={11} />
          <span className="font-semibold text-[#123B5C]">System Overview</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh dashboard data"
          >
            <RefreshCw size={11} className={refreshing ? "animate-spin text-[#2785B2]" : ""} />
            <span>{refreshing ? "Updating..." : "Refresh"}</span>
          </button>

          <span className="hidden items-center gap-1.5 text-[9px] font-medium text-emerald-600 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live data · Synced
          </span>
        </div>
      </div>

      {/* DASHBOARD BODY */}
      <main className="mx-auto max-w-[1600px] space-y-4 px-4 py-6 md:px-6 lg:px-7">
        {/* ERROR STATE */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => fetchDashboard()}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* PAGE HEADING */}
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <span className="inline-block rounded bg-red-50 px-2 py-1 text-[8px] font-bold tracking-wide text-red-500">
              SEVERITY 4 · MAJOR EMERGENCY
            </span>

            <h1 className="mt-2 text-xl font-medium tracking-tight text-[#123B5C] md:text-2xl">
              Emergency Operations Centre
            </h1>

            <p className="mt-1 text-[10px] text-slate-500">
              {summary?.activeCrisisName || "Monsoon Floods 2025"} · Greater Riverton response overview
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/admin/reports")}
              className="flex items-center gap-1.5 rounded-md border border-[#2785B2] bg-white px-3 py-2 text-[10px] font-semibold text-[#2785B2] transition hover:bg-slate-50"
            >
              <TrendingUp size={13} />
              Situation report
            </button>

            <button
              onClick={() => navigate("/admin/requests")}
              className="rounded-md bg-[#123B5C] px-3.5 py-2 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#1D5F8A]"
            >
              + Log incident
            </button>
          </div>
        </div>

        {/* CRISIS BANNER */}
        <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-[#FFF9FA] p-3.5 md:flex-row md:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <AlertTriangle size={18} className="shrink-0 text-red-500" />

            <div>
              <p className="text-[10px] font-bold text-slate-800">
                {summary?.activeCrisisName || "Monsoon Floods 2025"}
              </p>
              <p className="mt-0.5 text-[9px] text-slate-500">
                Active status: <span className="font-semibold text-red-600">{summary?.activeCrisisStatus || "Active Emergency"}</span> · 4 operational districts
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-red-100 pt-3 md:flex md:flex-1 md:justify-around md:border-l md:border-t-0 md:pl-4 md:pt-0">
            <div>
              <p className="text-[8px] font-semibold text-slate-400">LEAD AGENCY</p>
              <p className="mt-1 text-[10px] font-bold text-slate-800">
                National Disaster Authority
              </p>
            </div>

            <div>
              <p className="text-[8px] font-semibold text-slate-400">REGISTERED USERS</p>
              <p className="mt-1 text-[10px] font-bold text-[#123B5C]">
                {summary ? `${summary.activeUsersCount} Active / ${summary.totalRegisteredUsers} Total` : "7 Registered"}
              </p>
            </div>

            <div>
              <p className="text-[8px] font-semibold text-slate-400">PENDING VERIFICATION</p>
              <p className="mt-1 text-[10px] font-bold text-amber-600">
                {summary ? `${summary.pendingVerificationCount} Applications` : "14 Pending"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/ai-review")}
            className="flex items-center gap-1 text-[9px] font-semibold text-[#123B5C] hover:underline"
          >
            Review AI Triage <ArrowRight size={11} />
          </button>
        </div>

        {/* LOADING SKELETON OR STAT CARDS */}
        {loading && !data ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg border border-slate-200 bg-white p-4" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((item) => {
              const Icon = item.icon;
              const iconColors: Record<string, string> = {
                blue: "bg-sky-50 text-sky-600",
                red: "bg-red-50 text-red-500",
                orange: "bg-orange-50 text-orange-500",
              };
              const noteColors: Record<string, string> = {
                blue: "text-sky-600",
                red: "text-red-500",
                orange: "text-orange-500",
              };

              return (
                <div
                  key={item.label}
                  onClick={item.onClick}
                  className="cursor-pointer rounded-lg border border-[#64C9AD] bg-white p-4 shadow-sm transition hover:border-[#123B5C] hover:shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconColors[item.color]}`}>
                      <Icon size={18} />
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <h3 className="mt-1 text-2xl font-bold text-[#123B5C]">
                        {item.value}
                      </h3>
                      <p className={`mt-2 text-[10px] font-medium ${noteColors[item.color]}`}>
                        {item.note}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CHART AND MAP */}
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-lg border border-[#64C9AD] bg-white shadow-sm">
            <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 className="text-xs font-semibold text-[#123B5C]">
                  Request Operations Trend
                </h2>
                <p className="mt-0.5 text-[9px] text-slate-500">
                  Received vs fulfilled assistance requests over the past 7 days
                </p>
              </div>

              <div className="flex gap-3 text-[9px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-[#2684B8]" />
                  Received
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-sm bg-[#62BDA5]" />
                  Fulfilled
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex h-[185px] flex-col">
                <div className="relative flex flex-1">
                  <div className="flex flex-col justify-between pb-5 pr-3 text-[9px] text-slate-400">
                    {[300, 200, 100, 0].map((value) => (
                      <span key={value}>{value}</span>
                    ))}
                  </div>

                  <div className="relative flex flex-1 items-end justify-around border-b border-slate-200">
                    {[0, 100, 200, 300].map((value) => (
                      <div
                        key={value}
                        className="pointer-events-none absolute left-0 right-0 border-t border-slate-100"
                        style={{ bottom: `${(value / 320) * 100}%` }}
                      />
                    ))}

                    {chartData.map((d: DashboardChartPoint) => (
                      <div
                        key={d.day}
                        className="relative z-10 flex h-full w-full items-end justify-center gap-1.5"
                      >
                        <div
                          className="w-[8px] rounded-t-sm bg-[#2684B8] transition-all hover:opacity-80"
                          style={{ height: `${Math.min(100, (d.received / 320) * 100)}%` }}
                          title={`Received on ${d.day}: ${d.received}`}
                        />
                        <div
                          className="w-[8px] rounded-t-sm bg-[#62BDA5] transition-all hover:opacity-80"
                          style={{ height: `${Math.min(100, (d.fulfilled / 320) * 100)}%` }}
                          title={`Fulfilled on ${d.day}: ${d.fulfilled}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ml-8 flex justify-around pt-2 text-[9px] font-medium text-slate-500">
                  {chartData.map((d: DashboardChartPoint) => (
                    <span key={d.day}>{d.day}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-y divide-[#64C9AD]/40 border-t border-[#64C9AD]/40 sm:grid-cols-4 sm:divide-y-0 bg-[#EFF6F7]/30">
              {[
                ["1,947", "Total received"],
                ["1,502", "Fulfilled"],
                ["77.1%", "Resolution rate"],
                ["2h 18m", "Avg. response time"],
              ].map(([value, label]) => (
                <div key={label} className="px-3.5 py-2.5">
                  <p className="text-sm font-bold text-[#123B5C]">{value}</p>
                  <p className="mt-0.5 text-[8px] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* MAP PANEL */}
          <section className="overflow-hidden rounded-lg border border-[#64C9AD] bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div>
                <h2 className="text-xs font-semibold text-[#123B5C]">Live Operations Map</h2>
                <p className="mt-0.5 text-[9px] text-slate-500">
                  Greater Riverton · 342 active deployment points
                </p>
              </div>

              <button
                onClick={() => navigate("/admin/integrations")}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-[#64C9AD] text-[#123B5C] transition hover:bg-slate-50"
                title="View spatial integrations"
              >
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="relative h-[225px] overflow-hidden rounded-b-lg bg-[#F0F6F7]">
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 500 220"
                preserveAspectRatio="xMidYMid slice"
              >
                <rect width="500" height="220" fill="#F0F6F7" />
                <g stroke="white" strokeWidth="3" fill="none">
                  <path d="M-20 20 L160 130 L300 15 L520 160" />
                  <path d="M-20 100 L120 0 L300 180 L500 35" />
                  <path d="M60 240 L200 110 L370 240" />
                  <path d="M180 -20 L300 90 L430 -10" />
                  <path d="M0 175 L140 65 L280 220" />
                  <path d="M350 0 L480 100 L400 230" />
                </g>
                <path
                  d="M-30 180 L120 110 L300 25 L320 65 L140 150 L-10 220"
                  fill="#BEDCE5"
                  stroke="#D7E8EC"
                  strokeWidth="5"
                />
                <g fill="#829AA5" fontSize="7" fontWeight="bold">
                  <text x="30" y="45">NORTH WARD</text>
                  <text x="155" y="155">CENTRAL</text>
                  <text x="420" y="65">EASTBANK</text>
                </g>
              </svg>

              <div className="absolute left-[30%] top-[20%] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white shadow">
                <AlertTriangle size={12} />
              </div>
              <div className="absolute left-[72%] top-[22%] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-sky-600 text-white shadow">
                <Home size={12} />
              </div>
              <div className="absolute left-[42%] top-[55%] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-sky-600 text-white shadow">
                <span className="text-[9px] font-bold">24</span>
              </div>
              <div className="absolute left-[22%] top-[76%] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-white shadow">
                <span className="text-[9px] font-bold">9</span>
              </div>
              <div className="absolute left-[78%] top-[72%] flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-teal-500 text-white shadow">
                <Package size={12} />
              </div>

              <div className="absolute bottom-2 left-2 flex items-center gap-2 rounded-md border border-slate-200 bg-white/95 px-2.5 py-1 text-[8px] font-medium shadow-sm">
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Requests
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
                  Shelters
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                  Warehouses
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* PRIORITY REQUESTS & LIVE ACTIVITY */}
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="overflow-hidden rounded-lg border border-[#64C9AD] bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div>
                <h2 className="text-xs font-semibold text-[#123B5C]">Priority Assistance Requests</h2>
                <p className="mt-0.5 text-[9px] text-slate-500">
                  Requiring verification, coordination, or field dispatch
                </p>
              </div>

              <button
                onClick={() => navigate("/admin/requests")}
                className="flex items-center gap-1 text-[9px] font-semibold text-[#2785B2] hover:underline"
              >
                View all ({summary?.openRequestsCount || requests.length}) <ArrowRight size={11} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead>
                  <tr className="bg-[#EFF6F7] text-[8px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-3.5 py-2.5">Request ID</th>
                    <th className="px-3.5 py-2.5">Category</th>
                    <th className="px-3.5 py-2.5">Location</th>
                    <th className="px-3.5 py-2.5">Priority & Confidence</th>
                    <th className="px-3.5 py-2.5">Status</th>
                    <th className="px-3.5 py-2.5"></th>
                  </tr>
                </thead>

                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        No pending requests in queue
                      </td>
                    </tr>
                  ) : (
                    requests.map((request: DashboardRequestPreview) => (
                      <tr
                        key={request.id}
                        onClick={() => navigate(`/admin/ai-review?requestId=${request.id}`)}
                        className="cursor-pointer border-t border-slate-100 text-[9px] transition hover:bg-slate-50"
                      >
                        <td className="px-3.5 py-3">
                          <p className="font-bold text-[#123B5C]">{request.id}</p>
                          <p className="mt-0.5 text-[8px] text-slate-400">
                            {request.description}
                          </p>
                        </td>

                        <td className="px-3.5 py-3 font-medium text-slate-700">{request.category}</td>
                        <td className="px-3.5 py-3 text-slate-600">{request.location}</td>

                        <td className="px-3.5 py-3">
                          <span
                            className={`whitespace-nowrap rounded px-2 py-0.5 text-[8px] font-bold ${
                              request.critical
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {request.priority}
                          </span>
                        </td>

                        <td className="px-3.5 py-3">
                          <span className="whitespace-nowrap rounded bg-[#EFF6F7] px-2 py-0.5 text-[8px] font-semibold text-slate-700 border border-slate-200">
                            {request.status}
                          </span>
                        </td>

                        <td className="px-3.5 py-3 text-slate-400">
                          <ChevronRight size={13} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* LIVE ACTIVITY */}
          <section className="overflow-hidden rounded-lg border border-[#64C9AD] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 className="text-xs font-semibold text-[#123B5C]">Recent System Activity</h2>
                <p className="mt-0.5 text-[9px] text-slate-500">
                  Audit actions & operational event log
                </p>
              </div>

              <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {activities.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recent audit activity recorded
                </div>
              ) : (
                activities.map((activity: DashboardActivityItem) => {
                  const colors: Record<string, string> = {
                    blue: "bg-sky-50 text-sky-600",
                    red: "bg-red-50 text-red-500",
                    orange: "bg-orange-50 text-orange-500",
                  };

                  return (
                    <div
                      key={activity.id + activity.title}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition"
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors[activity.color] || colors.blue}`}>
                        {activity.icon === "AlertTriangle" ? (
                          <AlertTriangle size={14} />
                        ) : activity.icon === "ShieldCheck" ? (
                          <ShieldCheck size={14} />
                        ) : activity.icon === "Clock" ? (
                          <Clock size={14} />
                        ) : (
                          <Truck size={14} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] font-semibold text-[#123B5C]">
                          {activity.title}
                        </p>
                        <p className="mt-0.5 truncate text-[8px] text-slate-500">
                          {activity.description}
                        </p>
                      </div>

                      <span className="shrink-0 text-[8px] text-slate-400">
                        {activity.timeAgo}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="flex flex-col justify-between gap-2 pb-3 pt-2 text-[9px] text-slate-400 sm:flex-row">
          <p>© 2026 Humanitarian Aid Platform · CareLink Operations Network</p>
          <p className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-[#64C9AD]" />
            Secure verified operations environment
          </p>
        </footer>
      </main>
    </div>
  );
}
