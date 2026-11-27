import React, { useState, useEffect, useCallback, useMemo } from "react";

import {
  Search,
  ChevronRight,
  Download,
  ShieldCheck,
  Check,
  MessageSquare,
  X,
  Filter,
  ChevronLeft,
  ClipboardCheck,
  RefreshCw,
  Server,
  CheckCircle2,
  FileText,
  UserCheck,
} from "lucide-react";

import { caseVerificationService } from "../../services/caseVerificationService";
import type {
  VerificationCase,
  VerificationAnalyticsResponse,
  VerificationQueryDto,
} from "../../types/caseVerification";

const CaseVerification: React.FC = () => {
  // Data states
  const [analyticsData, setAnalyticsData] = useState<VerificationAnalyticsResponse | null>(null);
  const [cases, setCases] = useState<VerificationCase[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [evidenceFilter, setEvidenceFilter] = useState("All evidence states");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [ageFilter, setAgeFilter] = useState("Submission age");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Modal & Decision states
  const [selectedCase, setSelectedCase] = useState<VerificationCase | null>(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const [decisionRationale, setDecisionRationale] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Flash toast message
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch analytics & cases
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const query: VerificationQueryDto = {
        search: searchTerm || undefined,
        evidenceState: evidenceFilter !== "All evidence states" ? evidenceFilter : undefined,
        priority: priorityFilter !== "All priorities" ? priorityFilter : undefined,
        category: categoryFilter !== "All categories" ? categoryFilter : undefined,
        ageFilter: ageFilter !== "Submission age" ? ageFilter : undefined,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
      };

      const [analyticsResult, casesResult] = await Promise.all([
        caseVerificationService.getAnalytics(),
        caseVerificationService.getCases(query),
      ]);

      setAnalyticsData(analyticsResult.data);
      setCases(casesResult.data.items);
      setTotalCount(casesResult.data.totalCount);
      setTotalPages(casesResult.data.totalPages);
      setIsLiveBackend(analyticsResult.isLiveBackend || casesResult.isLiveBackend);
    } catch (err) {
      console.error("Error loading verification data:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchTerm, evidenceFilter, priorityFilter, categoryFilter, ageFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setEvidenceFilter("All evidence states");
    setPriorityFilter("All priorities");
    setCategoryFilter("All categories");
    setAgeFilter("Submission age");
    setCurrentPage(1);
  };

  // Export CSV
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await caseVerificationService.downloadExportCsv(cases);
      showToast("Verification records exported to CSV successfully.");
    } catch {
      showToast("Failed to export verification records.");
    } finally {
      setIsExporting(false);
    }
  };

  // Submit Verification Decision
  const handleRecordDecision = async (decision: "Verify" | "RequestInfo" | "Reject") => {
    if (!selectedCase) return;

    if (decision === "Reject" && !decisionRationale.trim()) {
      alert("Please provide a rejection rationale to maintain humanitarian audit records.");
      return;
    }

    setIsSubmittingDecision(true);
    try {
      await caseVerificationService.recordDecision(selectedCase.id, {
        decision,
        rationale: decisionRationale.trim() || undefined,
        verifiedBy: "You",
      });

      const decisionLabels = {
        Verify: "approved and verified",
        RequestInfo: "marked as requiring additional information",
        Reject: "rejected with recorded justification",
      };

      showToast(`Case ${selectedCase.id} ${decisionLabels[decision]}.`);
      setSelectedCase(null);
      setDecisionRationale("");
      // Refresh cases and analytics
      loadData(true);
    } catch {
      showToast(`Failed to record decision for case ${selectedCase.id}.`);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Badge styles
  const priorityStyle = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-700";
      case "High":
        return "bg-orange-100 text-orange-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-green-100 text-green-700";
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "Under Review":
        return "bg-orange-100 text-orange-700";
      case "Submitted":
        return "bg-amber-100 text-amber-700";
      case "Pending Info":
        return "bg-amber-100 text-amber-700";
      case "Verified":
        return "bg-emerald-100 text-emerald-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Dynamic statistics
  const statistics = useMemo(() => {
    const stats = analyticsData?.statistics;
    return [
      {
        title: "Awaiting review",
        value: stats ? stats.awaitingReview.toString() : "14",
        description: stats ? stats.awaitingReviewDesc : "3 critical priority",
        icon: ShieldCheck,
        color: "orange",
      },
      {
        title: "Verified today",
        value: stats ? stats.verifiedToday.toString() : "92",
        description: stats ? stats.verifiedTodayDesc : "96% passed",
        icon: Check,
        color: "green",
      },
      {
        title: "Information requested",
        value: stats ? stats.informationRequested.toString() : "18",
        description: stats ? stats.informationRequestedDesc : "Awaiting response",
        icon: MessageSquare,
        color: "blue",
      },
      {
        title: "Rejected today",
        value: stats ? stats.rejectedToday.toString() : "4",
        description: stats ? stats.rejectedTodayDesc : "All with rationale",
        icon: X,
        color: "red",
      },
    ];
  }, [analyticsData]);

  return (
    <div className="min-h-screen bg-[#eff6f8] text-slate-800">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-[13px] font-medium text-white shadow-xl animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-[1600px] px-5 py-5 lg:px-9">
        {/* Breadcrumb */}
        <div className="mb-9 flex items-center gap-2 text-xs text-slate-400">
          <span>Operations</span>
          <ChevronRight size={13} />
          <span>Case Management</span>
          <ChevronRight size={13} />
          <span className="font-semibold text-slate-800">Case Verification</span>
        </div>

        {/* PAGE HEADER */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">
              Case Verification
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Review citizen evidence, contact details, locations, and eligibility before assignment.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              title="Refresh verification data"
              className="flex items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-3.5 py-3 text-sm font-medium text-[#287da8] transition hover:bg-sky-50 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-sm font-medium text-[#287da8] transition hover:bg-sky-50 disabled:opacity-50 cursor-pointer"
            >
              <Download size={15} />
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>

            <button
              onClick={() => setShowPolicy(true)}
              className="rounded-lg bg-[#287da8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17678f] cursor-pointer"
            >
              Verification policy
            </button>
          </div>
        </div>

        {/* LIVE BACKEND STATUS / DEMO ALERT */}
        <div
          className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3.5 ${
            isLiveBackend
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-sky-200 bg-sky-50 text-sky-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {isLiveBackend ? (
              <Server size={18} className="text-emerald-600" />
            ) : (
              <CheckCircle2 size={18} className="text-sky-700" />
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold">
                  {isLiveBackend
                    ? "Live Case Verification API Connected (Port 5277)"
                    : "Demonstration Verification Mode"}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                    isLiveBackend
                      ? "bg-emerald-200 text-emerald-800"
                      : "bg-sky-200 text-sky-800"
                  }`}
                >
                  {isLiveBackend ? "LIVE" : "DEMO"}
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-slate-500">
                {isLiveBackend
                  ? "Real-time decision processing and verification audit sync enabled."
                  : "Serving simulated evidence cases for the Greater Riverton flood operations."}
              </p>
            </div>
          </div>

          <span className="hidden text-[13px] text-slate-400 sm:block">
            {analyticsData?.lastUpdated
              ? `Updated ${new Date(analyticsData.lastUpdated).toLocaleTimeString()}`
              : "Updated just now"}
          </span>
        </div>

        {/* VERIFICATION ALERT */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#f6d28a] border-l-[4px] bg-[#fff8e9] px-4 py-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-amber-700" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                {analyticsData?.statistics.awaitingReview ?? 14} cases awaiting evidence review
              </p>
              <p className="mt-1 text-sm text-amber-800">
                Critical requests should be verified or escalated within 30 minutes.
              </p>
            </div>
          </div>

          <span className="rounded-md bg-[#fff2d9] px-4 py-2 text-sm font-semibold text-amber-800">
            Oldest: {analyticsData?.statistics.oldestPendingAge ?? "42 min"}
          </span>
        </div>

        {/* STATISTICS CARDS */}
        <section className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((item, index) => {
            const Icon = item.icon;
            const iconColors: Record<string, string> = {
              orange: "bg-orange-50 text-amber-700",
              green: "bg-emerald-50 text-emerald-600",
              blue: "bg-sky-50 text-sky-600",
              red: "bg-red-50 text-red-600",
            };

            return (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl border border-[#d5e2eb] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconColors[item.color]}`}
                >
                  <Icon size={23} />
                </div>

                <div>
                  <p className="text-xs text-slate-400">{item.title}</p>
                  <h2 className="mt-1 text-2xl font-bold text-[#173e5b]">
                    {isLoading && !analyticsData ? "..." : item.value}
                  </h2>
                  <p className="mt-1 text-[13px] text-slate-500">{item.description}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* SEARCH & FILTERS */}
        <section className="mb-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex min-w-[230px] flex-1 items-center gap-3 rounded-lg border border-[#d2e0e9] bg-white px-4 py-3">
            <Search size={19} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search cases awaiting verification..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-sm sm:text-[15px] outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Evidence State */}
          <select
            value={evidenceFilter}
            onChange={(e) => {
              setEvidenceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none"
          >
            <option value="All evidence states">All evidence states</option>
            <option value="Evidence pending">Evidence pending</option>
            <option value="Contact verified">Contact verified</option>
            <option value="Needs information">Needs information</option>
            <option value="Verified">Verified</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none"
          >
            <option value="All priorities">All priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none"
          >
            <option value="All categories">All categories</option>
            <option value="Emergency shelter">Emergency shelter</option>
            <option value="Food & water">Food & water</option>
            <option value="Medicine">Medicine</option>
            <option value="Rescue assistance">Rescue assistance</option>
          </select>

          {/* Submission Age */}
          <select
            value={ageFilter}
            onChange={(e) => {
              setAgeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none"
          >
            <option value="Submission age">Submission age</option>
            <option value="Last 1 hour">Last 1 hour</option>
            <option value="Last 24 hours">Last 24 hours</option>
          </select>

          {/* More Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-sm font-semibold text-[#287da8] hover:bg-sky-50 cursor-pointer"
          >
            <Filter size={15} />
            Filters
          </button>
        </section>

        {/* Advanced Filters Drawer */}
        {showFilters && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold">Active Filter Summary</p>
              <p className="mt-1 text-xs text-slate-400">
                Showing {totalCount} matching verification cases.
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="text-sm font-semibold text-sky-700 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* VERIFICATION TABLE */}
        <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.06)]">
          {/* Table Header */}
          <div className="hidden border-b border-[#d5e2eb] bg-[#f7f9fa] lg:block">
            <div className="grid grid-cols-[1fr_2fr_1.8fr_1fr_1.2fr_1.7fr_1.2fr_0.8fr_1.1fr_30px] items-center text-[13px] font-semibold text-slate-500">
              {[
                "Case",
                "Category & Applicant",
                "Location",
                "Reported",
                "AI Priority",
                "Verification",
                "Assigned",
                "Age",
                "Status",
                "",
              ].map((heading, index) => (
                <div key={index} className="px-3 py-4">
                  {heading}
                </div>
              ))}
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#e5edf2]">
            {cases.length > 0 ? (
              cases.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedCase(item);
                    setDecisionRationale(item.evidenceNotes || "");
                  }}
                  className="grid cursor-pointer grid-cols-1 gap-3 p-4 transition hover:bg-[#f8fbfd] lg:grid-cols-[1fr_2fr_1.8fr_1fr_1.2fr_1.7fr_1.2fr_0.8fr_1.1fr_30px] lg:items-center lg:gap-0 lg:px-0 lg:py-4"
                >
                  {/* Case ID */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">
                      Case
                    </span>
                    <p className="text-sm font-bold text-[#173e5b]">{item.id}</p>
                  </div>

                  {/* Category */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">
                      Category & Applicant
                    </span>
                    <p className="text-sm font-semibold text-[#173e5b]">
                      {item.category}
                    </p>
                    <p className="mt-1 text-[13px] text-slate-500">{item.applicant}</p>
                  </div>

                  {/* Location */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">
                      Location
                    </span>
                    <p className="text-sm text-slate-600">{item.location}</p>
                  </div>

                  {/* Reported */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">
                      Reported
                    </span>
                    <span
                      className={`inline-block rounded-md px-2.5 py-1.5 text-sm font-semibold ${priorityStyle(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                  </div>

                  {/* AI Priority */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">
                      AI Priority
                    </span>
                    <p className="text-sm font-semibold text-slate-700">
                      {item.aiPriority}
                    </p>
                    <p className="mt-1 text-[13px] text-slate-400">{item.confidence}</p>
                  </div>

                  {/* Verification */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">
                      Verification
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {item.verification}
                    </span>
                  </div>

                  {/* Assigned */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">
                      Assigned
                    </span>
                    {item.assigned === "You" ? (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-sky-700">
                        <UserCheck size={12} />
                        You
                      </span>
                    ) : (
                      <span className="text-[13px] text-slate-500">{item.assigned}</span>
                    )}
                  </div>

                  {/* Age */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">
                      Age
                    </span>
                    <p className="text-sm text-slate-600">{item.age}</p>
                  </div>

                  {/* Status */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">
                      Status
                    </span>
                    <span
                      className={`inline-block whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-semibold ${statusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* View */}
                  <div className="flex justify-end px-3">
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <ClipboardCheck size={35} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">
                  No verification cases found
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Try changing your search or filters.
                </p>
              </div>
            )}
          </div>

          {/* PAGINATION */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e5edf2] px-5 py-4">
            <p className="text-xs text-slate-400">
              Showing{" "}
              {cases.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} –{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} cases
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-[#d5e2eb] px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg border text-sm transition cursor-pointer ${
                    currentPage === page
                      ? "border-[#287da8] bg-[#287da8] text-white"
                      : "border-[#d5e2eb] bg-white text-slate-600 hover:bg-sky-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 rounded-lg border border-[#b9d0df] px-4 py-2 text-sm font-medium text-[#287da8] hover:bg-sky-50 disabled:opacity-40 cursor-pointer"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* CASE DETAILS & DECISION MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#173e5b]">
                    Case Verification & Decision
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedCase.id} · {selectedCase.category}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Case Details Summary */}
            <div className="space-y-2.5 rounded-xl bg-slate-50 p-4 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-800">{selectedCase.applicant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800">{selectedCase.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Urgency Priority:</span>
                <span className={`rounded-md px-2 py-0.5 font-bold ${priorityStyle(selectedCase.priority)}`}>
                  {selectedCase.priority}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AI Priority & Confidence:</span>
                <span className="font-semibold text-slate-800">
                  {selectedCase.aiPriority} ({selectedCase.confidence})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Verification:</span>
                <span className="font-semibold text-slate-800">{selectedCase.verification}</span>
              </div>
            </div>

            {/* Evidence & Documents */}
            {selectedCase.documents && selectedCase.documents.length > 0 && (
              <div className="mt-3">
                <label className="block text-sm font-semibold text-slate-600">
                  Attached Evidence Documents ({selectedCase.documents.length})
                </label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedCase.documents.map((doc, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700"
                    >
                      <FileText size={12} />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Decision Rationale Input */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-600">
                Decision Notes & Rationale
              </label>
              <textarea
                rows={2}
                placeholder="Record decision reason, verification call details, or info request notes..."
                value={decisionRationale}
                onChange={(e) => setDecisionRationale(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm sm:text-[15px] text-slate-700 focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Decision Action Buttons */}
            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <button
                disabled={isSubmittingDecision}
                onClick={() => handleRecordDecision("Verify")}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
              >
                <Check size={14} />
                Verify Case
              </button>

              <button
                disabled={isSubmittingDecision}
                onClick={() => handleRecordDecision("RequestInfo")}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-700 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:opacity-60 cursor-pointer"
              >
                <MessageSquare size={13} />
                Request Info
              </button>

              <button
                disabled={isSubmittingDecision}
                onClick={() => handleRecordDecision("Reject")}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60 cursor-pointer"
              >
                <X size={14} />
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFICATION POLICY MODAL */}
      {showPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#173e5b]">Verification Policy</h2>
              <button
                onClick={() => setShowPolicy(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-600">
              <div>
                <h3 className="font-semibold text-slate-800">1. Evidence Review</h3>
                <p className="mt-1 text-sm leading-6">
                  Review submitted documents, photographs and supporting evidence before approving a case.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">2. Contact Verification</h3>
                <p className="mt-1 text-sm leading-6">
                  Confirm applicant contact information and validate the reported location.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">3. Priority Review</h3>
                <p className="mt-1 text-sm leading-6">
                  Critical requests should be reviewed or escalated within 30 minutes.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">4. Decision Recording</h3>
                <p className="mt-1 text-sm leading-6">
                  Record verification decisions with clear reasons and supporting information.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPolicy(false)}
              className="mt-6 w-full rounded-lg bg-[#287da8] py-3 text-sm font-semibold text-white hover:bg-[#17678f] cursor-pointer"
            >
              Close policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseVerification;
