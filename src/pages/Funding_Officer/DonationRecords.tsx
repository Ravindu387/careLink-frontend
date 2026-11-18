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
  Loader2,
  RefreshCw,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { donationService } from "../../services/donationService";
import { campaignService } from "../../services/campaignService";
import type {
  Donation,
  DonationTab,
  DonationType,
  DonationVerification,
  DonationAllocation,
  DonationSummary,
} from "../../types/donation";
import type { Campaign } from "../../types/campaign";

const DEFAULT_CAMPAIGNS = [
  "Flood Response 2025",
  "Emergency Shelter Fund",
  "Medical Relief",
  "Clean Water Appeal",
];

export default function DonationRecords() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<DonationSummary | null>(null);
  const [campaigns, setCampaigns] = useState<string[]>(DEFAULT_CAMPAIGNS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<DonationTab>("All records");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("All types");
  const [verificationFilter, setVerificationFilter] = useState("All verification states");
  const [allocationFilter, setAllocationFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");
  const [campaignFilter, setCampaignFilter] = useState("All campaigns");
  const [receivedDateFilter, setReceivedDateFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState<Donation | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [newDonation, setNewDonation] = useState({
    donor: "",
    type: "Monetary" as DonationType,
    amount: "",
    campaign: "Flood Response 2025",
    received: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const pageSize = 5;

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

  // Load campaigns for dropdowns
  useEffect(() => {
    campaignService
      .getAllCampaigns()
      .then((data: Campaign[]) => {
        if (data && data.length > 0) {
          const names = Array.from(new Set(data.map((c) => c.name)));
          setCampaigns(names);
          if (names.length > 0 && !names.includes(newDonation.campaign)) {
            setNewDonation((prev) => ({ ...prev, campaign: names[0] }));
          }
        }
      })
      .catch(() => {
        // Fallback to defaults
      });
  }, []);

  // Fetch Summary / Tab counts
  const loadSummary = useCallback(async () => {
    try {
      const data = await donationService.getDonationSummary();
      setSummary(data);
    } catch {
      // Graceful fallback
    }
  }, []);

  // Fetch Donations
  const loadDonations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await donationService.getDonations({
        page: currentPage,
        pageSize,
        search: debouncedSearch || undefined,
        tab: activeTab !== "All records" ? activeTab : undefined,
        type: typeFilter !== "All types" ? typeFilter : undefined,
        verification:
          verificationFilter !== "All verification states"
            ? verificationFilter
            : undefined,
        allocation:
          allocationFilter !== "All statuses" ? allocationFilter : undefined,
        campaign:
          campaignFilter !== "All campaigns" ? campaignFilter : undefined,
        dateRange: dateFilter !== "Date range" ? dateFilter : undefined,
        startDate: receivedDateFilter || undefined,
        endDate: receivedDateFilter || undefined,
      });

      setDonations(result.items || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(result.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || "Failed to load donation records. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    activeTab,
    typeFilter,
    verificationFilter,
    allocationFilter,
    campaignFilter,
    dateFilter,
    receivedDateFilter,
  ]);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  // CHANGE TAB
  const changeTab = (tab: DonationTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // SELECT DONATIONS
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = donations.map((item) => item.id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !visibleIds.includes(id))
        : [...new Set([...prev, ...visibleIds])]
    );
  };

  // ADD DONATION
  const handleAddDonation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newDonation.donor.trim() || !newDonation.amount.trim()) {
      notify("Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await donationService.createDonation({
        donor: newDonation.donor.trim(),
        type: newDonation.type,
        amount: newDonation.amount.trim(),
        campaign: newDonation.campaign,
        received: newDonation.received,
        notes: newDonation.notes.trim() || undefined,
      });

      notify("Donation recorded successfully.");
      setShowAddModal(false);
      setNewDonation({
        donor: "",
        type: "Monetary",
        amount: "",
        campaign: campaigns[0] || "Flood Response 2025",
        received: new Date().toISOString().split("T")[0],
        notes: "",
      });

      setCurrentPage(1);
      loadDonations();
      loadSummary();
    } catch (err: any) {
      notify(err?.message || "Failed to record donation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE STATUS
  const handleUpdateVerification = async (
    id: string,
    verification: DonationVerification
  ) => {
    try {
      await donationService.updateVerification(id, verification);
      notify(`Donation marked as ${verification.toLowerCase()}.`);
      setActiveMenu(null);
      loadDonations();
      loadSummary();
    } catch (err: any) {
      notify(err?.message || "Failed to update verification status.");
    }
  };

  const handleUpdateAllocation = async (
    id: string,
    allocation: DonationAllocation
  ) => {
    try {
      await donationService.updateAllocation(id, allocation);
      notify(`Donation status updated to ${allocation}.`);
      setActiveMenu(null);
      loadDonations();
      loadSummary();
    } catch (err: any) {
      notify(err?.message || "Failed to update allocation status.");
    }
  };

  // BULK ACTIONS
  const handleBulkAction = async (action: "Verify" | "Allocate" | "Flag" | "Hold") => {
    if (selectedIds.length === 0) {
      notify("Select at least one donation.");
      return;
    }

    try {
      const res = await donationService.bulkAction({
        ids: selectedIds,
        action,
      });
      notify(res.message || `${action} action completed successfully.`);
      setSelectedIds([]);
      setShowBulkMenu(false);
      loadDonations();
      loadSummary();
    } catch (err: any) {
      notify(err?.message || `Failed to execute ${action} action.`);
    }
  };

  // DELETE DONATION
  const handleDeleteDonation = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete donation ${id}?`)) {
      return;
    }

    try {
      await donationService.deleteDonation(id);
      notify(`Donation ${id} deleted.`);
      setActiveMenu(null);
      loadDonations();
      loadSummary();
    } catch (err: any) {
      notify(err?.message || "Failed to delete donation.");
    }
  };

  // EXPORT CSV
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allData = await donationService.getAllDonations();
      const recordsToExport = allData && allData.length > 0 ? allData : donations;

      const headers = [
        "Reference",
        "Donor",
        "Type",
        "Amount / Quantity",
        "Campaign",
        "Received",
        "Verification",
        "Allocation",
        "Notes",
      ];

      const rows = recordsToExport.map((donation) => [
        donation.id,
        donation.donor,
        donation.type,
        donation.amount,
        donation.campaign,
        donation.received,
        donation.verification,
        donation.allocation,
        donation.notes || "",
      ]);

      const csv = [headers, ...rows]
        .map((row) =>
          row
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `donation-records-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      URL.revokeObjectURL(url);
      notify("Donation records exported successfully.");
    } catch (err: any) {
      notify(err?.message || "Failed to export donation records.");
    } finally {
      setIsExporting(false);
    }
  };

  // TAB COUNTS
  const tabCounts: Record<DonationTab, number> = useMemo(() => {
    if (summary) {
      return {
        "All records": summary.totalRecords,
        "Pending verification": summary.pendingVerificationCount,
        Monetary: summary.monetaryCount,
        Material: summary.materialCount,
        Flagged: summary.flaggedCount,
      };
    }
    return {
      "All records": totalCount,
      "Pending verification": 0,
      Monetary: 0,
      Material: 0,
      Flagged: 0,
    };
  }, [summary, totalCount]);

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
          <span className="font-semibold">Donation Records</span>
        </div>

        {/* PAGE TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-[21px] font-medium">Donation Records</h1>
            <p className="text-[9px] text-slate-500 mt-1">
              Verify monetary and material contributions and track transparent allocation status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadDonations();
                loadSummary();
              }}
              title="Refresh records"
              className="h-[31px] w-[31px] bg-white border border-[#b5cbd8] rounded-lg text-[#23749e] flex items-center justify-center hover:bg-slate-50 transition"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="h-[31px] px-3 bg-white border border-[#b5cbd8] rounded-lg text-[9px] text-[#23749e] flex items-center gap-2 hover:bg-slate-50 transition disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              Export
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="h-[31px] px-3 bg-[#23749e] text-white rounded-lg text-[9px] font-semibold flex items-center gap-2 hover:bg-[#175c80] transition shadow-sm"
            >
              <Plus size={13} />
              Record donation
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
              onClick={() => loadDonations()}
              className="text-xs font-semibold underline hover:no-underline ml-4"
            >
              Try Again
            </button>
          </div>
        )}

        {/* TABS */}
        <div className="flex items-center gap-5 border-b border-[#d5e3e9] mb-2.5 overflow-x-auto">
          {(
            [
              "All records",
              "Pending verification",
              "Monetary",
              "Material",
              "Flagged",
            ] as DonationTab[]
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => changeTab(tab)}
              className={`h-[35px] whitespace-nowrap text-[8px] flex items-center gap-1.5 border-b-2 transition ${
                activeTab === tab
                  ? "border-[#23749e] text-[#23749e] font-semibold"
                  : "border-transparent text-slate-500 hover:text-[#23749e]"
              }`}
            >
              {tab}
              <span className="bg-[#e7eff3] text-slate-500 rounded-full px-1.5 py-0.5 text-[7px]">
                {tabCounts[tab]?.toLocaleString() ?? 0}
              </span>
            </button>
          ))}
        </div>

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
              placeholder="Search donation reference, donor, or campaign..."
              className="w-full h-[31px] bg-white border border-[#d5e3e9] rounded-lg pl-8 pr-3 text-[8px] outline-none focus:border-[#39ae90] transition"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2">
            <FilterSelect
              value={typeFilter}
              onChange={(value) => {
                setTypeFilter(value);
                setCurrentPage(1);
              }}
              options={["All types", "Monetary", "Material"]}
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
                "Pending",
                "Flagged",
              ]}
            />

            <FilterSelect
              value={allocationFilter}
              onChange={(value) => {
                setAllocationFilter(value);
                setCurrentPage(1);
              }}
              options={[
                "All statuses",
                "Allocated",
                "Partially Allocated",
                "Unallocated",
                "On Hold",
              ]}
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
              className={`h-[31px] px-3 bg-white border rounded-lg text-[8px] flex items-center justify-center gap-1.5 hover:bg-slate-50 whitespace-nowrap transition ${
                showMoreFilters || campaignFilter !== "All campaigns" || receivedDateFilter
                  ? "border-[#23749e] text-[#23749e] font-semibold"
                  : "border-[#b5cbd8]"
              }`}
            >
              <Filter size={11} />
              More filters
              {(campaignFilter !== "All campaigns" || receivedDateFilter) && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#23749e]" />
              )}
            </button>
          </div>
        </section>

        {/* MORE FILTERS */}
        {showMoreFilters && (
          <div className="bg-white border border-[#d5e3e9] rounded-lg p-3 mb-3 flex flex-wrap gap-4 items-end shadow-sm">
            <div>
              <label className="block text-[8px] text-slate-500 mb-1">
                Campaign
              </label>
              <select
                value={campaignFilter}
                onChange={(e) => {
                  setCampaignFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-[#d5e3e9] rounded-md p-1.5 text-[9px] outline-none focus:border-[#39ae90] min-w-[170px]"
              >
                <option>All campaigns</option>
                {campaigns.map((camp) => (
                  <option key={camp} value={camp}>
                    {camp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[8px] text-slate-500 mb-1">
                Received date
              </label>
              <input
                type="date"
                value={receivedDateFilter}
                onChange={(e) => {
                  setReceivedDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-[#d5e3e9] rounded-md p-1.5 text-[9px] outline-none focus:border-[#39ae90]"
              />
            </div>

            <button
              onClick={() => {
                setCampaignFilter("All campaigns");
                setReceivedDateFilter("");
                setCurrentPage(1);
                notify("Additional filters reset.");
              }}
              className="text-[9px] text-[#23749e] hover:underline pb-1.5"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* DONATION RECORDS TABLE */}
        <section className="bg-white rounded-lg border border-[#d5e3e9] shadow-sm overflow-hidden">
          {/* TABLE HEADER */}
          <div className="min-h-[51px] px-3 flex items-center justify-between border-b border-[#d7e4e9]">
            <div>
              <h2 className="text-[10px] font-medium">Donation Records</h2>
              <p className="text-[8px] text-slate-400 mt-0.5">
                {totalCount} total record{totalCount === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                className="h-[30px] px-3 bg-white border border-[#b5cbd8] rounded-lg text-[8px] hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                Bulk actions
                <ChevronDown size={11} />
              </button>

              {showBulkMenu && (
                <div className="absolute right-0 top-9 z-20 w-44 bg-white border border-slate-200 rounded-lg shadow-lg p-1">
                  <div className="px-2 py-1 text-[8px] font-semibold text-slate-400 uppercase tracking-wider">
                    With selected ({selectedIds.length})
                  </div>
                  <button
                    onClick={() => handleBulkAction("Verify")}
                    className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded flex items-center gap-2"
                  >
                    <CheckCircle2 size={12} className="text-[#159b79]" />
                    Verify selected
                  </button>
                  <button
                    onClick={() => handleBulkAction("Allocate")}
                    className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded flex items-center gap-2"
                  >
                    <CheckCircle2 size={12} className="text-[#23749e]" />
                    Allocate selected
                  </button>
                  <button
                    onClick={() => handleBulkAction("Hold")}
                    className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded flex items-center gap-2"
                  >
                    <Clock size={12} className="text-[#bd7b17]" />
                    Hold selected
                  </button>
                  <button
                    onClick={() => handleBulkAction("Flag")}
                    className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded flex items-center gap-2 text-red-600"
                  >
                    <AlertTriangle size={12} className="text-red-500" />
                    Flag selected
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="h-[28px] bg-[#f5f8f9] border-b border-[#d5e3e9] text-[7px] text-slate-500">
                  <th className="px-2.5 font-medium w-8">
                    <input
                      type="checkbox"
                      checked={
                        donations.length > 0 &&
                        donations.every((d) => selectedIds.includes(d.id))
                      }
                      onChange={toggleSelectAll}
                      className="accent-[#23749e] w-3 h-3 cursor-pointer"
                    />
                  </th>
                  <th className="px-2 font-medium">Reference</th>
                  <th className="px-2 font-medium">Donor</th>
                  <th className="px-2 font-medium">Type</th>
                  <th className="px-2 font-medium">Amount / Quantity</th>
                  <th className="px-2 font-medium">Campaign</th>
                  <th className="px-2 font-medium">Received</th>
                  <th className="px-2 font-medium">Verification</th>
                  <th className="px-2 font-medium">Allocation</th>
                  <th className="px-2 font-medium w-10"></th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
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
                        <div className="h-3 w-12 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-3 w-20 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-3 w-28 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-3 w-12 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-4 w-14 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2">
                        <div className="h-4 w-16 bg-slate-200 rounded" />
                      </td>
                      <td className="px-2"></td>
                    </tr>
                  ))
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center">
                      <Search size={23} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-[10px] text-slate-500 font-medium">
                        No donation records found.
                      </p>
                      <button
                        onClick={() => {
                          setSearch("");
                          setActiveTab("All records");
                          setTypeFilter("All types");
                          setVerificationFilter("All verification states");
                          setAllocationFilter("All statuses");
                          setCampaignFilter("All campaigns");
                          setReceivedDateFilter("");
                          setDateFilter("Date range");
                          setCurrentPage(1);
                        }}
                        className="text-[9px] text-[#23749e] hover:underline mt-2 inline-block"
                      >
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  donations.map((donation, index) => (
                    <tr
                      key={donation.id}
                      className={`h-[36px] border-b border-[#e1eaf0] hover:bg-[#f0f8fa] transition ${
                        index % 2 === 1 ? "bg-[#f7fafb]" : "bg-white"
                      }`}
                    >
                      <td className="px-2.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(donation.id)}
                          onChange={() => toggleSelect(donation.id)}
                          className="accent-[#23749e] w-3 h-3 cursor-pointer"
                        />
                      </td>

                      <td className="px-2 text-[7px] font-semibold whitespace-nowrap">
                        <button
                          onClick={() => setShowDetailsModal(donation)}
                          className="hover:underline text-[#23749e]"
                        >
                          {donation.id}
                        </button>
                      </td>

                      <td className="px-2 text-[7px] whitespace-nowrap">
                        {donation.donor}
                      </td>

                      <td className="px-2 text-[7px] whitespace-nowrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[7px] ${
                            donation.type === "Monetary"
                              ? "bg-[#e2f1f8] text-[#23749e] font-medium"
                              : "bg-[#eaf4ed] text-[#2e7d32] font-medium"
                          }`}
                        >
                          {donation.type}
                        </span>
                      </td>

                      <td className="px-2 text-[7px] font-medium whitespace-nowrap">
                        {donation.amount}
                      </td>

                      <td className="px-2 text-[7px] whitespace-nowrap text-slate-600">
                        {donation.campaign}
                      </td>

                      <td className="px-2 text-[7px] whitespace-nowrap text-slate-500">
                        {donation.received}
                      </td>

                      <td className="px-2 whitespace-nowrap">
                        <VerificationBadge status={donation.verification} />
                      </td>

                      <td className="px-2 whitespace-nowrap">
                        <AllocationBadge status={donation.allocation} />
                      </td>

                      <td className="px-2 relative">
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === donation.id ? null : donation.id
                            )
                          }
                          className="text-slate-500 hover:text-[#23749e] p-1 rounded hover:bg-slate-100 transition"
                        >
                          <MoreHorizontal size={14} />
                        </button>

                        {activeMenu === donation.id && (
                          <div className="absolute right-5 top-6 z-30 w-44 bg-white border border-slate-200 shadow-lg rounded-lg p-1">
                            <button
                              onClick={() => {
                                setShowDetailsModal(donation);
                                setActiveMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded flex items-center gap-2"
                            >
                              <Eye size={12} className="text-slate-400" />
                              View details
                            </button>

                            <button
                              onClick={() =>
                                handleUpdateVerification(donation.id, "Verified")
                              }
                              className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded flex items-center gap-2"
                            >
                              <CheckCircle2 size={12} className="text-[#159b79]" />
                              Mark as verified
                            </button>

                            <button
                              onClick={() =>
                                handleUpdateAllocation(donation.id, "Allocated")
                              }
                              className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded flex items-center gap-2"
                            >
                              <CheckCircle2 size={12} className="text-[#23749e]" />
                              Allocate donation
                            </button>

                            <button
                              onClick={() =>
                                handleUpdateAllocation(donation.id, "On Hold")
                              }
                              className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-slate-50 rounded flex items-center gap-2"
                            >
                              <Clock size={12} className="text-[#bd7b17]" />
                              Place on hold
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              onClick={() => handleDeleteDonation(donation.id)}
                              className="w-full text-left px-3 py-1.5 text-[9px] hover:bg-red-50 text-red-600 rounded flex items-center gap-2"
                            >
                              <Trash2 size={12} />
                              Delete record
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

              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
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

      {/* RECORD DONATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddDonation}
            className="bg-white rounded-xl shadow-xl w-full max-w-[430px] p-5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[16px] font-semibold">Record donation</h2>
                <p className="text-[9px] text-slate-400 mt-1">
                  Register a new monetary or material contribution.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <FormField label="Donor name">
                <input
                  required
                  value={newDonation.donor}
                  onChange={(e) =>
                    setNewDonation({
                      ...newDonation,
                      donor: e.target.value,
                    })
                  }
                  placeholder="Enter donor name or organisation"
                  className="w-full border border-[#d5e3e9] rounded-lg px-3 py-2 text-[10px] outline-none focus:border-[#23749e]"
                />
              </FormField>

              <FormField label="Donation type">
                <select
                  value={newDonation.type}
                  onChange={(e) =>
                    setNewDonation({
                      ...newDonation,
                      type: e.target.value as DonationType,
                    })
                  }
                  className="w-full border border-[#d5e3e9] rounded-lg px-3 py-2 text-[10px] outline-none focus:border-[#23749e] bg-white cursor-pointer"
                >
                  <option value="Monetary">Monetary</option>
                  <option value="Material">Material</option>
                </select>
              </FormField>

              <FormField label="Amount / Quantity">
                <input
                  required
                  value={newDonation.amount}
                  onChange={(e) =>
                    setNewDonation({
                      ...newDonation,
                      amount: e.target.value,
                    })
                  }
                  placeholder={
                    newDonation.type === "Monetary"
                      ? "e.g. $5,000 or 5000"
                      : "e.g. 500 food packs"
                  }
                  className="w-full border border-[#d5e3e9] rounded-lg px-3 py-2 text-[10px] outline-none focus:border-[#23749e]"
                />
              </FormField>

              <FormField label="Campaign">
                <select
                  value={newDonation.campaign}
                  onChange={(e) =>
                    setNewDonation({
                      ...newDonation,
                      campaign: e.target.value,
                    })
                  }
                  className="w-full border border-[#d5e3e9] rounded-lg px-3 py-2 text-[10px] outline-none focus:border-[#23749e] bg-white cursor-pointer"
                >
                  {campaigns.map((camp) => (
                    <option key={camp} value={camp}>
                      {camp}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Received date">
                <input
                  type="date"
                  value={newDonation.received}
                  onChange={(e) =>
                    setNewDonation({
                      ...newDonation,
                      received: e.target.value,
                    })
                  }
                  className="w-full border border-[#d5e3e9] rounded-lg px-3 py-2 text-[10px] outline-none focus:border-[#23749e]"
                />
              </FormField>

              <FormField label="Notes (optional)">
                <input
                  value={newDonation.notes}
                  onChange={(e) =>
                    setNewDonation({
                      ...newDonation,
                      notes: e.target.value,
                    })
                  }
                  placeholder="e.g. Wire transfer reference or warehouse delivery location"
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
                Save donation
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
                  Donation Record
                </span>
                <h2 className="text-[18px] font-bold text-[#123e60]">
                  {showDetailsModal.id}
                </h2>
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
                <span className="text-slate-400">Donor</span>
                <span className="font-semibold text-[#123e60]">
                  {showDetailsModal.donor}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Contribution Type</span>
                <span className="font-medium">{showDetailsModal.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Amount / Quantity</span>
                <span className="font-bold text-[#23749e]">
                  {showDetailsModal.amount}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Allocated Campaign</span>
                <span className="font-medium text-slate-700">
                  {showDetailsModal.campaign}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Received Date</span>
                <span>{showDetailsModal.received}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Verification</span>
                <VerificationBadge status={showDetailsModal.verification} />
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Allocation</span>
                <AllocationBadge status={showDetailsModal.allocation} />
              </div>
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

      {/* TOAST MESSAGE */}
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

// ==========================================
// FILTER SELECT
// ==========================================

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
        className="appearance-none w-full lg:w-[125px] h-[31px] bg-white border border-[#d5e3e9] rounded-lg pl-2 pr-6 text-[8px] outline-none focus:border-[#39ae90] cursor-pointer transition"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={11}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
      />
    </div>
  );
}

// ==========================================
// VERIFICATION BADGE
// ==========================================

function VerificationBadge({
  status,
}: {
  status: Donation["verification"];
}) {
  const styles = {
    Verified: "bg-[#e4f6f0] text-[#159b79]",
    Pending: "bg-[#fff3dd] text-[#bd7b17]",
    Flagged: "bg-[#fde9eb] text-[#d33b48]",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-[7px] font-semibold inline-block ${
        styles[status] || styles.Pending
      }`}
    >
      {status}
    </span>
  );
}

// ==========================================
// ALLOCATION BADGE
// ==========================================

function AllocationBadge({
  status,
}: {
  status: Donation["allocation"];
}) {
  const styles = {
    Allocated: "bg-[#e4f6f0] text-[#159b79]",
    "Partially Allocated": "bg-[#e4f6f0] text-[#159b79]",
    Unallocated: "bg-[#e8f1f6] text-[#23749e]",
    "On Hold": "bg-[#fff3dd] text-[#bd7b17]",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-[7px] font-semibold whitespace-nowrap inline-block ${
        styles[status] || styles.Unallocated
      }`}
    >
      {status}
    </span>
  );
}

// ==========================================
// FORM FIELD
// ==========================================

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
