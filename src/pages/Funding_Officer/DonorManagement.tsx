
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
  Users,
} from "lucide-react";

type Donor = {
  id: string;
  name: string;
  type: string;
  contact: string;
  scope: string;
  verification: "Verified" | "Under Review" | "Pending";
  contributions: number;
  status: "Active" | "Restricted" | "Inactive";
};

const initialDonors: Donor[] = [
  {
    id: "DNR-2048",
    name: "Global Relief Foundation",
    type: "Foundation",
    contact: "contact@grf.org",
    scope: "International",
    verification: "Verified",
    contributions: 842000,
    status: "Active",
  },
  {
    id: "DNR-2039",
    name: "Riverton Foods Ltd",
    type: "Corporate",
    contact: "impact@rivertonfoods.com",
    scope: "National",
    verification: "Verified",
    contributions: 185400,
    status: "Active",
  },
  {
    id: "DNR-2028",
    name: "HealthAccess International",
    type: "International NGO",
    contact: "giving@healthaccess.org",
    scope: "International",
    verification: "Verified",
    contributions: 420000,
    status: "Active",
  },
  {
    id: "DNR-2014",
    name: "Community Giving Circle",
    type: "Community Group",
    contact: "hello@cgc.org",
    scope: "Greater Riverton",
    verification: "Under Review",
    contributions: 48720,
    status: "Restricted",
  },
];

export default function DonorManagement() {
  const [donors, setDonors] = useState(initialDonors);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All types");
  const [verificationFilter, setVerificationFilter] =
    useState("All verification states");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date range");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonors, setSelectedDonors] = useState<string[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [toast, setToast] = useState("");

  const [newDonor, setNewDonor] = useState({
    name: "",
    type: "Foundation",
    contact: "",
    scope: "National",
  });

  const pageSize = 4;

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  // FILTER DONORS

  const filteredDonors = useMemo(() => {
    return donors.filter((donor) => {
      const matchesSearch = [
        donor.id,
        donor.name,
        donor.contact,
        donor.type,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All types" ||
        donor.type === typeFilter;

      const matchesVerification =
        verificationFilter === "All verification states" ||
        donor.verification === verificationFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        donor.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesVerification &&
        matchesStatus
      );
    });
  }, [
    donors,
    search,
    typeFilter,
    verificationFilter,
    statusFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDonors.length / pageSize)
  );

  const paginatedDonors = filteredDonors.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSelect = (id: string) => {
    setSelectedDonors((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const handleAddDonor = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newDonor.name.trim() || !newDonor.contact.trim()) {
      notify("Please enter donor name and contact.");
      return;
    }

    const donor: Donor = {
      id: `DNR-${Math.floor(2000 + Math.random() * 7999)}`,
      name: newDonor.name,
      type: newDonor.type,
      contact: newDonor.contact,
      scope: newDonor.scope,
      verification: "Pending",
      contributions: 0,
      status: "Active",
    };

    setDonors((previous) => [donor, ...previous]);
    setNewDonor({
      name: "",
      type: "Foundation",
      contact: "",
      scope: "National",
    });
    setCurrentPage(1);
    setShowAddModal(false);
    notify("Donor registered successfully.");
  };

  // EXPORT CSV

  const handleExport = () => {
    const headers = [
      "Donor ID",
      "Donor",
      "Type",
      "Contact",
      "Scope",
      "Verification",
      "Lifetime Contributions",
      "Status",
    ];

    const rows = filteredDonors.map((donor) => [
      donor.id,
      donor.name,
      donor.type,
      donor.contact,
      donor.scope,
      donor.verification,
      donor.contributions,
      donor.status,
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
    link.download = "donor-management.csv";
    link.click();

    URL.revokeObjectURL(url);
    notify("Donor report exported successfully.");
  };

  const handleBulkAction = (action: string) => {
    if (selectedDonors.length === 0) {
      notify("Please select at least one donor.");
      return;
    }

    if (action === "Restrict") {
      setDonors((previous) =>
        previous.map((donor) =>
          selectedDonors.includes(donor.id)
            ? { ...donor, status: "Restricted" }
            : donor
        )
      );
    }

    if (action === "Activate") {
      setDonors((previous) =>
        previous.map((donor) =>
          selectedDonors.includes(donor.id)
            ? { ...donor, status: "Active" }
            : donor
        )
      );
    }

    setSelectedDonors([]);
    setShowBulkMenu(false);
    notify(`${action} action completed.`);
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
          <span className="font-semibold">Donor Management</span>
        </div>

        {/* TITLE */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

          <div>
            <h1 className="text-[21px] font-medium">
              Donor Management
            </h1>

            <p className="text-[9px] text-slate-500 mt-1">
              Manage donor profiles, verification,
              communication preferences, and contribution history.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={handleExport}
              className="h-[32px] px-3 bg-white border border-[#b5cbd8] rounded-lg text-[9px] text-[#23749e] flex items-center gap-2 hover:bg-slate-50"
            >
              <Download size={13} />
              Export
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="h-[32px] px-3 bg-[#23749e] text-white rounded-lg text-[9px] font-semibold flex items-center gap-2 hover:bg-[#175c80]"
            >
              <Plus size={13} />
              Add donor
            </button>
          </div>
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
              placeholder="Search donor name, ID, or contact..."
              className="w-full h-[35px] bg-white border border-[#d5e3e9] rounded-lg pl-8 pr-3 text-[9px] outline-none focus:border-[#39ae90]"
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
              options={[
                "All statuses",
                "Active",
                "Restricted",
                "Inactive",
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
              className="h-[35px] px-3 bg-white border border-[#b5cbd8] rounded-lg text-[9px] flex items-center justify-center gap-2 hover:bg-slate-50"
            >
              <Filter size={12} />
              More filters
            </button>
          </div>
        </section>

        {showMoreFilters && (
          <div className="bg-white rounded-lg border border-[#d5e3e9] p-3 mb-3 flex flex-wrap items-center gap-3">
            <div>
              <p className="text-[8px] text-slate-500 mb-1">
                Minimum contribution
              </p>
              <input
                type="number"
                placeholder="Minimum USD"
                className="border rounded-md px-2 py-2 text-[9px] outline-none"
              />
            </div>

            <div>
              <p className="text-[8px] text-slate-500 mb-1">
                Donor scope
              </p>
              <select className="border rounded-md px-2 py-2 text-[9px]">
                <option>All scopes</option>
                <option>International</option>
                <option>National</option>
                <option>Greater Riverton</option>
              </select>
            </div>

            <button
              onClick={() => {
                setShowMoreFilters(false);
                notify("Filters applied.");
              }}
              className="bg-[#23749e] text-white rounded-md px-3 py-2 text-[9px] mt-3"
            >
              Apply
            </button>
          </div>
        )}

        {/* DONOR TABLE */}

        <section className="bg-white rounded-lg border border-[#d5e3e9] shadow-sm overflow-hidden">

          {/* TABLE HEADER */}

          <div className="min-h-[52px] px-3 flex items-center justify-between border-b border-[#d7e4e9]">

            <div>
              <h2 className="text-[10px] font-medium">
                Donor Management
              </h2>

              <p className="text-[8px] text-slate-400 mt-1">
                {filteredDonors.length} demonstration records
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                className="h-[31px] px-3 bg-white border border-[#b5cbd8] rounded-lg text-[8px] hover:bg-slate-50"
              >
                Bulk actions
              </button>

              {showBulkMenu && (
                <div className="absolute right-0 top-9 z-20 w-40 bg-white border border-slate-200 rounded-lg shadow-lg p-1">
                  <button
                    onClick={() => handleBulkAction("Activate")}
                    className="w-full text-left px-3 py-2 text-[9px] hover:bg-slate-50 rounded"
                  >
                    Activate selected
                  </button>

                  <button
                    onClick={() => handleBulkAction("Restrict")}
                    className="w-full text-left px-3 py-2 text-[9px] hover:bg-slate-50 rounded"
                  >
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
                <tr className="h-[27px] bg-[#f5f8f9] border-b border-[#d5e3e9] text-[7px] text-slate-500">

                  <th className="px-2.5 font-medium">
                    Donor ID
                  </th>

                  <th className="px-2 font-medium">Donor</th>

                  <th className="px-2 font-medium">Type</th>

                  <th className="px-2 font-medium">Contact</th>

                  <th className="px-2 font-medium">Scope</th>

                  <th className="px-2 font-medium">Verification</th>

                  <th className="px-2 font-medium">
                    Lifetime Contributions
                  </th>

                  <th className="px-2 font-medium">Status</th>

                  <th className="px-2 font-medium"></th>

                </tr>
              </thead>

              <tbody>
                {paginatedDonors.map((donor, index) => (
                  <tr
                    key={donor.id}
                    className={`h-[36px] border-b border-[#e1eaf0] hover:bg-[#f0f8fa] transition ${
                      index % 2 === 1 ? "bg-[#f7fafb]" : "bg-white"
                    }`}
                  >

                    <td className="px-2.5 text-[7px] font-semibold whitespace-nowrap">
                      {donor.id}
                    </td>

                    <td className="px-2 text-[7px] whitespace-nowrap">
                      {donor.name}
                    </td>

                    <td className="px-2 text-[7px] whitespace-nowrap">
                      {donor.type}
                    </td>

                    <td className="px-2 text-[7px] whitespace-nowrap">
                      {donor.contact}
                    </td>

                    <td className="px-2 text-[7px] whitespace-nowrap">
                      {donor.scope}
                    </td>

                    <td className="px-2 text-[7px] whitespace-nowrap">
                      <VerificationBadge
                        status={donor.verification}
                      />
                    </td>

                    <td className="px-2 text-[7px] whitespace-nowrap">
                      <span className="bg-[#e7f2f8] text-[#23749e] rounded px-2 py-1 font-semibold">
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
                            activeMenu === donor.id
                              ? null
                              : donor.id
                          )
                        }
                        className="text-slate-500 hover:text-[#23749e]"
                      >
                        <MoreHorizontal size={15} />
                      </button>

                      {activeMenu === donor.id && (
                        <div className="absolute right-4 top-6 z-30 bg-white border border-slate-200 shadow-lg rounded-lg w-36 p-1">

                          <button
                            onClick={() => {
                              notify(`Viewing ${donor.name}`);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 text-[9px] hover:bg-slate-50"
                          >
                            View profile
                          </button>

                          <button
                            onClick={() => {
                              setSelectedDonors([donor.id]);
                              notify("Donor selected.");
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-3 py-2 text-[9px] hover:bg-slate-50"
                          >
                            Select donor
                          </button>

                          <button
                            onClick={() => {
                              setDonors((previous) =>
                                previous.map((item) =>
                                  item.id === donor.id
                                    ? {
                                        ...item,
                                        status:
                                          item.status === "Restricted"
                                            ? "Active"
                                            : "Restricted",
                                      }
                                    : item
                                )
                              );

                              setActiveMenu(null);
                              notify("Donor status updated.");
                            }}
                            className="w-full text-left px-3 py-2 text-[9px] hover:bg-slate-50"
                          >
                            {donor.status === "Restricted"
                              ? "Activate"
                              : "Restrict"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedDonors.length === 0 && (
              <div className="py-10 text-center">
                <Users
                  size={24}
                  className="mx-auto text-slate-300 mb-2"
                />
                <p className="text-[10px] text-slate-400">
                  No donors found.
                </p>
              </div>
            )}
          </div>

          {/* PAGINATION */}

          <div className="min-h-[43px] px-3 flex flex-wrap items-center justify-between gap-2">

            <p className="text-[8px] text-slate-400">
              Showing{" "}
              {filteredDonors.length === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
              {"–"}
              {Math.min(currentPage * pageSize, filteredDonors.length)}
              {" "}of {filteredDonors.length}
              {search === "" &&
                typeFilter === "All types" &&
                statusFilter === "All statuses" &&
                verificationFilter === "All verification states" &&
                " · 2,184"}
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
                { length: Math.min(totalPages, 3) },
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

      {/* ADD DONOR MODAL */}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4">

          <form
            onSubmit={handleAddDonor}
            className="bg-white rounded-xl shadow-xl w-full max-w-[430px] p-5"
          >

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[16px] font-semibold">
                  Register new donor
                </h2>

                <p className="text-[9px] text-slate-400 mt-1">
                  Enter the donor information below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-red-500"
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
                  placeholder="Enter donor name"
                  className="form-input"
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
                  className="form-input"
                >
                  <option>Foundation</option>
                  <option>Corporate</option>
                  <option>International NGO</option>
                  <option>Community Group</option>
                  <option>Individual</option>
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
                  placeholder="example@email.com"
                  className="form-input"
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
                  className="form-input"
                >
                  <option>National</option>
                  <option>International</option>
                  <option>Greater Riverton</option>
                </select>
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
                className="px-4 py-2 bg-[#23749e] text-white rounded-lg text-[10px] font-semibold"
              >
                Register donor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TOAST */}

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
        className="appearance-none w-full lg:w-[110px] h-[35px] bg-white border border-[#d5e3e9] rounded-lg pl-2 pr-6 text-[8px] outline-none focus:border-[#39ae90] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
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
    <span className={`px-2 py-1 rounded text-[7px] whitespace-nowrap ${styles[status]}`}>
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
    <span className={`px-2 py-1 rounded text-[7px] font-semibold whitespace-nowrap ${styles[status]}`}>
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
      <span className="block text-[9px] font-medium mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
