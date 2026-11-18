import React, { useState, useEffect, useCallback } from "react";

import {
  Search,
  ChevronRight,
  Download,
  Filter,
  ChevronLeft,
  X,
  RefreshCw,
  Server,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Clock,
  ShieldAlert,
  Phone,
  Users,
  MapPin,
  Calendar,
  Check,
} from "lucide-react";

import { unassignedCasesService } from "../../services/unassignedCasesService";
import type {
  UnassignedCase,
  UnassignedCasesStatsDto,
} from "../../types/unassignedCases";

const UnassignedCases: React.FC = () => {
  // Sync and connection state
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Stats state
  const [stats, setStats] = useState<UnassignedCasesStatsDto>({
    totalCases: 0,
    criticalCount: 0,
    dueSoonCount: 0,
    pendingInfoCount: 0,
    recentlyUpdatedCount: 0,
  });

  // Table cases & pagination state
  const [cases, setCases] = useState<UnassignedCase[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter states
  const [activeTab, setActiveTab] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All priorities");
  const [categoryFilter, setCategoryFilter] = useState<string>("All categories");
  const [statusFilter, setStatusFilter] = useState<string>("All statuses");
  const [eventFilter, setEventFilter] = useState<string>("All crisis events");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("Date range");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Selection states
  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  // Modals & Drawers
  const [inspectCase, setInspectCase] = useState<UnassignedCase | null>(null);
  const [showBulkClaimModal, setShowBulkClaimModal] = useState<boolean>(false);
  const [bulkAssignee, setBulkAssignee] = useState<string>("You");
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ==========================================
  // DATA FETCHING
  // ==========================================

  const loadData = useCallback(async (page: number = 1) => {
    try {
      const [statsRes, casesRes] = await Promise.all([
        unassignedCasesService.getStats(),
        unassignedCasesService.getCases({
          tab: activeTab,
          search: searchTerm,
          priority: priorityFilter,
          category: categoryFilter,
          status: statusFilter,
          event: eventFilter,
          dateRange: dateRangeFilter,
          pageNumber: page,
          pageSize: itemsPerPage,
        }),
      ]);

      setIsLiveBackend(casesRes.isLiveBackend || statsRes.isLiveBackend);
      setStats(statsRes.data);
      setCases(casesRes.data.items);
      setTotalCount(casesRes.data.totalCount);
    } catch (err) {
      console.error("Failed to load unassigned cases", err);
      showToast("Notice: Using offline demonstration dataset.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [
    activeTab,
    searchTerm,
    priorityFilter,
    categoryFilter,
    statusFilter,
    eventFilter,
    dateRangeFilter,
  ]);

  useEffect(() => {
    loadData(currentPage);
  }, [loadData, currentPage]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(currentPage);
    showToast("Unassigned queue updated successfully.");
  };

  // ==========================================
  // ACTIONS
  // ==========================================

  const handleClaimSingle = async (caseId: string) => {
    setIsClaiming(true);
    try {
      await unassignedCasesService.claimCases({
        caseIds: [caseId],
        assignTo: "You",
      });
      showToast(`Case ${caseId} claimed successfully and moved to your cases.`);
      if (inspectCase?.id === caseId) {
        setInspectCase(null);
      }
      setSelectedCases((prev) => prev.filter((id) => id !== caseId));
      await loadData(currentPage);
    } catch (err) {
      console.error(err);
      showToast(`Error claiming case ${caseId}.`);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleBulkClaim = async () => {
    if (selectedCases.length === 0) return;
    setIsClaiming(true);
    try {
      const count = await unassignedCasesService.claimCases({
        caseIds: selectedCases,
        assignTo: bulkAssignee,
      });
      showToast(
        `Successfully claimed ${count} case(s) for ${bulkAssignee === "You" ? "yourself" : bulkAssignee}.`
      );
      setSelectedCases([]);
      setShowBulkClaimModal(false);
      await loadData(1);
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      showToast("Error processing bulk claim request.");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleAssignToColleague = async (caseId: string, colleagueName: string) => {
    try {
      const res = await unassignedCasesService.assignCase({
        caseId,
        assignedTo: colleagueName,
        notes: `Assigned via unassigned queue to ${colleagueName}.`,
      });
      if (res) {
        showToast(`Case ${caseId} assigned to ${colleagueName}.`);
        if (inspectCase?.id === caseId) {
          setInspectCase(null);
        }
        await loadData(currentPage);
      }
    } catch (err) {
      console.error(err);
      showToast("Error assigning case.");
    }
  };

  const handleExport = async () => {
    try {
      const blob = await unassignedCasesService.exportCsv({
        tab: activeTab,
        search: searchTerm,
        event: eventFilter,
        priority: priorityFilter,
        category: categoryFilter,
        status: statusFilter,
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `carelink-unassigned-cases-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("Unassigned cases exported to CSV.");
    } catch (err) {
      console.error(err);
      showToast("Failed to export cases.");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setPriorityFilter("All priorities");
    setCategoryFilter("All categories");
    setStatusFilter("All statuses");
    setEventFilter("All crisis events");
    setDateRangeFilter("Date range");
    setActiveTab("All");
    setCurrentPage(1);
    showToast("Filters reset to defaults.");
  };

  // ==========================================
  // SELECTION
  // ==========================================

  const toggleSelectAllCurrent = () => {
    const currentIds = cases.map((c) => c.id);
    const allSelected = currentIds.every((id) => selectedCases.includes(id));
    if (allSelected) {
      setSelectedCases((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      const combined = Array.from(new Set([...selectedCases, ...currentIds]));
      setSelectedCases(combined);
    }
  };

  const toggleCase = (id: string) => {
    setSelectedCases((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // ==========================================
  // BADGES & STYLING
  // ==========================================

  const priorityStyle = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700 border border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      default:
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    }
  };

  const statusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "submitted":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "pending info":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "under review":
        return "bg-sky-100 text-sky-700 border border-sky-200";
      default:
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    }
  };

  const verificationBadge = (verification: string) => {
    if (verification.toLowerCase().includes("needs information")) {
      return "bg-amber-50 text-amber-700 border border-amber-200";
    }
    if (verification.toLowerCase().includes("pending")) {
      return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    }
    return "bg-teal-50 text-teal-700 border border-teal-200";
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  const tabs = [
    { label: "All", count: stats.totalCases },
    { label: "Critical", count: stats.criticalCount },
    { label: "Due soon", count: stats.dueSoonCount },
    { label: "Pending information", count: stats.pendingInfoCount },
    { label: "Recently updated", count: stats.recentlyUpdatedCount },
  ];

  return (
    <div className="min-h-screen bg-[#eff6f8] text-slate-800">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* =====================================
          MAIN CONTENT
      ===================================== */}
      <main className="mx-auto max-w-[1600px] px-5 py-6 lg:px-9">
        {/* BREADCRUMB & STATUS BAR */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Operations</span>
            <ChevronRight size={13} />
            <span>Case Management</span>
            <ChevronRight size={13} />
            <span className="font-semibold text-slate-800">Unassigned Cases</span>
          </div>

          <div className="flex items-center gap-3">
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
              title="Refresh queue"
              className="flex items-center gap-1.5 rounded-lg border border-[#d5e2eb] bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={isRefreshing ? "animate-spin text-[#287da8]" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* =====================================
            PAGE HEADER
        ===================================== */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#173e5b]">
              Unassigned Cases
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review and claim incoming disaster relief requests awaiting an authorized case manager.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedCases.length > 0 && (
              <button
                onClick={() => setShowBulkClaimModal(true)}
                className="flex items-center gap-2 rounded-lg bg-[#173e5b] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#205175]"
              >
                <UserCheck size={16} />
                <span>Claim Selected ({selectedCases.length})</span>
              </button>
            )}

            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-4 py-2.5 text-xs font-medium text-[#287da8] transition hover:bg-sky-50 shadow-sm"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* =====================================
            KPI METRICS CARDS
        ===================================== */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Total Unassigned
              </span>
              <Clock size={16} className="text-[#287da8]" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[#173e5b]">{stats.totalCases}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Awaiting case manager claim</p>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-sm">
            <div className="flex items-center justify-between text-red-500">
              <span className="text-xs font-medium uppercase tracking-wider text-red-700">
                Critical Priority
              </span>
              <ShieldAlert size={16} className="text-red-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-red-700">{stats.criticalCount}</p>
            <p className="mt-0.5 text-[11px] text-red-600 font-medium">Requires immediate triage</p>
          </div>

          <div className="rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Due Soon / Urgent
              </span>
              <AlertTriangle size={16} className="text-orange-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[#173e5b]">{stats.dueSoonCount}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Under 60 min or High urgency</p>
          </div>

          <div className="rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Pending Information
              </span>
              <CheckCircle2 size={16} className="text-amber-500" />
            </div>
            <p className="mt-2 text-2xl font-bold text-[#173e5b]">{stats.pendingInfoCount}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">Needs applicant contact</p>
          </div>
        </div>

        {/* =====================================
            TABS
        ===================================== */}
        <div className="mb-4 flex flex-wrap items-center gap-6 border-b border-[#d5e2eb]">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setActiveTab(tab.label);
                setCurrentPage(1);
              }}
              className={`relative flex items-center gap-2 py-3.5 text-xs transition ${
                activeTab === tab.label
                  ? "font-semibold text-[#287da8]"
                  : "text-slate-500 hover:text-sky-700"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  activeTab === tab.label
                    ? "bg-sky-100 text-[#287da8]"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
              {activeTab === tab.label && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#287da8]" />
              )}
            </button>
          ))}
        </div>

        {/* =====================================
            SEARCH & FILTERS
        ===================================== */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex min-w-[240px] flex-1 items-center gap-3 rounded-lg border border-[#d2e0e9] bg-white px-3.5 py-2.5 shadow-sm">
            <Search size={17} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search case ID, applicant, location, category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                <X size={14} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Crisis Events */}
          <select
            value={eventFilter}
            onChange={(e) => {
              setEventFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-2.5 text-xs text-slate-700 outline-none shadow-sm"
          >
            <option>All crisis events</option>
            <option>Flood Response</option>
            <option>Storm Response</option>
            <option>Drought Relief</option>
            <option>Urban Fire Response</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-2.5 text-xs text-slate-700 outline-none shadow-sm"
          >
            <option>All priorities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-2.5 text-xs text-slate-700 outline-none shadow-sm"
          >
            <option>All categories</option>
            <option>Food & water</option>
            <option>Medicine</option>
            <option>Emergency shelter</option>
            <option>Rescue assistance</option>
            <option>Financial Aid</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-2.5 text-xs text-slate-700 outline-none shadow-sm"
          >
            <option>All statuses</option>
            <option>Submitted</option>
            <option>Pending Info</option>
            <option>Under Review</option>
          </select>

          {/* Date Range */}
          <select
            value={dateRangeFilter}
            onChange={(e) => {
              setDateRangeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-2.5 text-xs text-slate-700 outline-none shadow-sm"
          >
            <option>Date range</option>
            <option>Today</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>

          {/* More Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold shadow-sm transition ${
              showFilters
                ? "border-[#287da8] bg-sky-50 text-[#287da8]"
                : "border-[#b9d0df] bg-white text-[#287da8] hover:bg-sky-50"
            }`}
          >
            <Filter size={15} />
            <span>More filters</span>
          </button>
        </div>

        {/* ADVANCED FILTERS PANEL */}
        {showFilters && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-in fade-in">
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Active Filter Parameters
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                Showing {activeTab} cases • Priority: {priorityFilter} • Category:{" "}
                {categoryFilter} • Event: {eventFilter}
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[#287da8] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* =====================================
            CASE TABLE
        ===================================== */}
        <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-sm">
          {/* TABLE TOOLBAR */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d5e2eb] px-5 py-3.5 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-semibold text-[#173e5b]">
                Unassigned Case Queue
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {totalCount} unassigned emergency request{totalCount === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selectedCases.length > 0 && (
                <button
                  onClick={() => setShowBulkClaimModal(true)}
                  className="rounded-lg bg-[#287da8] px-3.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#20668a]"
                >
                  Claim {selectedCases.length} Selected
                </button>
              )}

              <span className="text-xs text-slate-400">
                Selected: {selectedCases.length}
              </span>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="bg-[#f7f9fa] border-b border-[#d5e2eb]">
                <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={
                        cases.length > 0 &&
                        cases.every((c) => selectedCases.includes(c.id))
                      }
                      onChange={toggleSelectAllCurrent}
                      title="Select all on this page"
                      className="accent-[#287da8]"
                    />
                  </th>
                  <th className="px-4 py-3.5">Case ID</th>
                  <th className="px-4 py-3.5">Category & Applicant</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Reported Priority</th>
                  <th className="px-4 py-3.5">AI Priority</th>
                  <th className="px-4 py-3.5">Verification</th>
                  <th className="px-4 py-3.5">Age</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#e5edf2]">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-xs text-slate-400">
                      <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-[#287da8]" />
                      Loading unassigned cases...
                    </td>
                  </tr>
                ) : cases.length > 0 ? (
                  cases.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition hover:bg-[#f8fbfd] ${
                        selectedCases.includes(item.id) ? "bg-sky-50/50" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCases.includes(item.id)}
                          onChange={() => toggleCase(item.id)}
                          title="Select case"
                          className="accent-[#287da8]"
                        />
                      </td>

                      {/* ID */}
                      <td className="whitespace-nowrap px-4 py-4 text-xs font-bold text-[#173e5b]">
                        <button
                          onClick={() => setInspectCase(item)}
                          className="hover:text-[#287da8] hover:underline"
                        >
                          {item.id}
                        </button>
                        <span className="block text-[10px] font-normal text-slate-400">
                          {item.event}
                        </span>
                      </td>

                      {/* Category & Applicant */}
                      <td className="px-4 py-4">
                        <p className="whitespace-nowrap text-xs font-semibold text-[#173e5b]">
                          {item.category}
                        </p>
                        <p className="mt-0.5 whitespace-nowrap text-[11px] text-slate-500">
                          {item.applicant}
                        </p>
                      </td>

                      {/* Location */}
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                        {item.location}
                      </td>

                      {/* Reported Priority */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-block rounded-md px-2.5 py-1 text-[10px] font-semibold ${priorityStyle(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      {/* AI Priority */}
                      <td className="px-4 py-4">
                        <p className="text-xs font-semibold text-slate-700">
                          {item.aiPriority}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {item.confidence}
                        </p>
                      </td>

                      {/* Verification */}
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-medium ${verificationBadge(
                            item.verification
                          )}`}
                        >
                          {item.verification}
                        </span>
                      </td>

                      {/* Age */}
                      <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-600">
                        {item.age}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[10px] font-semibold ${statusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleClaimSingle(item.id)}
                            disabled={isClaiming}
                            className="rounded-md bg-[#287da8] px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-[#20668a]"
                          >
                            Claim
                          </button>

                          <button
                            title="View case details"
                            onClick={() => setInspectCase(item)}
                            className="rounded-md border border-slate-200 p-1 text-slate-500 transition hover:bg-slate-100 hover:text-sky-700"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-16 text-center text-xs text-slate-400">
                      No unassigned cases found matching current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* =====================================
              PAGINATION
          ===================================== */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-t border-[#d5e2eb]">
            <p className="text-xs text-slate-400">
              Showing{" "}
              {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
              {" "}–{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} cases
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1 rounded-lg border border-[#d5e2eb] px-3 py-1.5 text-xs text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={13} />
                <span>Previous</span>
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg border text-xs transition ${
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
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className="flex items-center gap-1 rounded-lg border border-[#b9d0df] px-3 py-1.5 text-xs font-medium text-[#287da8] transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================
          CASE DETAILS DRAWER / MODAL
      ===================================== */}
      {inspectCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold text-[#173e5b]">
                  {inspectCase.id}
                </span>
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-medium text-slate-700">
                  {inspectCase.event}
                </span>
              </div>
              <button
                onClick={() => setInspectCase(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 text-xs space-y-5">
              {/* Status Bar */}
              <div className="flex flex-wrap gap-2.5">
                <span className={`rounded-md px-3 py-1 font-semibold ${priorityStyle(inspectCase.priority)}`}>
                  Priority: {inspectCase.priority}
                </span>
                <span className="rounded-md bg-sky-50 px-3 py-1 font-semibold text-sky-700 border border-sky-200">
                  AI: {inspectCase.aiPriority} ({inspectCase.confidence})
                </span>
                <span className={`rounded-md px-3 py-1 font-semibold ${statusStyle(inspectCase.status)}`}>
                  Status: {inspectCase.status}
                </span>
              </div>

              {/* Applicant Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5">
                <h4 className="font-semibold text-slate-800 text-xs">Applicant Details</h4>
                <div className="grid grid-cols-2 gap-3 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400" />
                    <span>{inspectCase.applicant}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{inspectCase.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    <span>{inspectCase.contactNumber || "+94 77 412 8041"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span>Age: {inspectCase.age}</span>
                  </div>
                </div>
              </div>

              {/* Requirement & Description */}
              <div>
                <h4 className="font-semibold text-slate-800 text-xs mb-1.5">
                  Emergency Needs & Assessment
                </h4>
                <div className="rounded-lg border border-slate-200 p-3 bg-white text-slate-700 leading-relaxed">
                  <p className="font-medium text-[#173e5b] mb-1">
                    Category: {inspectCase.category}
                  </p>
                  <p className="text-slate-600">
                    {inspectCase.description ||
                      "Emergency humanitarian aid requested for affected individuals. Verification document check completed and ready for immediate case assignment."}
                  </p>
                </div>
              </div>

              {/* Assign to Colleague Section */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-800 text-xs mb-2">
                  Direct Assignment
                </h4>
                <div className="flex gap-2">
                  <select
                    id="colleagueSelect"
                    defaultValue="Amina Mensah"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none"
                  >
                    <option>Amina Mensah (Senior Lead)</option>
                    <option>Rohan Silva (Field Operations)</option>
                    <option>Priyani Senanayake (Medical Lead)</option>
                  </select>
                  <button
                    onClick={() => {
                      const select = document.getElementById("colleagueSelect") as HTMLSelectElement;
                      const selectedVal = select.value.split(" ")[0] + " " + select.value.split(" ")[1];
                      handleAssignToColleague(inspectCase.id, selectedVal);
                    }}
                    className="rounded-lg border border-[#b9d0df] bg-white px-3 py-2 text-xs font-semibold text-[#287da8] transition hover:bg-sky-50"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
              <button
                onClick={() => setInspectCase(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>

              <button
                onClick={() => handleClaimSingle(inspectCase.id)}
                disabled={isClaiming}
                className="flex items-center gap-1.5 rounded-lg bg-[#287da8] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#20668a]"
              >
                <UserCheck size={15} />
                <span>Claim Case to Me</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================
          BULK CLAIM MODAL
      ===================================== */}
      {showBulkClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-base font-bold text-[#173e5b]">
              Bulk Claim Cases ({selectedCases.length})
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Assign the selected cases from the unassigned triage queue to an authorized case manager.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign To
                </label>
                <select
                  value={bulkAssignee}
                  onChange={(e) => setBulkAssignee(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none"
                >
                  <option value="You">You (Current Case Manager)</option>
                  <option value="Amina Mensah">Amina Mensah</option>
                  <option value="Rohan Silva">Rohan Silva</option>
                  <option value="Priyani Senanayake">Priyani Senanayake</option>
                </select>
              </div>

              <div className="rounded-lg bg-sky-50/70 p-3 text-[11px] text-[#173e5b]">
                <p className="font-semibold">Selected Cases:</p>
                <p className="mt-0.5 text-slate-600 line-clamp-2">
                  {selectedCases.join(", ")}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowBulkClaimModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={handleBulkClaim}
                disabled={isClaiming}
                className="flex items-center gap-1.5 rounded-lg bg-[#287da8] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#20668a] disabled:opacity-50"
              >
                <Check size={14} />
                <span>Confirm Claim</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnassignedCases;
