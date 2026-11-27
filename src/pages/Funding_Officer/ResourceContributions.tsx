
import { useEffect, useMemo, useState } from "react";
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
  Package,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

type Contribution = {
  id: string;
  donor: string;
  type: string;
  quantity: string;
  campaign: string;
  received: string;
  verification: "Verified" | "Pending" | "Flagged";
  allocation: "Allocated" | "Partially Allocated" | "Unallocated";
};

const initialContributions: Contribution[] = [
  {
    id: "DON-88412",
    donor: "Riverton Foods Ltd",
    type: "Material",
    quantity: "4,800 food packs",
    campaign: "Flood Response 2025",
    received: "21 Jun",
    verification: "Verified",
    allocation: "Allocated",
  },
  {
    id: "DON-88404",
    donor: "HealthAccess International",
    type: "Material",
    quantity: "320 medical kits",
    campaign: "Medical Relief",
    received: "21 Jun",
    verification: "Verified",
    allocation: "Partially Allocated",
  },
];

export default function ResourceContributions() {
  const [contributions, setContributions] =
    useState<Contribution[]>(initialContributions);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [verificationFilter, setVerificationFilter] =
    useState("All verification states");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");

  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedContribution, setSelectedContribution] =
    useState<Contribution | null>(null);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");

  useEffect(() => {
    apiClient.get<any>("/resource-contributions").then((res) => {
      const items = res?.items ?? (Array.isArray(res) ? res : null);
      if (items?.length) {
        setContributions(
          items.map((c: any) => ({
            id: c.id || c.reference || "DON-88400",
            donor: c.donor || c.donorName || "Donor",
            type: c.type || "Material",
            quantity: c.quantity || c.amount || "100 units",
            campaign: c.campaign || "Flood Response 2025",
            received: c.received || c.date || "Today",
            verification: (c.verification as Contribution["verification"]) || "Verified",
            allocation: (c.allocation as Contribution["allocation"]) || "Allocated",
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const [newContribution, setNewContribution] = useState({
    donor: "",
    type: "Material",
    quantity: "",
    campaign: "Flood Response 2025",
    received: new Date().toISOString().slice(0, 10),
  });

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  // SEARCH AND FILTER

  const filteredData = useMemo(() => {
    return contributions.filter((item) => {
      const searchMatch = [
        item.id,
        item.donor,
        item.type,
        item.quantity,
        item.campaign,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const typeMatch =
        typeFilter === "All types" ||
        item.type === typeFilter;

      const verificationMatch =
        verificationFilter === "All verification states" ||
        item.verification === verificationFilter;

      const statusMatch =
        statusFilter === "All statuses" ||
        item.allocation === statusFilter;

      return (
        searchMatch &&
        typeMatch &&
        verificationMatch &&
        statusMatch
      );
    });
  }, [
    contributions,
    search,
    typeFilter,
    verificationFilter,
    statusFilter,
  ]);

  // ADD CONTRIBUTION

  const handleAddContribution = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !newContribution.donor.trim() ||
      !newContribution.quantity.trim()
    ) {
      notify("Please complete all required fields.");
      return;
    }

    apiClient.post("/resource-contributions", {
      donor: newContribution.donor,
      type: newContribution.type,
      quantity: newContribution.quantity,
      campaign: newContribution.campaign,
      received: newContribution.received,
    }).catch(() => {});

    const newItem: Contribution = {
      id: `DON-${Math.floor(10000 + Math.random() * 90000)}`,
      donor: newContribution.donor,
      type: newContribution.type,
      quantity: newContribution.quantity,
      campaign: newContribution.campaign,
      received: new Date(
        newContribution.received
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
      verification: "Pending",
      allocation: "Unallocated",
    };

    setContributions((previous) => [newItem, ...previous]);

    setNewContribution({
      donor: "",
      type: "Material",
      quantity: "",
      campaign: "Flood Response 2025",
      received: new Date().toISOString().slice(0, 10),
    });

    setShowModal(false);
    setPage(1);
    setSearch("");
    setTypeFilter("All types");
    setVerificationFilter("All verification states");
    setStatusFilter("All statuses");

    notify("Resource contribution recorded successfully.");
  };

  // VERIFY CONTRIBUTION

  const verifyContribution = (id: string) => {
    setContributions((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, verification: "Verified" }
          : item
      )
    );

    setActiveMenu(null);
    setSelectedContribution(null);
    notify("Contribution verified successfully.");
  };

  // ALLOCATION STATUS

  const updateAllocation = (id: string) => {
    setContributions((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, allocation: "Allocated" }
          : item
      )
    );

    setActiveMenu(null);
    setSelectedContribution(null);
    notify("Contribution allocated successfully.");
  };

  // ROW SELECTION

  const toggleRow = (id: string) => {
    setSelectedRows((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleAll = () => {
    if (
      filteredData.length > 0 &&
      filteredData.every((item) =>
        selectedRows.includes(item.id)
      )
    ) {
      setSelectedRows((previous) =>
        previous.filter(
          (id) => !filteredData.some((item) => item.id === id)
        )
      );
    } else {
      setSelectedRows((previous) => [
        ...new Set([
          ...previous,
          ...filteredData.map((item) => item.id),
        ]),
      ]);
    }
  };

  // BULK VERIFICATION

  const handleBulkVerify = () => {
    setContributions((previous) =>
      previous.map((item) =>
        selectedRows.includes(item.id)
          ? { ...item, verification: "Verified" }
          : item
      )
    );

    setSelectedRows([]);
    notify("Selected contributions verified.");
  };

  // EXPORT CSV

  const exportCSV = () => {
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

    const rows = filteredData.map((item) => [
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
    link.download = "resource-contributions.csv";
    link.click();

    URL.revokeObjectURL(url);
    notify("Resource contributions exported.");
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("All types");
    setVerificationFilter("All verification states");
    setStatusFilter("All statuses");
    setDateFilter("Date range");
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

      <main className="max-w-[1600px] mx-auto px-5 md:px-8 py-4">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-xs mb-8">

          <span className="text-slate-500">
            Operations
          </span>

          <ChevronRight size={11} />

          <span className="text-slate-500">
            Funding & Donations
          </span>

          <ChevronRight size={11} />

          <span className="font-semibold">
            Resource Contributions
          </span>
        </div>

        {/* PAGE HEADING */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
              Resource Contributions
            </h1>

            <p className="text-[13px] text-slate-500 mt-1">
              Track donated food, water, medicine, equipment,
              and other material aid.
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
              Record contribution
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
              placeholder="Search material contributions..."
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
                "Material",
                "Monetary",
              ]}
            />

            <FilterSelect
              value={verificationFilter}
              onChange={(value) => {
                setVerificationFilter(value);
                setPage(1);
              }}
              options={[
                "All verification states",
                "Verified",
                "Pending",
                "Flagged",
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
                "Allocated",
                "Partially Allocated",
                "Unallocated",
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
              className="h-[40px] px-4 bg-white border border-[#b9cfda] rounded-lg text-sm text-[#23749e] flex items-center justify-center gap-2 hover:bg-[#f5fafc] whitespace-nowrap"
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
                Campaign
              </label>

              <select className="h-[34px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px]">
                <option>All campaigns</option>
                <option>Flood Response 2025</option>
                <option>Medical Relief</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1.5">
                Received date
              </label>

              <input
                type="date"
                className="h-[34px] border border-[#d5e3e9] rounded-lg px-3 text-sm sm:text-[15px]"
              />
            </div>

            <button
              onClick={() => {
                setShowFilters(false);
                notify("Additional filters applied.");
              }}
              className="h-[34px] px-4 bg-[#23749e] text-white rounded-lg text-sm"
            >
              Apply filters
            </button>

            <button
              onClick={clearFilters}
              className="h-[34px] px-3 text-[#23749e] text-sm"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* CONTRIBUTIONS TABLE */}

        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-visible">

          {/* TABLE HEADER */}

          <div className="px-4 py-4 flex items-center justify-between border-b border-[#d7e4e9]">

            <div>
              <h2 className="text-base sm:text-lg font-semibold">
                Resource Contributions
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                {filteredData.length} demonstration records
              </p>
            </div>

            <button
              onClick={() => {
                if (selectedRows.length === 0) {
                  notify("Select at least one contribution.");
                } else {
                  handleBulkVerify();
                }
              }}
              className="h-[40px] px-4 border border-[#b9cfda] rounded-lg text-sm text-[#23749e] hover:bg-[#f5fafc]"
            >
              Bulk actions
              {selectedRows.length > 0 &&
                ` (${selectedRows.length})`}
            </button>

          </div>

          {/* RESPONSIVE TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px] text-left">

              <thead>
                <tr className="bg-[#f5f8f9] border-b border-[#d7e4e9]">

                  <th className="px-3 py-3 w-8">
                    <input
                      type="checkbox"
                      checked={
                        filteredData.length > 0 &&
                        filteredData.every((item) =>
                          selectedRows.includes(item.id)
                        )
                      }
                      onChange={toggleAll}
                      className="accent-[#23749e]"
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
                      className="px-3 py-3 text-[13px] font-medium text-slate-500 whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}

                  <th className="px-3 py-3"></th>
                </tr>
              </thead>

              <tbody>

                {filteredData.map((item) => (
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
                      {item.donor}
                    </td>

                    <td className="px-3 py-4 text-sm">
                      {item.type}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {item.quantity}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {item.campaign}
                    </td>

                    <td className="px-3 py-4 text-sm whitespace-nowrap">
                      {item.received}
                    </td>

                    <td className="px-3 py-4">

                      <span
                        className={`inline-flex px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${getStatusStyle(
                          item.verification
                        )}`}
                      >
                        {item.verification}
                      </span>

                    </td>

                    <td className="px-3 py-4">

                      <span
                        className={`inline-flex px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap ${getStatusStyle(
                          item.allocation
                        )}`}
                      >
                        {item.allocation}
                      </span>

                    </td>

                    {/* ROW ACTIONS */}

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
                        <div className="absolute right-8 top-8 z-20 w-44 bg-white border border-[#d5e3e9] rounded-lg shadow-lg py-1">

                          <button
                            onClick={() => {
                              setSelectedContribution(item);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[#f1f6f8]"
                          >
                            View details
                          </button>

                          {item.verification !== "Verified" && (
                            <button
                              onClick={() =>
                                verifyContribution(item.id)
                              }
                              className="w-full text-left px-3 py-2 text-sm hover:bg-[#f1f6f8]"
                            >
                              Verify contribution
                            </button>
                          )}

                          {item.allocation !== "Allocated" && (
                            <button
                              onClick={() =>
                                updateAllocation(item.id)
                              }
                              className="w-full text-left px-3 py-2 text-sm hover:bg-[#f1f6f8]"
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

                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-14"
                    >
                      <Package
                        size={25}
                        className="mx-auto text-slate-300 mb-3"
                      />

                      <p className="text-sm font-medium">
                        No contributions found
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Try another search or change the filters.
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
              Showing {filteredData.length > 0 ? (page - 1) * 2 + 1 : 0}–
              {(page - 1) * 2 + filteredData.length} of{" "}
              {filteredData.length === contributions.length
                ? "1,842"
                : filteredData.length}
            </p>

            <div className="flex items-center gap-1.5">

              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage((p) => p + 1)}
                className="h-[34px] px-4 border border-[#b9cfda] rounded-lg text-sm text-[#23749e]"
              >
                Next
              </button>

            </div>
          </div>

        </section>
      </main>

      {/* RECORD CONTRIBUTION MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4">

          <form
            onSubmit={handleAddContribution}
            className="bg-white rounded-xl shadow-xl w-full max-w-[460px] p-5"
          >

            <div className="flex justify-between items-start mb-5">

              <div>
                <h2 className="text-lg sm:text-xl font-semibold">
                  Record contribution
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Register a new material or resource donation.
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

              <FormField label="Donor name">
                <input
                  required
                  value={newContribution.donor}
                  onChange={(e) =>
                    setNewContribution({
                      ...newContribution,
                      donor: e.target.value,
                    })
                  }
                  placeholder="Enter donor name"
                  className="contribution-input"
                />
              </FormField>

              <FormField label="Contribution type">
                <select
                  value={newContribution.type}
                  onChange={(e) =>
                    setNewContribution({
                      ...newContribution,
                      type: e.target.value,
                    })
                  }
                  className="contribution-input"
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
                    setNewContribution({
                      ...newContribution,
                      quantity: e.target.value,
                    })
                  }
                  placeholder="e.g. 500 food packs"
                  className="contribution-input"
                />
              </FormField>

              <FormField label="Campaign">
                <select
                  value={newContribution.campaign}
                  onChange={(e) =>
                    setNewContribution({
                      ...newContribution,
                      campaign: e.target.value,
                    })
                  }
                  className="contribution-input"
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
                    setNewContribution({
                      ...newContribution,
                      received: e.target.value,
                    })
                  }
                  className="contribution-input"
                />
              </FormField>

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
                Save contribution
              </button>

            </div>

          </form>
        </div>
      )}

      {/* CONTRIBUTION DETAILS MODAL */}

      {selectedContribution && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-[430px] p-5">

            <div className="flex items-start justify-between mb-5">

              <div>
                <p className="text-xs text-[#23749e] font-semibold">
                  {selectedContribution.id}
                </p>

                <h2 className="text-lg sm:text-xl font-semibold mt-1">
                  Contribution details
                </h2>
              </div>

              <button
                onClick={() => setSelectedContribution(null)}
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">

              {[
                ["Donor", selectedContribution.donor],
                ["Type", selectedContribution.type],
                ["Quantity / Value", selectedContribution.quantity],
                ["Campaign", selectedContribution.campaign],
                ["Received", selectedContribution.received],
                ["Verification", selectedContribution.verification],
                ["Allocation", selectedContribution.allocation],
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

            <button
              onClick={() => setSelectedContribution(null)}
              className="w-full mt-5 py-2.5 bg-[#23749e] text-white rounded-lg text-sm"
            >
              Close
            </button>

          </div>
        </div>
      )}

      {/* TOAST MESSAGE */}

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
  children: React.ReactNode;
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
