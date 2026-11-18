import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  Download,
  Filter,
  X,
  MoreHorizontal,
  CheckCircle2,
  Receipt,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { expenditureService } from "../../services/expenditureService";
import type {
  Expenditure,
  ExpenditureSummary,
  CreateExpenditureInput,
} from "../../types/expenditure";

// ============================================================
// HELPERS
// ============================================================

const currency = (amount: number) => "$" + amount.toLocaleString("en-US");

const verificationStyle = (status: string) => {
  switch (status) {
    case "Verified":
      return "bg-[#e5f6f0] text-[#078c70]";
    case "Pending Review":
      return "bg-[#fff3dd] text-[#b7791f]";
    case "Rejected":
      return "bg-[#fde9eb] text-[#d83e4b]";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const paymentStyle = (status: string) => {
  switch (status) {
    case "Paid":
      return "bg-[#e5f6f0] text-[#078c70]";
    case "On Hold":
      return "bg-[#fff3dd] text-[#b7791f]";
    default:
      return "bg-[#edf2f5] text-[#55738a]";
  }
};

const PAGE_SIZE = 10;

// ============================================================
// MAIN PAGE
// ============================================================

export default function Expenditure() {
  // ---- Data state ----
  const [items, setItems] = useState<Expenditure[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState<ExpenditureSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ---- Filter state ----
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [verificationFilter, setVerificationFilter] = useState("All verification states");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");
  const [showFilters, setShowFilters] = useState(false);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // ---- UI state ----
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expenditure | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [toastError, setToastError] = useState(false);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  // ---- New expense form ----
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    recipient: "",
    invoice: "",
    date: new Date().toISOString().slice(0, 10),
    type: "Shelter",
    notes: "",
  });

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================
  // FETCH
  // ============================================================

  const fetchData = useCallback(async (currentPage: number, currentSearch: string) => {
    setLoading(true);
    setError(null);
    try {
      const [pagedResult, summaryResult] = await Promise.all([
        expenditureService.getPaged({
          search: currentSearch,
          type: typeFilter,
          verification: verificationFilter,
          paymentStatus: statusFilter,
          dateRange: dateFilter,
          minAmount: minAmount ? Number(minAmount) : undefined,
          maxAmount: maxAmount ? Number(maxAmount) : undefined,
          page: currentPage,
          pageSize: PAGE_SIZE,
        }),
        expenditureService.getSummary(),
      ]);
      setItems(pagedResult.items);
      setTotalCount(pagedResult.totalCount);
      setSummary(summaryResult);
    } catch {
      setError("Failed to load expenditure data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, verificationFilter, statusFilter, dateFilter, minAmount, maxAmount]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchData(1, search);
    }, 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search, typeFilter, verificationFilter, statusFilter, dateFilter, fetchData]);

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
  // CREATE EXPENSE
  // ============================================================

  const handleCreateExpense = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const amount = Number(newExpense.amount);
    if (!Number.isFinite(amount) || amount <= 0 || !newExpense.description.trim() ||
        !newExpense.recipient.trim() || !newExpense.invoice.trim()) {
      notify("Please enter valid expense details.", true);
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateExpenditureInput = {
        amount,
        description: newExpense.description,
        recipient: newExpense.recipient,
        invoice: newExpense.invoice,
        expenseDate: new Date(newExpense.date).toISOString(),
        type: newExpense.type,
        notes: newExpense.notes,
      };
      await expenditureService.create(payload);
      setNewExpense({
        amount: "", description: "", recipient: "",
        invoice: "", date: new Date().toISOString().slice(0, 10),
        type: "Shelter", notes: "",
      });
      setShowModal(false);
      setPage(1);
      await fetchData(1, search);
      notify("Expense recorded successfully.");
    } catch {
      notify("Failed to create expense. Please try again.", true);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // VERIFY / REJECT / MARK PAID
  // ============================================================

  const verifyExpense = async (id: string) => {
    try {
      const updated = await expenditureService.updateVerification(id, "Verified");
      setItems(prev => prev.map(e => e.id === id ? updated : e));
      setActiveMenu(null);
      setSelectedExpense(prev => prev?.id === id ? updated : prev);
      notify("Expense verified successfully.");
    } catch {
      notify("Failed to verify expense.", true);
    }
  };

  const rejectExpense = async (id: string) => {
    try {
      const updated = await expenditureService.updateVerification(id, "Rejected");
      setItems(prev => prev.map(e => e.id === id ? updated : e));
      setActiveMenu(null);
      setSelectedExpense(prev => prev?.id === id ? updated : prev);
      notify("Expense rejected.");
    } catch {
      notify("Failed to reject expense.", true);
    }
  };

  const markAsPaid = async (id: string) => {
    const expense = items.find(e => e.id === id);
    if (!expense || expense.verification !== "Verified") {
      notify("Only verified expenses can be marked as paid.", true);
      return;
    }
    try {
      const updated = await expenditureService.updatePayment(id, "Paid");
      setItems(prev => prev.map(e => e.id === id ? updated : e));
      setActiveMenu(null);
      setSelectedExpense(prev => prev?.id === id ? updated : prev);
      notify("Payment marked as paid.");
    } catch {
      notify("Failed to update payment status.", true);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await expenditureService.delete(id);
      setActiveMenu(null);
      setSelectedExpense(null);
      setSelectedRows(prev => prev.filter(r => r !== id));
      await fetchData(page, search);
      notify("Expense deleted.");
    } catch {
      notify("Failed to delete expense.", true);
    }
  };

  // ============================================================
  // SELECTION & BULK
  // ============================================================

  const toggleRow = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    const allSelected = items.length > 0 && items.every(e => selectedRows.includes(e.id));
    if (allSelected) {
      setSelectedRows(prev => prev.filter(id => !items.some(e => e.id === id)));
    } else {
      setSelectedRows(prev => [...new Set([...prev, ...items.map(e => e.id)])]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedRows.length === 0) {
      notify("Please select expenses first.", true);
      return;
    }
    setBulkMenuOpen(false);
    try {
      const result = await expenditureService.bulkAction({ ids: selectedRows, action });
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
      const all = await expenditureService.getAll();
      const headers = ["Expense ID", "Amount", "Description", "Recipient", "Invoice", "Date", "Verification", "Payment Status", "Type"];
      const rows = all.map(e => [e.id, e.amount, e.description, e.recipient, e.invoice, e.date, e.verification, e.paymentStatus, e.type]);
      const csv = [headers, ...rows]
        .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "carelink-expenditure.csv";
      link.click();
      URL.revokeObjectURL(url);
      notify("Expenditure report exported.");
    } catch {
      notify("Failed to export data.", true);
    }
  };

  // ============================================================
  // FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All types");
    setVerificationFilter("All verification states");
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
      onClick={() => { setActiveMenu(null); setBulkMenuOpen(false); }}
    >
      <main className="max-w-[1600px] mx-auto px-5 md:px-8 py-4">

        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[9px] mb-8">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={11} />
          <span className="text-slate-500">Funding &amp; Donations</span>
          <ChevronRight size={11} />
          <span className="font-semibold">Expenditure</span>
        </div>

        {/* PAGE TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[25px] font-medium">Expenditure</h1>
            <p className="text-[11px] text-slate-500 mt-1">
              Record and verify humanitarian expenditure against approved allocations.
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
              Record expense
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <SummaryCard
              label="Total Expenditure"
              value={currency(summary.totalExpenditure)}
              sub={`${summary.totalCount} records`}
              color="#23749e"
            />
            <SummaryCard
              label="Total Paid"
              value={currency(summary.totalPaid)}
              sub={`${summary.paidCount} paid`}
              color="#078c70"
            />
            <SummaryCard
              label="Pending Review"
              value={String(summary.pendingReviewCount)}
              sub="awaiting verification"
              color="#b7791f"
            />
            <SummaryCard
              label="On Hold"
              value={currency(summary.totalOnHold)}
              sub={`${summary.onHoldCount} on hold`}
              color="#d83e4b"
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
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search expense, invoice, or recipient..."
              className="w-full h-[40px] bg-white border border-[#d5e3e9] rounded-lg pl-10 pr-3 text-[10px] outline-none focus:border-[#35b995]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2">
            <FilterSelect
              value={typeFilter}
              onChange={v => { setTypeFilter(v); setPage(1); }}
              options={["All types", "Shelter", "Transport", "Medical", "Water", "Other"]}
            />
            <FilterSelect
              value={verificationFilter}
              onChange={v => { setVerificationFilter(v); setPage(1); }}
              options={["All verification states", "Verified", "Pending Review", "Rejected"]}
            />
            <FilterSelect
              value={statusFilter}
              onChange={v => { setStatusFilter(v); setPage(1); }}
              options={["All statuses", "Paid", "On Hold", "Pending"]}
            />
            <FilterSelect
              value={dateFilter}
              onChange={v => { setDateFilter(v); setPage(1); }}
              options={["Date range", "Last 7 days", "Last 30 days", "Last 90 days"]}
            />
            <button
              onClick={e => { e.stopPropagation(); setShowFilters(!showFilters); }}
              className="h-[40px] px-4 bg-white border border-[#b9cfda] rounded-lg text-[10px] text-[#23749e] flex items-center justify-center gap-2 whitespace-nowrap hover:bg-[#f5fafc]"
            >
              <Filter size={14} />
              More filters
            </button>
          </div>
        </section>

        {/* ADDITIONAL FILTERS */}
        {showFilters && (
          <div
            className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-4 flex flex-wrap items-end gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <label className="block text-[9px] text-slate-500 mb-1.5">Minimum amount</label>
              <input
                type="number"
                value={minAmount}
                onChange={e => setMinAmount(e.target.value)}
                placeholder="Minimum USD"
                className="h-[35px] border border-[#d5e3e9] rounded-lg px-3 text-[10px] outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] text-slate-500 mb-1.5">Maximum amount</label>
              <input
                type="number"
                value={maxAmount}
                onChange={e => setMaxAmount(e.target.value)}
                placeholder="Maximum USD"
                className="h-[35px] border border-[#d5e3e9] rounded-lg px-3 text-[10px] outline-none"
              />
            </div>
            <button
              onClick={() => { setPage(1); fetchData(1, search); setShowFilters(false); }}
              className="h-[35px] px-4 bg-[#23749e] text-white rounded-lg text-[10px]"
            >
              Apply filters
            </button>
            <button onClick={clearFilters} className="h-[35px] px-3 text-[#23749e] text-[10px]">
              Clear filters
            </button>
          </div>
        )}

        {/* EXPENDITURE TABLE */}
        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-visible">

          {/* TABLE HEADER */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-[#d7e4e9]">
            <div>
              <h2 className="text-[13px] font-medium">Expenditure</h2>
              <p className="text-[9px] text-slate-400 mt-1">
                {loading ? "Loading..." : `${totalCount} record${totalCount !== 1 ? "s" : ""}`}
              </p>
            </div>

            {/* BULK ACTIONS */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setBulkMenuOpen(prev => !prev)}
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
                    { label: "Mark as paid", action: "Pay" },
                    { label: "Place on hold", action: "Hold" },
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

          {/* TABLE BODY */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="bg-[#f5f8f9] border-b border-[#d7e4e9]">
                  <th className="px-3 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={items.length > 0 && items.every(e => selectedRows.includes(e.id))}
                      onChange={toggleAll}
                      className="accent-[#23749e]"
                    />
                  </th>
                  {["Expense ID", "Amount", "Description", "Recipient", "Invoice", "Date", "Verification", "Payment Status"].map(h => (
                    <th key={h} className="px-3 py-3 text-[9px] font-medium text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                  <th className="px-3 py-3" />
                </tr>
              </thead>

              <tbody>
                {/* LOADING SKELETONS */}
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[#e3ebef]">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <td key={j} className="px-3 py-4">
                        <div className="h-3 bg-slate-100 rounded animate-pulse w-16" />
                      </td>
                    ))}
                  </tr>
                ))}

                {/* DATA ROWS */}
                {!loading && items.map(expense => (
                  <tr
                    key={expense.id}
                    className="border-b border-[#e3ebef] hover:bg-[#f8fbfc] transition-colors"
                  >
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(expense.id)}
                        onChange={() => toggleRow(expense.id)}
                        className="accent-[#23749e]"
                      />
                    </td>
                    <td className="px-3 py-4 text-[10px] font-semibold whitespace-nowrap">{expense.id}</td>
                    <td className="px-3 py-4 text-[10px] whitespace-nowrap">{currency(expense.amount)}</td>
                    <td className="px-3 py-4 text-[10px] whitespace-nowrap max-w-[200px] truncate">{expense.description}</td>
                    <td className="px-3 py-4 text-[10px] whitespace-nowrap">{expense.recipient}</td>
                    <td className="px-3 py-4 text-[10px] whitespace-nowrap">{expense.invoice}</td>
                    <td className="px-3 py-4 text-[10px] whitespace-nowrap">{expense.date}</td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex px-2.5 py-1.5 rounded-md text-[9px] font-semibold whitespace-nowrap ${verificationStyle(expense.verification)}`}>
                        {expense.verification}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex px-2.5 py-1.5 rounded-md text-[9px] font-semibold whitespace-nowrap ${paymentStyle(expense.paymentStatus)}`}>
                        {expense.paymentStatus}
                      </span>
                    </td>

                    {/* THREE-DOT MENU */}
                    <td className="px-3 py-4 relative" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveMenu(prev => prev === expense.id ? null : expense.id)}
                        className="p-1.5 text-slate-400 hover:text-[#23749e]"
                      >
                        <MoreHorizontal size={17} />
                      </button>

                      {activeMenu === expense.id && (
                        <div className="absolute right-8 top-8 z-30 w-48 bg-white border border-[#d5e3e9] rounded-lg shadow-lg py-1">
                          <button
                            onClick={() => { setSelectedExpense(expense); setActiveMenu(null); }}
                            className="w-full text-left px-3 py-2 text-[10px] hover:bg-[#f1f6f8]"
                          >
                            View expense details
                          </button>

                          {expense.verification === "Pending Review" && (
                            <>
                              <button
                                onClick={() => verifyExpense(expense.id)}
                                className="w-full text-left px-3 py-2 text-[10px] text-[#159b79] hover:bg-[#f1f6f8]"
                              >
                                Verify expense
                              </button>
                              <button
                                onClick={() => rejectExpense(expense.id)}
                                className="w-full text-left px-3 py-2 text-[10px] text-red-500 hover:bg-[#f1f6f8]"
                              >
                                Reject expense
                              </button>
                            </>
                          )}

                          {expense.verification === "Verified" && expense.paymentStatus !== "Paid" && (
                            <button
                              onClick={() => markAsPaid(expense.id)}
                              className="w-full text-left px-3 py-2 text-[10px] text-[#23749e] hover:bg-[#f1f6f8]"
                            >
                              Mark as paid
                            </button>
                          )}

                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="w-full text-left px-3 py-2 text-[10px] text-red-400 hover:bg-[#f1f6f8] border-t border-slate-100 mt-1"
                          >
                            Delete expense
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
                      <Receipt size={27} className="mx-auto text-slate-300 mb-3" />
                      <p className="text-[11px] font-medium">No expenditure records found</p>
                      <p className="text-[9px] text-slate-400 mt-1">Try changing your search or filters.</p>
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
                : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, totalCount)} of ${totalCount.toLocaleString()}`}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1 || loading}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="h-[34px] px-4 border border-[#d5e3e9] rounded-lg text-[9px] disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNum = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-[34px] h-[34px] border rounded-lg text-[9px] ${
                      page === pageNum ? "bg-[#23749e] text-white border-[#23749e]" : "bg-white border-[#d5e3e9]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="h-[34px] px-4 border border-[#b9cfda] rounded-lg text-[9px] text-[#23749e] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* RECORD EXPENSE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <form
            onSubmit={handleCreateExpense}
            className="bg-white rounded-xl shadow-xl w-full max-w-[470px] max-h-[90vh] overflow-y-auto p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-[16px] font-semibold">Record expense</h2>
                <p className="text-[9px] text-slate-400 mt-1">Enter the expenditure and invoice details.</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500">
                <X size={19} />
              </button>
            </div>

            <div className="space-y-3">
              <FormField label="Expense amount (USD)">
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="expenditure-input"
                />
              </FormField>

              <FormField label="Expense description">
                <input
                  required
                  value={newExpense.description}
                  onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="e.g. Emergency shelter kits"
                  className="expenditure-input"
                />
              </FormField>

              <FormField label="Expense type">
                <select
                  value={newExpense.type}
                  onChange={e => setNewExpense({ ...newExpense, type: e.target.value })}
                  className="expenditure-input"
                >
                  <option value="Shelter">Shelter</option>
                  <option value="Transport">Transport</option>
                  <option value="Medical">Medical</option>
                  <option value="Water">Water</option>
                  <option value="Other">Other</option>
                </select>
              </FormField>

              <FormField label="Recipient">
                <input
                  required
                  value={newExpense.recipient}
                  onChange={e => setNewExpense({ ...newExpense, recipient: e.target.value })}
                  placeholder="Enter recipient organisation"
                  className="expenditure-input"
                />
              </FormField>

              <FormField label="Invoice number">
                <input
                  required
                  value={newExpense.invoice}
                  onChange={e => setNewExpense({ ...newExpense, invoice: e.target.value })}
                  placeholder="e.g. INV-4822"
                  className="expenditure-input"
                />
              </FormField>

              <FormField label="Expense date">
                <input
                  type="date"
                  required
                  value={newExpense.date}
                  onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="expenditure-input"
                />
              </FormField>

              <FormField label="Notes (optional)">
                <textarea
                  value={newExpense.notes}
                  onChange={e => setNewExpense({ ...newExpense, notes: e.target.value })}
                  placeholder="Any additional details..."
                  rows={2}
                  className="expenditure-input resize-none"
                />
              </FormField>

              <div className="bg-[#eef5f7] rounded-lg p-3 flex items-start gap-2">
                <ShieldCheck size={16} className="text-[#23749e] shrink-0" />
                <p className="text-[9px] text-slate-600">
                  Newly recorded expenses will be submitted with <strong>Pending Review</strong> status.
                  Payment will remain on hold until verification.
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
                {submitting ? "Saving..." : "Save expense"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EXPENSE DETAILS MODAL */}
      {selectedExpense && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4" onClick={() => setSelectedExpense(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[440px] p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[9px] text-[#23749e] font-semibold">{selectedExpense.id}</p>
                <h2 className="text-[16px] font-semibold mt-1">Expense details</h2>
              </div>
              <button onClick={() => setSelectedExpense(null)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="bg-[#eef5f7] rounded-lg p-4 mb-4">
              <p className="text-[9px] text-slate-500">Expense amount</p>
              <h3 className="text-[25px] font-bold mt-1">{currency(selectedExpense.amount)}</h3>
            </div>

            <div className="space-y-3">
              {[
                ["Description", selectedExpense.description],
                ["Recipient", selectedExpense.recipient],
                ["Invoice", selectedExpense.invoice],
                ["Date", selectedExpense.date],
                ["Type", selectedExpense.type],
                ["Verification", selectedExpense.verification],
                ["Payment status", selectedExpense.paymentStatus],
                ...(selectedExpense.notes ? [["Notes", selectedExpense.notes]] : []),
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                  <span className="text-[9px] text-slate-400">{label}</span>
                  <span className="text-[9px] font-medium text-right">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-2 mt-6">
              {selectedExpense.verification === "Pending Review" && (
                <>
                  <button
                    onClick={() => rejectExpense(selectedExpense.id)}
                    className="px-3 py-2 bg-[#fde9e9] text-red-600 rounded-lg text-[9px]"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => verifyExpense(selectedExpense.id)}
                    className="px-3 py-2 bg-[#e4f6f0] text-[#159b79] rounded-lg text-[9px]"
                  >
                    Verify expense
                  </button>
                </>
              )}
              {selectedExpense.verification === "Verified" && selectedExpense.paymentStatus !== "Paid" && (
                <button
                  onClick={() => markAsPaid(selectedExpense.id)}
                  className="px-3 py-2 bg-[#23749e] text-white rounded-lg text-[9px]"
                >
                  Mark as paid
                </button>
              )}
              <button
                onClick={() => setSelectedExpense(null)}
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
        <div className={`fixed bottom-5 right-5 z-[60] ${toastError ? "bg-red-600" : "bg-[#123e60]"} text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-[10px]`}>
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

// ============================================================
// SUMMARY CARD
// ============================================================

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
      <p className="text-[18px] font-bold" style={{ color }}>{value}</p>
      <p className="text-[9px] text-slate-400 mt-1">{sub}</p>
    </div>
  );
}

// ============================================================
// FILTER SELECT
// ============================================================

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
        onChange={e => onChange(e.target.value)}
        className="appearance-none w-full lg:w-[150px] h-[40px] bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-8 text-[9px] outline-none focus:border-[#35b995] cursor-pointer"
      >
        {options.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[9px] font-medium mb-1.5">{label}</span>
      {children}
    </label>
  );
}
