import { useEffect, useState, useCallback } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  Download,
  Filter,
  X,
  MoreHorizontal,
  Package,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { resourceContributionService } from "../../services/resourceContributionService";
import type {
  ResourceContribution,
  ResourceContributionQueryParams,
} from "../../types/resourceContribution";

const PAGE_SIZE = 10;

export default function ResourceContributions() {
  const [contributions, setContributions] = useState<ResourceContribution[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [verificationFilter, setVerificationFilter] = useState("All verification states");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");
  const [campaignFilter, setCampaignFilter] = useState("All campaigns");
  const [receivedDateFilter, setReceivedDateFilter] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<ResourceContribution | null>(null);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [newContribution, setNewContribution] = useState({
    donor: "",
    type: "Material",
    quantity: "",
    campaign: "Flood Response 2025",
    received: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  };

  const fetchContributions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ResourceContributionQueryParams = {
        page,
        pageSize: PAGE_SIZE,
        search: search.trim() || undefined,
        type: typeFilter !== "All types" ? typeFilter : undefined,
        verification: verificationFilter !== "All verification states" ? verificationFilter : undefined,
        status: statusFilter !== "All statuses" ? statusFilter : undefined,
        campaign: campaignFilter !== "All campaigns" ? campaignFilter : undefined,
        dateRange: dateFilter !== "Date range" ? dateFilter : undefined,
        receivedDate: receivedDateFilter || undefined,
      };

      const res = await resourceContributionService.getPaged(params);
      setContributions(res.items);
      setTotalCount(res.totalCount);
    } catch (err: unknown) {
      console.error("Failed to load resource contributions:", err);
      setError(err instanceof Error ? err.message : "Failed to load resource contributions.");
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, verificationFilter, statusFilter, campaignFilter, dateFilter, receivedDateFilter]);

  useEffect(() => {
    fetchContributions();
  }, [fetchContributions]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ADD CONTRIBUTION
  const handleAddContribution = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newContribution.donor.trim() || !newContribution.quantity.trim()) {
      notify("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await resourceContributionService.create({
        donor: newContribution.donor.trim(),
        type: newContribution.type,
        quantity: newContribution.quantity.trim(),
        campaign: newContribution.campaign,
        receivedDate: newContribution.received,
        notes: newContribution.notes.trim() || undefined,
      });

      setNewContribution({
        donor: "",
        type: "Material",
        quantity: "",
        campaign: "Flood Response 2025",
        received: new Date().toISOString().slice(0, 10),
        notes: "",
      });

      setShowModal(false);
      setPage(1);
      notify("Resource contribution recorded successfully.");
      fetchContributions();
    } catch (err) {
      console.error("Failed to record contribution:", err);
      notify("Failed to record resource contribution. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // VERIFY CONTRIBUTION
  const verifyContribution = async (id: string) => {
    try {
      await resourceContributionService.verify(id, "Verified");
      setActiveMenu(null);
      setSelectedContribution(null);
      notify("Contribution verified successfully.");
      fetchContributions();
    } catch (err) {
      console.error("Failed to verify contribution:", err);
      notify("Failed to verify contribution.");
    }
  };

  // ALLOCATION STATUS
  const updateAllocation = async (id: string) => {
    try {
      await resourceContributionService.allocate(id, "Allocated");
      setActiveMenu(null);
      setSelectedContribution(null);
      notify("Contribution allocated successfully.");
      fetchContributions();
    } catch (err) {
      console.error("Failed to allocate contribution:", err);
      notify("Failed to allocate contribution.");
    }
  };

  // ROW SELECTION
  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (contributions.length > 0 && contributions.every((item) => selectedRows.includes(item.id))) {
      setSelectedRows((prev) => prev.filter((id) => !contributions.some((item) => item.id === id)));
    } else {
      setSelectedRows((prev) => [...new Set([...prev, ...contributions.map((item) => item.id)])]);
    }
  };

  // BULK VERIFICATION
  const handleBulkVerify = async () => {
    if (selectedRows.length === 0) {
      notify("Select at least one contribution.");
      return;
    }

    try {
      const res = await resourceContributionService.bulkVerify(selectedRows);
      setSelectedRows([]);
      notify(`${res.count} contributions verified successfully.`);
      fetchContributions();
    } catch (err) {
      console.error("Failed to bulk verify:", err);
      notify("Failed to verify selected contributions.");
    }
  };

  // EXPORT CSV
  const exportCSV = async () => {
    try {
      const allData = await resourceContributionService.getAll({
        search: search.trim() || undefined,
        type: typeFilter !== "All types" ? typeFilter : undefined,
        verification: verificationFilter !== "All verification states" ? verificationFilter : undefined,
        status: statusFilter !== "All statuses" ? statusFilter : undefined,
        campaign: campaignFilter !== "All campaigns" ? campaignFilter : undefined,
      });

      const headers = [
        "Reference",
        "Donor",
        "Type",
        "Quantity / Value",
        "Campaign",
        "Received",
        "Verification",
        "Allocation",
      ];

      const rows = allData.map((item) => [
        item.id,
        item.donor,
        item.type,
        item.quantity,
        item.campaign,
        item.received,
        item.verification,
        item.allocation,
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resource-contributions-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      notify("Resource contributions exported successfully.");
    } catch (err) {
      console.error("Failed to export contributions:", err);
      notify("Failed to export contributions.");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All types");
    setVerificationFilter("All verification states");
    setStatusFilter("All statuses");
    setDateFilter("Date range");
    setCampaignFilter("All campaigns");
    setReceivedDateFilter("");
    setPage(1);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Verified":
      case "Allocated":
        return "bg-[#e4f6f0] text-[#159b79]";
      case "Pending":
      case "Partially Allocated":
        return "bg-[#e4f1f7] text-[#23749e]";
      case "Flagged":
        return "bg-[#fde9e9] text-[#dc414b]";
      case "Unallocated":
        return "bg-[#fff3dd] text-[#b7791f]";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eef5f7] text-[#123e60] overflow-x-hidden">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-8 py-5">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[11px] mb-6">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={13} />
          <span className="text-slate-500">Funding & Donations</span>
          <ChevronRight size={13} />
          <span className="font-semibold text-[#123e60]">Resource Contributions</span>
        </div>

        {/* PAGE HEADING */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-[28px] font-medium tracking-tight">Resource Contributions</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Track donated food, water, medicine, equipment, and other material aid.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="h-[42px] px-4 bg-white border border-[#b9cfda] rounded-xl text-[12px] text-[#23749e] font-semibold flex items-center gap-2 hover:bg-[#f5fafc] transition-colors shadow-2xs cursor-pointer"
            >
              <Download size={15} />
              Export
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="h-[42px] px-4 bg-[#23749e] hover:bg-[#175c80] text-white rounded-xl text-[12px] font-semibold flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus size={16} />
              Record contribution
            </button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-[13px]">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchContributions}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search material contributions, donors, campaigns..."
              className="w-full h-[42px] bg-white border border-[#d5e3e9] rounded-xl pl-10 pr-3 text-[12px] outline-none focus:border-[#23749e] shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2">
            <FilterSelect
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value);
                setPage(1);
              }}
              options={["All types", "Material", "Monetary"]}
            />

            <FilterSelect
              value={verificationFilter}
              onChange={(value) => {
                setVerificationFilter(value);
                setPage(1);
              }}
              options={["All verification states", "Verified", "Pending", "Flagged"]}
            />

            <FilterSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              options={["All statuses", "Allocated", "Partially Allocated", "Unallocated"]}
            />

            <FilterSelect
              value={dateFilter}
              onChange={(val) => {
                setDateFilter(val);
                setPage(1);
              }}
              options={["Date range", "Last 7 days", "Last 30 days", "Last 90 days"]}
            />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-[42px] px-4 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2 border transition-colors whitespace-nowrap cursor-pointer ${
                showFilters
                  ? "bg-[#e8f1f6] border-[#23749e] text-[#23749e]"
                  : "bg-white border-[#b9cfda] text-[#23749e] hover:bg-[#f5fafc]"
              }`}
            >
              <Filter size={14} />
              More filters
            </button>
          </div>
        </section>

        {/* MORE FILTERS ACCORDION */}
        {showFilters && (
          <div className="bg-white border border-[#d5e3e9] rounded-xl p-4 mb-4 flex flex-wrap items-end gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1.5">
                Campaign
              </label>
              <select
                value={campaignFilter}
                onChange={(e) => {
                  setCampaignFilter(e.target.value);
                  setPage(1);
                }}
                className="h-[38px] border border-[#d5e3e9] rounded-xl px-3 text-[12px] outline-none bg-white focus:border-[#23749e]"
              >
                <option>All campaigns</option>
                <option>Flood Response 2025</option>
                <option>Medical Relief</option>
                <option>Emergency Shelter Fund</option>
                <option>Clean Water Appeal</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1.5">
                Received date
              </label>
              <input
                type="date"
                value={receivedDateFilter}
                onChange={(e) => {
                  setReceivedDateFilter(e.target.value);
                  setPage(1);
                }}
                className="h-[38px] border border-[#d5e3e9] rounded-xl px-3 text-[12px] outline-none focus:border-[#23749e]"
              >
              </input>
            </div>

            <button
              onClick={() => {
                setShowFilters(false);
                notify("Filters applied.");
              }}
              className="h-[38px] px-4 bg-[#23749e] hover:bg-[#175c80] text-white rounded-xl text-[12px] font-medium transition-colors cursor-pointer"
            >
              Apply filters
            </button>

            <button
              onClick={clearFilters}
              className="h-[38px] px-3 text-[#23749e] hover:underline text-[12px] font-medium cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* CONTRIBUTIONS TABLE */}
        <section className="bg-white border border-[#d5e3e9] rounded-2xl shadow-sm overflow-hidden">
          {/* TABLE HEADER */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-[#d7e4e9]">
            <div>
              <h2 className="text-[14px] font-semibold text-[#123e60]">
                Resource Contributions
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {totalCount} total contributions recorded
              </p>
            </div>

            <button
              onClick={handleBulkVerify}
              disabled={selectedRows.length === 0}
              className="h-[38px] px-4 border border-[#b9cfda] rounded-xl text-[12px] font-medium text-[#23749e] hover:bg-[#f5fafc] disabled:opacity-40 transition-colors cursor-pointer"
            >
              Bulk verify {selectedRows.length > 0 && `(${selectedRows.length})`}
            </button>
          </div>

          {/* RESPONSIVE TABLE */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 size={32} className="animate-spin text-[#23749e]" />
                <p className="text-[13px]">Loading resource contributions...</p>
              </div>
            ) : (
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="bg-[#f5f8f9] border-b border-[#d7e4e9]">
                    <th className="px-4 py-3.5 w-10">
                      <input
                        type="checkbox"
                        checked={
                          contributions.length > 0 &&
                          contributions.every((item) => selectedRows.includes(item.id))
                        }
                        onChange={toggleAll}
                        className="accent-[#23749e] cursor-pointer"
                      />
                    </th>

                    {[
                      "Reference",
                      "Donor",
                      "Type",
                      "Quantity / Value",
                      "Campaign",
                      "Received",
                      "Verification",
                      "Allocation",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-3 py-3.5 text-[11px] font-semibold text-slate-500 whitespace-nowrap"
                      >
                        {heading}
                      </th>
                    ))}

                    <th className="px-3 py-3.5 w-12"></th>
                  </tr>
                </thead>

                <tbody>
                  {contributions.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#e3ebef] hover:bg-[#f8fbfc] transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.id)}
                          onChange={() => toggleRow(item.id)}
                          className="accent-[#23749e] cursor-pointer"
                        />
                      </td>

                      <td className="px-3 py-3.5 text-[12px] font-mono font-semibold text-[#123e60] whitespace-nowrap">
                        {item.id}
                      </td>

                      <td className="px-3 py-3.5 text-[12px] font-medium whitespace-nowrap">
                        {item.donor}
                      </td>

                      <td className="px-3 py-3.5 text-[12px] whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {item.type}
                        </span>
                      </td>

                      <td className="px-3 py-3.5 text-[12px] font-semibold whitespace-nowrap">
                        {item.quantity}
                      </td>

                      <td className="px-3 py-3.5 text-[12px] text-slate-600 whitespace-nowrap">
                        {item.campaign}
                      </td>

                      <td className="px-3 py-3.5 text-[12px] text-slate-500 whitespace-nowrap">
                        {item.received}
                      </td>

                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap ${getStatusStyle(
                            item.verification
                          )}`}
                        >
                          {item.verification}
                        </span>
                      </td>

                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap ${getStatusStyle(
                            item.allocation
                          )}`}
                        >
                          {item.allocation}
                        </span>
                      </td>

                      {/* ROW ACTIONS */}
                      <td className="px-3 py-3.5 relative">
                        <button
                          onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                          className="p-1.5 text-slate-400 hover:text-[#23749e] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreHorizontal size={17} />
                        </button>

                        {activeMenu === item.id && (
                          <div className="absolute right-4 top-10 z-30 w-44 bg-white border border-[#d5e3e9] rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
                            <button
                              onClick={() => {
                                setSelectedContribution(item);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-3.5 py-2 text-[12px] text-slate-700 hover:bg-[#f1f6f8] cursor-pointer"
                            >
                              View details
                            </button>

                            {item.verification !== "Verified" && (
                              <button
                                onClick={() => verifyContribution(item.id)}
                                className="w-full text-left px-3.5 py-2 text-[12px] text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                              >
                                Verify contribution
                              </button>
                            )}

                            {item.allocation !== "Allocated" && (
                              <button
                                onClick={() => updateAllocation(item.id)}
                                className="w-full text-left px-3.5 py-2 text-[12px] text-[#23749e] hover:bg-[#eaf3f7] cursor-pointer"
                              >
                                Allocate contribution
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* EMPTY STATE */}
                  {contributions.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-16">
                        <Package size={32} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-[14px] font-medium text-slate-700">No contributions found</p>
                        <p className="text-[12px] text-slate-400 mt-1">
                          Try another search term or change your active filters.
                        </p>
                        <button
                          onClick={clearFilters}
                          className="text-[#23749e] hover:underline text-[12px] font-medium mt-3 cursor-pointer"
                        >
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* PAGINATION */}
          <div className="px-5 py-3.5 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#d7e4e9]">
            <p className="text-[12px] text-slate-500">
              Showing {totalCount > 0 ? (page - 1) * PAGE_SIZE + 1 : 0}–
              {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} records
            </p>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-[34px] px-3.5 border border-[#d5e3e9] bg-white rounded-lg text-[11px] font-medium disabled:opacity-40 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => setPage(number)}
                  className={`w-[34px] h-[34px] border rounded-lg text-[11px] font-semibold cursor-pointer transition-colors ${
                    page === number
                      ? "bg-[#23749e] text-white border-[#23749e]"
                      : "bg-white border-[#d5e3e9] text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-[34px] px-3.5 border border-[#b9cfda] bg-white rounded-lg text-[11px] font-medium text-[#23749e] disabled:opacity-40 hover:bg-[#f5fafc] cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* RECORD CONTRIBUTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <form
            onSubmit={handleAddContribution}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] p-6 animate-in zoom-in-95 duration-150"
          >
            <div className="flex justify-between items-start pb-3 border-b border-[#e4edf1] mb-5">
              <div>
                <h2 className="text-[17px] font-semibold text-[#123e60]">Record contribution</h2>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  Register a new material or resource donation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-red-500 rounded-lg p-1 transition-colors cursor-pointer"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-4">
              <FormField label="Donor name">
                <input
                  required
                  value={newContribution.donor}
                  onChange={(e) =>
                    setNewContribution({ ...newContribution, donor: e.target.value })
                  }
                  placeholder="e.g. Riverton Foods Ltd"
                  className="w-full h-[44px] px-3 border border-[#d5e3e9] rounded-xl text-[12px] outline-none focus:border-[#23749e]"
                />
              </FormField>

              <FormField label="Contribution type">
                <select
                  value={newContribution.type}
                  onChange={(e) =>
                    setNewContribution({ ...newContribution, type: e.target.value })
                  }
                  className="w-full h-[44px] px-3 border border-[#d5e3e9] rounded-xl text-[12px] outline-none bg-white focus:border-[#23749e]"
                >
                  <option>Material</option>
                  <option>Monetary</option>
                </select>
              </FormField>

              <FormField label="Quantity / Value">
                <input
                  required
                  value={newContribution.quantity}
                  onChange={(e) =>
                    setNewContribution({ ...newContribution, quantity: e.target.value })
                  }
                  placeholder="e.g. 5,000 food ration packs"
                  className="w-full h-[44px] px-3 border border-[#d5e3e9] rounded-xl text-[12px] outline-none focus:border-[#23749e]"
                />
              </FormField>

              <FormField label="Campaign">
                <select
                  value={newContribution.campaign}
                  onChange={(e) =>
                    setNewContribution({ ...newContribution, campaign: e.target.value })
                  }
                  className="w-full h-[44px] px-3 border border-[#d5e3e9] rounded-xl text-[12px] outline-none bg-white focus:border-[#23749e]"
                >
                  <option>Flood Response 2025</option>
                  <option>Medical Relief</option>
                  <option>Emergency Shelter Fund</option>
                  <option>Clean Water Appeal</option>
                </select>
              </FormField>

              <FormField label="Received date">
                <input
                  required
                  type="date"
                  value={newContribution.received}
                  onChange={(e) =>
                    setNewContribution({ ...newContribution, received: e.target.value })
                  }
                  className="w-full h-[44px] px-3 border border-[#d5e3e9] rounded-xl text-[12px] outline-none focus:border-[#23749e]"
                />
              </FormField>

              <FormField label="Notes (optional)">
                <input
                  value={newContribution.notes}
                  onChange={(e) =>
                    setNewContribution({ ...newContribution, notes: e.target.value })
                  }
                  placeholder="Additional specifications or logistics notes"
                  className="w-full h-[44px] px-3 border border-[#d5e3e9] rounded-xl text-[12px] outline-none focus:border-[#23749e]"
                />
              </FormField>
            </div>

            <div className="flex justify-end gap-2.5 mt-6 pt-3 border-t border-[#e4edf1]">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 h-[42px] border border-[#d5e3e9] rounded-xl text-[12px] font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 h-[42px] bg-[#23749e] hover:bg-[#175c80] disabled:opacity-50 text-white rounded-xl text-[12px] font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save contribution"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTRIBUTION DETAILS MODAL */}
      {selectedContribution && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[460px] p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-[#e4edf1] mb-5">
              <div>
                <p className="text-[11px] font-mono font-semibold text-[#23749e]">
                  {selectedContribution.id}
                </p>
                <h2 className="text-[17px] font-semibold text-[#123e60] mt-0.5">
                  Contribution details
                </h2>
              </div>

              <button
                onClick={() => setSelectedContribution(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5">
              {[
                ["Donor", selectedContribution.donor],
                ["Type", selectedContribution.type],
                ["Quantity / Value", selectedContribution.quantity],
                ["Campaign", selectedContribution.campaign],
                ["Received", selectedContribution.received],
                ["Verification", selectedContribution.verification],
                ["Allocation", selectedContribution.allocation],
                ["Notes", selectedContribution.notes || "None specified"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between items-center gap-3 border-b border-slate-100 pb-2 text-[12px]"
                >
                  <span className="text-slate-400 font-medium">{label}</span>
                  <span className="font-semibold text-right text-[#123e60]">{value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-6 pt-3 border-t border-[#e4edf1]">
              {selectedContribution.verification !== "Verified" && (
                <button
                  onClick={() => verifyContribution(selectedContribution.id)}
                  className="flex-1 h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Verify now
                </button>
              )}

              {selectedContribution.allocation !== "Allocated" && (
                <button
                  onClick={() => updateAllocation(selectedContribution.id)}
                  className="flex-1 h-[42px] bg-[#23749e] hover:bg-[#175c80] text-white rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
                >
                  Allocate now
                </button>
              )}

              <button
                onClick={() => setSelectedContribution(null)}
                className="h-[42px] px-5 border border-[#d5e3e9] rounded-xl text-[12px] font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] bg-[#123e60] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-[12px] animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-[#57d6ad]" />
          <span>{toast}</span>
          <button
            onClick={() => setToast("")}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}
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
        className="appearance-none w-full lg:w-[155px] h-[42px] bg-white border border-[#d5e3e9] rounded-xl pl-3 pr-8 text-[11px] font-medium outline-none focus:border-[#23749e] cursor-pointer shadow-2xs"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
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
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-semibold text-slate-700 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
