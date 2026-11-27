import React, { useState, useEffect, useCallback } from "react";

import {
  Search,
  ChevronRight,
  ChevronLeft,
  Filter,
  X,
  Copy,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileSearch,
  RefreshCw,
  Server,
  Download,
  GitMerge,
} from "lucide-react";

import { potentialDuplicatesService } from "../../services/potentialDuplicatesService";
import type {
  DuplicateCase,
  DuplicatesStatsDto,
  DuplicateQueryDto,
} from "../../types/potentialDuplicates";

const PotentialDuplicates: React.FC = () => {
  // Data states
  const [stats, setStats] = useState<DuplicatesStatsDto | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateCase[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [similarityFilter, setSimilarityFilter] = useState("All similarity levels");
  const [reviewFilter, setReviewFilter] = useState("All review states");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [dateFilter, setDateFilter] = useState("Date detected");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Modals & Actions
  const [showPolicy, setShowPolicy] = useState(false);
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateCase | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
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
        const query: DuplicateQueryDto = {
          search: searchTerm.trim() || undefined,
          similarity: similarityFilter !== "All similarity levels" ? similarityFilter : undefined,
          status: reviewFilter !== "All review states" ? reviewFilter : undefined,
          category: categoryFilter !== "All categories" ? categoryFilter : undefined,
          dateRange: dateFilter !== "Date detected" ? dateFilter : undefined,
          pageNumber: currentPage,
          pageSize: itemsPerPage,
        };

        const [statsRes, dupsRes] = await Promise.all([
          potentialDuplicatesService.getStats(),
          potentialDuplicatesService.getDuplicates(query),
        ]);

        setStats(statsRes.data);
        setDuplicates(dupsRes.data.items);
        setTotalCount(dupsRes.data.totalCount);
        setTotalPages(dupsRes.data.totalPages);
        setIsLiveBackend(statsRes.isLiveBackend || dupsRes.isLiveBackend);
      } catch (err) {
        console.error("Failed to load potential duplicates", err);
        showToast("Error connecting to backend; offline demo data active.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [searchTerm, similarityFilter, reviewFilter, categoryFilter, dateFilter, currentPage, itemsPerPage]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Update Review Status
  const handleUpdateStatus = async (status: string) => {
    if (!selectedDuplicate) return;
    try {
      setIsSubmittingDecision(true);
      const res = await potentialDuplicatesService.updateStatus(selectedDuplicate.id, {
        status,
        notes: reviewNotes.trim() || undefined,
      });
      showToast(res.message);
      setSelectedDuplicate(null);
      setReviewNotes("");
      loadData(true);
    } catch (err) {
      console.error("Failed to update review status", err);
      showToast("Error updating review decision.");
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Merge cases
  const handleMergeCases = async () => {
    if (!selectedDuplicate) return;
    try {
      setIsSubmittingDecision(true);
      const res = await potentialDuplicatesService.mergeCases({
        matchId: selectedDuplicate.id,
        primaryCaseId: selectedDuplicate.primaryCase,
        duplicateCaseId: selectedDuplicate.duplicateCase,
        resolutionNotes: reviewNotes.trim() || undefined,
      });
      showToast(res.message);
      setSelectedDuplicate(null);
      setReviewNotes("");
      loadData(true);
    } catch (err) {
      console.error("Failed to merge cases", err);
      showToast("Error merging duplicate case.");
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  // Export CSV
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const query: DuplicateQueryDto = {
        search: searchTerm.trim() || undefined,
        similarity: similarityFilter !== "All similarity levels" ? similarityFilter : undefined,
        status: reviewFilter !== "All review states" ? reviewFilter : undefined,
        category: categoryFilter !== "All categories" ? categoryFilter : undefined,
        dateRange: dateFilter !== "Date detected" ? dateFilter : undefined,
      };
      await potentialDuplicatesService.downloadExportCsv(query);
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
    setSimilarityFilter("All similarity levels");
    setReviewFilter("All review states");
    setCategoryFilter("All categories");
    setDateFilter("Date detected");
    setCurrentPage(1);
  };

  // Open modal
  const openReviewModal = (item: DuplicateCase) => {
    setSelectedDuplicate(item);
    setReviewNotes(item.reviewNotes || "");
  };

  // Badge Styles
  const confidenceStyle = (confidence: string) => {
    switch (confidence) {
      case "High":
        return "bg-red-50 text-red-600";
      case "Medium":
        return "bg-orange-50 text-orange-700";
      default:
        return "bg-sky-50 text-sky-700";
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "Awaiting Review":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "Deferred":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Confirmed":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-200";
    }
  };

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
            <span className="font-semibold text-slate-800">Potential Duplicates</span>
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
              title="Refresh duplicate matches"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-[#287da8]" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">
              Potential Duplicates
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Compare possible duplicate requests with AI assistance without automatically deleting valid humanitarian cases.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-4 py-2.5 text-sm font-medium text-[#287da8] shadow-sm transition hover:bg-sky-50 disabled:opacity-50"
            >
              <Download size={16} />
              {isExporting ? "Exporting..." : "Export"}
            </button>

            <button
              onClick={() => setShowPolicy(true)}
              className="flex items-center gap-2 rounded-lg border border-[#b9d0df] bg-white px-4 py-2.5 text-sm font-medium text-[#287da8] shadow-sm transition hover:bg-sky-50"
            >
              <ShieldCheck size={16} />
              Detection policy
            </button>
          </div>
        </div>

        {/* KPI / Metric Cards */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-sm">
              <span className="text-xs text-slate-500">Total Matches</span>
              <p className="mt-1 text-2xl font-bold text-[#173e5b]">{stats.totalMatches}</p>
            </div>
            <div className="rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-sm">
              <span className="text-xs text-slate-500">Awaiting Review</span>
              <p className="mt-1 text-2xl font-bold text-amber-600">{stats.awaitingReviewCount}</p>
            </div>
            <div className="rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-sm">
              <span className="text-xs text-slate-500">High Confidence</span>
              <p className="mt-1 text-2xl font-bold text-red-600">{stats.highConfidenceCount}</p>
            </div>
            <div className="rounded-xl border border-[#d5e2eb] bg-white p-4 shadow-sm">
              <span className="text-xs text-slate-500">Confirmed Duplicates</span>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{stats.confirmedCount}</p>
            </div>
          </div>
        )}

        {/* Human Review Alert */}
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#d9c8fa] border-l-[4px] border-l-[#7654c8] bg-[#f4efff] px-4 py-4 shadow-sm">
          <Copy size={22} className="shrink-0 text-[#7654c8]" />
          <div>
            <p className="text-sm font-bold text-[#6040a8]">Human review is required</p>
            <p className="mt-1 text-sm text-[#7654c8]">
              Similarity detection flags possible matches only. Cases remain separate until an authorised reviewer decides otherwise.
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <section className="mb-5 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex min-w-[240px] flex-1 items-center gap-3 rounded-lg border border-[#d2e0e9] bg-white px-4 py-3 shadow-sm">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search duplicate pair, factors, category, or request ID..."
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

          {/* Similarity Filter */}
          <select
            value={similarityFilter}
            onChange={(e) => {
              setSimilarityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none shadow-sm focus:border-sky-500"
          >
            <option>All similarity levels</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          {/* Review State Filter */}
          <select
            value={reviewFilter}
            onChange={(e) => {
              setReviewFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-sm sm:text-[15px] outline-none shadow-sm focus:border-sky-500"
          >
            <option>All review states</option>
            <option>Awaiting Review</option>
            <option>Deferred</option>
            <option>Confirmed</option>
            <option>Not Duplicate</option>
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
            <option>Food & water</option>
            <option>Medical supplies</option>
            <option>Rescue assistance</option>
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
            <option>Date detected</option>
            <option>Today</option>
            <option>Last 24 hours</option>
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
        </section>

        {/* Advanced Filters Expandable */}
        {showFilters && (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-sky-100 bg-white p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-800">Advanced Filter Management</p>
              <p className="mt-1 text-xs text-slate-400">
                Found {totalCount} matching duplicate pair(s) across selected criteria.
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

        {/* Duplicates Table Card */}
        <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.06)]">
          {/* Table Header */}
          <div className="hidden border-b border-[#d5e2eb] bg-[#f7f9fa] lg:block">
            <div className="grid grid-cols-[1fr_1.2fr_1.7fr_4fr_0.8fr_1.2fr_1.8fr_35px] items-center text-[13px] font-semibold text-slate-500">
              {["Match ID", "Primary Case", "Possible Duplicate", "Similarity Factors", "Score", "Confidence", "Status", ""].map(
                (heading, index) => (
                  <div key={index} className="px-3 py-4">
                    {heading}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#e5edf2]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-sm text-slate-400">
                <RefreshCw size={24} className="mb-2 animate-spin text-[#287da8]" />
                <span>Loading duplicate matches...</span>
              </div>
            ) : duplicates.length > 0 ? (
              duplicates.map((item) => (
                <div
                  key={item.id}
                  onClick={() => openReviewModal(item)}
                  className="grid cursor-pointer grid-cols-1 gap-3 p-4 transition hover:bg-[#f8fbfd] lg:grid-cols-[1fr_1.2fr_1.7fr_4fr_0.8fr_1.2fr_1.8fr_35px] lg:items-center lg:gap-0 lg:px-0 lg:py-4"
                >
                  {/* Match ID */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">Match ID</span>
                    <p className="text-sm font-bold text-[#173e5b]">{item.id}</p>
                  </div>

                  {/* Primary Case */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">Primary Case</span>
                    <p className="text-sm font-semibold text-[#173e5b]">{item.primaryCase}</p>
                  </div>

                  {/* Possible Duplicate */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">Possible Duplicate</span>
                    <p className="text-sm text-slate-600">{item.duplicateCase}</p>
                  </div>

                  {/* Similarity Factors */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">Similarity Factors</span>
                    <p className="text-sm leading-5 text-slate-600">{item.factors}</p>
                  </div>

                  {/* Score */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">Score</span>
                    <p className="text-sm font-bold text-[#7654c8]">{item.score}%</p>
                  </div>

                  {/* Confidence */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">Confidence</span>
                    <span
                      className={`inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${confidenceStyle(
                        item.confidence
                      )}`}
                    >
                      {item.confidence}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="px-3">
                    <span className="mb-1 block text-xs text-slate-400 lg:hidden">Status</span>
                    <span
                      className={`inline-block whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold ${statusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* View Icon */}
                  <div className="flex justify-end px-3">
                    <ChevronRight size={19} className="text-slate-400" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <FileSearch size={35} className="mx-auto mb-3 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No potential duplicates found</p>
                <p className="mt-1 text-xs text-slate-400">Try changing your search or filters.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e5edf2] px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing {totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} –{" "}
              {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} match(es)
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
          DUPLICATE REVIEW MODAL
      ============================================================ */}
      {selectedDuplicate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-semibold text-[#173e5b]">Duplicate Review</h2>
                <p className="mt-0.5 text-xs text-slate-400">Match ID: {selectedDuplicate.id}</p>
              </div>
              <button
                onClick={() => setSelectedDuplicate(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Similarity Score Card */}
            <div className="mb-5 rounded-xl bg-purple-50 p-4 text-center">
              <p className="text-sm font-medium text-purple-700">AI Similarity Score</p>
              <h3 className="mt-1 text-3xl font-bold text-purple-700">{selectedDuplicate.score}%</h3>
              <p className="mt-1 text-sm text-purple-600">
                {selectedDuplicate.confidence} Confidence · Category: {selectedDuplicate.category}
              </p>
            </div>

            {/* Case Comparison Cards */}
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Primary Case
                </p>
                <p className="mt-1 text-sm font-bold text-[#173e5b]">{selectedDuplicate.primaryCase}</p>
              </div>

              <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-3.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-500">
                  Possible Duplicate
                </p>
                <p className="mt-1 text-sm font-bold text-purple-800">
                  {selectedDuplicate.duplicateCase}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Similarity Factors:</span>
                <span className="font-semibold text-slate-700">{selectedDuplicate.factors}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Detection Time:</span>
                <span className="font-semibold text-slate-700">{selectedDuplicate.detected}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-2">
                <span className="text-slate-400">Review Status:</span>
                <span
                  className={`rounded px-2 py-0.5 font-semibold ${statusStyle(
                    selectedDuplicate.status
                  )}`}
                >
                  {selectedDuplicate.status}
                </span>
              </div>
              <div className="pt-1">
                <span className="text-slate-400">Description / Comparison Context:</span>
                <p className="mt-1 text-sm text-slate-700">{selectedDuplicate.description}</p>
              </div>
            </div>

            {/* Review Notes Input */}
            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-700">Reviewer Notes (Optional)</label>
              <textarea
                rows={2}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add explanation for confirming, deferring, or dismissing this duplicate..."
                className="mt-1 w-full rounded-lg border border-[#d2e0e9] p-3 text-sm sm:text-[15px] outline-none focus:border-sky-500"
              />
            </div>

            {/* Review Actions */}
            <div className="mt-5 space-y-2.5">
              <p className="text-sm font-semibold text-slate-700">Review decision</p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  disabled={isSubmittingDecision}
                  onClick={() => handleUpdateStatus("Confirmed")}
                  className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 size={15} />
                  Confirm Duplicate
                </button>

                <button
                  disabled={isSubmittingDecision}
                  onClick={handleMergeCases}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#287da8] py-2.5 text-sm font-semibold text-white hover:bg-[#17678f] disabled:opacity-50"
                >
                  <GitMerge size={15} />
                  Confirm & Merge Cases
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  disabled={isSubmittingDecision}
                  onClick={() => handleUpdateStatus("Not Duplicate")}
                  className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ShieldCheck size={15} />
                  Mark as Not Duplicate
                </button>

                <button
                  disabled={isSubmittingDecision}
                  onClick={() => handleUpdateStatus("Deferred")}
                  className="flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 py-2.5 text-sm font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                >
                  <Clock size={15} />
                  Defer Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          DETECTION POLICY MODAL
      ============================================================ */}
      {showPolicy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={22} className="text-purple-600" />
                <h2 className="text-lg font-semibold text-[#173e5b]">Duplicate Detection Policy</h2>
              </div>
              <button
                onClick={() => setShowPolicy(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl bg-purple-50 p-3.5">
                <p className="text-sm font-semibold text-purple-800">Similarity Scoring Algorithm</p>
                <p className="mt-1 leading-5 text-purple-700">
                  The system analyzes incoming humanitarian cases against open records using phonetic contact matching, geolocation proximity, household size ratios, and natural language descriptions.
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-3.5">
                <p className="text-sm font-semibold text-red-800">High Similarity (85% – 100%)</p>
                <p className="mt-1 text-red-700">Requires priority human review before relief dispatch.</p>
              </div>

              <div className="rounded-xl bg-orange-50 p-3.5">
                <p className="text-sm font-semibold text-orange-800">Medium Similarity (70% – 84%)</p>
                <p className="mt-1 text-orange-700">Requires additional field corroboration or phone verification.</p>
              </div>

              <div className="rounded-xl bg-sky-50 p-3.5">
                <p className="text-sm font-semibold text-sky-800">Low Similarity (Below 70%)</p>
                <p className="mt-1 text-sky-700">Can proceed under normal standard operating procedures.</p>
              </div>

              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                <strong>Safety Guarantee:</strong> Potential matches must never be automatically purged or merged. An authorised human reviewer must make the final decision.
              </p>
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

export default PotentialDuplicates;
