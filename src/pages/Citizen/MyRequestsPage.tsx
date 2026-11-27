import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Search,
  Plus,
  ClipboardList,
  House,
  Utensils,
  Cross,
  Truck,
  Package,
  Users,
  FileText,
  MessageSquare,
  ChevronRight,
  X,
  Check,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  Activity,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuth } from "../../context/AuthContext";
import {
  citizenRequestService,
  MOCK_REQUESTS,
} from "../../services/citizenRequestService";
import type {
  CitizenHelpRequest,
  CitizenRequestsSummary,
} from "../../types/citizenRequest";

const STAGES = ["Sent", "Under review", "Help arranged", "Completed"];

export default function MyRequestsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Requests state
  const [requests, setRequests] = useState<CitizenHelpRequest[]>(MOCK_REQUESTS);
  const [summary, setSummary] = useState<CitizenRequestsSummary>({
    totalRequests: MOCK_REQUESTS.length,
    activeCount: MOCK_REQUESTS.filter((r) => r.progress < 4).length,
    completedCount: MOCK_REQUESTS.filter((r) => r.progress === 4).length,
    draftsCount: 0,
  });

  // UI & Loading state
  const [activeTab, setActiveTab] = useState<"All requests" | "Active" | "Completed" | "Saved drafts">("All requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<CitizenHelpRequest | null>(null);
  const [cancelTargetRequest, setCancelTargetRequest] = useState<CitizenHelpRequest | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => setFeedbackToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackToast]);

  // Fetch Requests
  const fetchRequests = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const citizen = user?.fullName || "Samira Khan";
      const data = await citizenRequestService.getRequests({
        citizenName: citizen,
        search: searchQuery.trim() || undefined,
      });

      setRequests(data);
      setIsBackendConnected(true);

      // Summary
      try {
        const sum = await citizenRequestService.getSummary(citizen);
        setSummary(sum);
      } catch {
        setSummary({
          totalRequests: data.length,
          activeCount: data.filter((r) => r.progress < 4).length,
          completedCount: data.filter((r) => r.progress === 4).length,
          draftsCount: 0,
        });
      }
    } catch (err) {
      console.warn("Backend API offline, using local mock requests:", err);
      setIsBackendConnected(false);

      let filtered = [...MOCK_REQUESTS];
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (r) =>
            r.id.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q) ||
            r.description.toLowerCase().includes(q) ||
            r.status.toLowerCase().includes(q)
        );
      }
      setRequests(filtered);
      setSummary({
        totalRequests: MOCK_REQUESTS.length,
        activeCount: MOCK_REQUESTS.filter((r) => r.progress < 4).length,
        completedCount: MOCK_REQUESTS.filter((r) => r.progress === 4).length,
        draftsCount: 0,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.fullName, searchQuery]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Cancel / Withdraw Request
  const handleCancelRequest = async (request: CitizenHelpRequest) => {
    try {
      if (isBackendConnected) {
        await citizenRequestService.updateStatus(request.id, "Cancelled");
      }

      setRequests((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: "Cancelled", progress: 0 } : r))
      );

      setFeedbackToast({
        type: "info",
        message: `Request ${request.id} has been marked as cancelled.`,
      });

      setCancelTargetRequest(null);
      if (selectedRequest?.id === request.id) {
        setSelectedRequest(null);
      }
    } catch (err: any) {
      console.error("Failed to cancel request:", err);
      setFeedbackToast({
        type: "error",
        message: err.message || "Failed to cancel request.",
      });
    }
  };

  // Helper for Category Icon
  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("shelter")) return <House size={20} />;
    if (c.includes("food") || c.includes("water")) return <Utensils size={20} />;
    if (c.includes("medical") || c.includes("health")) return <Cross size={20} />;
    if (c.includes("transport") || c.includes("transit")) return <Truck size={20} />;
    if (c.includes("family")) return <Users size={20} />;
    return <Package size={20} />;
  };

  // Tab Counts
  const tabs = [
    { name: "All requests", count: summary.totalRequests },
    { name: "Active", count: summary.activeCount },
    { name: "Completed", count: summary.completedCount },
    { name: "Saved drafts", count: summary.draftsCount },
  ] as const;

  // Filtered requests by active tab
  const filteredRequests = requests.filter((r) => {
    if (activeTab === "Active") return r.progress < 4 && r.status !== "Cancelled";
    if (activeTab === "Completed") return r.progress === 4;
    if (activeTab === "Saved drafts") return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#eef4f7] text-[#173d5b]">
      {/* SIDEBAR */}
      <Sidebar
        activePage="My Requests"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* MAIN CONTENT AREA */}
      <main className="min-h-screen lg:ml-[295px]">
        {/* TOPBAR */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* PAGE CONTENT CONTAINER */}
        <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6">
          {/* TOAST FEEDBACK NOTIFICATION */}
          {feedbackToast && (
            <div
              className={`flex items-center justify-between gap-3 rounded-xl border p-4 text-xs font-semibold shadow-md transition-all ${
                feedbackToast.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : feedbackToast.type === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackToast.type === "success" ? (
                  <CheckCircle size={16} className="text-emerald-600" />
                ) : feedbackToast.type === "error" ? (
                  <AlertCircle size={16} className="text-red-600" />
                ) : (
                  <Info size={16} className="text-sky-600" />
                )}
                <span>{feedbackToast.message}</span>
              </div>
              <button
                onClick={() => setFeedbackToast(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* PAGE HEADER & CONTROLS */}
          <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold tracking-tight">
                  My Requests
                </h2>

                {/* BACKEND STATUS BADGE */}
                <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-xs">
                  {isBackendConnected === true ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <Wifi size={11} /> Backend API Online
                      </span>
                    </>
                  ) : isBackendConnected === false ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="font-semibold text-amber-700 flex items-center gap-1">
                        <WifiOff size={11} /> Local Fallback Mode
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-400">Connecting...</span>
                  )}
                </div>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                Track your active relief requests and receive live stage updates from response coordinators.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => fetchRequests()}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 transition"
                title="Refresh requests"
              >
                <RefreshCw
                  size={14}
                  className={isRefreshing ? "animate-spin text-[#287da6]" : "text-slate-500"}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={() => navigate("/citizen/request-help")}
                className="flex items-center gap-2 rounded-lg bg-[#287da6] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-[#1d688e] transition"
              >
                <Plus size={15} />
                New Request
              </button>
            </div>
          </section>

          {/* KPI COUNTERS */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Requests
              </span>
              <p className="mt-1.5 text-xl font-bold text-[#173d5b]">
                {summary.totalRequests}
              </p>
              <p className="text-xs text-slate-400">Submitted cases</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#287da6]">
                In Progress / Active
              </span>
              <p className="mt-1.5 text-xl font-bold text-[#287da6]">
                {summary.activeCount}
              </p>
              <p className="text-xs text-slate-400">Assigned & dispatching</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Fulfilled / Completed
              </span>
              <p className="mt-1.5 text-xl font-bold text-emerald-600">
                {summary.completedCount}
              </p>
              <p className="text-xs text-slate-400">Confirmed deliveries</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Drafts
              </span>
              <p className="mt-1.5 text-xl font-bold text-slate-700">
                {summary.draftsCount}
              </p>
              <p className="text-xs text-slate-400">Saved unfinished</p>
            </div>
          </section>

          {/* TABS & SEARCH BAR */}
          <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
            {/* TABS */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-b border-slate-100 lg:border-b-0 pb-2 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => {
                    setActiveTab(tab.name as any);
                    setSelectedRequest(null);
                  }}
                  className={`flex items-center gap-1.5 pb-1 text-sm font-semibold transition ${
                    activeTab === tab.name
                      ? "border-b-2 border-[#287da6] text-[#287da6]"
                      : "border-b-2 border-transparent text-slate-500 hover:text-[#287da6]"
                  }`}
                >
                  {tab.name}
                  {tab.count !== undefined && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* SEARCH BOX */}
            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, title, or status..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-7 text-sm sm:text-[15px] outline-none focus:border-[#287da6] focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </section>

          {/* REQUEST CARDS CONTENT */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center">
              <RefreshCw size={28} className="animate-spin text-[#287da6]" />
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Loading citizen requests...
              </p>
            </div>
          ) : activeTab === "Saved drafts" ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <FileText size={36} className="mx-auto text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-700">No saved drafts</h3>
              <p className="mt-1 text-xs text-slate-500">
                Unfinished help requests you started will appear here for you to resume.
              </p>
              <button
                onClick={() => navigate("/citizen/request-help")}
                className="mt-4 rounded-lg bg-[#287da6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d688e]"
              >
                Create Help Request
              </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <ClipboardList size={36} className="mx-auto text-slate-300" />
              <h3 className="mt-3 text-base font-bold text-slate-700">No requests found</h3>
              <p className="mt-1 text-xs text-slate-500">
                {searchQuery
                  ? "No requests match your current search terms."
                  : `There are currently no requests in the "${activeTab}" view.`}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 text-sm font-semibold text-[#287da6] underline"
                >
                  Clear search
                </button>
              ) : (
                <button
                  onClick={() => navigate("/citizen/request-help")}
                  className="mt-4 rounded-lg bg-[#287da6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d688e]"
                >
                  Request Emergency Help
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredRequests.map((request) => {
                const statusLower = request.status.toLowerCase();
                const isCompleted = request.progress === 4 || statusLower.includes("completed");
                const isUnderReview = statusLower.includes("review");
                const isCancelled = statusLower.includes("cancelled");

                const statusBadgeStyle = isCancelled
                  ? "bg-slate-100 text-slate-600 border border-slate-200"
                  : isCompleted
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : isUnderReview
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-sky-50 text-sky-700 border border-sky-200";

                return (
                  <article
                    key={request.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:border-[#287da6]/40 hover:shadow-md"
                  >
                    {/* REQUEST HEADER */}
                    <div className="flex flex-wrap items-start justify-between gap-3 bg-slate-50/70 p-4 border-b border-slate-100">
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e7f2f7] text-[#287da6] shadow-xs">
                          {getCategoryIcon(request.category || request.title)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[13px] font-bold text-slate-400">
                              {request.id}
                            </span>
                            <span className="text-[13px] text-slate-400">•</span>
                            <span className="text-[13px] text-slate-500">
                              {request.formattedDate || request.timeAgo || "Submitted recently"}
                            </span>
                          </div>

                          <h3 className="mt-1 text-base font-bold text-[#173d5b]">
                            {request.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-600">
                            {request.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {request.priority && request.priority !== "Normal" && (
                          <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                            {request.priority} Priority
                          </span>
                        )}

                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${statusBadgeStyle}`}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>

                    {/* PROGRESS TRACKER */}
                    {!isCancelled && (
                      <div className="px-5 py-5 sm:px-8">
                        <div className="relative flex items-start justify-between">
                          {/* PROGRESS LINE BACKGROUND */}
                          <div className="absolute left-[12%] right-[12%] top-[8px] h-[2px] bg-slate-200">
                            <div
                              className="h-full bg-[#58b39d] transition-all duration-500"
                              style={{
                                width: `${((Math.max(1, request.progress) - 1) / 3) * 100}%`,
                              }}
                            />
                          </div>

                          {/* STAGES NODES */}
                          {STAGES.map((stage, index) => {
                            const completed = index < request.progress;
                            const isCurrent = index === request.progress - 1;

                            return (
                              <div
                                key={stage}
                                className="relative z-10 flex w-1/4 flex-col items-center"
                              >
                                <div
                                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition ${
                                    completed
                                      ? "border-[#58b39d] bg-[#58b39d] text-white"
                                      : "border-slate-300 bg-white text-slate-300"
                                  } ${isCurrent ? "ring-4 ring-emerald-100" : ""}`}
                                >
                                  {completed ? (
                                    <Check size={11} strokeWidth={3} />
                                  ) : (
                                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                  )}
                                </div>

                                <span
                                  className={`mt-2 text-center text-xs sm:text-[13px] ${
                                    completed
                                      ? "font-bold text-[#357c6e]"
                                      : "text-slate-400 font-medium"
                                  }`}
                                >
                                  {stage}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* CARD FOOTER */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 bg-white">
                      <p className="text-[13px] text-slate-400">
                        Last updated: {request.updated || request.timeAgo || "Recently"}
                      </p>

                      <div className="flex items-center gap-2">
                        {request.canMessage !== false && !isCancelled && (
                          <button
                            onClick={() => navigate("/citizen/messages")}
                            className="flex items-center gap-1.5 rounded-lg border border-[#287da6] px-3 py-1.5 text-sm font-semibold text-[#287da6] hover:bg-sky-50 transition"
                          >
                            <MessageSquare size={13} />
                            Message Support
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="flex items-center gap-1.5 rounded-lg bg-[#287da6] px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-[#1d688e] transition"
                        >
                          <Eye size={13} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 py-4 text-[13px] text-slate-400">
            <p>© 2026 ReliefOS Citizen Support · Help Requests</p>
            <p className="flex items-center gap-1.5">
              <Heart size={12} className="text-rose-500 fill-rose-500" />
              Supporting communities through response and recovery
            </p>
          </footer>
        </div>
      </main>

      {/* REQUEST DETAILS MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-[#287da6]">
                  {getCategoryIcon(selectedRequest.category || selectedRequest.title)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#173d5b]">
                    Request Details
                  </h3>
                  <p className="font-mono text-[13px] text-slate-400">
                    {selectedRequest.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              {/* STATUS BANNER */}
              <div className="flex items-center justify-between rounded-lg bg-sky-50/80 p-3 border border-sky-100">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Current Status
                  </span>
                  <p className="mt-0.5 text-sm font-bold text-[#173d5b]">
                    {selectedRequest.status}
                  </p>
                </div>

                <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-[#287da6] shadow-xs border border-sky-200">
                  Stage {selectedRequest.progress} of 4 ({STAGES[Math.min(3, selectedRequest.progress - 1)]})
                </span>
              </div>

              {/* DETAILS FIELDS */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 divide-y divide-slate-100 text-xs">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Help Category</span>
                  <span className="font-semibold text-[#173d5b]">
                    {selectedRequest.title}
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Priority Level</span>
                  <span className="font-semibold text-rose-600">
                    {selectedRequest.priority || "Normal"}
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Registered Citizen</span>
                  <span className="font-semibold text-[#173d5b]">
                    {selectedRequest.citizenName || "Samira Khan"}
                  </span>
                </div>

                {selectedRequest.contactPhone && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Contact Number</span>
                    <span className="font-mono text-slate-700">
                      {selectedRequest.contactPhone}
                    </span>
                  </div>
                )}

                {selectedRequest.address && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Assigned Address</span>
                    <span className="text-right text-slate-700">
                      {selectedRequest.address}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Date Submitted</span>
                  <span className="text-slate-700">
                    {selectedRequest.formattedDate || "Recent"}
                  </span>
                </div>

                {selectedRequest.dispatchTrackingId && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Dispatch ID</span>
                    <span className="font-mono font-bold text-[#287da6]">
                      {selectedRequest.dispatchTrackingId}
                    </span>
                  </div>
                )}
              </div>

              {/* DESCRIPTION */}
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Request Description & Notes
                </span>
                <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 leading-relaxed">
                  {selectedRequest.description}
                </p>
              </div>
            </div>

            {/* MODAL ACTIONS */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
              {selectedRequest.progress < 4 && selectedRequest.status !== "Cancelled" ? (
                <button
                  type="button"
                  onClick={() => setCancelTargetRequest(selectedRequest)}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Withdraw Request
                </button>
              ) : (
                <div />
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>

                {selectedRequest.canMessage !== false && selectedRequest.status !== "Cancelled" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRequest(null);
                      navigate("/citizen/messages");
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-[#287da6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d688e]"
                  >
                    <MessageSquare size={13} />
                    Message Support
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL REQUEST CONFIRMATION MODAL */}
      {cancelTargetRequest && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <Trash2 size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Withdraw Request?
              </h3>
            </div>

            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Are you sure you want to withdraw help request{" "}
              <span className="font-bold text-[#173d5b]">
                {cancelTargetRequest.id} ({cancelTargetRequest.title})
              </span>
              ? Coordinators will be notified to halt processing.
            </p>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setCancelTargetRequest(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Keep Request
              </button>

              <button
                type="button"
                onClick={() => handleCancelRequest(cancelTargetRequest)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
              >
                Yes, Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
