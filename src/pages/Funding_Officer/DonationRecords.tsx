
import { useMemo, useState } from "react";
import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronRight,
  ChevronDown,
  Download,
  Plus,
  Filter,
  MoreHorizontal,
  X,
} from "lucide-react";

type Donation = {
  id: string;
  donor: string;
  type: "Monetary" | "Material";
  amount: string;
  campaign: string;
  received: string;
  verification: "Verified" | "Pending" | "Flagged";
  allocation: "Allocated" | "Partially Allocated" | "Unallocated" | "On Hold";
};

const initialDonations: Donation[] = [
  {
    id: "DON-88421",
    donor: "Global Relief Foundation",
    type: "Monetary",
    amount: "$125,000",
    campaign: "Flood Response 2025",
    received: "22 Jun",
    verification: "Verified",
    allocation: "Partially Allocated",
  },
  {
    id: "DON-88418",
    donor: "Anonymous Individual",
    type: "Monetary",
    amount: "$2,500",
    campaign: "Emergency Shelter Fund",
    received: "22 Jun",
    verification: "Pending",
    allocation: "Unallocated",
  },
  {
    id: "DON-88412",
    donor: "Riverton Foods Ltd",
    type: "Material",
    amount: "4,800 food packs",
    campaign: "Flood Response 2025",
    received: "21 Jun",
    verification: "Verified",
    allocation: "Allocated",
  },
  {
    id: "DON-88404",
    donor: "HealthAccess International",
    type: "Material",
    amount: "320 medical kits",
    campaign: "Medical Relief",
    received: "21 Jun",
    verification: "Verified",
    allocation: "Partially Allocated",
  },
  {
    id: "DON-88398",
    donor: "Community Giving Circle",
    type: "Monetary",
    amount: "$18,420",
    campaign: "Clean Water Appeal",
    received: "20 Jun",
    verification: "Flagged",
    allocation: "On Hold",
  },
];

type Tab = "All records" | "Pending verification" | "Monetary" | "Material" | "Flagged";

export default function DonationRecords() {
  const [donations, setDonations] = useState(initialDonations);

  const [activeTab, setActiveTab] = useState<Tab>("All records");
  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("All types");
  const [verificationFilter, setVerificationFilter] = useState("All verification states");
  const [allocationFilter, setAllocationFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState("");

  const [newDonation, setNewDonation] = useState({
    donor: "",
    type: "Monetary" as "Monetary" | "Material",
    amount: "",
    campaign: "Flood Response 2025",
    received: "22 Jun",
  });

  const pageSize = 5;

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  // FILTER DONATIONS

  const filteredDonations = useMemo(() => {
    return donations.filter((donation) => {
      const matchesSearch = [
        donation.id,
        donation.donor,
        donation.campaign,
        donation.amount,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesTab =
        activeTab === "All records" ||
        (activeTab === "Pending verification" &&
          donation.verification === "Pending") ||
        (activeTab === "Monetary" && donation.type === "Monetary") ||
        (activeTab === "Material" && donation.type === "Material") ||
        (activeTab === "Flagged" && donation.verification === "Flagged");

      const matchesType =
        typeFilter === "All types" || donation.type === typeFilter;

      const matchesVerification =
        verificationFilter === "All verification states" ||
        donation.verification === verificationFilter;

      const matchesAllocation =
        allocationFilter === "All statuses" ||
        donation.allocation === allocationFilter;

      return (
        matchesSearch &&
        matchesTab &&
        matchesType &&
        matchesVerification &&
        matchesAllocation
      );
    });
  }, [
    donations,
    search,
    activeTab,
    typeFilter,
    verificationFilter,
    allocationFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDonations.length / pageSize)
  );

  const displayedDonations = filteredDonations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // CHANGE TAB

  const changeTab = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedIds([]);
  };

  // SELECT DONATIONS

  const toggleSelect = (id: string) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = displayedDonations.map((item) => item.id);

    const allSelected = visibleIds.every((id) =>
      selectedIds.includes(id)
    );

    setSelectedIds((previous) =>
      allSelected
        ? previous.filter((id) => !visibleIds.includes(id))
        : [...new Set([...previous, ...visibleIds])]
    );
  };

  // ADD DONATION

  const handleAddDonation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !newDonation.donor.trim() ||
      !newDonation.amount.trim()
    ) {
      notify("Please complete all required fields.");
      return;
    }

    const donation: Donation = {
      id: `DON-${Math.floor(10000 + Math.random() * 89999)}`,
      donor: newDonation.donor,
      type: newDonation.type,
      amount: newDonation.amount,
      campaign: newDonation.campaign,
      received: newDonation.received,
      verification: "Pending",
      allocation: "Unallocated",
    };

    setDonations((previous) => [donation, ...previous]);

    setNewDonation({
      donor: "",
      type: "Monetary",
      amount: "",
      campaign: "Flood Response 2025",
      received: "22 Jun",
    });

    setActiveTab("All records");
    setSearch("");
    setTypeFilter("All types");
    setVerificationFilter("All verification states");
    setAllocationFilter("All statuses");
    setCurrentPage(1);
    setShowAddModal(false);

    notify("Donation recorded successfully.");
  };

  // UPDATE DONATION

  const updateDonation = (
    id: string,
    updates: Partial<Donation>
  ) => {
    setDonations((previous) =>
      previous.map((donation) =>
        donation.id === id
          ? { ...donation, ...updates }
          : donation
      )
    );
  };

  // BULK ACTIONS

  const handleBulkAction = (action: string) => {
    if (selectedIds.length === 0) {
      notify("Select at least one donation.");
      return;
    }

    if (action === "Verify") {
      setDonations((previous) =>
        previous.map((donation) =>
          selectedIds.includes(donation.id)
            ? { ...donation, verification: "Verified" }
            : donation
        )
      );
    }

    if (action === "Allocate") {
      setDonations((previous) =>
        previous.map((donation) =>
          selectedIds.includes(donation.id)
            ? {
                ...donation,
                allocation: "Allocated",
                verification: "Verified",
              }
            : donation
        )
      );
    }

    setSelectedIds([]);
    setShowBulkMenu(false);
    notify(`${action} action completed successfully.`);
  };

  // EXPORT CSV

  const handleExport = () => {
    const headers = [
      "Reference",
      "Donor",
      "Type",
      "Amount / Quantity",
      "Campaign",
      "Received",
      "Verification",
      "Allocation",
    ];

    const rows = filteredDonations.map((donation) => [
      donation.id,
      donation.donor,
      donation.type,
      donation.amount,
      donation.campaign,
      donation.received,
      donation.verification,
      donation.allocation,
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
    link.download = "donation-records.csv";
    link.click();

    URL.revokeObjectURL(url);

    notify("Donation records exported.");
  };

  // TAB COUNTS

  const tabCounts: Record<Tab, number> = {
    "All records": 1842,
    "Pending verification": 16,
    Monetary: donations.filter((d) => d.type === "Monetary").length,
    Material: donations.filter((d) => d.type === "Material").length,
    Flagged: 2,
  };

  return (
    <div className="min-h-screen w-full bg-[#eef5f7] text-[#123e60] overflow-x-hidden">

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-8 py-4">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[8px] mb-7">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={10} />
          <span className="text-slate-500">
            Funding & Donations
          </span>
          <ChevronRight size={10} />
          <span className="font-semibold">Donation Records</span>
        </div>

        {/* PAGE TITLE */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">

          <div>
            <h1 className="text-[21px] font-medium">
              Donation Records
            </h1>

            <p className="text-[9px] text-slate-500 mt-1">
              Verify monetary and material contributions and track
              transparent allocation status.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={handleExport}
              className="h-[31px] px-3 bg-white border border-[#b5cbd8] rounded-lg text-[9px] text-[#23749e] flex items-center gap-2 hover:bg-slate-50"
            >
              <Download size={12} />
              Export
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="h-[31px] px-3 bg-[#23749e] text-white rounded-lg text-[9px] font-semibold flex items-center gap-2 hover:bg-[#175c80]"
            >
              <Plus size={13} />
              Record donation
            </button>
          </div>
        </div>

        {/* TABS */}

        <div className="flex items-center gap-5 border-b border-[#d5e3e9] mb-2.5 overflow-x-auto">

          {(
            [
              "All records",
              "Pending verification",
              "Monetary",
              "Material",
              "Flagged",
            ] as Tab[]
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
                {tabCounts[tab].toLocaleString()}
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
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search donation reference or donor..."
              className="w-full h-[31px] bg-white border border-[#d5e3e9] rounded-lg pl-8 pr-3 text-[8px] outline-none focus:border-[#39ae90]"
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
                "Monetary",
                "Material",
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
              onChange={setDateFilter}
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
              className="h-[31px] px-3 bg-white border border-[#b5cbd8] rounded-lg text-[8px] flex items-center justify-center gap-1.5 hover:bg-slate-50 whitespace-nowrap"
            >
              <Filter size={11} />
              More filters
            </button>
          </div>
        </section>

        {/* MORE FILTERS */}

        {showMoreFilters && (
          <div className="bg-white border border-[#d5e3e9] rounded-lg p-3 mb-3 flex flex-wrap gap-4 items-end">

            <div>
              <label className="block text-[8px] text-slate-500 mb-1">
                Campaign
              </label>
              <select className="border border-[#d5e3e9] rounded-md p-2 text-[9px]">
                <option>All campaigns</option>
                <option>Flood Response 2025</option>
                <option>Emergency Shelter Fund</option>
                <option>Medical Relief</option>
                <option>Clean Water Appeal</option>
              </select>
            </div>

            <div>
              <label className="block text-[8px] text-slate-500 mb-1">
                Received date
              </label>
              <input
                type="date"
                className="border border-[#d5e3e9] rounded-md p-2 text-[9px]"
              />
            </div>

            <button
              onClick={() => {
                setShowMoreFilters(false);
                notify("Additional filters applied.");
              }}
              className="bg-[#23749e] text-white rounded-md px-4 py-2 text-[9px]"
            >
              Apply filters
            </button>
          </div>
        )}

        {/* DONATION RECORDS TABLE */}

        <section className="bg-white rounded-lg border border-[#d5e3e9] shadow-sm overflow-hidden">

          {/* TABLE HEADER */}

          <div className="min-h-[51px] px-3 flex items-center justify-between border-b border-[#d7e4e9]">

            <div>
              <h2 className="text-[10px] font-medium">
                Donation Records
              </h2>

              <p className="text-[8px] text-slate-400 mt-1">
                {filteredDonations.length} demonstration records
              </p>
            </div>

            <div className="relative">

              <button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                className="h-[30px] px-3 bg-white border border-[#b5cbd8] rounded-lg text-[8px] hover:bg-slate-50"
              >
                Bulk actions
              </button>

              {showBulkMenu && (
                <div className="absolute right-0 top-9 z-20 w-40 bg-white border border-slate-200 rounded-lg shadow-lg p-1">

                  <button
                    onClick={() => handleBulkAction("Verify")}
                    className="w-full text-left px-3 py-2 text-[9px] hover:bg-slate-50 rounded"
                  >
                    Verify selected
                  </button>

                  <button
                    onClick={() => handleBulkAction("Allocate")}
                    className="w-full text-left px-3 py-2 text-[9px] hover:bg-slate-50 rounded"
                  >
                    Allocate selected
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TABLE */}

          <div className="w-full overflow-x-auto">

            <table className="w-full min-w-[900px] text-left">

              <thead>
                <tr className="h-[25px] bg-[#f5f8f9] border-b border-[#d5e3e9] text-[7px] text-slate-500">

                  <th className="px-2.5 font-medium">
                    <input
                      type="checkbox"
                      checked={
                        displayedDonations.length > 0 &&
                        displayedDonations.every((d) =>
                          selectedIds.includes(d.id)
                        )
                      }
                      onChange={toggleSelectAll}
                      className="accent-[#23749e] w-3 h-3"
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
                  <th className="px-2 font-medium"></th>

                </tr>
              </thead>

              <tbody>

                {displayedDonations.map((donation, index) => (
                  <tr
                    key={donation.id}
                    className={`h-[35px] border-b border-[#e1eaf0] hover:bg-[#f0f8fa] transition ${
                      index % 2 === 1 ? "bg-[#f7fafb]" : "bg-white"
                    }`}
                  >

                    <td className="px-2.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(donation.id)}
                        onChange={() => toggleSelect(donation.id)}
                        className="accent-[#23749e] w-3 h-3"
                      />
                    </td>

                    <td className="px-2 text-[7px] font-semibold whitespace-nowrap">
                      {donation.id}
                    </td>

                    <td className="px-2 text-[7px] whitespace-nowrap">
                      {donation.donor}
                    </td>

                    <td className="px-2 text-[7px] whitespace-nowrap">
                      {donation.type}
                    </td>

                    <td className="px-2 text-[7px] whitespace-nowrap">
                      {donation.amount}
                    </td>

                    <td className="px-2 text-[7px] whitespace-nowrap">
                      {donation.campaign}
                    </td>

                    <td className="px-2 text-[7px] whitespace-nowrap">
                      {donation.received}
                    </td>

                    <td className="px-2 whitespace-nowrap">
                      <VerificationBadge
                        status={donation.verification}
                      />
                    </td>

                    <td className="px-2 whitespace-nowrap">
                      <AllocationBadge
                        status={donation.allocation}
                      />
                    </td>

                    <td className="px-2 relative">

                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === donation.id
                              ? null
                              : donation.id
                          )
                        }
                        className="text-slate-500 hover:text-[#23749e]"
                      >
                        <MoreHorizontal size={14} />
                      </button>

                      {activeMenu === donation.id && (
                        <div className="absolute right-5 top-6 z-30 w-40 bg-white border border-slate-200 shadow-lg rounded-lg p-1">

                          <button
                            onClick={() => {
                              notify(`Viewing ${donation.id}`);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 text-[9px] hover:bg-slate-50"
                          >
                            View details
                          </button>

                          <button
                            onClick={() => {
                              updateDonation(donation.id, {
                                verification: "Verified",
                              });
                              setActiveMenu(null);
                              notify("Donation verified.");
                            }}
                            className="w-full text-left px-3 py-2 text-[9px] hover:bg-slate-50"
                          >
                            Mark as verified
                          </button>

                          <button
                            onClick={() => {
                              updateDonation(donation.id, {
                                allocation: "Allocated",
                              });
                              setActiveMenu(null);
                              notify("Donation allocated.");
                            }}
                            className="w-full text-left px-3 py-2 text-[9px] hover:bg-slate-50"
                          >
                            Allocate donation
                          </button>

                          <button
                            onClick={() => {
                              updateDonation(donation.id, {
                                allocation: "On Hold",
                              });
                              setActiveMenu(null);
                              notify("Donation placed on hold.");
                            }}
                            className="w-full text-left px-3 py-2 text-[9px] hover:bg-slate-50"
                          >
                            Place on hold
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>

            {displayedDonations.length === 0 && (
              <div className="py-12 text-center">
                <Search
                  size={23}
                  className="mx-auto text-slate-300 mb-2"
                />
                <p className="text-[10px] text-slate-500">
                  No donation records found.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveTab("All records");
                    setTypeFilter("All types");
                    setVerificationFilter("All verification states");
                    setAllocationFilter("All statuses");
                  }}
                  className="text-[9px] text-[#23749e] mt-2"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* PAGINATION */}

          <div className="min-h-[43px] px-3 flex flex-wrap items-center justify-between gap-2">

            <p className="text-[8px] text-slate-400">
              Showing{" "}
              {filteredDonations.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              –
              {Math.min(
                currentPage * pageSize,
                filteredDonations.length
              )}
              {" "}of{" "}
              {activeTab === "All records" &&
              search === "" &&
              typeFilter === "All types" &&
              verificationFilter === "All verification states" &&
              allocationFilter === "All statuses"
                ? "1,842"
                : filteredDonations.length}
            </p>

            <div className="flex items-center gap-1.5">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                className="h-[25px] px-3 border border-[#d5e3e9] rounded-md text-[8px] disabled:opacity-40 hover:bg-slate-50"
              >
                Previous
              </button>

              {Array.from(
                { length: Math.min(3, totalPages) },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-[24px] h-[25px] rounded-md border text-[8px] ${
                    currentPage === page
                      ? "bg-[#23749e] border-[#23749e] text-white"
                      : "bg-white border-[#d5e3e9] hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                className="h-[25px] px-3 border border-[#b5cbd8] rounded-md text-[8px] disabled:opacity-40 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* RECORD DONATION MODAL */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4">

          <form
            onSubmit={handleAddDonation}
            className="bg-white rounded-xl shadow-xl w-full max-w-[430px] p-5"
          >

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[16px] font-semibold">
                  Record donation
                </h2>

                <p className="text-[9px] text-slate-400 mt-1">
                  Register a new monetary or material contribution.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-red-500"
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
                  placeholder="Enter donor name"
                  className="form-input"
                />
              </FormField>

              <FormField label="Donation type">
                <select
                  value={newDonation.type}
                  onChange={(e) =>
                    setNewDonation({
                      ...newDonation,
                      type: e.target.value as "Monetary" | "Material",
                    })
                  }
                  className="form-input"
                >
                  <option>Monetary</option>
                  <option>Material</option>
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
                      ? "e.g. $5,000"
                      : "e.g. 500 food packs"
                  }
                  className="form-input"
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
                  className="form-input"
                >
                  <option>Flood Response 2025</option>
                  <option>Emergency Shelter Fund</option>
                  <option>Medical Relief</option>
                  <option>Clean Water Appeal</option>
                </select>
              </FormField>

              <FormField label="Received date">
                <input
                  type="date"
                  onChange={(e) =>
                    setNewDonation({
                      ...newDonation,
                      received: e.target.value,
                    })
                  }
                  className="form-input"
                />
              </FormField>

            </div>

            <div className="flex justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-[10px]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-[#23749e] text-white rounded-lg text-[10px] font-semibold hover:bg-[#175c80]"
              >
                Save donation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOAST MESSAGE */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] bg-[#123e60] text-white rounded-lg px-4 py-3 shadow-xl text-[10px] flex items-center gap-3">
          {toast}
          <button onClick={() => setToast("")}>
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
        className="appearance-none w-full lg:w-[110px] h-[31px] bg-white border border-[#d5e3e9] rounded-lg pl-2 pr-6 text-[8px] outline-none focus:border-[#39ae90] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={11}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
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
      className={`px-2 py-1 rounded text-[7px] font-semibold ${styles[status]}`}
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
      className={`px-2 py-1 rounded text-[7px] font-semibold whitespace-nowrap ${styles[status]}`}
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
      <span className="block text-[9px] font-medium mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
