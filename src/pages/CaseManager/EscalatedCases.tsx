import React, { useState, useEffect, useCallback, useMemo } from "react";

import {
  Search,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  X,
  AlertTriangle,
  RefreshCw,
  Server,
  CheckCircle2,
  Check,
  Building2,
  UserCheck,
  Users,
} from "lucide-react";

import { escalatedCasesService } from "../../services/escalatedCasesService";
import type {
  EscalatedCase,
  EscalationStatsDto,
  EscalatedQueryDto,
} from "../../types/escalatedCases";

const EscalatedCases: React.FC = () => {
  // Data states
  const [stats, setStats] = useState<EscalationStatsDto | null>(null);
  const [cases, setCases] = useState<EscalatedCase[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Filter states
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState("All crisis events");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selection & Modal states
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [selectedCase, setSelectedCase] = useState<EscalatedCase | null>(null);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [bulkActionType, setBulkActionType] = useState<string>("Escalate");
  const [bulkNotes, setBulkNotes] = useState<string>("");
  const [isSubmittingBulk, setIsSubmittingBulk] = useState<boolean>(false);

  // Case Decision states
  const [decisionNotes, setDecisionNotes] = useState<string>("");
  const [targetOrgInput, setTargetOrgInput] = useState<string>("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Flash toast message
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load data
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const query: EscalatedQueryDto = {
        tab: activeTab !== "All" ? activeTab : undefined,
        search: searchTerm || undefined,
        event: eventFilter !== "All crisis events" ? eventFilter : undefined,
        priority: priorityFilter !== "All priorities" ? priorityFilter : undefined,
        category: categoryFilter !== "All categories" ? categoryFilter : undefined,
        status: statusFilter !== "All statuses" ? statusFilter : undefined,
        dateRange: dateFilter !== "Date range" ? dateFilter : undefined,
        pageNumber: currentPage,
        pageSize: itemsPerPage,
      };

      const [statsRes, casesRes] = await Promise.all([
        escalatedCasesService.getStats(),
        escalatedCasesService.getCases(query),
      ]);

      setStats(statsRes.data);
      setCases(casesRes.data.items);
      setTotalCount(casesRes.data.totalCount);
      setTotalPages(casesRes.data.totalPages);
      setIsLiveBackend(statsRes.isLiveBackend || casesRes.isLiveBackend);
    } catch (err) {
      console.error("Error loading escalated cases:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab, searchTerm, eventFilter, priorityFilter, categoryFilter, statusFilter, dateFilter, currentPage]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setEventFilter("All crisis events");
    setPriorityFilter("All priorities");
    setCategoryFilter("All categories");
    setStatusFilter("All statuses");
    setDateFilter("Date range");
    setActiveTab("All");
    setCurrentPage(1);
  };

  // Export CSV
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await escalatedCasesService.downloadExportCsv(cases);
      showToast("Escalated cases exported to CSV successfully.");
    } catch {
      showToast("Failed to export cases.");
    } finally {
      setIsExporting(false);
    }
  };

  // Selection toggle
  const toggleCase = (id: string) => {
    setSelectedCases((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Submit Bulk Action
  const handleBulkActionSubmit = async () => {
    if (selectedCases.length === 0) return;
    setIsSubmittingBulk(true);
    try {
      const count = await escalatedCasesService.bulkAction({
        caseIds: selectedCases,
        action: bulkActionType,
        notes: bulkNotes.trim() || undefined,
        assignTo: bulkActionType === "AssignCoordinator" ? "Senior Coordinator" : undefined,
      });

      showToast(`${count} case(s) updated with action '${bulkActionType}'.`);
      setSelectedCases([]);
      setShowBulkModal(false);
      setBulkNotes("");
      loadData(true);
    } catch {
      showToast("Failed to execute bulk action.");
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Submit Individual Decision
  const handleCaseDecision = async (action: "Resolve" | "Reassign" | "RequestCrossOrg") => {
    if (!selectedCase) return;
    setIsSubmittingDecision(true);
    try {
      await escalatedCasesService.recordDecision(selectedCase.id, {
        action,
        notes: decisionNotes.trim() || undefined,
        targetOrg: targetOrgInput.trim() || undefined,
        assignTo: action === "Reassign" ? "You" : undefined,
      });

      const actionLabels = {
        Resolve: "marked as resolved",
        Reassign: "reassigned to you",
        RequestCrossOrg: `cross-organisation action requested${targetOrgInput ? ` for ${targetOrgInput}` : ""}`,
      };

      showToast(`Case ${selectedCase.id} ${actionLabels[action]}.`);
      setSelectedCase(null);
      setDecisionNotes("");
      setTargetOrgInput("");
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
      case "Escalated":
        return "bg-red-100 text-red-700";
      case "Assigned":
        return "bg-emerald-100 text-emerald-700";
      case "Pending Info":
        return "bg-amber-100 text-amber-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Tab definitions with dynamic badge counts
  const tabs = useMemo(() => [
    { label: "All", count: stats?.totalEscalated ?? 0 },
    { label: "Critical", count: stats?.criticalCount ?? 0 },
    { label: "Due soon", count: stats?.dueSoonCount ?? 0 },
    { label: "Pending information", count: stats?.pendingInfoCount ?? 0 },
    { label: "Recently updated", count: stats?.recentlyUpdatedCount ?? 0 },
  ], [stats]);

  return (
    <div className="min-h-screen bg-[#eff6f8] text-slate-800">
      {/* TOAST ALERT */}
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

      {/* BULK ACTION MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl transition-all">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#173e5b]">
                    Batch Escalation Action
                  </h3>
                  <p className="text-xs text-slate-400">
                    Applying to {selectedCases.length} selected case(s)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBulkModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Action Type *
                </label>
                <select
                  value={bulkActionType}
                  onChange={(e) => setBulkActionType(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-sky-500 focus:bg-white focus:outline-none"
                >
                  <option value="Escalate">Mark as Escalated & Critical</option>
                  <option value="De-escalate">De-escalate to Under Review</option>
                  <option value="AssignCoordinator">Assign to Senior Coordinator Team</option>
                  <option value="Resolve">Mark Escalation as Resolved</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Coordinator Action Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Record rationale or cross-organisation operational context..."
                  value={bulkNotes}
                  onChange={(e) => setBulkNotes(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingBulk}
                  onClick={handleBulkActionSubmit}
                  className="flex items-center gap-1.5 rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-sky-800 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmittingBulk ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Execute Action
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="mx-auto max-w-[1600px] px-5 py-5 lg:px-9">
        {/* BREADCRUMB */}
        <div className="mb-9 flex items-center gap-2 text-xs text-slate-400">
          <span>Operations</span>
          <ChevronRight size={13} />
          <span>Case Management</span>
          <ChevronRight size={13} />
          <span className="font-semibold text-slate-800">Escalated Cases</span>
        </div>

        {/* PAGE HEADER */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">
              Escalated Cases
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Coordinate cases escalated for senior or cross-organisation action.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              title="Refresh escalated cases"
              className="flex items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-3.5 py-3 text-xs font-medium text-[#287da8] transition hover:bg-sky-50 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-5 py-3 text-sm font-medium text-[#287da8] transition hover:bg-sky-50 disabled:opacity-50 cursor-pointer"
            >
              <Download size={17} />
              {isExporting ? "Exporting..." : "Export"}
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
              <AlertTriangle size={18} className="text-amber-600" />
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold">
                  {isLiveBackend
                    ? "Live Escalation Dispatch Connected (Port 5277)"
                    : "Demonstration Escalation Mode"}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    isLiveBackend
                      ? "bg-emerald-200 text-emerald-800"
                      : "bg-sky-200 text-sky-800"
                  }`}
                >
                  {isLiveBackend ? "LIVE" : "DEMO"}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500">
                {isLiveBackend
                  ? "Real-time dispatch coordination and cross-agency assignment active."
                  : "Serving simulated escalated crisis cases for the Greater Riverton flood response."}
              </p>
            </div>
          </div>

          <span className="hidden text-[10px] text-slate-400 sm:block">
            {stats ? `${stats.totalEscalated} total active records` : "Updated just now"}
          </span>
        </div>

        {/* TABS */}
        <div className="mb-4 flex flex-wrap items-center gap-7 border-b border-[#d5e2eb]">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.label);
                setCurrentPage(1);
              }}
              className={`relative flex items-center gap-2 py-4 text-xs transition cursor-pointer ${
                activeTab === tab.label
                  ? "font-semibold text-[#287da8]"
                  : "text-slate-500 hover:text-sky-700"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                activeTab === tab.label
                  ? "bg-sky-100 text-sky-800 font-bold"
                  : "bg-slate-200 text-slate-600"
              }`}>
                {tab.count}
              </span>

              {activeTab === tab.label && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#287da8]" />
              )}
            </button>
          ))}
        </div>

        {/* SEARCH AND FILTERS */}
        <section className="mb-4 flex flex-wrap items-center gap-3">
          {/* SEARCH */}
          <div className="flex min-w-[230px] flex-1 items-center gap-3 rounded-lg border border-[#d2e0e9] bg-white px-4 py-3">
            <Search size={19} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search case ID, applicant, location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="cursor-pointer">
                <X size={15} className="text-slate-400" />
              </button>
            )}
          </div>

          {/* EVENT FILTER */}
          <select
            value={eventFilter}
            onChange={(e) => {
              setEventFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >
            <option value="All crisis events">All crisis events</option>
            <option value="Flood Response">Flood Response</option>
            <option value="Storm Response">Storm Response</option>
            <option value="Landslide Emergency">Landslide Emergency</option>
          </select>

          {/* PRIORITY FILTER */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >
            <option value="All priorities">All priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* CATEGORY FILTER */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >
            <option value="All categories">All categories</option>
            <option value="Emergency shelter">Emergency shelter</option>
            <option value="Rescue assistance">Rescue assistance</option>
            <option value="Medical supplies">Medical supplies</option>
            <option value="Food & water">Food & water</option>
            <option value="Medicine">Medicine</option>
          </select>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >
            <option value="All statuses">All statuses</option>
            <option value="Under Review">Under Review</option>
            <option value="Escalated">Escalated</option>
            <option value="Assigned">Assigned</option>
            <option value="Pending Info">Pending Info</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* DATE FILTER */}
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >
            <option value="Date range">Date range</option>
            <option value="Last 1 hour">Last 1 hour</option>
            <option value="Last 24 hours">Last 24 hours</option>
            <option value="All time">All time</option>
          </select>

          {/* MORE FILTERS */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-xs font-semibold text-[#287da8] hover:bg-sky-50 cursor-pointer"
          >
            <Filter size={15} />
            Filters
          </button>
        </section>

        {/* ADVANCED FILTERS DRAWER */}
        {showFilters && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Filter Overview</p>
              <p className="mt-1 text-xs text-slate-400">
                Displaying {totalCount} matching escalated cases for {activeTab}.
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* ESCALATED CASES TABLE */}
        <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.06)]">
          {/* TABLE HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d5e2eb] px-5 py-4">
            <div>
              <h2 className="text-base font-medium text-[#173e5b]">
                Escalated Cases Queue
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {totalCount} cases requiring priority coordination
              </p>
            </div>

            <button
              onClick={() => {
                if (selectedCases.length === 0) {
                  alert("Please select at least one case using the checkboxes.");
                  return;
                }
                setShowBulkModal(true);
              }}
              className="rounded-lg border border-[#b9d0df] bg-white px-4 py-2.5 text-xs font-semibold text-[#287da8] transition hover:bg-sky-50 cursor-pointer"
            >
              Bulk actions {selectedCases.length > 0 && `(${selectedCases.length})`}
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-[#f7f9fa]">
                <tr className="border-b border-[#d5e2eb] text-[11px] font-semibold text-slate-500">
                  <th className="px-3 py-4">
                    <input
                      type="checkbox"
                      checked={
                        cases.length > 0 &&
                        cases.every((item) => selectedCases.includes(item.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCases((prev) => [
                            ...new Set([...prev, ...cases.map((i) => i.id)]),
                          ]);
                        } else {
                          setSelectedCases((prev) =>
                            prev.filter((id) => !cases.some((i) => i.id === id))
                          );
                        }
                      }}
                      className="accent-sky-700 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-4">Case</th>
                  <th className="px-3 py-4">Category & Applicant</th>
                  <th className="px-3 py-4">Location</th>
                  <th className="px-3 py-4">Reported</th>
                  <th className="px-3 py-4">AI Priority</th>
                  <th className="px-3 py-4">Verification</th>
                  <th className="px-3 py-4">Assigned</th>
                  <th className="px-3 py-4">Age</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {cases.length > 0 ? (
                  cases.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#e5edf2] transition hover:bg-[#f8fbfd]"
                    >
                      {/* SELECT */}
                      <td className="px-3 py-5">
                        <input
                          type="checkbox"
                          checked={selectedCases.includes(item.id)}
                          onChange={() => toggleCase(item.id)}
                          className="accent-sky-700 cursor-pointer"
                        />
                      </td>

                      {/* CASE ID */}
                      <td className="whitespace-nowrap px-3 py-5 text-[11px] font-bold text-[#173e5b]">
                        {item.id}
                      </td>

                      {/* CATEGORY */}
                      <td className="px-3 py-5">
                        <p className="whitespace-nowrap text-[11px] font-semibold text-[#173e5b]">
                          {item.category}
                        </p>
                        <p className="mt-1 whitespace-nowrap text-[10px] text-slate-500">
                          {item.applicant}
                        </p>
                      </td>

                      {/* LOCATION */}
                      <td className="whitespace-nowrap px-3 py-5 text-[11px] text-slate-600">
                        {item.location}
                      </td>

                      {/* REPORTED PRIORITY */}
                      <td className="px-3 py-5">
                        <span
                          className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${priorityStyle(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      {/* AI PRIORITY */}
                      <td className="px-3 py-5">
                        <p className="text-[11px] font-semibold text-slate-700">
                          {item.aiPriority}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {item.confidence}
                        </p>
                      </td>

                      {/* VERIFICATION */}
                      <td className="whitespace-nowrap px-3 py-5 text-[11px] text-slate-600">
                        {item.verification}
                      </td>

                      {/* ASSIGNED */}
                      <td className="whitespace-nowrap px-3 py-5 text-[11px] text-slate-600">
                        {item.assigned === "You" ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-sky-700">
                            <UserCheck size={12} />
                            You
                          </span>
                        ) : (
                          item.assigned
                        )}
                      </td>

                      {/* AGE */}
                      <td className="whitespace-nowrap px-3 py-5 text-[11px] text-slate-600">
                        {item.age}
                      </td>

                      {/* STATUS */}
                      <td className="px-3 py-5">
                        <span
                          className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${statusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* VIEW DETAILS */}
                      <td className="px-3 py-5">
                        <button
                          onClick={() => {
                            setSelectedCase(item);
                            setDecisionNotes(item.coordinatorNotes || "");
                            setTargetOrgInput(item.targetOrg || "");
                          }}
                          className="text-slate-400 transition hover:text-sky-700 cursor-pointer"
                          title="View case details & coordinate"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={11}
                      className="py-16 text-center text-sm text-slate-400"
                    >
                      {isLoading ? "Loading escalated cases..." : "No escalated cases found. Try changing your filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-t border-[#e5edf2]">
            <p className="text-xs text-slate-400">
              Showing {cases.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} –{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} cases
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-[#d5e2eb] px-4 py-2 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg border text-xs transition cursor-pointer ${
                    currentPage === page
                      ? "border-[#287da8] bg-[#287da8] font-semibold text-white"
                      : "border-[#d5e2eb] bg-white text-slate-600 hover:bg-sky-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1 rounded-lg border border-[#b9d0df] px-4 py-2 text-xs font-medium text-[#287da8] hover:bg-sky-50 disabled:opacity-40 cursor-pointer"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* CASE DETAILS & COORDINATOR ACTION MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl transition-all">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#173e5b]">
                    Escalation Response Coordination
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedCase.id} · {selectedCase.category}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Case Info Table */}
            <div className="space-y-2 rounded-xl bg-slate-50 p-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Applicant:</span>
                <span className="font-semibold text-slate-800">{selectedCase.applicant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-800">{selectedCase.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reported Priority:</span>
                <span className={`rounded-md px-2 py-0.5 font-bold ${priorityStyle(selectedCase.priority)}`}>
                  {selectedCase.priority}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Crisis Event:</span>
                <span className="font-semibold text-slate-800">{selectedCase.event}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned To:</span>
                <span className="font-semibold text-slate-800">{selectedCase.assigned}</span>
              </div>
            </div>

            {/* Escalation Context */}
            {selectedCase.escalationReason && (
              <div className="mt-3.5 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-[11px] font-bold text-amber-900">
                  Escalation Trigger:
                </p>
                <p className="mt-0.5 text-xs text-amber-800">
                  {selectedCase.escalationReason}
                </p>
              </div>
            )}

            {/* Cross-Org Dispatch Field */}
            <div className="mt-4">
              <label className="block text-[11px] font-semibold text-slate-600">
                Designated Partner / Agency Unit
              </label>
              <input
                type="text"
                placeholder="e.g. Navy Search & Rescue, Red Cross Logistics, DMC"
                value={targetOrgInput}
                onChange={(e) => setTargetOrgInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Coordinator Notes */}
            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-600">
                Coordinator Directive & Audit Notes
              </label>
              <textarea
                rows={2}
                placeholder="Record situational directive, resource assignment, or resolution rationale..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-700 focus:border-sky-500 focus:outline-none"
              />
            </div>

            {/* Coordinator Actions */}
            <div className="mt-5 grid grid-cols-3 gap-2">
              <button
                disabled={isSubmittingDecision}
                onClick={() => handleCaseDecision("Resolve")}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
              >
                <Check size={14} />
                Resolve Case
              </button>

              <button
                disabled={isSubmittingDecision}
                onClick={() => handleCaseDecision("Reassign")}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-700 py-2.5 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-60 cursor-pointer"
              >
                <UserCheck size={14} />
                Assign to Me
              </button>

              <button
                disabled={isSubmittingDecision}
                onClick={() => handleCaseDecision("RequestCrossOrg")}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-purple-700 py-2.5 text-xs font-semibold text-white hover:bg-purple-800 disabled:opacity-60 cursor-pointer"
              >
                <Building2 size={13} />
                Dispatch Org
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscalatedCases;
