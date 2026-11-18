import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  Download,
  Filter,
  X,
  MoreHorizontal,
  Wallet,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { fundAllocationService } from "../../services/fundAllocationService";
import type {
  FundAllocation,
  FundAllocationSummary,
  CreateFundAllocationInput,
} from "../../types/fundAllocation";

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (amount: number) =>
  "$" + amount.toLocaleString("en-US");

const getApprovalStyle = (status: string) => {
  switch (status) {
    case "Approved":
      return "bg-[#e4f6f0] text-[#159b79]";
    case "Under Review":
      return "bg-[#fff3dd] text-[#b7791f]";
    case "Rejected":
      return "bg-[#fde9e9] text-[#dc414b]";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const getDisbursementStyle = (status: string) => {
  switch (status) {
    case "Disbursed":
    case "68% Disbursed":
      return "bg-[#e4f6f0] text-[#159b79]";
    case "Pending":
      return "bg-[#fff3dd] text-[#b7791f]";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const PAGE_SIZE = 10;

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function FundAllocations() {
  // ---- Data state ----
  const [items, setItems] = useState<FundAllocation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState<FundAllocationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ---- Filter state ----
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [approvalFilter, setApprovalFilter] = useState("All verification states");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");
  const [showFilters, setShowFilters] = useState(false);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // ---- UI state ----
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<FundAllocation | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [toastError, setToastError] = useState(false);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  // ---- Form state ----
  const [newAllocation, setNewAllocation] = useState({
    amount: "",
    source: "Flood Response 2025",
    purpose: "",
    recipient: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================
  // FETCH
  // ============================================================

  const fetchData = useCallback(
    async (currentPage: number, currentSearch: string) => {
      setLoading(true);
      setError(null);
      try {
        const [pagedResult, summaryResult] = await Promise.all([
          fundAllocationService.getPaged({
            search: currentSearch,
            source: typeFilter,
            approval: approvalFilter,
            disbursement: statusFilter,
            dateRange: dateFilter,
            minAmount: minAmount ? Number(minAmount) : undefined,
            maxAmount: maxAmount ? Number(maxAmount) : undefined,
            page: currentPage,
            pageSize: PAGE_SIZE,
          }),
          fundAllocationService.getSummary(),
        ]);
        setItems(pagedResult.items);
        setTotalCount(pagedResult.totalCount);
        setSummary(summaryResult);
      } catch {
        setError("Failed to load fund allocations. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [typeFilter, approvalFilter, statusFilter, dateFilter, minAmount, maxAmount]
  );

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchData(1, search);
    }, 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search, typeFilter, approvalFilter, statusFilter, dateFilter, fetchData]);

  useEffect(() => {
    fetchData(page, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ============================================================
  // TOAST
  // ============================================================

  const notify = (message: string, isError = false) => {
    setToast(message);
    setToastError(isError);
    window.setTimeout(() => setToast(""), 3500);
  };

  // ============================================================
  // CREATE ALLOCATION
  // ============================================================

  const handleCreateAllocation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const amount = Number(newAllocation.amount);
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !newAllocation.purpose.trim() ||
      !newAllocation.recipient.trim()
    ) {
      notify("Please enter valid allocation details.", true);
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateFundAllocationInput = {
        amount,
        source: newAllocation.source,
        purpose: newAllocation.purpose,
        recipient: newAllocation.recipient,
        allocationDate: new Date(newAllocation.date).toISOString(),
        notes: newAllocation.notes,
      };

      await fundAllocationService.create(payload);

      setNewAllocation({
        amount: "",
        source: "Flood Response 2025",
        purpose: "",
        recipient: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
      });

      setShowModal(false);
      setPage(1);
      await fetchData(1, search);
      notify("Fund allocation created successfully.");
    } catch {
      notify("Failed to create fund allocation. Please try again.", true);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // ACTIONS: APPROVE / REJECT / DISBURSE / DELETE
  // ============================================================

  const approveAllocation = async (id: string) => {
    try {
      const updated = await fundAllocationService.updateApproval(id, "Approved");
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setActiveMenu(null);
      setSelectedAllocation((prev) => (prev?.id === id ? updated : prev));
      notify("Allocation approved successfully.");
    } catch {
      notify("Failed to approve allocation.", true);
    }
  };

  const rejectAllocation = async (id: string) => {
    try {
      const updated = await fundAllocationService.updateApproval(id, "Rejected");
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setActiveMenu(null);
      setSelectedAllocation((prev) => (prev?.id === id ? updated : prev));
      notify("Allocation rejected.");
    } catch {
      notify("Failed to reject allocation.", true);
    }
  };

  const disburseAllocation = async (id: string) => {
    const item = items.find((a) => a.id === id);
    if (!item || item.approval !== "Approved") {
      notify("Only approved allocations can be disbursed.", true);
      return;
    }

    try {
      const updated = await fundAllocationService.updateDisbursement(id, "Disbursed");
      setItems((prev) => prev.map((allocation) => (allocation.id === id ? updated : allocation)));
      setActiveMenu(null);
      setSelectedAllocation((prev) => (prev?.id === id ? updated : prev));
      notify("Funds marked as disbursed successfully.");
    } catch {
      notify("Failed to update disbursement status.", true);
    }
  };

  const deleteAllocation = async (id: string) => {
    try {
      await fundAllocationService.delete(id);
      setActiveMenu(null);
      setSelectedAllocation(null);
      setSelectedRows((prev) => prev.filter((r) => r !== id));
      await fetchData(page, search);
      notify("Allocation deleted.");
    } catch {
      notify("Failed to delete allocation.", true);
    }
  };

  // ============================================================
  // SELECTION & BULK
  // ============================================================

  const toggleRow = (id: string) => {
    setSelectedRows((previous) =>
      previous.includes(id) ? previous.filter((row) => row !== id) : [...previous, id]
    );
  };

  const toggleAll = () => {
    const allSelected = items.length > 0 && items.every((item) => selectedRows.includes(item.id));
    if (allSelected) {
      setSelectedRows((previous) => previous.filter((id) => !items.some((item) => item.id === id)));
    } else {
      setSelectedRows((previous) => [...new Set([...previous, ...items.map((item) => item.id)])]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedRows.length === 0) {
      notify("Please select allocations first.", true);
      return;
    }
    setBulkMenuOpen(false);

    try {
      const result = await fundAllocationService.bulkAction({ ids: selectedRows, action });
      setSelectedRows([]);
      await fetchData(page, search);
      notify(result.message);
    } catch {
      notify("Bulk action failed. Please try again.", true);
    }
  };

  // ============================================================
  // EXPORT CSV
  // ============================================================

  const exportCSV = async () => {
    try {
      const all = await fundAllocationService.getAll();
      const headers = [
        "Allocation ID",
        "Amount",
        "Funding Source",
        "Purpose",
        "Recipient",
        "Date",
        "Approval",
        "Disbursement",
      ];

      const rows = all.map((item) => [
        item.id,
        item.amount,
        item.source,
        item.purpose,
        item.recipient,
        item.date,
        item.approval,
        item.disbursement,
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "fund-allocations.csv";
      link.click();
      URL.revokeObjectURL(url);

      notify("Fund allocation report exported.");
    } catch {
      notify("Failed to export data.", true);
    }
  };

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All types");
    setApprovalFilter("All verification states");
    setStatusFilter("All statuses");
    setDateFilter("Date range");
    setMinAmount("");
    setMaxAmount("");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="min-h-screen w-full bg-[#eef5f7] text-[#123e60] overflow-x-hidden"
      onClick={() => {
        setActiveMenu(null);
        setBulkMenuOpen(false);
      }}
    >
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-8 py-4">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[9px] mb-8">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={11} />
          <span className="text-slate-500">Funding &amp; Donations</span>
          <ChevronRight size={11} />
          <span className="font-semibold">Fund Allocations</span>
        </div>

        {/* PAGE TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[23px] font-medium">Fund Allocations</h1>
            <p className="text-[11px] text-slate-500 mt-1">
              Allocate verified funds to approved humanitarian needs with accountable rationale.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="h-[40px] px-4 bg-white border border-[#b9cfda] rounded-lg text-[10px] text-[#23749e] flex items-center gap-2 hover:bg-[#f5fafc]"
            >
              <Download size={15} />
              Export
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="h-[40px] px-4 bg-[#23749e] text-white rounded-lg text-[10px] font-semibold flex items-center gap-2 hover:bg-[#175c80]"
            >
              <Plus size={16} />
              Allocate funds
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <SummaryCard
              label="Total Allocated"
              value={formatCurrency(summary.totalAllocated)}
              sub={`${summary.totalCount} allocation records`}
              color="#23749e"
            />
            <SummaryCard
              label="Disbursed"
              value={formatCurrency(summary.totalDisbursed)}
              sub={`${summary.disbursedCount} fully disbursed`}
              color="#078c70"
            />
            <SummaryCard
              label="Under Review"
              value={String(summary.underReviewCount)}
              sub="awaiting board approval"
              color="#b7791f"
            />
            <SummaryCard
              label="Pending Disbursement"
              value={formatCurrency(summary.totalPending)}
              sub={`${summary.approvedCount} approved`}
              color="#315d7b"
            />
          </div>
        )}

        {/* ERROR BANNER */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600 text-[10px]">
              <AlertCircle size={15} />
              {error}
            </div>
            <button
              onClick={() => fetchData(page, search)}
              className="text-[9px] text-red-600 flex items-center gap-1 hover:underline"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}

        {/* SEARCH AND FILTERS */}
        <section className="flex flex-col lg:flex-row gap-2.5 mb-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search allocation ID, recipient, or purpose..."
              className="w-full h-[40px] bg-white border border-[#d5e3e9] rounded-lg pl-10 pr-3 text-[10px] outline-none focus:border-[#35b995]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2">
            <FilterSelect
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value);
                setPage(1);
              }}
              options={[
                "All types",
                "Flood Response 2025",
                "Medical Relief",
                "Clean Water Appeal",
                "Emergency Shelter Fund",
              ]}
            />

            <FilterSelect
              value={approvalFilter}
              onChange={(value) => {
                setApprovalFilter(value);
                setPage(1);
              }}
              options={[
                "All verification states",
                "Approved",
                "Under Review",
                "Rejected",
              ]}
            />

            <FilterSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              options={[
                "All statuses",
                "Disbursed",
                "68% Disbursed",
                "Pending",
                "Not Disbursed",
              ]}
            />

            <FilterSelect
              value={dateFilter}
              onChange={setDateFilter}
              options={[
                "Date range",
                "Last 7 days",
                "Last 30 days",
                "Last 90 days",
              ]}
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFilters(!showFilters);
              }}
              className="h-[40px] px-4 bg-white border border-[#b9cfda] rounded-lg text-[10px] text-[#23749e] flex items-center justify-center gap-2 whitespace-nowrap hover:bg-[#f5fafc]"
            >
              <Filter size={14} />
              More filters
            </button>
          </div>
        </section>

        {/* MORE FILTERS */}
        {showFilters && (
          <div
            className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-4 flex flex-wrap items-end gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <label className="block text-[9px] text-slate-500 mb-1.5">
                Minimum amount
              </label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="Minimum USD"
                className="h-[35px] border border-[#d5e3e9] rounded-lg px-3 text-[10px] outline-none"
              />
            </div>

            <div>
              <label className="block text-[9px] text-slate-500 mb-1.5">
                Maximum amount
              </label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="Maximum USD"
                className="h-[35px] border border-[#d5e3e9] rounded-lg px-3 text-[10px] outline-none"
              />
            </div>

            <button
              onClick={() => {
                setPage(1);
                fetchData(1, search);
                setShowFilters(false);
              }}
              className="h-[35px] px-4 bg-[#23749e] text-white rounded-lg text-[10px]"
            >
              Apply filters
            </button>

            <button
              onClick={clearFilters}
              className="h-[35px] px-3 text-[#23749e] text-[10px]"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* FUND ALLOCATIONS TABLE */}
        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-visible">
          {/* TABLE HEADER */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-[#d7e4e9]">
            <div>
              <h2 className="text-[13px] font-medium">Fund Allocations</h2>
              <p className="text-[9px] text-slate-400 mt-1">
                {loading ? "Loading..." : `${totalCount} record${totalCount !== 1 ? "s" : ""}`}
              </p>
            </div>

            {/* BULK ACTIONS */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setBulkMenuOpen((prev) => !prev)}
                className="h-[40px] px-4 border border-[#b9cfda] rounded-lg text-[9px] text-[#23749e] hover:bg-[#f5fafc] flex items-center gap-1"
              >
                Bulk actions
                {selectedRows.length > 0 && ` (${selectedRows.length})`}
                <ChevronDown size={12} />
              </button>
              {bulkMenuOpen && (
                <div className="absolute right-0 top-11 z-30 w-44 bg-white border border-[#d5e3e9] rounded-lg shadow-lg py-1">
                  {[
                    { label: "Approve selected", action: "Approve" },
                    { label: "Reject selected", action: "Reject" },
                  ].map(({ label, action }) => (
                    <button
                      key={action}
                      onClick={() => handleBulkAction(action)}
                      className="w-full text-left px-3 py-2 text-[10px] hover:bg-[#f1f6f8]"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="bg-[#f5f8f9] border-b border-[#d7e4e9]">
                  <th className="px-3 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && items.every((item) => selectedRows.includes(item.id))}
                      onChange={toggleAll}
                      className="accent-[#23749e]"
                    />
                  </th>

                  {[
                    "Allocation ID",
                    "Amount",
                    "Funding Source",
                    "Purpose",
                    "Recipient",
                    "Date",
                    "Approval",
                    "Disbursement",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-3 text-[9px] font-medium text-slate-500 whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}

                  <th className="px-3 py-3"></th>
                </tr>
              </thead>

              <tbody>
                {/* LOADING SKELETONS */}
                {loading &&
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-[#e3ebef]">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <td key={j} className="px-3 py-4">
                          <div className="h-3 bg-slate-100 rounded animate-pulse w-16" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {/* DATA ROWS */}
                {!loading &&
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#e3ebef] hover:bg-[#f8fbfc] transition-colors"
                    >
                      <td className="px-3 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => toggleRow(item.id)}
                          className="accent-[#23749e]"
                        />
                      </td>

                      <td className="px-3 py-4 text-[10px] font-semibold whitespace-nowrap">
                        {item.id}
                      </td>

                      <td className="px-3 py-4 text-[10px] whitespace-nowrap">
                        {formatCurrency(item.amount)}
                      </td>

                      <td className="px-3 py-4 text-[10px] whitespace-nowrap">
                        {item.source}
                      </td>

                      <td className="px-3 py-4 text-[10px] whitespace-nowrap max-w-[200px] truncate">
                        {item.purpose}
                      </td>

                      <td className="px-3 py-4 text-[10px] whitespace-nowrap">
                        {item.recipient}
                      </td>

                      <td className="px-3 py-4 text-[10px] whitespace-nowrap">
                        {item.date}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1.5 rounded-md text-[9px] font-semibold whitespace-nowrap ${getApprovalStyle(
                            item.approval
                          )}`}
                        >
                          {item.approval}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1.5 rounded-md text-[9px] font-semibold whitespace-nowrap ${getDisbursementStyle(
                            item.disbursement
                          )}`}
                        >
                          {item.disbursement}
                        </span>
                      </td>

                      {/* ACTION MENU */}
                      <td className="px-3 py-4 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() =>
                            setActiveMenu((prev) => (prev === item.id ? null : item.id))
                          }
                          className="p-1.5 text-slate-400 hover:text-[#23749e]"
                        >
                          <MoreHorizontal size={17} />
                        </button>

                        {activeMenu === item.id && (
                          <div className="absolute right-8 top-8 z-30 w-48 bg-white border border-[#d5e3e9] rounded-lg shadow-lg py-1">
                            <button
                              onClick={() => {
                                setSelectedAllocation(item);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-3 py-2 text-[10px] hover:bg-[#f1f6f8]"
                            >
                              View allocation details
                            </button>

                            {item.approval === "Under Review" && (
                              <>
                                <button
                                  onClick={() => approveAllocation(item.id)}
                                  className="w-full text-left px-3 py-2 text-[10px] text-[#159b79] hover:bg-[#f1f6f8]"
                                >
                                  Approve allocation
                                </button>

                                <button
                                  onClick={() => rejectAllocation(item.id)}
                                  className="w-full text-left px-3 py-2 text-[10px] text-red-500 hover:bg-[#f1f6f8]"
                                >
                                  Reject allocation
                                </button>
                              </>
                            )}

                            {item.approval === "Approved" &&
                              item.disbursement !== "Disbursed" && (
                                <button
                                  onClick={() => disburseAllocation(item.id)}
                                  className="w-full text-left px-3 py-2 text-[10px] text-[#23749e] hover:bg-[#f1f6f8]"
                                >
                                  Mark as disbursed
                                </button>
                              )}

                            <button
                              onClick={() => deleteAllocation(item.id)}
                              className="w-full text-left px-3 py-2 text-[10px] text-red-400 hover:bg-[#f1f6f8] border-t border-slate-100 mt-1"
                            >
                              Delete allocation
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                {/* EMPTY STATE */}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-14">
                      <Wallet size={27} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-[11px] font-medium">No fund allocations found</p>
                      <p className="text-[9px] text-slate-400 mt-1">
                        Try changing your search or filters.
                      </p>
                      <button onClick={clearFilters} className="text-[#23749e] text-[9px] mt-3">
                        Clear filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[9px] text-slate-400">
              {totalCount === 0
                ? "No records"
                : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                    page * PAGE_SIZE,
                    totalCount
                  )} of ${totalCount.toLocaleString()}`}
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                className="h-[34px] px-4 border border-[#d5e3e9] rounded-lg text-[9px] disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum =
                  totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-[34px] h-[34px] border rounded-lg text-[9px] ${
                      page === pageNum
                        ? "bg-[#23749e] text-white border-[#23749e]"
                        : "bg-white border-[#d5e3e9]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                className="h-[34px] px-4 border border-[#b9cfda] rounded-lg text-[9px] text-[#23749e] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* CREATE ALLOCATION MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <form
            onSubmit={handleCreateAllocation}
            className="bg-white rounded-xl shadow-xl w-full max-w-[470px] max-h-[90vh] overflow-y-auto p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-[16px] font-semibold">Allocate funds</h2>
                <p className="text-[9px] text-slate-400 mt-1">
                  Assign funds to an approved humanitarian need.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-3">
              <FormField label="Allocation amount (USD)">
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={newAllocation.amount}
                  onChange={(e) =>
                    setNewAllocation({
                      ...newAllocation,
                      amount: e.target.value,
                    })
                  }
                  placeholder="Enter amount"
                  className="allocation-input"
                />
              </FormField>

              <FormField label="Funding source">
                <select
                  value={newAllocation.source}
                  onChange={(e) =>
                    setNewAllocation({
                      ...newAllocation,
                      source: e.target.value,
                    })
                  }
                  className="allocation-input"
                >
                  <option value="Flood Response 2025">Flood Response 2025</option>
                  <option value="Medical Relief">Medical Relief</option>
                  <option value="Clean Water Appeal">Clean Water Appeal</option>
                  <option value="Emergency Shelter Fund">Emergency Shelter Fund</option>
                </select>
              </FormField>

              <FormField label="Allocation purpose">
                <input
                  required
                  value={newAllocation.purpose}
                  onChange={(e) =>
                    setNewAllocation({
                      ...newAllocation,
                      purpose: e.target.value,
                    })
                  }
                  placeholder="e.g. Emergency shelter kits"
                  className="allocation-input"
                />
              </FormField>

              <FormField label="Recipient organisation">
                <input
                  required
                  value={newAllocation.recipient}
                  onChange={(e) =>
                    setNewAllocation({
                      ...newAllocation,
                      recipient: e.target.value,
                    })
                  }
                  placeholder="Enter recipient organisation"
                  className="allocation-input"
                />
              </FormField>

              <FormField label="Allocation date">
                <input
                  type="date"
                  required
                  value={newAllocation.date}
                  onChange={(e) =>
                    setNewAllocation({
                      ...newAllocation,
                      date: e.target.value,
                    })
                  }
                  className="allocation-input"
                />
              </FormField>

              <FormField label="Notes (optional)">
                <textarea
                  value={newAllocation.notes}
                  onChange={(e) =>
                    setNewAllocation({
                      ...newAllocation,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Additional context or allocation conditions..."
                  rows={2}
                  className="allocation-input resize-none"
                />
              </FormField>

              <div className="bg-[#eef5f7] rounded-lg p-3 flex items-start gap-2">
                <ShieldCheck size={16} className="text-[#23749e] shrink-0" />
                <p className="text-[9px] text-slate-600">
                  New allocations will be submitted with
                  <strong> Under Review </strong>
                  status and require approval before funds can be disbursed.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-[10px]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-[#23749e] text-white rounded-lg text-[10px] font-semibold hover:bg-[#175c80] disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create allocation"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ALLOCATION DETAILS MODAL */}
      {selectedAllocation && (
        <div
          className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4"
          onClick={() => setSelectedAllocation(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-[440px] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[9px] text-[#23749e] font-semibold">
                  {selectedAllocation.id}
                </p>
                <h2 className="text-[16px] font-semibold mt-1">Allocation details</h2>
              </div>

              <button onClick={() => setSelectedAllocation(null)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="bg-[#eef5f7] rounded-lg p-4 mb-4">
              <p className="text-[9px] text-slate-500">Allocation amount</p>
              <h3 className="text-[25px] font-bold mt-1">
                {formatCurrency(selectedAllocation.amount)}
              </h3>
            </div>

            <div className="space-y-3">
              {[
                ["Funding source", selectedAllocation.source],
                ["Purpose", selectedAllocation.purpose],
                ["Recipient", selectedAllocation.recipient],
                ["Date", selectedAllocation.date],
                ["Approval", selectedAllocation.approval],
                ["Disbursement", selectedAllocation.disbursement],
                ...(selectedAllocation.notes ? [["Notes", selectedAllocation.notes]] : []),
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-3 border-b border-slate-100 pb-2"
                >
                  <span className="text-[9px] text-slate-400">{label}</span>
                  <span className="text-[9px] font-medium text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-2 mt-6">
              {selectedAllocation.approval === "Under Review" && (
                <>
                  <button
                    onClick={() => rejectAllocation(selectedAllocation.id)}
                    className="px-3 py-2 bg-[#fde9e9] text-red-600 rounded-lg text-[9px]"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => approveAllocation(selectedAllocation.id)}
                    className="px-3 py-2 bg-[#e4f6f0] text-[#159b79] rounded-lg text-[9px]"
                  >
                    Approve
                  </button>
                </>
              )}

              {selectedAllocation.approval === "Approved" &&
                selectedAllocation.disbursement !== "Disbursed" && (
                  <button
                    onClick={() => disburseAllocation(selectedAllocation.id)}
                    className="px-3 py-2 bg-[#23749e] text-white rounded-lg text-[9px]"
                  >
                    Mark disbursed
                  </button>
                )}

              <button
                onClick={() => setSelectedAllocation(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-[9px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[60] ${
            toastError ? "bg-red-600" : "bg-[#123e60]"
          } text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-[10px]`}
        >
          <CheckCircle2 size={15} />
          {toast}
          <button onClick={() => setToast("")}>
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ========================================
// SUMMARY CARD
// ========================================

function SummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-[#d5e3e9] rounded-xl p-4 shadow-sm">
      <p className="text-[9px] text-slate-500 mb-1">{label}</p>
      <p className="text-[18px] font-bold" style={{ color }}>
        {value}
      </p>
      <p className="text-[9px] text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

// ========================================
// FILTER SELECT
// ========================================

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full lg:w-[150px] h-[40px] bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-8 text-[9px] outline-none focus:border-[#35b995] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={13}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  );
}

// ========================================
// FORM FIELD
// ========================================

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[9px] font-medium mb-1.5">{label}</span>
      {children}
    </label>
  );
}
