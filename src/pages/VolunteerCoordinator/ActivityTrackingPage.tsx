import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";

import {
  Search,
  HelpCircle,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Activity,
  Users,
  X,
  Filter,
  CheckCircle2,
  ShieldCheck,
  ClipboardList,
  Download,
  Server,
  RefreshCw,
} from "lucide-react";

import { activityTrackingService } from "../../services/activityTrackingService";
import type {
  ActivityRecord,
  ActivityType,
  ActivityTrackingStatsDto,
} from "../../types/activityTracking";

export default function ActivityTrackingPage() {
  // Sync and connection state
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  // Stats state
  const [stats, setStats] = useState<ActivityTrackingStatsDto>({
    volunteersCheckedIn: 294,
    hoursToday: "2,184h",
    tasksOnTrack: "89.4%",
    safetyAlerts: 3,
    lastSync: "Just now",
    operationalAreasCount: 12,
    presenceSummary: {
      medicalTeams: 58,
      logistics: 96,
      shelterSupport: 74,
      areas: [
        { name: "North Ward", count: 42, position: "top-[26%] left-[30%]" },
        { name: "Eastbank", count: 64, position: "top-[26%] right-[22%]" },
        { name: "Central", count: 86, position: "top-[52%] left-[52%]" },
        { name: "West District", count: 31, position: "bottom-[16%] left-[19%]" },
      ],
    },
  });

  // Activities & Pagination state
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Filters & Search
  const [search, setSearch] = useState<string>("");
  const [activityFilter, setActivityFilter] = useState<string>("All activities");
  const [locationFilter, setLocationFilter] = useState<string>("All locations");
  const [availableLocations, setAvailableLocations] = useState<string[]>([
    "North Ward",
    "West Warehouse",
    "Central Clinic",
    "Eastbank Hub",
    "Riverton School",
    "West District",
    "Remote",
  ]);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Modals
  const [showCheckIn, setShowCheckIn] = useState<boolean>(false);
  const [showRecordModal, setShowRecordModal] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Forms
  const [checkInForm, setCheckInForm] = useState({
    volunteer: "",
    task: "",
    location: "",
    verification: "GPS verified",
  });

  const [recordForm, setRecordForm] = useState({
    volunteer: "",
    activity: "Progress update" as ActivityType,
    task: "",
    location: "",
    verification: "",
  });

  // NOTIFICATION
  const notify = (message: string) => {
    setNotification(message);
    window.setTimeout(() => {
      setNotification("");
    }, 3500);
  };

  // LOAD DATA
  const loadData = useCallback(async (page: number = 1) => {
    try {
      const [statsRes, activitiesRes, locationsRes] = await Promise.all([
        activityTrackingService.getStats(),
        activityTrackingService.getActivities({
          search,
          activity: activityFilter,
          location: locationFilter,
          pageNumber: page,
          pageSize,
        }),
        activityTrackingService.getLocations(),
      ]);

      setIsLiveBackend(statsRes.isLiveBackend || activitiesRes.isLiveBackend);
      setStats(statsRes.data);
      setActivities(activitiesRes.data.items);
      setTotalCount(activitiesRes.data.totalCount);
      if (locationsRes && locationsRes.length > 0) {
        setAvailableLocations(locationsRes);
      }
    } catch (err) {
      console.error("Failed to load activity tracking data", err);
      notify("Notice: Using offline demonstration dataset.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search, activityFilter, locationFilter, pageSize]);

  useEffect(() => {
    loadData(currentPage);
  }, [loadData, currentPage]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(currentPage);
    notify("Activity tracking refreshed successfully.");
  };

  // MANUAL CHECK IN
  const handleManualCheckIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await activityTrackingService.manualCheckIn({
        volunteer: checkInForm.volunteer,
        task: checkInForm.task,
        location: checkInForm.location,
        verification: checkInForm.verification,
      });

      setCheckInForm({
        volunteer: "",
        task: "",
        location: "",
        verification: "GPS verified",
      });
      setShowCheckIn(false);
      notify("Volunteer checked in successfully!");
      setCurrentPage(1);
      await loadData(1);
    } catch (err) {
      console.error(err);
      notify("Failed to record check-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // RECORD ACTIVITY
  const handleRecordActivity = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await activityTrackingService.recordActivity({
        volunteer: recordForm.volunteer,
        activity: recordForm.activity,
        task: recordForm.task,
        location: recordForm.location,
        verification: recordForm.verification || "Manual entry",
      });

      setRecordForm({
        volunteer: "",
        activity: "Progress update",
        task: "",
        location: "",
        verification: "",
      });
      setShowRecordModal(false);
      notify("Activity recorded successfully!");
      setCurrentPage(1);
      await loadData(1);
    } catch (err) {
      console.error(err);
      notify("Failed to record activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // RESET FILTERS
  const resetFilters = () => {
    setSearch("");
    setActivityFilter("All activities");
    setLocationFilter("All locations");
    setCurrentPage(1);
    notify("Filters reset to default.");
  };

  // ACTIVITY STATUS STYLE
  const getActivityStyle = (activity: ActivityType) => {
    switch (activity) {
      case "Checked in":
        return "bg-[#e5f5ef] text-[#239879] border border-emerald-200";
      case "Progress update":
        return "bg-[#e8f1f6] text-[#287fa9] border border-sky-200";
      case "Break started":
        return "bg-[#fff3df] text-[#b87813] border border-amber-200";
      case "Assignment accepted":
        return "bg-[#e8f1f6] text-[#287fa9] border border-sky-200";
      case "Training completed":
        return "bg-[#e5f5ef] text-[#239879] border border-emerald-200";
      default:
        return "bg-[#fdebec] text-[#d64550] border border-rose-200";
    }
  };

  // EXPORT CSV
  const handleExport = async () => {
    try {
      const blob = await activityTrackingService.exportCsv({
        search,
        activity: activityFilter,
        location: locationFilter,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carelink-activity-tracking-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      notify("Activity report exported successfully!");
    } catch (err) {
      console.error(err);
      notify("Failed to export activity report.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="w-full min-h-full bg-[#eff6f8] text-[#123c5b]">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-6 pt-5 pb-10">
        {/* BREADCRUMB & STATUS BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] mb-6">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[#8296aa]">Operations</span>
            <ChevronRight size={12} />
            <span className="text-[#8296aa]">Volunteer Coordination</span>
            <ChevronRight size={12} />
            <span className="font-semibold text-[#123c5b]">Activity Tracking</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium ${
                isLiveBackend
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              <Server size={12} />
              <span>{isLiveBackend ? "Live Server (API)" : "Offline Demo"}</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh activity logs"
              className="flex items-center gap-1.5 rounded-lg border border-[#b9d0dc] bg-white px-3 py-1 text-[10px] text-slate-700 hover:bg-[#f5fafc] disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={isRefreshing ? "animate-spin text-[#287fa9]" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[27px] font-normal text-[#173e5b]">
              Activity Tracking
            </h1>
            <p className="text-[12px] text-[#718ba0] mt-1.5">
              Monitor field check-ins, progress, safety, hours, and task completion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExport}
              className="h-[38px] px-3.5 bg-white border border-[#b9d0dc] rounded-lg text-[10px] text-[#17648e] hover:bg-[#f5fafc] flex items-center gap-1.5 shadow-xs"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setShowCheckIn(true)}
              className="h-[38px] px-3.5 bg-white border border-[#b9d0dc] rounded-lg text-[10px] text-[#17648e] hover:bg-[#f5fafc] shadow-xs"
            >
              Manual check-in
            </button>

            <button
              onClick={() => setShowRecordModal(true)}
              className="h-[38px] px-4 bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg flex items-center gap-1.5 text-[10px] font-semibold shadow-xs"
            >
              <Plus size={14} />
              <span>Record activity</span>
            </button>
          </div>
        </div>

        {/* FIELD OPERATIONS LIVE BANNER */}
        <section className="bg-[#153e5e] rounded-xl px-6 py-5 mb-5 text-white shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-[2.2fr_0.8fr_0.8fr_0.8fr] items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#65c5a8] animate-pulse" />
                <span className="text-[9px] uppercase tracking-wider text-[#78d9bb] font-semibold">
                  Field Operations Live
                </span>
              </div>
              <h2 className="text-[15px] font-semibold">
                {stats.volunteersCheckedIn} volunteers currently checked in
              </h2>
              <p className="text-[9px] text-[#b8cbd9] mt-1.5">
                Last sync: {stats.lastSync} · {stats.operationalAreasCount} operational areas active
              </p>
            </div>

            <div className="md:border-l border-[#ffffff30] md:pl-5">
              <h2 className="text-[22px] font-bold tracking-tight">
                {stats.hoursToday}
              </h2>
              <p className="text-[10px] text-[#b8cbd9] mt-0.5">Hours today</p>
            </div>

            <div className="md:border-l border-[#ffffff30] md:pl-5">
              <h2 className="text-[22px] font-bold tracking-tight">
                {stats.tasksOnTrack}
              </h2>
              <p className="text-[10px] text-[#b8cbd9] mt-0.5">Tasks on track</p>
            </div>

            <div className="md:border-l border-[#ffffff30] md:pl-5">
              <h2 className="text-[22px] font-bold tracking-tight text-amber-300">
                {stats.safetyAlerts}
              </h2>
              <p className="text-[10px] text-[#b8cbd9] mt-0.5">Safety alerts</p>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.75fr_1fr] gap-5">
          {/* LIVE ACTIVITY LOG */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              {/* TABLE HEADER */}
              <div className="px-5 py-4 border-b border-[#d5e3e9] flex items-center justify-between">
                <div>
                  <h2 className="text-[13px] font-semibold text-[#173e5b]">
                    Live Activity Log
                  </h2>
                  <p className="text-[10px] text-[#8296aa] mt-0.5">
                    Today · All operational areas ({totalCount} entries)
                  </p>
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-[34px] px-3.5 border rounded-lg flex items-center gap-1.5 text-[10px] transition ${
                    showFilters
                      ? "bg-[#e8f1f6] border-[#287fa9] text-[#287fa9] font-medium"
                      : "border-[#b9d0dc] text-[#17648e] hover:bg-[#f5fafc]"
                  }`}
                >
                  <Filter size={12} />
                  <span>Filters</span>
                </button>
              </div>

              {/* FILTER PANEL */}
              {showFilters && (
                <div className="p-4 bg-[#f8fbfc] border-b border-[#d5e3e9] grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Activity Type
                    </label>
                    <select
                      value={activityFilter}
                      onChange={(e) => {
                        setActivityFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full h-[36px] bg-white border border-[#d5e3e9] rounded-lg px-3 text-[10px] text-slate-700 outline-none"
                    >
                      <option>All activities</option>
                      <option>Checked in</option>
                      <option>Progress update</option>
                      <option>Break started</option>
                      <option>Assignment accepted</option>
                      <option>Training completed</option>
                      <option>Checked out</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Location
                    </label>
                    <select
                      value={locationFilter}
                      onChange={(e) => {
                        setLocationFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full h-[36px] bg-white border border-[#d5e3e9] rounded-lg px-3 text-[10px] text-slate-700 outline-none"
                    >
                      <option>All locations</option>
                      {availableLocations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex justify-end">
                    <button
                      onClick={resetFilters}
                      className="text-[10px] text-[#287fa9] font-semibold hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              )}

              {/* SEARCH */}
              <div className="px-5 py-3 border-b border-[#e1eaf0]">
                <div className="flex items-center gap-2 bg-[#f7fafb] border border-[#d5e3e9] rounded-lg px-3 h-[36px]">
                  <Search size={14} className="text-[#8296aa]" />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search activity, volunteer, task ID, location..."
                    className="bg-transparent outline-none text-[11px] w-full placeholder:text-slate-400"
                  />
                  {search && (
                    <button onClick={() => setSearch("")}>
                      <X size={13} className="text-slate-400 hover:text-slate-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead className="bg-[#f5f8f9] border-b border-[#d5e3e9]">
                    <tr className="text-[10px] text-[#718ba0] font-semibold uppercase tracking-wider">
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Volunteer</th>
                      <th className="px-4 py-3">Activity</th>
                      <th className="px-4 py-3">Task</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Verification</th>
                      <th className="px-4 py-3 text-right"></th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#e1eaf0]">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-xs text-slate-400">
                          <RefreshCw size={18} className="mx-auto mb-2 animate-spin text-[#287fa9]" />
                          Loading activities...
                        </td>
                      </tr>
                    ) : activities.length > 0 ? (
                      activities.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedActivity(item)}
                          className="hover:bg-[#f5fafc] cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3.5 text-[10px] font-bold text-[#173e5b] whitespace-nowrap">
                            {item.time}
                          </td>
                          <td className="px-4 py-3.5 text-[11px] font-medium text-slate-700 whitespace-nowrap">
                            {item.volunteer}
                          </td>
                          <td className="px-4 py-3.5 text-[10px] whitespace-nowrap text-slate-600">
                            {item.activity}
                          </td>
                          <td className="px-4 py-3.5 text-[10px] font-mono text-[#287fa9] whitespace-nowrap">
                            {item.task}
                          </td>
                          <td className="px-4 py-3.5 text-[10px] text-slate-600 whitespace-nowrap">
                            {item.location}
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 rounded-md text-[9px] font-semibold ${getActivityStyle(
                                item.activity
                              )}`}
                            >
                              {item.verification}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <ChevronRight size={14} className="text-[#718ba0] inline-block" />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-xs text-slate-400">
                          No volunteer activities found matching current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAGINATION */}
            <div className="px-5 py-3 border-t border-[#d5e3e9] flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50">
              <p className="text-[10px] text-[#8296aa]">
                Showing {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                {" "}–{" "}
                {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="border border-[#d5e2e9] bg-white rounded-lg px-3 py-1.5 text-[10px] text-[#287fa9] disabled:opacity-40 hover:bg-sky-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-[30px] h-[30px] rounded-lg border text-[10px] transition ${
                      currentPage === page
                        ? "bg-[#287fa9] border-[#287fa9] text-white font-semibold"
                        : "border-[#d5e2e9] bg-white text-slate-600 hover:bg-[#f0f7fa]"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="border border-[#b9d0dc] bg-white rounded-lg px-3 py-1.5 text-[10px] text-[#287fa9] disabled:opacity-40 hover:bg-sky-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* FIELD PRESENCE MAP */}
          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-xs overflow-hidden flex flex-col">
            {/* MAP HEADER */}
            <div className="px-5 py-4 border-b border-[#d5e3e9]">
              <h2 className="text-[13px] font-semibold text-[#173e5b]">
                Field Presence
              </h2>
              <p className="text-[10px] text-[#8296aa] mt-0.5">
                Checked-in volunteers across operational areas
              </p>
            </div>

            {/* MAP VISUALIZATION */}
            <div className="relative h-[290px] overflow-hidden bg-[#e8f0ed]">
              {/* ROAD LINES */}
              <div className="absolute inset-0 opacity-80 pointer-events-none">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="absolute w-[150%] h-[3px] bg-white/90"
                    style={{
                      top: `${index * 17 + 5}%`,
                      left: "-20%",
                      transform: "rotate(30deg)",
                    }}
                  />
                ))}

                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={`road-${index}`}
                    className="absolute w-[120%] h-[2px] bg-white/70"
                    style={{
                      top: `${index * 22 + 10}%`,
                      left: "10%",
                      transform: "rotate(-35deg)",
                    }}
                  />
                ))}
              </div>

              {/* AREA LABELS */}
              <span className="absolute top-[12%] left-[6%] text-[9px] font-semibold text-[#728d87] tracking-wider">
                NORTH WARD
              </span>
              <span className="absolute top-[30%] right-[7%] text-[9px] font-semibold text-[#728d87] tracking-wider">
                EASTBANK
              </span>
              <span className="absolute top-[52%] left-[45%] text-[9px] font-semibold text-[#728d87] tracking-wider">
                CENTRAL
              </span>
              <span className="absolute bottom-[10%] left-[7%] text-[9px] font-semibold text-[#728d87] tracking-wider">
                WEST DISTRICT
              </span>

              {/* MAP MARKERS */}
              {stats.presenceSummary.areas.map((area) => (
                <button
                  key={area.name}
                  onClick={() =>
                    notify(`${area.name}: ${area.count} volunteers currently checked in.`)
                  }
                  className={`absolute ${area.position} w-[34px] h-[34px] rounded-full bg-[#287fa9] border-[3px] border-white text-white text-[10px] font-bold flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10 cursor-pointer`}
                  title={`${area.name}: ${area.count} volunteers`}
                >
                  {area.count}
                </button>
              ))}
            </div>

            {/* MAP LEGEND */}
            <div className="p-5 space-y-3.5 border-t border-[#d5e3e9] bg-white flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#287fa9]" />
                  <span className="text-[11px] text-slate-700">Medical teams</span>
                </div>
                <span className="text-[11px] font-bold text-[#173e5b]">
                  {stats.presenceSummary.medicalTeams}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#65bda5]" />
                  <span className="text-[11px] text-slate-700">Logistics</span>
                </div>
                <span className="text-[11px] font-bold text-[#173e5b]">
                  {stats.presenceSummary.logistics}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#efa53b]" />
                  <span className="text-[11px] text-slate-700">Shelter support</span>
                </div>
                <span className="text-[11px] font-bold text-[#173e5b]">
                  {stats.presenceSummary.shelterSupport}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MANUAL CHECK-IN MODAL */}
      {showCheckIn && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-[450px] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-[15px] font-bold text-[#173e5b]">
                  Manual Volunteer Check-in
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Record on-site attendance for a deployed volunteer.
                </p>
              </div>

              <button
                onClick={() => setShowCheckIn(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualCheckIn} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">
                  Volunteer Name
                </label>
                <input
                  required
                  value={checkInForm.volunteer}
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      volunteer: e.target.value,
                    })
                  }
                  placeholder="e.g. Elena Rossi"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">
                  Task ID
                </label>
                <input
                  required
                  value={checkInForm.task}
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      task: e.target.value,
                    })
                  }
                  placeholder="e.g. TASK-782"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">
                  Location
                </label>
                <input
                  required
                  value={checkInForm.location}
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      location: e.target.value,
                    })
                  }
                  placeholder="e.g. North Ward"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">
                  Verification Method
                </label>
                <select
                  value={checkInForm.verification}
                  onChange={(e) =>
                    setCheckInForm({
                      ...checkInForm,
                      verification: e.target.value,
                    })
                  }
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none bg-white"
                >
                  <option>GPS verified</option>
                  <option>Coordinator verified</option>
                  <option>Manual verification</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCheckIn(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#287fa9] text-white rounded-lg px-5 py-2 text-xs font-semibold hover:bg-[#17678e] shadow-xs disabled:opacity-50"
                >
                  Confirm Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD ACTIVITY MODAL */}
      {showRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-[450px] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-[15px] font-bold text-[#173e5b]">
                  Record Volunteer Activity
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Log field events, progress notes, or schedule breaks.
                </p>
              </div>

              <button
                onClick={() => setShowRecordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordActivity} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-700">
                  Volunteer Name
                </label>
                <input
                  required
                  value={recordForm.volunteer}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      volunteer: e.target.value,
                    })
                  }
                  placeholder="e.g. Daniel Okafor"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">
                  Activity Type
                </label>
                <select
                  value={recordForm.activity}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      activity: e.target.value as ActivityType,
                    })
                  }
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none bg-white"
                >
                  <option>Checked in</option>
                  <option>Progress update</option>
                  <option>Break started</option>
                  <option>Assignment accepted</option>
                  <option>Training completed</option>
                  <option>Checked out</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">
                  Task ID
                </label>
                <input
                  required
                  value={recordForm.task}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      task: e.target.value,
                    })
                  }
                  placeholder="e.g. TASK-761"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">
                  Location
                </label>
                <input
                  required
                  value={recordForm.location}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      location: e.target.value,
                    })
                  }
                  placeholder="e.g. West Warehouse"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700">
                  Verification Details
                </label>
                <input
                  value={recordForm.verification}
                  onChange={(e) =>
                    setRecordForm({
                      ...recordForm,
                      verification: e.target.value,
                    })
                  }
                  placeholder="e.g. 76% complete / GPS verified"
                  className="w-full mt-1.5 border border-[#d5e3e9] rounded-lg p-2.5 text-xs outline-none focus:border-[#287fa9]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="border border-[#d5e3e9] rounded-lg px-4 py-2 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#287fa9] text-white rounded-lg px-5 py-2 text-xs font-semibold hover:bg-[#17678e] shadow-xs disabled:opacity-50"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVITY DETAILS MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-[420px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-[15px] font-bold text-[#173e5b]">
                  Activity Details
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {selectedActivity.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <Users size={15} className="text-[#287fa9]" />
                <span className="font-medium">{selectedActivity.volunteer}</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700">
                <Activity size={15} className="text-[#287fa9]" />
                <span>{selectedActivity.activity}</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700">
                <ClipboardList size={15} className="text-[#287fa9]" />
                <span className="font-mono text-[#287fa9]">{selectedActivity.task}</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700">
                <MapPin size={15} className="text-[#287fa9]" />
                <span>{selectedActivity.location}</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700">
                <Clock size={15} className="text-[#287fa9]" />
                <span>{selectedActivity.time}</span>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700">
                <ShieldCheck size={15} className="text-[#239879]" />
                <span>Verification: {selectedActivity.verification}</span>
              </div>

              <div className="pt-2">
                <span
                  className={`inline-flex px-3 py-1 rounded-md text-[10px] font-semibold ${getActivityStyle(
                    selectedActivity.activity
                  )}`}
                >
                  {selectedActivity.activity}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm(`Delete activity record ${selectedActivity.id}?`)) {
                    await activityTrackingService.deleteActivity(selectedActivity.id);
                    setSelectedActivity(null);
                    notify("Activity record deleted successfully.");
                    await loadData(currentPage);
                  }
                }}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-medium border border-rose-200 transition cursor-pointer"
              >
                Delete record
              </button>

              <button
                onClick={() => setSelectedActivity(null)}
                className="bg-[#287fa9] text-white rounded-lg px-5 py-2 text-xs font-semibold hover:bg-[#17678e] shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-xl px-5 py-3 shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* HELP BUTTON */}
      <button
        onClick={() => notify("Activity Tracking help: Monitor field deployments and attendance logs.")}
        className="fixed bottom-4 right-4 w-10 h-10 bg-[#173e5b] hover:bg-[#205175] text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        title="Help & Info"
      >
        <HelpCircle size={18} />
      </button>
    </div>
  );
}
