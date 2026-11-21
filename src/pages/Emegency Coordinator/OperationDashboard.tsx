import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Download,
  Plus,
  Activity,
  Inbox,
  TrendingUp,
  Package,
  Home,
  Users,
  Sparkles,
  Clock,
  ArrowUpRight,
  MapPin,
  Calendar,
  ChevronRight,
  RefreshCw,
  X,
  Check,
  ShieldAlert,
} from "lucide-react";
import {
  operationDashboardService,
  type OperationDashboardData,
  type LogIncidentPayload,
} from "../../services/operationDashboardService";

const iconMap: Record<string, React.ElementType> = {
  AlertTriangle,
  Inbox,
  TrendingUp,
  Package,
  Home,
  Users,
  Sparkles,
  Clock,
};

const colorStyles: Record<string, string> = {
  red: "bg-red-50 text-red-600 border-red-200",
  blue: "bg-sky-50 text-sky-600 border-sky-200",
  amber: "bg-amber-50 text-amber-600 border-amber-200",
  green: "bg-emerald-50 text-emerald-600 border-emerald-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
};

export default function OperationDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<OperationDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showLogModal, setShowLogModal] = useState(false);
  const [loggingIncident, setLoggingIncident] = useState(false);
  const [newIncident, setNewIncident] = useState<LogIncidentPayload>({
    title: "",
    district: "North Ward",
    location: "",
    severity: "Major",
  });

  const [showSitRepModal, setShowSitRepModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await operationDashboardService.getDashboard();
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Unable to sync telemetry. Using cached dashboard state.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLogIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncident.title || !newIncident.location) return;

    setLoggingIncident(true);
    try {
      const addedActivity = await operationDashboardService.logQuickIncident(newIncident);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          recentActivities: [addedActivity, ...prev.recentActivities],
          activeOperationalPointsCount: prev.activeOperationalPointsCount + 1,
        };
      });
      setShowLogModal(false);
      setNewIncident({
        title: "",
        district: "North Ward",
        location: "",
        severity: "Major",
      });
      notify("Emergency incident logged and dispatched to active telemetry.");
    } catch {
      notify("Failed to log incident.");
    } finally {
      setLoggingIncident(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm("Reset operations dashboard to initial scenario?")) return;
    try {
      await operationDashboardService.reset();
      loadData(true);
      notify("Dashboard reset to baseline scenario.");
    } catch {
      notify("Could not reset dashboard.");
    }
  };

  const handleDownloadSitRep = () => {
    setShowSitRepModal(true);
  };

  if (!data && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eff5f7]">
        <div className="flex flex-col items-center gap-2">
          <RefreshCw size={28} className="animate-spin text-[#123b5a]" />
          <span className="text-xs font-semibold text-[#123b5a]">
            Loading Emergency Operations Command Center...
          </span>
        </div>
      </div>
    );
  }

  const crisis = data?.crisis;
  const kpis = data?.kpis || [];
  const weeklyTrends = data?.weeklyTrends || [];
  const recentActivities = data?.recentActivities || [];
  const upcomingBriefings = data?.upcomingBriefings || [];

  return (
    <div className="min-h-screen bg-[#eff5f7] px-4 py-5 md:px-6 lg:px-7">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-[#123b5a] px-4 py-2.5 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-top-2">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Emergency Operations</span>
          <ChevronRight size={14} />
          <span className="font-semibold text-slate-800">
            Emergency Operations Dashboard
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Telemetry Live
          </span>
          <span>·</span>
          <span>Last sync: {data ? new Date(data.lastSyncedAt).toLocaleTimeString() : "Just now"}</span>
        </div>
      </div>

      {/* Page Heading & Header Actions */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#123b5a]">
            Emergency Operations Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Unified command view for crisis incidents, critical priority triage, logistics stocks, shelters, and inter-agency coordination.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sync / Refresh */}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            title="Refresh dashboard telemetry"
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition shadow-2xs"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {/* Situation Report */}
          <button
            onClick={handleDownloadSitRep}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            <Download size={15} />
            <span>Situation Report</span>
          </button>

          {/* Log Incident */}
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-[#247ba5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#17668c] transition shadow-xs"
          >
            <Plus size={16} />
            <span>Log Incident</span>
          </button>
        </div>
      </div>

      {/* Error alert with retry */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} className="text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData()}
            className="font-semibold text-amber-900 underline hover:no-underline cursor-pointer"
          >
            Retry Telemetry
          </button>
        </div>
      )}

      {/* Active Crisis Alert Banner */}
      {crisis && (
        <div className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-red-200 border-l-4 border-l-red-600 bg-red-50/70 p-4 shadow-xs md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-red-100 p-3 text-red-600">
              <AlertTriangle size={24} />
            </div>

            <div>
              <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-700">
                {crisis.severity}
              </span>
              <h3 className="mt-1 text-base font-bold text-slate-800">
                {crisis.title}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {crisis.activeSince}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Lead Agency
              </p>
              <p className="mt-0.5 text-xs font-bold text-slate-800">
                {crisis.leadAgency}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Next Briefing
              </p>
              <p className="mt-0.5 text-xs font-bold text-slate-800">
                {crisis.nextBriefing}
              </p>
            </div>

            <button
              onClick={() => navigate("/emergency-coordinator/crisis-events")}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
            >
              View Crisis
            </button>
          </div>
        </div>
      )}

      {/* 8 Core Statistics KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = iconMap[item.icon] || Inbox;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">{item.title}</p>
                  <h3 className="mt-1.5 text-2xl font-bold text-slate-800">
                    {item.value}
                  </h3>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">
                    {item.detail}
                  </p>
                </div>

                <div className={`rounded-xl p-3 border ${colorStyles[item.color] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Grid: Weekly Requests Chart & Live Operations Map Preview */}
      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Requests Chart Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Requests Received and Fulfilled
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Seven-day emergency intake versus resolution telemetry
              </p>
            </div>

            <div className="flex gap-3 text-[11px]">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full bg-sky-600" />
                Received
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Fulfilled
              </span>
            </div>
          </div>

          <div className="flex h-64 items-end justify-around gap-2 px-5 pb-5 pt-8">
            {weeklyTrends.map((dataItem) => (
              <div
                key={dataItem.day}
                className="flex h-full flex-1 flex-col items-center justify-end"
              >
                <div className="flex h-full w-full items-end justify-center gap-1.5">
                  <div
                    className="w-4.5 rounded-t-md bg-sky-600 hover:bg-sky-700 transition"
                    style={{ height: `${dataItem.received}%` }}
                    title={`Received: ${dataItem.received} requests`}
                  />
                  <div
                    className="w-4.5 rounded-t-md bg-emerald-500 hover:bg-emerald-600 transition"
                    style={{ height: `${dataItem.fulfilled}%` }}
                    title={`Fulfilled: ${dataItem.fulfilled} requests`}
                  />
                </div>
                <span className="mt-2.5 text-[11px] font-semibold text-slate-500">
                  {dataItem.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Operations Map Preview Widget */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Live Operations Map
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                {data?.activeOperationalPointsCount || 342} active operational points tracked
              </p>
            </div>

            <button
              onClick={() => navigate("/emergency-coordinator/live-map")}
              className="flex items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
            >
              <span>Open full map</span>
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div
            onClick={() => navigate("/emergency-coordinator/live-map")}
            className="relative flex-1 min-h-[220px] flex items-center justify-center overflow-hidden bg-[#e5edf0] cursor-pointer group"
          >
            {/* Topographic Background */}
            <div
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  "linear-gradient(32deg, transparent 47%, white 48%, white 50%, transparent 51%), linear-gradient(145deg, transparent 47%, white 48%, white 50%, transparent 51%)",
                backgroundSize: "120px 100px",
              }}
            />

            {/* River corridor */}
            <div className="absolute left-0 top-[35%] h-6 w-full rotate-[-6deg] bg-sky-200/50 border-y border-sky-300/40" />

            {/* Marker pins */}
            <div className="absolute left-[20%] top-[25%] transition group-hover:scale-125">
              <MapPin size={28} className="text-red-600 drop-shadow-md" />
            </div>
            <div className="absolute right-[25%] top-[32%] transition group-hover:scale-125">
              <MapPin size={28} className="text-sky-600 drop-shadow-md" />
            </div>
            <div className="absolute bottom-[22%] left-[48%] transition group-hover:scale-125">
              <MapPin size={28} className="text-emerald-600 drop-shadow-md" />
            </div>

            <div className="z-10 rounded-xl bg-white/95 px-5 py-3 text-center shadow-lg backdrop-blur-xs border border-white transition group-hover:scale-105">
              <Activity className="mx-auto mb-1 text-sky-700 animate-pulse" size={22} />
              <p className="text-xs font-bold text-slate-800">
                Interactive Geospatial Map
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Click to explore affected zones, shelters, and teams
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Operations Feed & Upcoming Briefings */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Recent Operations Activity Feed */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Recent Operations Feed
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Latest field dispatches and resource operations
              </p>
            </div>
            <button
              onClick={() => navigate("/emergency-coordinator/audit-timeline")}
              className="text-xs font-semibold text-sky-700 hover:text-sky-800"
            >
              Audit Timeline
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivities.slice(0, 5).map((activity) => (
              <div
                key={activity.id || activity.title}
                className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center hover:bg-slate-50/50 transition"
              >
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">
                    {activity.title}
                  </h4>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin size={11} className="shrink-0" />
                    <span>{activity.location}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      activity.status === "New"
                        ? "bg-amber-100 text-amber-800"
                        : activity.status === "In Progress"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {activity.status}
                  </span>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Briefings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">
                Upcoming Briefings & Liaison Syncs
              </h3>
              <button
                onClick={handleResetDemo}
                title="Reset dashboard demo values"
                className="text-[10px] font-semibold text-slate-400 hover:text-slate-600"
              >
                Reset Demo
              </button>
            </div>

            <div className="space-y-3">
              {upcomingBriefings.map((briefing) => (
                <div
                  key={briefing.id || briefing.title}
                  className="rounded-xl bg-slate-50 p-4 border border-slate-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-blue-100 p-2.5 text-blue-700 shrink-0">
                      <Calendar size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-800">
                        {briefing.title}
                      </h4>
                      <p className="mt-0.5 text-[11px] text-slate-500 font-medium">
                        {briefing.time} · {briefing.location}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Lead: <strong className="text-slate-600">{briefing.leadOrganisation}</strong> ({briefing.attendeesCount} participants)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Active Coordination HQ
              </p>
              <p className="mt-0.5 text-xs font-bold text-slate-800">
                Greater Riverton National Incident Room
              </p>
            </div>
            <button
              onClick={() => navigate("/emergency-coordinator/partners")}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition"
              title="View Partner Organisations"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer watermark */}
      <p className="mt-8 text-center text-[10px] text-slate-400">
        CareLink Disaster Operations Telemetry System · Emergency Command HUD
      </p>

      {/* Log Quick Incident Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl animate-in zoom-in-95">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-[#123b5a] flex items-center gap-2">
                <Plus size={18} className="text-sky-700" />
                Log Emergency Incident
              </h2>
              <button
                onClick={() => setShowLogModal(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-4 text-xs text-slate-500">
              Record and immediately broadcast a new crisis incident to the active operations stream.
            </p>

            <form onSubmit={handleLogIncident} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Incident Title
                </label>
                <input
                  required
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                  placeholder="e.g. Flash Flood embankment breach"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    District
                  </label>
                  <select
                    value={newIncident.district}
                    onChange={(e) => setNewIncident({ ...newIncident, district: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 outline-none"
                  >
                    <option>North Ward</option>
                    <option>Central Ward</option>
                    <option>Eastbank</option>
                    <option>West District</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Severity
                  </label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 outline-none"
                  >
                    <option>Critical</option>
                    <option>Major</option>
                    <option>Moderate</option>
                    <option>Minor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Location Specifics
                </label>
                <input
                  required
                  value={newIncident.location}
                  onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                  placeholder="e.g. Sector 3, Bridge 2 Riverside"
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loggingIncident}
                  className="rounded-lg bg-[#247ba5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#17668c] disabled:opacity-50"
                >
                  {loggingIncident ? "Broadcasting..." : "Dispatch Incident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Situation Report Modal */}
      {showSitRepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl animate-in zoom-in-95">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-[#123b5a] flex items-center gap-2">
                <Download size={18} className="text-sky-700" />
                Operational Situation Report
              </h2>
              <button
                onClick={() => setShowSitRepModal(false)}
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1.5">
                <p><strong>Incident:</strong> {crisis?.title} ({crisis?.severity})</p>
                <p><strong>Open Requests:</strong> 1,284 total (47 Critical)</p>
                <p><strong>Active Shelters:</strong> 38 shelters accommodating 8,642 persons</p>
                <p><strong>Response Teams:</strong> 84 teams deployed in field</p>
                <p><strong>Lead Command:</strong> {crisis?.leadAgency}</p>
              </div>
              <p className="text-[11px] text-slate-400">
                Generated live from CareLink Operations Telemetry.
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  setShowSitRepModal(false);
                  notify("Situation Report downloaded successfully.");
                }}
                className="flex-1 rounded-lg bg-[#247ba5] py-2.5 text-xs font-semibold text-white hover:bg-[#17668c] transition text-center"
              >
                Download SITREP PDF
              </button>
              <button
                onClick={() => {
                  setShowSitRepModal(false);
                  navigate("/emergency-coordinator/situation-reports");
                }}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
              >
                View SITREP Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
