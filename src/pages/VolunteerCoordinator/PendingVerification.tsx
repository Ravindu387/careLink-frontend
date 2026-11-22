import { useEffect, useMemo, useState, useCallback } from "react";
import {
  X,
  Search,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Server,
  RefreshCw,
  Download,
} from "lucide-react";

import { pendingVerificationService } from "../../services/pendingVerificationService";
import type {
  VolunteerApplication,
  Priority,
  VolunteerVerificationStatsDto,
} from "../../types/pendingVerification";

export default function PendingVerification() {
  // CONNECTION & LOADING STATES
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");

  // STATS
  const [stats, setStats] = useState<VolunteerVerificationStatsDto>({
    totalApplications: 18,
    pendingCount: 18,
    urgentCount: 4,
    highPriorityCount: 6,
    standardPriorityCount: 8,
    completeDocumentsCount: 14,
    incompleteDocumentsCount: 4,
    approvedCount: 0,
    rejectedCount: 0,
    oldestPendingSubmission: "2 days",
  });

  // APPLICATIONS DATA
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<VolunteerApplication | null>(null);

  // FILTERS
  const [search, setSearch] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All priorities");
  const [skillFilter, setSkillFilter] = useState<string>("All skill groups");
  const [documentFilter, setDocumentFilter] = useState<string>("All document states");
  const [dateFilter, setDateFilter] = useState<string>("Date submitted");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 4;

  // TOAST NOTIFICATION
  const showNotification = (message: string) => {
    setNotification(message);
    window.setTimeout(() => {
      setNotification("");
    }, 3500);
  };

  // LOAD DATA FROM BACKEND
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [res, statsData] = await Promise.all([
        pendingVerificationService.getApplications({ pageNumber: 1, pageSize: 50 }),
        pendingVerificationService.getStats(),
      ]);

      if (res && res.data) {
        setApplications(res.data.items);
        setIsLiveBackend(true);
      }
      if (statsData && statsData.data) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error("API Error:", error);
      setIsLiveBackend(false);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // FILTER APPLICATIONS
  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const searchMatch =
        !search.trim() ||
        application.id.toLowerCase().includes(search.toLowerCase()) ||
        application.applicant.toLowerCase().includes(search.toLowerCase()) ||
        application.skills.join(" ").toLowerCase().includes(search.toLowerCase()) ||
        application.location.toLowerCase().includes(search.toLowerCase());

      const priorityMatch =
        priorityFilter === "All priorities" ||
        application.priority === priorityFilter;

      const skillMatch =
        skillFilter === "All skill groups" ||
        application.skills.some(
          (skill) => skill.toLowerCase() === skillFilter.toLowerCase()
        );

      const documentMatch =
        documentFilter === "All document states" ||
        application.documentState === documentFilter;

      let dateMatch = true;
      if (dateFilter === "Today") {
        dateMatch =
          application.submitted.includes("hour") ||
          application.submitted.includes("min") ||
          application.submitted.includes("Just now");
      } else if (dateFilter === "Last 2 days") {
        dateMatch =
          application.submitted.includes("hour") ||
          application.submitted.includes("min") ||
          application.submitted.includes("Just now") ||
          application.submitted === "Yesterday" ||
          application.submitted.includes("1 day ago") ||
          application.submitted.includes("2 days ago");
      }

      return (
        searchMatch &&
        priorityMatch &&
        skillMatch &&
        documentMatch &&
        dateMatch &&
        application.status === "Pending"
      );
    });
  }, [
    applications,
    search,
    priorityFilter,
    skillFilter,
    documentFilter,
    dateFilter,
  ]);

  // PAGINATION CALCULATIONS
  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / pageSize)
  );

  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // APPROVE APPLICATION
  const handleApprove = async (id: string) => {
    setProcessing(true);

    try {
      const updated = await pendingVerificationService.approve(id, {
        notes: "Identity, safeguarding clearance and qualifications verified.",
        reviewedBy: "Nadia Okafor (Coordinator)",
      });

      if (updated) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: "Approved" } : app))
        );
        setStats((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
          approvedCount: prev.approvedCount + 1,
        }));
        setSelectedApplication(null);
        showNotification(`Application ${id} approved successfully!`);
      }
    } catch {
      showNotification("Unable to approve application. Please retry.");
    } finally {
      setProcessing(false);
    }
  };

  // REJECT APPLICATION
  const handleReject = async (id: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to reject verification application ${id}?`
    );
    if (!confirmed) return;

    setProcessing(true);

    try {
      const updated = await pendingVerificationService.reject(id, {
        notes: "Rejected due to missing verification documentation.",
        reviewedBy: "Nadia Okafor (Coordinator)",
      });

      if (updated) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: "Rejected" } : app))
        );
        setStats((prev) => ({
          ...prev,
          pendingCount: Math.max(0, prev.pendingCount - 1),
          rejectedCount: prev.rejectedCount + 1,
        }));
        setSelectedApplication(null);
        showNotification(`Application ${id} has been rejected.`);
      }
    } catch {
      showNotification("Unable to reject application. Please retry.");
    } finally {
      setProcessing(false);
    }
  };

  // RESET FILTERS
  const resetFilters = () => {
    setSearch("");
    setPriorityFilter("All priorities");
    setSkillFilter("All skill groups");
    setDocumentFilter("All document states");
    setDateFilter("Date submitted");
    setCurrentPage(1);
  };

  // EXPORT CSV
  const handleExportCsv = async () => {
    try {
      showNotification("Preparing verification audit CSV export...");
      const blob = await pendingVerificationService.exportCsv({
        search,
        priority: priorityFilter,
        skill: skillFilter,
        documentState: documentFilter,
        status: "Pending",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carelink-pending-verifications-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showNotification("Verification log exported successfully!");
    } catch {
      showNotification("Failed to export verification log.");
    }
  };

  // PRIORITY BADGE STYLE
  const priorityStyle = (priority: Priority) => {
    switch (priority) {
      case "Urgent":
        return "bg-red-50 text-red-700 border border-red-200 font-bold";
      case "High":
        return "bg-[#fff3dc] text-[#b87813] border border-[#f5dfb8] font-bold";
      default:
        return "bg-[#e8f1f6] text-[#287fa9] border border-[#cbe1ed] font-medium";
    }
  };

  const pendingCount = applications.filter((app) => app.status === "Pending").length;
  const urgentCount = applications.filter(
    (app) => app.status === "Pending" && app.priority === "Urgent"
  ).length;

  return (
    <div className="min-h-screen bg-[#eff6f8] text-[#123c5b]">
      {/* TOAST NOTIFICATION */}
      {notification && (
        <div className="fixed top-5 right-5 z-[100] bg-[#123c5b] text-white rounded-lg px-5 py-3 shadow-xl text-xs flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={16} className="text-[#65bda5]" />
          <span>{notification}</span>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 lg:px-[38px] pt-5 pb-10">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[10px] mb-6">
          <span className="text-[#8296aa]">Operations</span>
          <ChevronRight size={13} />
          <span className="text-[#8296aa]">Volunteer Coordination</span>
          <ChevronRight size={13} />
          <span className="font-semibold text-[#17648e]">Pending Verification</span>
        </div>

        {/* PAGE TITLE & ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-semibold text-[#123c5b]">
                Pending Verification
              </h1>

              {/* LIVE BACKEND STATUS BADGE */}
              <div
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide ${
                  isLiveBackend
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <Server size={11} />
                <span>{isLiveBackend ? "API Online (Live)" : "Demo Simulation"}</span>
              </div>
            </div>

            <p className="text-[12px] text-[#718ba0] mt-1">
              Review volunteer identity credentials, declared qualifications, safeguarding checks, and eligibility before field deployment.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* REFRESH BUTTON */}
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="h-[40px] px-3.5 bg-white border border-[#d5e3e9] rounded-lg text-[11px] font-medium text-[#17648e] hover:bg-[#f5fafc] disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              title="Refresh applications list"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            {/* EXPORT CSV */}
            <button
              onClick={handleExportCsv}
              className="h-[40px] px-3.5 bg-white border border-[#d5e3e9] rounded-lg text-[11px] font-medium text-[#17648e] hover:bg-[#f5fafc] flex items-center gap-1.5 transition-colors"
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>

            {/* POLICY BUTTON */}
            <button
              onClick={() =>
                showNotification("Verification Standard: Level 4 Background Checks & Active Certifications required.")
              }
              className="h-[40px] px-4 bg-white border border-[#b9d0dc] hover:bg-[#f5fafc] rounded-lg text-[11px] font-medium text-[#17648e] transition-colors"
            >
              Verification policy
            </button>
          </div>
        </div>

        {/* AWAITING REVIEW ALERT BANNER */}
        <section className="bg-[#fff8e9] border border-[#f4d18b] border-l-[4px] border-l-[#f4a62a] rounded-xl px-4 py-3.5 mb-5 shadow-xs">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <ShieldCheck size={24} className="text-[#946000] shrink-0" />

            <div className="flex-1">
              <h3 className="text-[12px] font-bold text-[#825300]">
                {pendingCount} applications awaiting coordinator review
              </h3>
              <p className="text-[10px] text-[#946b2d] mt-0.5">
                {urgentCount} urgent applications include critical response qualifications (Rescue driving, Heavy vehicles, First aid) needed in active operations.
              </p>
            </div>

            <div className="bg-[#fff3dc] border border-[#f5dfb8] rounded-lg px-3.5 py-2 w-full md:w-auto shrink-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#a46a09]" />
              <p className="text-[10px] font-semibold text-[#a46a09]">
                Oldest pending: {stats.oldestPendingSubmission}
              </p>
            </div>
          </div>
        </section>

        {/* FILTER CONTROLS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_124px_135px_160px_139px_105px] gap-2.5 mb-4">
          {/* SEARCH */}
          <div className="h-[42px] bg-white border border-[#d3e2e9] rounded-lg flex items-center px-3 gap-2.5">
            <Search size={16} className="text-[#718ba0] shrink-0" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search applicant, skills, or ID..."
              className="w-full outline-none text-[11px] placeholder:text-[#a1b1c0] bg-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* PRIORITY SELECT */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[42px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[11px] outline-none cursor-pointer"
          >
            <option>All priorities</option>
            <option>Standard</option>
            <option>High</option>
            <option>Urgent</option>
          </select>

          {/* SKILLS SELECT */}
          <select
            value={skillFilter}
            onChange={(e) => {
              setSkillFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[42px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[11px] outline-none cursor-pointer"
          >
            <option>All skill groups</option>
            <option>First Aid</option>
            <option>Medical</option>
            <option>Logistics</option>
            <option>Driving</option>
            <option>Rescue</option>
            <option>Childcare</option>
            <option>Shelter Support</option>
          </select>

          {/* DOCUMENT STATE SELECT */}
          <select
            value={documentFilter}
            onChange={(e) => {
              setDocumentFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[42px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[11px] outline-none cursor-pointer"
          >
            <option>All document states</option>
            <option>Complete</option>
            <option>Incomplete</option>
          </select>

          {/* DATE SELECT */}
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-[42px] bg-white border border-[#d3e2e9] rounded-lg px-3 text-[11px] outline-none cursor-pointer"
          >
            <option>Date submitted</option>
            <option>Today</option>
            <option>Last 2 days</option>
          </select>

          {/* MORE / ADVANCED FILTERS */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="h-[42px] bg-white border border-[#b9d0dc] rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#17648e] hover:bg-[#f5fafc] transition-colors cursor-pointer"
          >
            <SlidersHorizontal size={13} />
            <span>Filters</span>
          </button>
        </section>

        {/* ADVANCED FILTER PANEL */}
        {showFilters && (
          <div className="bg-white border border-[#d3e2e9] rounded-lg p-4 mb-4 flex items-center justify-between shadow-xs">
            <div>
              <p className="text-xs font-semibold text-[#123c5b]">Filter Configuration</p>
              <p className="text-[10px] text-gray-500 mt-0.5">
                {filteredApplications.length} records match current criteria out of {applications.length} total applications.
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="text-xs text-[#287fa9] hover:underline font-semibold cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* VERIFICATION APPLICATIONS TABLE */}
        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-[0_8px_20px_rgba(30,70,90,0.05)] overflow-hidden">
          {/* TABLE HEADER BAR */}
          <div className="bg-[#f5f8f9] border-b border-[#d5e3e9] px-4 py-3 flex items-center justify-between">
            <h2 className="text-[12px] font-semibold text-[#315c79]">
              Verification Applications Queue
            </h2>
            <span className="text-[10px] text-[#8296aa] bg-slate-100 px-2 py-0.5 rounded font-medium">
              {filteredApplications.length} pending
            </span>
          </div>

          {/* TABLE CONTAINER */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-[#f5f8f9] border-b border-[#d5e3e9]">
                <tr className="text-[10px] text-[#718ba0] uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Verification ID</th>
                  <th className="px-4 py-3 font-semibold">Applicant</th>
                  <th className="px-4 py-3 font-semibold">Declared Skills</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Documents</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold">Review Priority</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-sm text-[#8296aa]">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw size={16} className="animate-spin text-[#287fa9]" />
                        <span>Loading verification applications...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedApplications.length > 0 ? (
                  paginatedApplications.map((application) => (
                    <tr
                      key={application.id}
                      onClick={() => setSelectedApplication(application)}
                      className="border-b border-[#e1eaf0] hover:bg-[#f5fafc] cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3.5 text-[11px] font-semibold text-[#17648e] whitespace-nowrap">
                        {application.id}
                      </td>

                      <td className="px-4 py-3.5 text-[11px] font-medium text-[#123c5b] whitespace-nowrap">
                        {application.applicant}
                      </td>

                      <td className="px-4 py-3.5 text-[10px] text-[#527d96] whitespace-nowrap">
                        {application.skills.join(" · ")}
                      </td>

                      <td className="px-4 py-3.5 text-[10px] text-[#718ba0] whitespace-nowrap">
                        {application.location}
                      </td>

                      <td className="px-4 py-3.5 text-[10px] whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-medium ${
                            application.documentState === "Complete"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {application.documents.join(" · ")}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-[10px] text-[#8296aa] whitespace-nowrap">
                        {application.submitted}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-[9px] ${priorityStyle(
                            application.priority
                          )}`}
                        >
                          {application.priority}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <ChevronRight
                          size={16}
                          className="text-[#718ba0] group-hover:text-[#287fa9] group-hover:translate-x-0.5 transition-all inline"
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-xs text-gray-400">
                      No pending verification applications match current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="px-4 py-3.5 bg-[#fbfdfe] border-t border-[#d5e3e9] flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[10px] text-[#8296aa]">
              Showing{" "}
              {filteredApplications.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} –{" "}
              {Math.min(currentPage * pageSize, filteredApplications.length)} of{" "}
              {filteredApplications.length} applications
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="border border-[#d5e2e9] rounded-lg px-3 py-1.5 text-[10px] font-medium text-[#287fa9] hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[28px] h-[28px] rounded-lg border text-[10px] font-medium transition-colors ${
                    currentPage === page
                      ? "bg-[#287fa9] border-[#287fa9] text-white"
                      : "border-[#d5e2e9] hover:bg-[#f0f7fa] text-[#123c5b]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="border border-[#b9d0dc] rounded-lg px-3 py-1.5 text-[10px] font-medium text-[#287fa9] hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* APPLICATION DETAILS & REVIEW MODAL */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[530px] overflow-hidden border border-[#d5e3e9]">
            {/* MODAL HEADER */}
            <div className="p-5 border-b border-[#d5e3e9] flex justify-between items-center bg-[#fbfdfe]">
              <div>
                <h2 className="text-[16px] font-semibold text-[#123c5b]">
                  Verification Application Review
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono text-[#8296aa]">
                    {selectedApplication.id}
                  </span>
                  <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.2 rounded font-semibold">
                    {selectedApplication.status}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedApplication(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto [scrollbar-width:thin]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#e7f1f6] flex items-center justify-center shrink-0">
                  <User size={22} className="text-[#287fa9]" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-[#123c5b] truncate">
                    {selectedApplication.applicant}
                  </h3>
                  <p className="text-[10px] text-gray-400">Volunteer Applicant</p>
                </div>

                <span
                  className={`rounded-md px-2.5 py-1 text-[9px] shrink-0 ${priorityStyle(
                    selectedApplication.priority
                  )}`}
                >
                  {selectedApplication.priority} Priority
                </span>
              </div>

              {/* DETAILS GRID */}
              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="bg-[#f5f8fa] p-3 rounded-lg border border-[#e8f0f4]">
                  <p className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">Location</p>
                  <p className="text-xs font-semibold text-[#123c5b] mt-0.5">
                    {selectedApplication.location}
                  </p>
                </div>

                <div className="bg-[#f5f8fa] p-3 rounded-lg border border-[#e8f0f4]">
                  <p className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">Submitted</p>
                  <p className="text-xs font-semibold text-[#123c5b] mt-0.5">
                    {selectedApplication.submitted}
                  </p>
                </div>

                <div className="bg-[#f5f8fa] p-3 rounded-lg border border-[#e8f0f4]">
                  <p className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">Email</p>
                  <p className="text-[11px] font-semibold text-[#123c5b] mt-0.5 break-all">
                    {selectedApplication.email}
                  </p>
                </div>

                <div className="bg-[#f5f8fa] p-3 rounded-lg border border-[#e8f0f4]">
                  <p className="text-gray-400 font-semibold uppercase tracking-wider text-[9px]">Phone</p>
                  <p className="text-[11px] font-semibold text-[#123c5b] mt-0.5">
                    {selectedApplication.phone}
                  </p>
                </div>
              </div>

              {/* SKILLS */}
              <div>
                <p className="text-[10px] font-bold text-[#123c5b] uppercase tracking-wider mb-2">
                  Declared Skills & Qualifications
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplication.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-[#e8f1f6] text-[#287fa9] rounded-md px-2.5 py-1 text-[10px] font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* DOCUMENTS */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-[#123c5b] uppercase tracking-wider">
                    Uploaded Documents
                  </p>
                  <span className="text-[9px] font-semibold text-[#159879] bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                    State: {selectedApplication.documentState}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {selectedApplication.documents.map((doc) => (
                    <div
                      key={doc}
                      className="flex items-center justify-between border border-[#d5e2e9] bg-[#fcfdfe] rounded-lg p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-[#287fa9]" />
                        <span className="text-[11px] text-[#123c5b] font-medium">{doc}</span>
                      </div>
                      <CheckCircle2 size={15} className="text-[#16a085]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* SAFETY NOTICE */}
              <div className="bg-[#fff8e9] border border-[#f4d18b] rounded-lg p-3 flex gap-2.5">
                <AlertTriangle size={17} className="text-[#b87813] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#946000] leading-4">
                  Approval activates this volunteer profile immediately for emergency assignments and field coordination tasks.
                </p>
              </div>
            </div>

            {/* MODAL ACTIONS */}
            <div className="border-t border-[#d5e3e9] bg-[#fbfdfe] p-4 flex flex-col sm:flex-row justify-end gap-2.5">
              <button
                disabled={processing}
                onClick={() => handleReject(selectedApplication.id)}
                className="border border-red-200 text-red-600 hover:bg-red-50 rounded-lg px-4 py-2 text-[11px] font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                <XCircle size={14} />
                <span>Reject</span>
              </button>

              <button
                disabled={processing}
                onClick={() => handleApprove(selectedApplication.id)}
                className="bg-[#287fa9] hover:bg-[#17678e] text-white rounded-lg px-5 py-2 text-[11px] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
              >
                <CheckCircle2 size={14} />
                <span>{processing ? "Updating..." : "Approve application"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING HELP BUTTON */}
      <button
        type="button"
        onClick={() =>
          showNotification("Verification Helpdesk: Dial Operations Extension 404 for expedited background verification.")
        }
        aria-label="Help"
        className="fixed bottom-5 right-4 w-10 h-10 bg-[#153f60] hover:bg-[#123c5b] text-white rounded-full flex items-center justify-center shadow-lg transition-colors cursor-pointer"
      >
        <HelpCircle size={21} />
      </button>
    </div>
  );
}
