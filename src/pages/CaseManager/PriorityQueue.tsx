import React, { useState, useEffect, useCallback, useMemo } from "react";

import {
  Search,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  X,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Server,
  UserCheck,
  Check,
} from "lucide-react";

import { priorityQueueService } from "../../services/priorityQueueService";
import type {
  PriorityCase,
  PriorityQueueStatsDto,
  PriorityQueueQueryDto,
} from "../../types/priorityQueue";

const PriorityQueue: React.FC = () => {
  // Data states
  const [stats, setStats] = useState<PriorityQueueStatsDto | null>(null);
  const [cases, setCases] = useState<PriorityCase[]>([]);
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
  const [selectedCase, setSelectedCase] = useState<PriorityCase | null>(null);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkAssignTo, setBulkAssignTo] = useState("You");
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // Edit Case Modal State
  const [editPriority, setEditPriority] = useState("Critical");
  const [editStatus, setEditStatus] = useState("Assigned");
  const [editNotes, setEditNotes] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load Data
  const loadData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const query: PriorityQueueQueryDto = {
          tab: activeTab !== "All" ? activeTab : undefined,
          search: searchTerm.trim() || undefined,
          event: eventFilter !== "All crisis events" ? eventFilter : undefined,
          priority: priorityFilter !== "All priorities" ? priorityFilter : undefined,
          category: categoryFilter !== "All categories" ? categoryFilter : undefined,
          status: statusFilter !== "All statuses" ? statusFilter : undefined,
          dateRange: dateFilter !== "Date range" ? dateFilter : undefined,
          pageNumber: currentPage,
          pageSize: itemsPerPage,
        };

        const [statsRes, casesRes] = await Promise.all([
          priorityQueueService.getStats(),
          priorityQueueService.getCases(query),
        ]);

        setStats(statsRes.data);
        setCases(casesRes.data.items);
        setTotalCount(casesRes.data.totalCount);
        setTotalPages(casesRes.data.totalPages);
        setIsLiveBackend(statsRes.isLiveBackend || casesRes.isLiveBackend);
      } catch (err) {
        console.error("Failed to load priority queue", err);
        showToast("Error connecting to backend; offline demo data active.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      activeTab,
      searchTerm,
      eventFilter,
      priorityFilter,
      categoryFilter,
      statusFilter,
      dateFilter,
      currentPage,
      itemsPerPage,
    ]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Export CSV
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const query: PriorityQueueQueryDto = {
        tab: activeTab !== "All" ? activeTab : undefined,
        search: searchTerm.trim() || undefined,
        event: eventFilter !== "All crisis events" ? eventFilter : undefined,
        priority: priorityFilter !== "All priorities" ? priorityFilter : undefined,
        category: categoryFilter !== "All categories" ? categoryFilter : undefined,
        status: statusFilter !== "All statuses" ? statusFilter : undefined,
        dateRange: dateFilter !== "Date range" ? dateFilter : undefined,
      };
      await priorityQueueService.downloadExportCsv(query);
      showToast("CSV file exported successfully!");
    } catch (err) {
      console.error("Export failed", err);
      showToast("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Reset Filters
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

  // Selection
  const toggleCase = (id: string) => {
    setSelectedCases((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Claim
  const handleBulkClaim = async () => {
    if (selectedCases.length === 0) return;
    try {
      setIsSubmittingBulk(true);
      const res = await priorityQueueService.claimCases({
        caseIds: selectedCases,
        assignTo: bulkAssignTo.trim() || "You",
      });
      showToast(res.message);
      setSelectedCases([]);
      setShowBulkModal(false);
      loadData(true);
    } catch (err) {
      console.error("Bulk claim failed", err);
      showToast("Failed to claim selected cases.");
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Open Case Details Modal
  const openCaseDetails = (c: PriorityCase) => {
    setSelectedCase(c);
    setEditPriority(c.priority);
    setEditStatus(c.status);
    setEditNotes(c.notes || "");
  };

  // Save Case Updates
  const handleUpdateCase = async () => {
    if (!selectedCase) return;
    try {
      setIsSubmittingEdit(true);
      const res = await priorityQueueService.updateCase(selectedCase.id, {
        priority: editPriority,
        status: editStatus,
        assigned: editStatus === "Assigned" && selectedCase.assigned === "Unassigned" ? "You" : undefined,
        notes: editNotes.trim() || undefined,
      });
      showToast(res.message);
      setSelectedCase(null);
      loadData(true);
    } catch (err) {
      console.error("Failed to update case", err);
      showToast("Error updating case.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Claim directly from modal
  const handleClaimSingle = async () => {
    if (!selectedCase) return;
    try {
      setIsSubmittingEdit(true);
      const res = await priorityQueueService.claimCases({
        caseIds: [selectedCase.id],
        assignTo: "You",
      });
      showToast(res.message);
      setSelectedCase(null);
      loadData(true);
    } catch (err) {
      console.error("Failed to claim case", err);
      showToast("Error claiming case.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Badge Styles
  const priorityStyle = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-700 border border-red-200";
      case "High":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      default:
        return "bg-green-100 text-green-700 border border-green-200";
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "Under Review":
        return "bg-orange-100 text-orange-700 border border-orange-200";
      case "Assigned":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "Escalated":
        return "bg-red-100 text-red-700 border border-red-200";
      case "Submitted":
        return "bg-amber-100 text-amber-700 border border-amber-200";
      case "Pending Info":
        return "bg-purple-100 text-purple-700 border border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border border-slate-200";
    }
  };

  // Tabs configuration
  const tabs = useMemo(
    () => [
      { id: "All", label: "All", count: stats?.totalCases ?? cases.length },
      { id: "Critical", label: "Critical", count: stats?.criticalCount ?? 0 },
      { id: "Due soon", label: "Due soon", count: stats?.dueSoonCount ?? 0 },
      { id: "Pending information", label: "Pending information", count: stats?.pendingInfoCount ?? 0 },
      { id: "Recently updated", label: "Recently updated", count: stats?.recentlyUpdatedCount ?? 0 },
    ],
    [stats, cases.length]
  );

  return (
    <div className="min-h-screen bg-[#eff6f8] text-slate-800">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-sky-200 bg-white px-5 py-4 shadow-xl">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span className="text-sm font-medium text-slate-700">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] px-5 py-5 lg:px-9">
        {/* Breadcrumb & Live Sync Badge */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Operations</span>
            <ChevronRight size={13} />
            <span>Case Management</span>
            <ChevronRight size={13} />
            <span className="font-semibold text-slate-800">Priority Queue</span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                isLiveBackend
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <Server size={12} className={isLiveBackend ? "text-emerald-600" : "text-amber-600"} />
              {isLiveBackend ? "Backend Live (Port 5277)" : "Demo Mode (Offline)"}
            </span>

            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg border border-[#b9d0df] bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-sky-50 disabled:opacity-50"
              title="Refresh queue"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#287da8]" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">Priority Queue</h1>
            <p className="mt-2 text-sm text-slate-500">
              Act on critical, high-priority, and SLA-risk cases requiring immediate humanitarian dispatch.
            </p>
          </div>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2.5 rounded-lg border border-[#b9d0df] bg-white px-5 py-3 text-sm font-medium text-[#287da8] shadow-sm transition hover:bg-sky-50 disabled:opacity-50"
          >
            <Download size={18} />
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>

        {/* Dynamic SLA Alert Banner */}
        <div
          className={`mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-l-[4px] px-4 py-4 shadow-sm ${
            (stats?.overdueCount ?? 0) > 0
              ? "border-red-200 border-l-red-600 bg-[#fff5f5]"
              : "border-emerald-200 border-l-emerald-600 bg-emerald-50/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle
              size={22}
              className={(stats?.overdueCount ?? 0) > 0 ? "text-red-700" : "text-emerald-700"}
            />
            <div>
              <p
                className={`text-sm font-bold ${
                  (stats?.overdueCount ?? 0) > 0 ? "text-red-900" : "text-emerald-900"
                }`}
              >
                {(stats?.overdueCount ?? 0) > 0
                  ? `${stats?.overdueCount} critical case(s) exceed SLA review window`
                  : "All critical cases are currently within target SLA review windows"}
              </p>
              <p
                className={`mt-1 text-sm ${
                  (stats?.overdueCount ?? 0) > 0 ? "text-red-800" : "text-emerald-800"
                }`}
              >
                Immediate review and triage within 30 minutes ensures rapid rescue mobilization.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPolicy(true)}
            className="rounded-lg border border-[#b9d0df] bg-white px-4 py-2.5 text-sm font-semibold text-[#287da8] shadow-sm transition hover:bg-sky-50"
          >
            View SLA policy
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-4 flex flex-wrap items-center gap-7 border-b border-[#d5e2eb]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`relative flex items-center gap-2 py-4 text-sm transition ${
                activeTab === tab.id
                  ? "font-semibold text-[#287da8]"
                  : "text-slate-500 hover:text-sky-700"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  activeTab === tab.id
                    ? "bg-sky-100 text-[#287da8]"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#287da8]" />
              )}
            </button>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex min-w-[240px] flex-1 items-center gap-3 rounded-lg border border-[#d2e0e9] bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search case ID, applicant, location, category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-sm sm:text-[15px] outline-none placeholder:text-slate-400"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                <X size={15} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Event Filter */}
          <select
            value={eventFilter}
            onChange={(e) => {
              setEventFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none shadow-sm focus:border-sky-500"
          >
            <option>All crisis events</option>
            <option>Flood Response</option>
            <option>Storm Response</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none shadow-sm focus:border-sky-500"
          >
            <option>All priorities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none shadow-sm focus:border-sky-500"
          >
            <option>All categories</option>
            <option>Emergency shelter</option>
            <option>Medical supplies</option>
            <option>Food & water</option>
            <option>Rescue assistance</option>
            <option>Medicine</option>
            <option>Clean water</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none shadow-sm focus:border-sky-500"
          >
            <option>All statuses</option>
            <option>Under Review</option>
            <option>Assigned</option>
            <option>Submitted</option>
            <option>Escalated</option>
            <option>Pending Info</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none shadow-sm focus:border-sky-500"
          >
            <option>Date range</option>
            <option>Last 1 hour</option>
            <option>Last 24 hours</option>
            <option>All time</option>
          </select>

          {/* More Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-semibold shadow-sm transition ${
              showFilters
                ? "border-[#287da8] bg-sky-50 text-[#287da8]"
                : "border-[#b9d0df] bg-white text-[#287da8] hover:bg-sky-50"
            }`}
          >
            <Filter size={16} />
            More filters
          </button>
        </div>

        {/* Advanced Filters Expandable */}
        {showFilters && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-800">Advanced Filter Management</p>
              <p className="mt-1 text-xs text-slate-400">
                Displaying {totalCount} priority case(s) matching criteria.
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Priority Queue Table Card */}
        <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.06)]">
          {/* Table Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d5e2eb] px-5 py-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#173e5b]">Prioritised Assistance Queue</h2>
              <p className="mt-1 text-xs text-slate-400">
                {isLoading ? "Loading queue..." : `Showing ${cases.length} of ${totalCount} priority case(s)`}
              </p>
            </div>

            <button
              onClick={() => {
                if (selectedCases.length > 0) {
                  setShowBulkModal(true);
                } else {
                  showToast("Please select at least one case using the checkboxes.");
                }
              }}
              className="rounded-lg border border-[#b9d0df] bg-white px-4 py-2.5 text-sm font-medium text-[#287da8] shadow-sm transition hover:bg-sky-50"
            >
              Claim selected {selectedCases.length > 0 && `(${selectedCases.length})`}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="bg-[#f7f9fa]">
                <tr className="border-b border-[#d5e2eb] text-sm font-semibold text-slate-500">
                  <th className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={
                        cases.length > 0 && cases.every((item) => selectedCases.includes(item.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCases((prev) => [
                            ...new Set([...prev, ...cases.map((item) => item.id)]),
                          ]);
                        } else {
                          setSelectedCases((prev) =>
                            prev.filter((id) => !cases.some((item) => item.id === id))
                          );
                        }
                      }}
                      className="accent-[#287da8]"
                    />
                  </th>
                  <th className="px-3 py-4">Case</th>
                  <th className="px-3 py-4">Category & Applicant</th>
                  <th className="px-3 py-4">Location</th>
                  <th className="px-3 py-4">Reported</th>
                  <th className="px-3 py-4">AI Priority & Confidence</th>
                  <th className="px-3 py-4">Verification</th>
                  <th className="px-3 py-4">Assigned</th>
                  <th className="px-3 py-4">Age / Urgency</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-4 py-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="py-16 text-center text-sm text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw size={24} className="animate-spin text-[#287da8]" />
                        <span>Loading priority queue...</span>
                      </div>
                    </td>
                  </tr>
                ) : cases.length > 0 ? (
                  cases.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#e5edf2] transition hover:bg-[#f8fbfd]"
                    >
                      <td className="px-4 py-5">
                        <input
                          type="checkbox"
                          checked={selectedCases.includes(item.id)}
                          onChange={() => toggleCase(item.id)}
                          className="accent-[#287da8]"
                        />
                      </td>

                      <td className="whitespace-nowrap px-3 py-5 text-sm font-bold text-[#173e5b]">
                        {item.id}
                      </td>

                      <td className="px-3 py-5">
                        <p className="whitespace-nowrap text-sm font-semibold text-[#173e5b]">
                          {item.category}
                        </p>
                        <p className="mt-1 whitespace-nowrap text-[13px] text-slate-500">
                          {item.applicant}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-600">
                        {item.location}
                      </td>

                      <td className="px-3 py-5">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ${priorityStyle(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      <td className="px-3 py-5">
                        <p className="text-sm font-semibold text-slate-700">{item.aiPriority}</p>
                        <p className="mt-1 text-[13px] text-slate-400">{item.confidence}</p>
                      </td>

                      <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-600">
                        {item.verification}
                      </td>

                      <td className="px-3 py-5 text-sm text-slate-600">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs ${
                            item.assigned === "Unassigned"
                              ? "bg-amber-50 font-medium text-amber-700"
                              : "bg-slate-100 font-medium text-slate-700"
                          }`}
                        >
                          {item.assigned}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-600">
                        <span className="font-semibold text-slate-700">{item.age}</span>
                        {item.priority === "Critical" && item.minutes > 30 && (
                          <span className="ml-1.5 rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">
                            SLA RISK
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-5">
                        <span
                          className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-5 text-center">
                        <button
                          title="Manage case"
                          onClick={() => openCaseDetails(item)}
                          className="rounded-lg p-1 text-slate-400 transition hover:bg-sky-50 hover:text-sky-700"
                        >
                          <ChevronRight size={19} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="py-16 text-center text-sm text-slate-400">
                      No priority cases found. Try changing your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#d5e2eb] px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} –{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} case(s)
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1 rounded-lg border border-[#d5e2eb] px-3.5 py-2 text-sm text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded-lg border text-sm transition ${
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
                className="flex items-center gap-1 rounded-lg border border-[#b9d0df] px-3.5 py-2 text-sm font-medium text-[#287da8] transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================
          CASE DETAILS & TRIAGE MODAL
      ============================================================ */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-[#173e5b]">
                  Priority Case Review: {selectedCase.id}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">{selectedCase.applicant}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3.5 rounded-xl bg-slate-50 p-4 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Category & Location:</span>
                <span className="font-semibold text-slate-700">
                  {selectedCase.category} · {selectedCase.location}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Crisis Event:</span>
                <span className="font-semibold text-slate-700">{selectedCase.event}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Assigned To:</span>
                <span className="font-semibold text-slate-700">{selectedCase.assigned}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Verification:</span>
                <span className="font-semibold text-slate-700">{selectedCase.verification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AI Priority & Confidence:</span>
                <span className="font-semibold text-slate-700">
                  {selectedCase.aiPriority} ({selectedCase.confidence})
                </span>
              </div>
            </div>

            {/* Quick Actions & Triage Controls */}
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Update Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#d2e0e9] px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                  >
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Update Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#d2e0e9] px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                  >
                    <option>Under Review</option>
                    <option>Assigned</option>
                    <option>Escalated</option>
                    <option>Submitted</option>
                    <option>Pending Info</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Coordinator Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record priority reassessment reason, relief deployment instructions..."
                  className="mt-1 w-full rounded-lg border border-[#d2e0e9] p-3 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-3">
              {selectedCase.assigned !== "You" && (
                <button
                  type="button"
                  disabled={isSubmittingEdit}
                  onClick={handleClaimSingle}
                  className="flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-semibold text-[#287da8] hover:bg-sky-100 disabled:opacity-50"
                >
                  <UserCheck size={14} />
                  Claim Case
                </button>
              )}

              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="rounded-lg border border-[#b9d0df] px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={isSubmittingEdit}
                  onClick={handleUpdateCase}
                  className="flex items-center gap-1.5 rounded-lg bg-[#287da8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#17678f] disabled:opacity-50"
                >
                  <Check size={14} />
                  {isSubmittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          BULK CLAIM MODAL
      ============================================================ */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-semibold text-[#173e5b]">Claim Priority Cases</h2>
              <button onClick={() => setShowBulkModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              You are about to assign <strong>{selectedCases.length}</strong> selected priority case(s).
            </p>

            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-700">Assign To</label>
              <input
                type="text"
                value={bulkAssignTo}
                onChange={(e) => setBulkAssignTo(e.target.value)}
                placeholder="You, Field Team A, Coordinator West..."
                className="mt-1 w-full rounded-lg border border-[#d2e0e9] px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="rounded-lg border border-[#b9d0df] px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingBulk}
                onClick={handleBulkClaim}
                className="flex items-center gap-1.5 rounded-lg bg-[#287da8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#17678f] disabled:opacity-50"
              >
                <UserCheck size={14} />
                {isSubmittingBulk ? "Claiming..." : `Confirm Claim (${selectedCases.length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SLA POLICY MODAL
      ============================================================ */}
      {showPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={22} className="text-red-600" />
                <h2 className="text-lg font-semibold text-[#173e5b]">Humanitarian SLA Policy</h2>
              </div>
              <button onClick={() => setShowPolicy(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-red-50 p-3.5">
                <p className="font-semibold text-red-800">Critical Priority SLA &lt; 30 Minutes</p>
                <p className="mt-1 text-red-700 leading-5">
                  Immediate life-safety and search/rescue cases must be claimed and dispatched within 30 minutes of intake.
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-3.5">
                <p className="font-semibold text-orange-800">High Priority SLA &lt; 2 Hours</p>
                <p className="mt-1 text-orange-700 leading-5">
                  Medical supplies, high-risk shelters, and vulnerable family rations should be processed within 2 hours.
                </p>
              </div>

              <div className="rounded-xl bg-yellow-50 p-3.5">
                <p className="font-semibold text-yellow-800">Medium Priority SLA &lt; 6 Hours</p>
                <p className="mt-1 text-yellow-700 leading-5">
                  Non-critical food replenishment and general logistics processed according to team capacity.
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3.5">
                <p className="font-semibold text-emerald-800">Low Priority SLA &lt; 24 Hours</p>
                <p className="mt-1 text-emerald-700 leading-5">
                  Standard rehabilitation and post-crisis survey requests handled in sequence.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPolicy(false)}
              className="mt-6 w-full rounded-lg bg-[#287da8] py-2.5 text-sm font-semibold text-white hover:bg-[#17678f]"
            >
              Close policy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityQueue;
