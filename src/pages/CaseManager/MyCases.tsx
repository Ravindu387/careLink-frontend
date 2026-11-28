import React, { useState, useEffect, useCallback, useMemo } from "react";

import {
  Search,
  ChevronRight,
  ChevronLeft,
  Download,
  Plus,
  Filter,
  X,
  RefreshCw,
  Server,
  CheckCircle2,
  AlertTriangle,
  Check,
  FileText,
  Clock,
  User,
  MapPin,
  Tag,
} from "lucide-react";

import { myCasesService } from "../../services/myCasesService";
import type {
  MyCase,
  MyCasesStatsDto,
  MyCasesQueryDto,
  CreateMyCaseRequest,
} from "../../types/myCases";

const MyCases: React.FC = () => {
  // Data states
  const [stats, setStats] = useState<MyCasesStatsDto | null>(null);
  const [cases, setCases] = useState<MyCase[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Filter states
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [eventFilter, setEventFilter] = useState("All crisis events");
  const [dateFilter, setDateFilter] = useState("Date range");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selection states
  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [selectedCase, setSelectedCase] = useState<MyCase | null>(null);

  // Create Form State
  const [newApplicant, setNewApplicant] = useState("");
  const [newPeopleCount, setNewPeopleCount] = useState<number>(1);
  const [newLocation, setNewLocation] = useState("");
  const [newCategory, setNewCategory] = useState("Emergency shelter");
  const [newEvent, setNewEvent] = useState("Flood Response");
  const [newPriority, setNewPriority] = useState("High");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Status/Details Modal State
  const [editStatus, setEditStatus] = useState("Assigned");
  const [editPriority, setEditPriority] = useState("High");
  const [editNotes, setEditNotes] = useState("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Bulk Action State
  const [bulkActionType, setBulkActionType] = useState<string>("Resolve");
  const [bulkNotes, setBulkNotes] = useState<string>("");
  const [bulkAssignTo, setBulkAssignTo] = useState<string>("You");
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

  // Toast feedback
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
        const query: MyCasesQueryDto = {
          tab: activeTab !== "All" ? activeTab : undefined,
          search: searchTerm || undefined,
          priority: priorityFilter !== "All priorities" ? priorityFilter : undefined,
          category: categoryFilter !== "All categories" ? categoryFilter : undefined,
          status: statusFilter !== "All statuses" ? statusFilter : undefined,
          event: eventFilter !== "All crisis events" ? eventFilter : undefined,
          dateRange: dateFilter !== "Date range" ? dateFilter : undefined,
          pageNumber: currentPage,
          pageSize: itemsPerPage,
        };

        const [statsRes, casesRes] = await Promise.all([
          myCasesService.getStats(),
          myCasesService.getCases(query),
        ]);

        setStats(statsRes.data);
        setCases(casesRes.data.items);
        setTotalCount(casesRes.data.totalCount);
        setTotalPages(casesRes.data.totalPages);
        setIsLiveBackend(statsRes.isLiveBackend || casesRes.isLiveBackend);
      } catch (err) {
        console.error("Failed to load cases data", err);
        showToast("Error connecting to backend; offline demo data active.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [
      activeTab,
      searchTerm,
      priorityFilter,
      categoryFilter,
      statusFilter,
      eventFilter,
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
      const query: MyCasesQueryDto = {
        tab: activeTab !== "All" ? activeTab : undefined,
        search: searchTerm || undefined,
        priority: priorityFilter !== "All priorities" ? priorityFilter : undefined,
        category: categoryFilter !== "All categories" ? categoryFilter : undefined,
        status: statusFilter !== "All statuses" ? statusFilter : undefined,
        event: eventFilter !== "All crisis events" ? eventFilter : undefined,
        dateRange: dateFilter !== "Date range" ? dateFilter : undefined,
      };
      await myCasesService.downloadExportCsv(query);
      showToast("CSV file exported successfully!");
    } catch (err) {
      console.error("Export failed", err);
      showToast("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Create Case
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApplicant.trim() || !newLocation.trim()) {
      showToast("Please enter applicant name and location.");
      return;
    }

    try {
      setIsSubmittingCreate(true);
      const payload: CreateMyCaseRequest = {
        applicantName: newApplicant.trim(),
        peopleCount: Number(newPeopleCount) || 1,
        location: newLocation.trim(),
        category: newCategory,
        event: newEvent,
        priority: newPriority,
        description: newDescription.trim() || undefined,
      };

      const res = await myCasesService.createCase(payload);
      showToast(res.message);
      setShowCreateModal(false);
      // Reset form
      setNewApplicant("");
      setNewPeopleCount(1);
      setNewLocation("");
      setNewCategory("Emergency shelter");
      setNewPriority("High");
      setNewDescription("");
      loadData(true);
    } catch (err) {
      console.error("Failed to create case", err);
      showToast("Error creating case. Please verify inputs.");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Open Details Modal
  const openCaseDetails = (c: MyCase) => {
    setSelectedCase(c);
    setEditStatus(c.status);
    setEditPriority(c.priority);
    setEditNotes(c.notes || "");
  };

  // Update Status & Priority
  const handleUpdateStatus = async () => {
    if (!selectedCase) return;
    try {
      setIsSubmittingEdit(true);
      const res = await myCasesService.updateStatus(selectedCase.id, {
        status: editStatus,
        priority: editPriority,
        notes: editNotes.trim() || undefined,
      });
      showToast(res.message);
      setSelectedCase(null);
      loadData(true);
    } catch (err) {
      console.error("Failed to update status", err);
      showToast("Error updating case status.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Bulk Actions
  const handleBulkAction = async () => {
    if (selectedCases.length === 0) return;
    try {
      setIsSubmittingBulk(true);
      const res = await myCasesService.bulkAction({
        caseIds: selectedCases,
        action: bulkActionType,
        notes: bulkNotes.trim() || undefined,
        assignTo: bulkAssignTo.trim() || undefined,
      });
      showToast(res.message);
      setShowBulkModal(false);
      setSelectedCases([]);
      setBulkNotes("");
      loadData(true);
    } catch (err) {
      console.error("Bulk action failed", err);
      showToast("Failed to process bulk action.");
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Selection
  const toggleCase = (id: string) => {
    setSelectedCases((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Reset Filters
  const resetFilters = () => {
    setSearchTerm("");
    setPriorityFilter("All priorities");
    setCategoryFilter("All categories");
    setStatusFilter("All statuses");
    setEventFilter("All crisis events");
    setDateFilter("Date range");
    setActiveTab("All");
    setCurrentPage(1);
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
      case "Resolved":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      default:
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-sky-200 bg-white px-5 py-4 shadow-xl">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span className="text-sm font-medium text-slate-700">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-[1600px] px-5 py-6 lg:px-9">
        {/* Breadcrumb & Live Sync Badge */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Operations</span>
            <ChevronRight size={13} />
            <span>Case Management</span>
            <ChevronRight size={13} />
            <span className="font-semibold text-slate-800">My Cases</span>
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
              title="Refresh case data"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#287da8]" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">My Cases</h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage assigned assistance cases, track priority queues, and coordinate emergency responses.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-3 rounded-lg border border-[#b9d0df] bg-white px-5 py-3 text-sm font-medium text-[#287da8] shadow-sm transition hover:bg-sky-50 disabled:opacity-50"
            >
              <Download size={18} />
              {isExporting ? "Exporting..." : "Export"}
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-3 rounded-lg bg-[#287da8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#17678f]"
            >
              <Plus size={19} />
              Create case
            </button>
          </div>
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

        {/* Filters Section */}
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
            <option>Landslide Alert</option>
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
            <option>Rescue assistance</option>
            <option>Food & water</option>
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
            <option>Escalated</option>
            <option>Submitted</option>
            <option>Resolved</option>
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
            <option>Today</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
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

        {/* More Filters Expanded Bar */}
        {showFilters && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-800">Advanced Filter Overview</p>
              <p className="mt-1 text-xs text-slate-400">
                Filtered view contains {totalCount} matching case(s) across selected criteria.
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* Case Table Card */}
        <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.06)]">
          {/* Table Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d5e2eb] px-5 py-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-[#173e5b]">Active Case Queue</h2>
              <p className="mt-1 text-xs text-slate-400">
                {isLoading
                  ? "Loading cases..."
                  : `Showing ${cases.length} of ${totalCount} case(s)`}
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
              Bulk actions {selectedCases.length > 0 && `(${selectedCases.length})`}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
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
                            ...new Set([...prev, ...cases.map((c) => c.id)]),
                          ]);
                        } else {
                          setSelectedCases((prev) =>
                            prev.filter((id) => !cases.some((c) => c.id === id))
                          );
                        }
                      }}
                      className="accent-[#287da8]"
                    />
                  </th>
                  <th className="px-3 py-4">Case</th>
                  <th className="px-3 py-4">Category & Applicant</th>
                  <th className="px-3 py-4">Location</th>
                  <th className="px-3 py-4">Crisis Event</th>
                  <th className="px-3 py-4">Priority & AI Confidence</th>
                  <th className="px-3 py-4">Verification</th>
                  <th className="px-3 py-4">Assigned</th>
                  <th className="px-3 py-4">Age</th>
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
                        <span>Loading cases queue...</span>
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

                      <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-600">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {item.event}
                        </span>
                      </td>

                      <td className="px-3 py-5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-semibold ${priorityStyle(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                        <p className="mt-1 text-[13px] text-slate-400">{item.confidence}</p>
                      </td>

                      <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-600">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                            item.verification === "Verified"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {item.verification}
                        </span>
                      </td>

                      <td className="px-3 py-5 text-sm text-slate-600">{item.assigned}</td>

                      <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-600">
                        {item.age}
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
                      No cases found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#d5e2eb] px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing{" "}
              {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} –{" "}
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
          CREATE CASE MODAL
      ============================================================ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-sky-50 p-2 text-[#287da8]">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#173e5b]">Create Assistance Case</h3>
                  <p className="text-xs text-slate-500">
                    Add and self-assign an incoming humanitarian case.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Applicant / Family Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. M. Senanayake"
                    value={newApplicant}
                    onChange={(e) => setNewApplicant(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#d2e0e9] px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">People Impacted *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newPeopleCount}
                    onChange={(e) => setNewPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="mt-1 w-full rounded-lg border border-[#d2e0e9] px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Location / Sector *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Riverbank Lane, Ward 5"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#d2e0e9] px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#d2e0e9] px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                  >
                    <option>Emergency shelter</option>
                    <option>Medical supplies</option>
                    <option>Rescue assistance</option>
                    <option>Food & water</option>
                    <option>Clean water</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Crisis Event</label>
                  <select
                    value={newEvent}
                    onChange={(e) => setNewEvent(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#d2e0e9] px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                  >
                    <option>Flood Response</option>
                    <option>Storm Response</option>
                    <option>Landslide Alert</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">Initial Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#d2e0e9] px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                  >
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">Description & Special Needs</label>
                <textarea
                  rows={3}
                  placeholder="Details regarding urgent requirements, elderly/children, access conditions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#d2e0e9] p-3 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-[#b9d0df] px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="flex items-center gap-2 rounded-lg bg-[#287da8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#17678f] disabled:opacity-50"
                >
                  {isSubmittingCreate ? "Creating..." : "Create & Assign"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          CASE DETAIL & STATUS UPDATE MODAL
      ============================================================ */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-sky-50 p-2 text-[#287da8]">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#173e5b]">
                    Case Management: {selectedCase.id}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCase.applicant}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-slate-400" />
                  <span>Category:</span>
                  <span className="font-semibold text-slate-800">{selectedCase.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span>Location:</span>
                  <span className="font-semibold text-slate-800">{selectedCase.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <span>Age:</span>
                  <span className="font-semibold text-slate-800">{selectedCase.age}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span>Assigned To:</span>
                  <span className="font-semibold text-slate-800">{selectedCase.assigned}</span>
                </div>
              </div>

              {selectedCase.description && (
                <div className="rounded-lg border border-sky-100 bg-sky-50/50 p-3">
                  <p className="text-sm font-semibold text-[#173e5b]">Case Description:</p>
                  <p className="mt-1 text-sm text-slate-600">{selectedCase.description}</p>
                </div>
              )}

              {/* Status & Priority Controls */}
              <div className="grid grid-cols-2 gap-4">
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
                    <option>Resolved</option>
                  </select>
                </div>

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
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Coordinator & Response Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record verification notes, relief dispatch details, or escalation reason..."
                  className="mt-1 w-full rounded-lg border border-[#d2e0e9] p-3 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="rounded-lg border border-[#b9d0df] px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmittingEdit}
                  onClick={handleUpdateStatus}
                  className="flex items-center gap-2 rounded-lg bg-[#287da8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#17678f] disabled:opacity-50"
                >
                  <Check size={14} />
                  {isSubmittingEdit ? "Saving..." : "Save Updates"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          BULK ACTIONS MODAL
      ============================================================ */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-sky-50 p-2 text-[#287da8]">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#173e5b]">Bulk Case Action</h3>
                  <p className="text-xs text-slate-500">
                    Applying action to {selectedCases.length} selected case(s).
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Action Type</label>
                <select
                  value={bulkActionType}
                  onChange={(e) => setBulkActionType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#d2e0e9] px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                >
                  <option value="Resolve">Mark as Resolved</option>
                  <option value="Escalate">Escalate to Emergency Team</option>
                  <option value="UnderReview">Move to Under Review</option>
                  <option value="Reassign">Reassign Coordinator</option>
                </select>
              </div>

              {bulkActionType === "Reassign" && (
                <div>
                  <label className="text-sm font-semibold text-slate-700">Reassign To</label>
                  <input
                    type="text"
                    value={bulkAssignTo}
                    onChange={(e) => setBulkAssignTo(e.target.value)}
                    placeholder="e.g. Field Team A, Coordinator West"
                    className="mt-1 w-full rounded-lg border border-[#d2e0e9] px-3 py-2 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-slate-700">Action Note / Log</label>
                <textarea
                  rows={3}
                  value={bulkNotes}
                  onChange={(e) => setBulkNotes(e.target.value)}
                  placeholder="Optional log message applied to all selected cases..."
                  className="mt-1 w-full rounded-lg border border-[#d2e0e9] p-3 text-sm sm:text-[15px] outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
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
                  onClick={handleBulkAction}
                  className="flex items-center gap-2 rounded-lg bg-[#287da8] px-5 py-2 text-sm font-semibold text-white hover:bg-[#17678f] disabled:opacity-50"
                >
                  {isSubmittingBulk ? "Processing..." : `Execute on ${selectedCases.length} Cases`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCases;
