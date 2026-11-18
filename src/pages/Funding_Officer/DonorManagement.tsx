import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Download,
  Plus,
  Filter,
  MoreHorizontal,
  X,
  Users,
  Loader2,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle2,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { donorService } from "../../services/donorService";
import type {
  Donor,
  DonorSummary,
  DonorVerification,
  DonorStatusType,
} from "../../types/donor";

export default function DonorManagement() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [summary, setSummary] = useState<DonorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("All types");
  const [verificationFilter, setVerificationFilter] = useState("All verification states");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");
  const [scopeFilter, setScopeFilter] = useState("All scopes");
  const [minContributionFilter, setMinContributionFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<Donor | null>(null);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [toast, setToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [newDonor, setNewDonor] = useState({
    name: "",
    type: "Foundation",
    contact: "",
    scope: "National",
    address: "",
    notes: "",
  });

  const pageSize = 4;

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Load KPI Summary
  const loadSummary = useCallback(async () => {
    try {
      const data = await donorService.getDonorSummary();
      setSummary(data);
    } catch {
      // Graceful fallback
    }
  }, []);

  // Load Donors
  const loadDonors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const minContrib = minContributionFilter ? parseFloat(minContributionFilter) : undefined;
      const result = await donorService.getDonors({
        page: currentPage,
        pageSize,
        search: debouncedSearch || undefined,
        type: typeFilter !== "All types" ? typeFilter : undefined,
        verification:
          verificationFilter !== "All verification states"
            ? verificationFilter
            : undefined,
        status: statusFilter !== "All statuses" ? statusFilter : undefined,
        scope: scopeFilter !== "All scopes" ? scopeFilter : undefined,
        dateRange: dateFilter !== "Date range" ? dateFilter : undefined,
        minContribution: !isNaN(minContrib!) ? minContrib : undefined,
      });

      setDonors(result.items || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(result.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || "Failed to load donor profiles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    typeFilter,
    verificationFilter,
    statusFilter,
    scopeFilter,
    dateFilter,
    minContributionFilter,
  ]);

  useEffect(() => {
    loadDonors();
  }, [loadDonors]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // Multi-select
  const toggleSelect = (id: string) => {
    setSelectedDonors((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = donors.map((d) => d.id);
    const allSelected = visibleIds.every((id) => selectedDonors.includes(id));

    setSelectedDonors((prev) =>
      allSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : [...new Set([...prev, ...visibleIds])]
    );
  };

  // Add Donor
  const handleAddDonor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDonor.name.trim() || !newDonor.contact.trim()) {
      notify("Please enter donor name and contact.");
      return;
    }

    setIsSubmitting(true);
    try {
      await donorService.createDonor({
        name: newDonor.name.trim(),
        type: newDonor.type,
        contact: newDonor.contact.trim(),
        scope: newDonor.scope,
        address: newDonor.address.trim() || undefined,
        notes: newDonor.notes.trim() || undefined,
      });

      notify("Donor registered successfully.");
      setShowAddModal(false);
      setNewDonor({
        name: "",
        type: "Foundation",
        contact: "",
        scope: "National",
        address: "",
        notes: "",
      });

      setCurrentPage(1);
      loadDonors();
      loadSummary();
    } catch (err: any) {
      notify(err?.message || "Failed to register donor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Status
  const handleToggleStatus = async (donor: Donor) => {
    const nextStatus: DonorStatusType =
      donor.status === "Restricted" ? "Active" : "Restricted";

    try {
      await donorService.updateStatus(donor.id, nextStatus);
      notify(`Donor marked as ${nextStatus.toLowerCase()}.`);
      setActiveMenu(null);
      loadDonors();
      loadSummary();
    } catch (err: any) {
      notify(err?.message || "Failed to update donor status.");
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action: "Activate" | "Restrict" | "Deactivate") => {
    if (selectedDonors.length === 0) {
      notify("Please select at least one donor.");
      return;
    }

    try {
      const res = await donorService.bulkAction({
        ids: selectedDonors,
        action,
      });
      notify(res.message || `${action} action completed.`);
      setSelectedDonors([]);
      setShowBulkMenu(false);
      loadDonors();
      loadSummary();
    } catch (err: any) {
      notify(err?.message || `Failed to execute ${action} action.`);
    }
  };

  // Delete Donor
  const handleDeleteDonor = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete donor ${id}?`)) {
      return;
    }

    try {
      await donorService.deleteDonor(id);
      notify(`Donor ${id} deleted.`);
      setActiveMenu(null);
      loadDonors();
      loadSummary();
    } catch (err: any) {
      notify(err?.message || "Failed to delete donor.");
    }
  };

  // Export CSV
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allData = await donorService.getAllDonors();
      const recordsToExport = allData && allData.length > 0 ? allData : donors;

      const headers = [
        "Donor ID",
        "Donor",
        "Type",
        "Contact",
        "Scope",
        "Verification",
        "Lifetime Contributions",
        "Status",
        "Address",
        "Notes",
      ];

      const rows = recordsToExport.map((donor) => [
        donor.id,
        donor.name,
        donor.type,
        donor.contact,
        donor.scope,
        donor.verification,
        donor.contributions,
        donor.status,
        donor.address || "",
        donor.notes || "",
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `donor-management-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      URL.revokeObjectURL(url);
      notify("Donor report exported successfully.");
    } catch (err: any) {
      notify(err?.message || "Failed to export donor records.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eef5f7] text-[#123e60] overflow-x-hidden">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-8 py-4">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[8px] mb-7">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={10} />
          <span className="text-slate-500">Funding & Donations</span>
          <ChevronRight size={10} />
          <span className="font-semibold">Donor Management</span>
        </div>

        {/* TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-[21px] font-medium">Donor Management</h1>
            <p className="text-[9px] text-slate-500 mt-1">
              Manage donor profiles, verification, communication preferences, and contribution history.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadDonors();
                loadSummary();
              }}
              title="Refresh donors"
              className="h-[32px] w-[32px] bg-white border border-[#b5cbd8] rounded-lg text-[#23749e] flex items-center justify-center hover:bg-slate-50 transition"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="h-[32px] px-3 bg-white border border-[#b5cbd8] rounded-lg text-[9px] text-[#23749e] flex items-center gap-2 hover:bg-slate-50 transition disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              Export
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="h-[32px] px-3 bg-[#23749e] text-white rounded-lg text-[9px] font-semibold flex items-center gap-2 hover:bg-[#175c80] transition shadow-sm"
            >
              <Plus size={13} />
              Add donor
            </button>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between text-red-700 text-xs">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadDonors()}
              className="text-xs font-semibold underline hover:no-underline ml-4"
            >
              Try Again
            </button>
          </div>
        )}

        {/* SEARCH AND FILTERS */}
        <section className="flex flex-col lg:flex-row gap-2 mb-2.5">
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search donor name, ID, contact, or type..."
              className="w-full h-[35px] bg-white border border-[#d5e3e9] rounded-lg pl-8 pr-3 text-[9px] outline-none focus:border-[#39ae90] transition"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2">
            <FilterSelect
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value);
                setCurrentPage(1);
              }}
              options={[
                "All types",
                "Foundation",
                "Corporate",
                "International NGO",
                "Community Group",
                "Individual",
              ]}
            />

            <FilterSelect
              value={verificationFilter}
              onChange={(value) => {
                setVerificationFilter(value);
                setCurrentPage(1);
              }}
              options={[
                "All verification states",
                "Verified",
                "Under Review",
                "Pending",
              ]}
            />

            <FilterSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              options={["All statuses", "Active", "Restricted", "Inactive"]}
            />

            <FilterSelect
              value={dateFilter}
              onChange={(value) => {
                setDateFilter(value);
                setCurrentPage(1);
              }}
              options={[
                "Date range",
                "Last 7 days",
                "Last 30 days",
                "Last 90 days",
                "This year",
              ]}
            />

            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`h-[35px] px-3 bg-white border rounded-lg text-[9px] flex items-center justify-center gap-2 hover:bg-slate-50 transition whitespace-nowrap ${
                showMoreFilters || scopeFilter !== "All scopes" || minContributionFilter
                  ? "border-[#23749e] text-[#23749e] font-semibold"
                  : "border-[#b5cbd8]"
              }`}
            >
              <Filter size={12} />
              More filters
              {(scopeFilter !== "All scopes" || minContributionFilter) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#23749e]" />
              )}
            </button>
          </div>
        </section>

        {/* MORE FILTERS TRAY */}
        {showMoreFilters && (
          <div className="bg-white rounded-lg border border-[#d5e3e9] p-3 mb-3 flex flex-wrap items-center gap-3 shadow-sm">
            <div>
              <p className="text-[8px] text-slate-500 mb-1">Minimum contribution ($)</p>
              <input
                type="number"
                value={minContributionFilter}
                onChange={(e) => {
                  setMinContributionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="e.g. 50000"
                className="border border-[#d5e3e9] rounded-md px-2 py-1.5 text-[9px] outline-none focus:border-[#39ae90] w-36"
              />
            </div>

            <div>
              <p className="text-[8px] text-slate-500 mb-1">Donor scope</p>
              <select
                value={scopeFilter}
                onChange={(e) => {
                  setScopeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-[#d5e3e9] rounded-md px-2 py-1.5 text-[9px] outline-none focus:border-[#39ae90] bg-white cursor-pointer"
              >
                <option value="All scopes">All scopes</option>
                <option value="International">International</option>
                <option value="National">National</option>
                <option value="Greater Riverton">Greater Riverton</option>
              </select>
            </div>

            <button
              onClick={() => {
                setScopeFilter("All scopes");
                setMinContributionFilter("");
                setCurrentPage(1);
                notify("Additional filters reset.");
              }}
              className="text-[9px] text-[#23749e] hover:underline mt-4"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* DONOR TABLE */}
        <section className="bg-white rounded-lg border border-[#d5e3e9] shadow-sm overflow-hidden">
          {/* TABLE HEADER */}
          <div className="min-h-[52px] px-3 flex items-center justify-between border-b border-[#d7e4e9]">
            <div>
              <h2 className="text-[10px] font-medium">Donor Management</h2>
              <p className="text-[8px] text-slate-400 mt-0.5">
                {totalCount} total donor{totalCount === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                className="h-[31px] px-3 bg-white border border-[#b5cbd8] rounded-lg text-[8px] hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                Bulk actions
                <ChevronDown size={11} />
              </button>

              {showBulkMenu && (
                <div className="absolute right-0 top-9 z-20 w-44 bg-white border border-slate-200 rounded-lg shadow-lg p-1">
                  <div className="px-2 py-1 text-[8px] font-semibold text-slate-400 uppercase tracking-wider">
                    With selected ({selectedDonors.length})
                  </div>
                  <button
                    onClick={() => handleBulkAction("Activate")}
                    className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded flex items-center gap-2"
                  >
                    <CheckCircle2 size={12} className="text-[#159b79]" />
                    Activate selected
                  </button>
                  <button
                    onClick={() => handleBulkAction("Restrict")}
                    className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded flex items-center gap-2 text-amber-600"
                  >
                    <ShieldAlert size={12} className="text-amber-500" />
                    Restrict selected
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RESPONSIVE TABLE */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="h-[28px] bg-[#f5f8f9] border-b border-[#d5e3e9] text-[7px] text-slate-500">
                  <th className="px-2.5 font-medium w-8">
                    <input
                      type="checkbox"
                      checked={
                        donors.length > 0 &&
                        donors.every((d) => selectedDonors.includes(d.id))
                      }
                      onChange={toggleSelectAll}
                      className="accent-[#23749e] w-3 h-3 cursor-pointer"
                    />
                  </th>
                  <th className="px-2 font-medium">Donor ID</th>
                  <th className="px-2 font-medium">Donor</th>
                  <th className="px-2 font-medium">Type</th>
                  <th className="px-2 font-medium">Contact</th>
                  <th className="px-2 font-medium">Scope</th>
                  <th className="px-2 font-medium">Verification</th>
                  <th className="px-2 font-medium">Lifetime Contributions</th>
                  <th className="px-2 font-medium">Status</th>
                  <th className="px-2 font-medium w-10"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="h-[38px] border-b border-[#e1eaf0] animate-pulse">
                      <td className="px-2.5">
                        <div className="w-3 h-3 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-3 w-28 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-3 w-20 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-3 w-24 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-4 w-14 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-4 w-12 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2"></td>
                    </tr>
                  ))
                ) : donors.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <Users size={24} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-[10px] text-slate-500 font-medium">
                        No donors found.
                      </p>
                      <button
                        onClick={() => {
                          setSearch("");
                          setTypeFilter("All types");
                          setVerificationFilter("All verification states");
                          setStatusFilter("All statuses");
                          setScopeFilter("All scopes");
                          setDateFilter("Date range");
                          setMinContributionFilter("");
                          setCurrentPage(1);
                        }}
                        className="text-[9px] text-[#23749e] hover:underline mt-2 inline-block"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  donors.map((donor, index) => (
                    <tr
                      key={donor.id}
                      className={`h-[36px] border-b border-[#e1eaf0] hover:bg-[#f0f8fa] transition ${
                        index % 2 === 1 ? "bg-[#f7fafb]" : "bg-white"
                      }`}
                    >
                      <td className="px-2.5">
                        <input
                          type="checkbox"
                          checked={selectedDonors.includes(donor.id)}
                          onChange={() => toggleSelect(donor.id)}
                          className="accent-[#23749e] w-3 h-3 cursor-pointer"
                        />
                      </td>

                      <td className="px-2 text-[7px] font-semibold whitespace-nowrap">
                        <button
                          onClick={() => setShowDetailsModal(donor)}
                          className="hover:underline text-[#23749e]"
                        >
                          {donor.id}
                        </button>
                      </td>

                      <td className="px-2 text-[7px] font-medium whitespace-nowrap">
                        {donor.name}
                      </td>

                      <td className="px-2 text-[7px] whitespace-nowrap text-slate-600">
                        {donor.type}
                      </td>

                      <td className="px-2 text-[7px] whitespace-nowrap text-slate-500">
                        {donor.contact}
                      </td>

                      <td className="px-2 text-[7px] whitespace-nowrap text-slate-600">
                        {donor.scope}
                      </td>

                      <td className="px-2 whitespace-nowrap">
                        <VerificationBadge status={donor.verification} />
                      </td>

                      <td className="px-2 text-[7px] whitespace-nowrap">
                        <span className="bg-[#e7f2f8] text-[#23749e] rounded px-2 py-0.5 font-semibold">
                          ${donor.contributions.toLocaleString("en-US")}
                        </span>
                      </td>

                      <td className="px-2 text-[7px] whitespace-nowrap">
                        <DonorStatus status={donor.status} />
                      </td>

                      <td className="px-2 relative">
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === donor.id ? null : donor.id
                            )
                          }
                          className="text-slate-500 hover:text-[#23749e] p-1 rounded hover:bg-slate-100 transition"
                        >
                          <MoreHorizontal size={15} />
                        </button>

                        {activeMenu === donor.id && (
                          <div className="absolute right-4 top-6 z-30 bg-white border border-slate-200 shadow-lg rounded-lg w-40 p-1">
                            <button
                              onClick={() => {
                                setShowDetailsModal(donor);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded flex items-center gap-2"
                            >
                              <Eye size={12} className="text-slate-400" />
                              View profile
                            </button>

                            <button
                              onClick={() => {
                                setSelectedDonors([donor.id]);
                                notify(`Donor ${donor.id} selected.`);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded"
                            >
                              Select donor
                            </button>

                            <button
                              onClick={() => handleToggleStatus(donor)}
                              className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded"
                            >
                              {donor.status === "Restricted"
                                ? "Activate donor"
                                : "Restrict donor"}
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              onClick={() => handleDeleteDonor(donor.id)}
                              className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-red-50 text-red-600 rounded flex items-center gap-2"
                            >
                              <Trash2 size={12} />
                              Delete profile
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="min-h-[43px] px-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#d7e4e9]">
            <p className="text-[8px] text-slate-400">
              Showing{" "}
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, totalCount)} of{" "}
              {totalCount.toLocaleString()}
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-[25px] px-3 border border-[#d5e3e9] rounded-md text-[8px] disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                let pageNumber: number;
                if (totalPages <= 5) {
                  pageNumber = index + 1;
                } else if (currentPage <= 3) {
                  pageNumber = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index;
                } else {
                  pageNumber = currentPage - 2 + index;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-[24px] h-[25px] rounded-md border text-[8px] transition ${
                      currentPage === pageNumber
                        ? "bg-[#23749e] border-[#23749e] text-white font-semibold"
                        : "bg-white border-[#d5e3e9] hover:bg-slate-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                disabled={currentPage >= totalPages || loading}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-[25px] px-3 border border-[#b5cbd8] rounded-md text-[8px] disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ADD DONOR MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddDonor}
            className="bg-white rounded-xl shadow-xl w-full max-w-[430px] p-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[16px] font-semibold">Register new donor</h2>
                <p className="text-[9px] text-slate-400 mt-1">
                  Enter the donor profile and contact information below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-3">
              <FormField label="Donor name">
                <input
                  required
                  value={newDonor.name}
                  onChange={(e) =>
                    setNewDonor({
                      ...newDonor,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter donor or organization name"
                  className="w-full border border-[#d5e3e9] rounded-lg px-3 py-2 text-[10px] outline-none focus:border-[#23749e]"
                />
              </FormField>

              <FormField label="Donor type">
                <select
                  value={newDonor.type}
                  onChange={(e) =>
                    setNewDonor({
                      ...newDonor,
                      type: e.target.value,
                    })
                  }
                  className="w-full border border-[#d5e3e9] rounded-lg px-3 py-2 text-[10px] outline-none focus:border-[#23749e] bg-white cursor-pointer"
                >
                  <option value="Foundation">Foundation</option>
                  <option value="Corporate">Corporate</option>
                  <option value="International NGO">International NGO</option>
                  <option value="Community Group">Community Group</option>
                  <option value="Individual">Individual</option>
                </select>
              </FormField>

              <FormField label="Contact email">
                <input
                  required
                  type="email"
                  value={newDonor.contact}
                  onChange={(e) =>
                    setNewDonor({
                      ...newDonor,
                      contact: e.target.value,
                    })
                  }
                  placeholder="e.g. contact@domain.org"
                  className="w-full border border-[#d5e3e9] rounded-lg px-3 py-2 text-[10px] outline-none focus:border-[#23749e]"
                />
              </FormField>

              <FormField label="Donor scope">
                <select
                  value={newDonor.scope}
                  onChange={(e) =>
                    setNewDonor({
                      ...newDonor,
                      scope: e.target.value,
                    })
                  }
                  className="w-full border border-[#d5e3e9] rounded-lg px-3 py-2 text-[10px] outline-none focus:border-[#23749e] bg-white cursor-pointer"
                >
                  <option value="National">National</option>
                  <option value="International">International</option>
                  <option value="Greater Riverton">Greater Riverton</option>
                </select>
              </FormField>

              <FormField label="Address / Location (optional)">
                <input
                  value={newDonor.address}
                  onChange={(e) =>
                    setNewDonor({
                      ...newDonor,
                      address: e.target.value,
                    })
                  }
                  placeholder="e.g. Colombo 03, Sri Lanka"
                  className="w-full border border-[#d5e3e9] rounded-lg px-3 py-2 text-[10px] outline-none focus:border-[#23749e]"
                />
              </FormField>

              <FormField label="Notes (optional)">
                <input
                  value={newDonor.notes}
                  onChange={(e) =>
                    setNewDonor({
                      ...newDonor,
                      notes: e.target.value,
                    })
                  }
                  placeholder="e.g. Focus areas, recurring grant program details"
                  className="w-full border border-[#d5e3e9] rounded-lg px-3 py-2 text-[10px] outline-none focus:border-[#23749e]"
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-[10px] hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-[#23749e] text-white rounded-lg text-[10px] font-semibold hover:bg-[#175c80] transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                Register donor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[480px] p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#e1eaf0]">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  Donor Profile
                </span>
                <h2 className="text-[18px] font-bold text-[#123e60]">
                  {showDetailsModal.name}
                </h2>
                <span className="text-[10px] text-slate-500 font-mono">
                  {showDetailsModal.id}
                </span>
              </div>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Donor Type</span>
                <span className="font-semibold text-[#123e60]">
                  {showDetailsModal.type}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Contact Email</span>
                <span className="font-medium">{showDetailsModal.contact}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Operational Scope</span>
                <span className="font-medium">{showDetailsModal.scope}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Lifetime Contributions</span>
                <span className="font-bold text-[#23749e]">
                  ${showDetailsModal.contributions.toLocaleString("en-US")}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Verification</span>
                <VerificationBadge status={showDetailsModal.verification} />
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Status</span>
                <DonorStatus status={showDetailsModal.status} />
              </div>
              {showDetailsModal.address && (
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Address</span>
                  <span className="text-slate-700">{showDetailsModal.address}</span>
                </div>
              )}
              {showDetailsModal.notes && (
                <div className="pt-1">
                  <span className="block text-slate-400 mb-1">Notes / Description</span>
                  <p className="bg-[#f5f8f9] p-2.5 rounded-lg text-slate-600 text-[10px]">
                    {showDetailsModal.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#e1eaf0]">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 bg-[#23749e] text-white rounded-lg text-[10px] font-semibold hover:bg-[#175c80] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] bg-[#123e60] text-white rounded-lg px-4 py-3 shadow-xl text-[10px] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span>{toast}</span>
          <button onClick={() => setToast("")} className="hover:text-slate-300">
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// FILTER SELECT
// ============================================

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
        className="appearance-none w-full lg:w-[125px] h-[35px] bg-white border border-[#d5e3e9] rounded-lg pl-2 pr-6 text-[8px] outline-none focus:border-[#39ae90] cursor-pointer transition"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
      />
    </div>
  );
}

// ============================================
// VERIFICATION BADGE
// ============================================

function VerificationBadge({
  status,
}: {
  status: Donor["verification"];
}) {
  const styles = {
    Verified: "bg-[#e4f6f0] text-[#159b79]",
    "Under Review": "bg-[#fff3dd] text-[#bd7b17]",
    Pending: "bg-[#e8f1f6] text-[#23749e]",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-[7px] whitespace-nowrap font-medium inline-block ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
  );
}

// ============================================
// DONOR STATUS
// ============================================

function DonorStatus({
  status,
}: {
  status: Donor["status"];
}) {
  const styles = {
    Active: "bg-[#e4f6f0] text-[#159b79]",
    Restricted: "bg-[#fff3dd] text-[#bd7b17]",
    Inactive: "bg-[#edf1f3] text-slate-500",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-[7px] font-semibold whitespace-nowrap inline-block ${
        styles[status] || styles.Inactive
      }`}
    >
      {status}
    </span>
  );
}

// ============================================
// FORM FIELD
// ============================================

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[9px] font-medium mb-1.5 text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
