
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { apiClient } from "../../services/api";
import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronRight,
  ChevronDown,
  Plus,
  Download,
  Filter,
  X,
  MoreHorizontal,
  Wallet,
  CheckCircle2,
  Clock,
  Send,
  FileText,
  ShieldCheck,
} from "lucide-react";

type Allocation = {
  id: string;
  amount: number;
  source: string;
  purpose: string;
  recipient: string;
  date: string;
  approval: "Approved" | "Under Review" | "Rejected";
  disbursement: "68% Disbursed" | "Disbursed" | "Pending" | "Not Disbursed";
};

const initialAllocations: Allocation[] = [
  {
    id: "ALL-4408",
    amount: 180000,
    source: "Flood Response 2025",
    purpose: "Emergency Shelter Kits",
    recipient: "CareLink Shelter Network",
    date: "22 Jun",
    approval: "Approved",
    disbursement: "68% Disbursed",
  },
  {
    id: "ALL-4402",
    amount: 92500,
    source: "Medical Relief",
    purpose: "Trauma & First Aid Kits",
    recipient: "Health Response Unit",
    date: "21 Jun",
    approval: "Approved",
    disbursement: "Disbursed",
  },
  {
    id: "ALL-4396",
    amount: 64200,
    source: "Clean Water Appeal",
    purpose: "Water Purification",
    recipient: "Municipal Water Team",
    date: "21 Jun",
    approval: "Under Review",
    disbursement: "Pending",
  },
  {
    id: "ALL-4384",
    amount: 48000,
    source: "Flood Response 2025",
    purpose: "Emergency Transport",
    recipient: "Logistics Unit",
    date: "20 Jun",
    approval: "Approved",
    disbursement: "Disbursed",
  },
];

const formatCurrency = (amount: number) =>
  "$" + amount.toLocaleString("en-US");

export default function FundAllocations() {
  const [allocations, setAllocations] =
    useState<Allocation[]>(initialAllocations);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [approvalFilter, setApprovalFilter] =
    useState("All verification states");
  const [statusFilter, setStatusFilter] =
    useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");

  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedAllocation, setSelectedAllocation] =
    useState<Allocation | null>(null);

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");

  useEffect(() => {
    apiClient.get<any>("/fund-allocations").then((res) => {
      const items = res?.items ?? (Array.isArray(res) ? res : null);
      if (items?.length) {
        setAllocations(
          items.map((a: any) => ({
            id: a.id || a.reference || "ALL-4400",
            amount: Number(a.amount ?? 0),
            source: a.source || a.campaign || "Flood Response 2025",
            purpose: a.purpose || "Emergency Relief",
            recipient: a.recipient || "CareLink",
            date: a.date || "Today",
            approval: (a.approval as Allocation["approval"]) || "Approved",
            disbursement: (a.disbursement as Allocation["disbursement"]) || "Disbursed",
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const [newAllocation, setNewAllocation] = useState({
    amount: "",
    source: "Flood Response 2025",
    purpose: "",
    recipient: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  // SEARCH AND FILTERS

  const filteredAllocations = useMemo(() => {
    return allocations.filter((item) => {
      const searchMatch = [
        item.id,
        item.source,
        item.purpose,
        item.recipient,
        item.amount,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const typeMatch =
        typeFilter === "All types" ||
        item.source === typeFilter;

      const approvalMatch =
        approvalFilter === "All verification states" ||
        item.approval === approvalFilter;

      const statusMatch =
        statusFilter === "All statuses" ||
        item.disbursement === statusFilter;

      return (
        searchMatch &&
        typeMatch &&
        approvalMatch &&
        statusMatch
      );
    });
  }, [
    allocations,
    search,
    typeFilter,
    approvalFilter,
    statusFilter,
  ]);

  // CREATE ALLOCATION

  const handleCreateAllocation = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const amount = Number(newAllocation.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !newAllocation.purpose.trim() ||
      !newAllocation.recipient.trim()
    ) {
      notify("Please enter valid allocation details.");
      return;
    }

    apiClient.post("/fund-allocations", {
      amount,
      source: newAllocation.source,
      purpose: newAllocation.purpose,
      recipient: newAllocation.recipient,
      date: newAllocation.date,
    }).catch(() => {});

    const allocation: Allocation = {
      id: `ALL-${Math.floor(1000 + Math.random() * 9000)}`,
      amount,
      source: newAllocation.source,
      purpose: newAllocation.purpose,
      recipient: newAllocation.recipient,
      date: new Date(
        newAllocation.date
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
      approval: "Under Review",
      disbursement: "Pending",
    };

    setAllocations((previous) => [
      allocation,
      ...previous,
    ]);

    setNewAllocation({
      amount: "",
      source: "Flood Response 2025",
      purpose: "",
      recipient: "",
      date: new Date().toISOString().slice(0, 10),
    });

    setShowModal(false);
    setSearch("");
    setPage(1);
    setTypeFilter("All types");
    setApprovalFilter("All verification states");
    setStatusFilter("All statuses");

    notify("Fund allocation created successfully.");
  };

  // APPROVE ALLOCATION

  const approveAllocation = (id: string) => {
    setAllocations((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, approval: "Approved" }
          : item
      )
    );

    setActiveMenu(null);
    setSelectedAllocation(null);
    notify("Allocation approved successfully.");
  };

  // REJECT ALLOCATION

  const rejectAllocation = (id: string) => {
    setAllocations((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, approval: "Rejected" }
          : item
      )
    );

    setActiveMenu(null);
    setSelectedAllocation(null);
    notify("Allocation rejected.");
  };

  // UPDATE DISBURSEMENT

  const disburseAllocation = (id: string) => {
    const item = allocations.find((a) => a.id === id);

    if (!item || item.approval !== "Approved") {
      notify("Only approved allocations can be disbursed.");
      return;
    }

    setAllocations((previous) =>
      previous.map((allocation) =>
        allocation.id === id
          ? { ...allocation, disbursement: "Disbursed" }
          : allocation
      )
    );

    setActiveMenu(null);
    setSelectedAllocation(null);
    notify("Funds marked as disbursed successfully.");
  };

  // SELECT ROWS

  const toggleRow = (id: string) => {
    setSelectedRows((previous) =>
      previous.includes(id)
        ? previous.filter((row) => row !== id)
        : [...previous, id]
    );
  };

  const toggleAll = () => {
    const allSelected =
      filteredAllocations.length > 0 &&
      filteredAllocations.every((item) =>
        selectedRows.includes(item.id)
      );

    if (allSelected) {
      setSelectedRows((previous) =>
        previous.filter(
          (id) =>
            !filteredAllocations.some(
              (item) => item.id === id
            )
        )
      );
    } else {
      setSelectedRows((previous) => [
        ...new Set([
          ...previous,
          ...filteredAllocations.map((item) => item.id),
        ]),
      ]);
    }
  };

  // BULK APPROVAL

  const bulkApprove = () => {
    if (selectedRows.length === 0) {
      notify("Please select allocations first.");
      return;
    }

    setAllocations((previous) =>
      previous.map((item) =>
        selectedRows.includes(item.id) &&
        item.approval === "Under Review"
          ? { ...item, approval: "Approved" }
          : item
      )
    );

    setSelectedRows([]);
    notify("Selected allocations reviewed.");
  };

  // EXPORT CSV

  const exportCSV = () => {
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

    const rows = filteredAllocations.map((item) => [
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
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "fund-allocations.csv";
    link.click();

    URL.revokeObjectURL(url);

    notify("Fund allocation report exported.");
  };

  // CLEAR FILTERS

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All types");
    setApprovalFilter("All verification states");
    setStatusFilter("All statuses");
    setDateFilter("Date range");
    setPage(1);
  };

  // STATUS COLORS

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

  return (
    <div className="min-h-screen w-full bg-[#eef5f7] text-[#123e60] overflow-x-hidden">

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-8 py-4">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-xs mb-8">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={11} />
          <span className="text-slate-500">
            Funding & Donations
          </span>
          <ChevronRight size={11} />
          <span className="font-semibold">Fund Allocations</span>
        </div>

        {/* PAGE TITLE */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
              Fund Allocations
            </h1>

            <p className="text-[13px] text-slate-500 mt-1">
              Allocate verified funds to approved humanitarian
              needs with accountable rationale.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={exportCSV}
              className="h-[40px] px-4 bg-white border border-[#b9cfda] rounded-lg text-sm text-[#23749e] flex items-center gap-2 hover:bg-[#f5fafc]"
            >
              <Download size={15} />
              Export
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="h-[40px] px-4 bg-[#23749e] text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#175c80]"
            >
              <Plus size={16} />
              Allocate funds
            </button>

          </div>
        </div>

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
              placeholder="Search allocation ID, recipient, or purpose..."
              className="w-full h-[40px] bg-white border border-[#d5e3e9] rounded-lg pl-10 pr-3 text-sm sm:text-[15px] outline-none focus:border-[#35b995]"
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
              onClick={() => setShowFilters(!showFilters)}
              className="h-[40px] px-4 bg-white border border-[#b9cfda] rounded-lg text-sm text-[#23749e] flex items-center justify-center gap-2 whitespace-nowrap hover:bg-[#f5fafc]"
            >
              <Filter size={14} />
              More filters
            </button>
          </div>
        </section>

        {/* MORE FILTERS */}

        {showFilters && (
          <div className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-4 flex flex-wrap items-end gap-4">

            <div>
              <label className="block text-sm text-slate-500 mb-1.5">
                Recipient
              </label>

              <input
                placeholder="Search recipient"
                className="h-[35px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px]"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1.5">
                Minimum amount
              </label>

              <input
                type="number"
                placeholder="Minimum USD"
                className="h-[35px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px]"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1.5">
                Maximum amount
              </label>

              <input
                type="number"
                placeholder="Maximum USD"
                className="h-[35px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px]"
              />
            </div>

            <button
              onClick={() => {
                setShowFilters(false);
                notify("Additional filters applied.");
              }}
              className="h-[35px] px-4 bg-[#23749e] text-white rounded-lg text-sm"
            >
              Apply filters
            </button>

            <button
              onClick={clearFilters}
              className="h-[35px] px-3 text-[#23749e] text-sm"
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
              <h2 className="text-base sm:text-lg font-semibold">
                Fund Allocations
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                {filteredAllocations.length} demonstration records
              </p>
            </div>

            <button
              onClick={bulkApprove}
              className="h-[40px] px-4 border border-[#b9cfda] rounded-lg text-sm text-[#23749e] hover:bg-[#f5fafc]"
            >
              Bulk actions
              {selectedRows.length > 0 &&
                ` (${selectedRows.length})`}
            </button>
          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px] text-left">

              <thead>
                <tr className="bg-[#f5f8f9] border-b border-[#d7e4e9]">

                  <th className="px-3 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        filteredAllocations.length > 0 &&
                        filteredAllocations.every((item) =>
                          selectedRows.includes(item.id)
                        )
                      }
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
                      className="px-3 py-3 text-[13px] font-medium text-slate-500 whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}

                  <th className="px-3 py-3"></th>
                </tr>
              </thead>

              <tbody>

                {filteredAllocations.map((item) => (
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

                    <td className="px-3 py-4 text-sm font-semibold whitespace-nowrap">
                      {item.id}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {formatCurrency(item.amount)}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {item.source}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {item.purpose}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {item.recipient}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {item.date}
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${getApprovalStyle(
                          item.approval
                        )}`}
                      >
                        {item.approval}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${getDisbursementStyle(
                          item.disbursement
                        )}`}
                      >
                        {item.disbursement}
                      </span>
                    </td>

                    {/* ACTION MENU */}

                    <td className="px-3 py-4 relative">

                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === item.id ? null : item.id
                          )
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
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[#f1f6f8]"
                          >
                            View allocation details
                          </button>

                          {item.approval === "Under Review" && (
                            <>
                              <button
                                onClick={() =>
                                  approveAllocation(item.id)
                                }
                                className="w-full text-left px-3 py-2 text-sm text-[#159b79] hover:bg-[#f1f6f8]"
                              >
                                Approve allocation
                              </button>

                              <button
                                onClick={() =>
                                  rejectAllocation(item.id)
                                }
                                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-[#f1f6f8]"
                              >
                                Reject allocation
                              </button>
                            </>
                          )}

                          {item.approval === "Approved" &&
                            item.disbursement !== "Disbursed" && (
                              <button
                                onClick={() =>
                                  disburseAllocation(item.id)
                                }
                                className="w-full text-left px-3 py-2 text-sm text-[#23749e] hover:bg-[#f1f6f8]"
                              >
                                Mark as disbursed
                              </button>
                            )}

                        </div>
                      )}

                    </td>
                  </tr>
                ))}

                {/* EMPTY STATE */}

                {filteredAllocations.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-14">

                      <Wallet
                        size={27}
                        className="mx-auto text-slate-300 mb-3"
                      />

                      <p className="text-sm font-medium">
                        No fund allocations found
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Try changing your search or filters.
                      </p>

                      <button
                        onClick={clearFilters}
                        className="text-[#23749e] text-sm mt-3"
                      >
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

            <p className="text-xs text-slate-400">
              Showing 1–{filteredAllocations.length} of{" "}
              {filteredAllocations.length === allocations.length
                ? "1,842"
                : filteredAllocations.length}
            </p>

            <div className="flex items-center gap-1.5">

              <button
                disabled={page === 1}
                onClick={() =>
                  setPage((previous) => Math.max(1, previous - 1))
                }
                className="h-[34px] px-4 border border-[#d5e3e9] rounded-lg text-sm disabled:opacity-40"
              >
                Previous
              </button>

              {[1, 2, 3].map((number) => (
                <button
                  key={number}
                  onClick={() => setPage(number)}
                  className={`w-[34px] h-[34px] border rounded-lg text-sm ${
                    page === number
                      ? "bg-[#23749e] text-white border-[#23749e]"
                      : "bg-white border-[#d5e3e9]"
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() => setPage((previous) => previous + 1)}
                className="h-[34px] px-4 border border-[#b9cfda] rounded-lg text-sm text-[#23749e]"
              >
                Next
              </button>

            </div>
          </div>
        </section>
      </main>

      {/* CREATE ALLOCATION MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4">

          <form
            onSubmit={handleCreateAllocation}
            className="bg-white rounded-xl shadow-xl w-full max-w-[470px] p-5"
          >

            <div className="flex justify-between items-start mb-5">

              <div>
                <h2 className="text-lg sm:text-xl font-semibold">
                  Allocate funds
                </h2>

                <p className="text-xs text-slate-400 mt-1">
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
                  min="1"
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
                  <option>Flood Response 2025</option>
                  <option>Medical Relief</option>
                  <option>Clean Water Appeal</option>
                  <option>Emergency Shelter Fund</option>
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

              <div className="bg-[#eef5f7] rounded-lg p-3 flex items-start gap-2">
                <ShieldCheck
                  size={16}
                  className="text-[#23749e] shrink-0"
                />

                <p className="text-xs text-slate-600">
                  New allocations will be submitted with
                  <strong> Under Review </strong>
                  status and require approval before funds
                  can be disbursed.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-[#23749e] text-white rounded-lg text-sm font-semibold hover:bg-[#175c80]"
              >
                Create allocation
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ALLOCATION DETAILS MODAL */}

      {selectedAllocation && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-[440px] p-5">

            <div className="flex items-start justify-between mb-5">

              <div>
                <p className="text-xs text-[#23749e] font-semibold">
                  {selectedAllocation.id}
                </p>

                <h2 className="text-lg sm:text-xl font-semibold mt-1">
                  Allocation details
                </h2>
              </div>

              <button
                onClick={() => setSelectedAllocation(null)}
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="bg-[#eef5f7] rounded-lg p-4 mb-4">
              <p className="text-xs text-slate-500">
                Allocation amount
              </p>

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
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-3 border-b border-slate-100 pb-2"
                >
                  <span className="text-xs text-slate-400">
                    {label}
                  </span>

                  <span className="text-xs font-medium text-right">
                    {value}
                  </span>
                </div>
              ))}

            </div>

            <div className="flex flex-wrap justify-end gap-2 mt-6">

              {selectedAllocation.approval === "Under Review" && (
                <>
                  <button
                    onClick={() =>
                      rejectAllocation(selectedAllocation.id)
                    }
                    className="px-3 py-2 bg-[#fde9e9] text-red-600 rounded-lg text-sm"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() =>
                      approveAllocation(selectedAllocation.id)
                    }
                    className="px-3 py-2 bg-[#e4f6f0] text-[#159b79] rounded-lg text-sm"
                  >
                    Approve
                  </button>
                </>
              )}

              {selectedAllocation.approval === "Approved" &&
                selectedAllocation.disbursement !== "Disbursed" && (
                  <button
                    onClick={() =>
                      disburseAllocation(selectedAllocation.id)
                    }
                    className="px-3 py-2 bg-[#23749e] text-white rounded-lg text-sm"
                  >
                    Mark disbursed
                  </button>
                )}

              <button
                onClick={() => setSelectedAllocation(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] bg-[#123e60] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-sm">

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
        className="appearance-none w-full lg:w-[150px] h-[40px] bg-white border border-[#d5e3e9] rounded-lg pl-3 pr-8 text-sm sm:text-[15px] outline-none focus:border-[#35b995] cursor-pointer"
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

      <span className="block text-xs font-medium mb-1.5">
        {label}
      </span>

      {children}

    </label>
  );
}
