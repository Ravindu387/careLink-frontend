import React, { useMemo, useState } from "react";

import {
  Menu,
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  Download,
  Filter,
  ChevronLeft,
  X,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

interface Case {
  id: string;
  category: string;
  applicant: string;
  location: string;
  priority: string;
  aiPriority: string;
  confidence: string;
  verification: string;
  assigned: string;
  age: string;
  status: string;
  event: string;
}

// ==========================================
// DEMONSTRATION DATA
// ==========================================

const caseData: Case[] = [
  {
    id: "REQ-2836",
    category: "Food & water",
    applicant: "M. Rasheed - 3 people",
    location: "Eastbank, Sector 2",
    priority: "High",
    aiPriority: "High",
    confidence: "87% confidence",
    verification: "Contact verified",
    assigned: "Unassigned",
    age: "49 min",
    status: "Submitted",
    event: "Flood Response",
  },
  {
    id: "REQ-2814",
    category: "Medicine",
    applicant: "R. Perera - 1 people",
    location: "West District",
    priority: "High",
    aiPriority: "Medium",
    confidence: "74% confidence",
    verification: "Needs information",
    assigned: "Unassigned",
    age: "2h 08m",
    status: "Pending Info",
    event: "Flood Response",
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const UnassignedCases: React.FC = () => {

  const [activeTab, setActiveTab] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");

  const [priorityFilter, setPriorityFilter] =
    useState("All priorities");

  const [categoryFilter, setCategoryFilter] =
    useState("All categories");

  const [statusFilter, setStatusFilter] =
    useState("All statuses");

  const [eventFilter, setEventFilter] =
    useState("All crisis events");

  const [showFilters, setShowFilters] = useState(false);

  const [selectedCases, setSelectedCases] =
    useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 2;

  // ==========================================
  // FILTER CASES
  // ==========================================

  const filteredCases = useMemo(() => {

    return caseData.filter((item) => {

      const searchMatch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const priorityMatch =
        priorityFilter === "All priorities" ||
        item.priority === priorityFilter;

      const categoryMatch =
        categoryFilter === "All categories" ||
        item.category === categoryFilter;

      const statusMatch =
        statusFilter === "All statuses" ||
        item.status === statusFilter;

      const eventMatch =
        eventFilter === "All crisis events" ||
        item.event === eventFilter;

      const tabMatch =
        activeTab === "All" ||
        (activeTab === "Critical" &&
          item.priority === "Critical") ||
        (activeTab === "Due soon" &&
          ["Critical", "High"].includes(item.priority)) ||
        (activeTab === "Pending information" &&
          item.verification === "Needs information") ||
        (activeTab === "Recently updated" &&
          item.status === "Submitted");

      return (
        searchMatch &&
        priorityMatch &&
        categoryMatch &&
        statusMatch &&
        eventMatch &&
        tabMatch
      );

    });

  }, [
    searchTerm,
    priorityFilter,
    categoryFilter,
    statusFilter,
    eventFilter,
    activeTab,
  ]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCases.length / itemsPerPage)
  );

  const currentCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==========================================
  // EXPORT CSV
  // ==========================================

  const handleExport = () => {

    const headers = [
      "Case ID",
      "Category",
      "Applicant",
      "Location",
      "Priority",
      "AI Priority",
      "Verification",
      "Assigned",
      "Age",
      "Status",
    ];

    const rows = filteredCases.map((item) => [
      item.id,
      item.category,
      item.applicant,
      item.location,
      item.priority,
      item.aiPriority,
      item.verification,
      item.assigned,
      item.age,
      item.status,
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row.map((value) => `"${value}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "unassigned-cases.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  // ==========================================
  // RESET FILTERS
  // ==========================================

  const resetFilters = () => {

    setSearchTerm("");
    setPriorityFilter("All priorities");
    setCategoryFilter("All categories");
    setStatusFilter("All statuses");
    setEventFilter("All crisis events");
    setActiveTab("All");
    setCurrentPage(1);

  };

  // ==========================================
  // SELECT CASES
  // ==========================================

  const toggleCase = (id: string) => {

    setSelectedCases((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );

  };

  // ==========================================
  // BADGE STYLES
  // ==========================================

  const priorityStyle = (priority: string) => {

    switch (priority) {

      case "Critical":
        return "bg-red-100 text-red-700";

      case "High":
        return "bg-orange-100 text-orange-700";

      case "Medium":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-green-100 text-green-700";

    }

  };

  const statusStyle = (status: string) => {

    switch (status) {

      case "Submitted":
        return "bg-orange-100 text-orange-700";

      case "Pending Info":
        return "bg-amber-100 text-amber-700";

      case "Under Review":
        return "bg-sky-100 text-sky-700";

      default:
        return "bg-emerald-100 text-emerald-700";

    }

  };

  // ==========================================
  // TABS
  // ==========================================

  const tabs = [
    "All",
    "Critical",
    "Due soon",
    "Pending information",
    "Recently updated",
  ];

  // ==========================================
  // JSX
  // ==========================================

  return (

    <div className="min-h-screen bg-[#eff6f8] text-slate-800">

    

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="mx-auto max-w-[1600px] px-5 py-5 lg:px-9">

        {/* BREADCRUMB */}

        <div className="mb-9 flex items-center gap-2 text-xs text-slate-400">

          <span>Operations</span>

          <ChevronRight size={13} />

          <span>Case Management</span>

          <ChevronRight size={13} />

          <span className="font-semibold text-slate-800">
            Unassigned Cases
          </span>

        </div>

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">
              Unassigned Cases
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review and claim cases awaiting an authorised case manager.
            </p>

          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-3 rounded-lg border border-[#b9d0df] bg-white px-5 py-3 text-sm font-medium text-[#287da8] transition hover:bg-sky-50"
          >

            <Download size={18} />

            Export

          </button>

        </div>

        {/* =====================================
            TABS
        ===================================== */}

        <div className="mb-4 flex flex-wrap items-center gap-7 border-b border-[#d5e2eb]">

          {tabs.map((tab) => (

            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`relative flex items-center gap-2 py-4 text-xs transition ${
                activeTab === tab
                  ? "font-semibold text-[#287da8]"
                  : "text-slate-500 hover:text-sky-700"
              }`}
            >

              {tab}

              {tab === "All" && (

                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">
                  2
                </span>

              )}

              {activeTab === tab && (

                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#287da8]" />

              )}

            </button>

          ))}

        </div>

        {/* =====================================
            SEARCH & FILTERS
        ===================================== */}

        <div className="mb-4 flex flex-wrap items-center gap-3">

          {/* Search */}

          <div className="flex min-w-[230px] flex-1 items-center gap-3 rounded-lg border border-[#d2e0e9] bg-white px-4 py-3">

            <Search size={19} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search case ID, applicant, location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            />

            {searchTerm && (

              <button onClick={() => setSearchTerm("")}>
                <X size={15} className="text-slate-400" />
              </button>

            )}

          </div>

          {/* Crisis Events */}

          <select
            value={eventFilter}
            onChange={(e) => {
              setEventFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>All crisis events</option>
            <option>Flood Response</option>
            <option>Storm Response</option>

          </select>

          {/* Priority */}

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>All priorities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>

          </select>

          {/* Category */}

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>All categories</option>
            <option>Food & water</option>
            <option>Medicine</option>
            <option>Emergency shelter</option>
            <option>Rescue assistance</option>

          </select>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>All statuses</option>
            <option>Submitted</option>
            <option>Pending Info</option>
            <option>Under Review</option>
            <option>Assigned</option>

          </select>

          {/* Date Range */}

          <select
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
            defaultValue="Date range"
          >

            <option>Date range</option>
            <option>Today</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>

          </select>

          {/* More Filters */}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-3 rounded-lg border border-[#b9d0df] bg-white px-5 py-3 text-xs font-semibold text-[#287da8] hover:bg-sky-50"
          >

            <Filter size={17} />

            More filters

          </button>

        </div>

        {/* ADVANCED FILTERS */}

        {showFilters && (

          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">

            <div>

              <p className="text-sm font-semibold text-slate-700">
                Advanced filters
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Manage your unassigned case filtering options.
              </p>

            </div>

            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-sky-700 hover:underline"
            >
              Clear all filters
            </button>

          </div>

        )}

        {/* =====================================
            CASE TABLE
        ===================================== */}

        <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.06)]">

          {/* TABLE HEADER */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d5e2eb] px-5 py-4">

            <div>

              <h2 className="text-base font-medium text-[#173e5b]">
                Unassigned Cases
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {filteredCases.length} demonstration cases
              </p>

            </div>

            <button
              onClick={() => {

                if (selectedCases.length === 0) {
                  alert("Please select cases first.");
                } else {
                  alert(
                    `Selected ${selectedCases.length} cases. Claim action requires backend integration.`
                  );
                }

              }}
              className="rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-xs font-medium text-[#287da8] transition hover:bg-sky-50"
            >

              Bulk actions

              {selectedCases.length > 0 &&
                ` (${selectedCases.length})`}

            </button>

          </div>

          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left">

              <thead className="bg-[#f7f9fa]">

                <tr className="border-b border-[#d5e2eb] text-[11px] font-semibold text-slate-500">

                  <th className="px-3 py-3">Case</th>

                  <th className="px-3 py-3">
                    Category & Applicant
                  </th>

                  <th className="px-3 py-3">Location</th>

                  <th className="px-3 py-3">Reported</th>

                  <th className="px-3 py-3">AI Priority</th>

                  <th className="px-3 py-3">Verification</th>

                  <th className="px-3 py-3">Assigned</th>

                  <th className="px-3 py-3">Age</th>

                  <th className="px-3 py-3">Status</th>

                  <th className="px-3 py-3"></th>

                </tr>

              </thead>

              <tbody>

                {currentCases.length > 0 ? (

                  currentCases.map((item) => (

                    <tr
                      key={item.id}
                      className="border-b border-[#e5edf2] transition hover:bg-[#f8fbfd]"
                    >

                      <td className="whitespace-nowrap px-3 py-5 text-[11px] font-bold text-[#173e5b]">

                        {item.id}

                      </td>

                      <td className="px-3 py-5">

                        <p className="whitespace-nowrap text-[11px] font-semibold text-[#173e5b]">
                          {item.category}
                        </p>

                        <p className="mt-1 whitespace-nowrap text-[10px] text-slate-500">
                          {item.applicant}
                        </p>

                      </td>

                      <td className="whitespace-nowrap px-3 py-5 text-[11px] text-slate-600">

                        {item.location}

                      </td>

                      <td className="px-3 py-5">

                        <span
                          className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${priorityStyle(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>

                      </td>

                      <td className="px-3 py-5">

                        <p className="text-[11px] font-semibold text-slate-700">
                          {item.aiPriority}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {item.confidence}
                        </p>

                      </td>

                      <td className="whitespace-nowrap px-3 py-5 text-[11px] text-slate-600">

                        {item.verification}

                      </td>

                      <td className="whitespace-nowrap px-3 py-5 text-[11px] text-slate-600">

                        {item.assigned}

                      </td>

                      <td className="whitespace-nowrap px-3 py-5 text-[11px] text-slate-600">

                        {item.age}

                      </td>

                      <td className="px-3 py-5">

                        <span
                          className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${statusStyle(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>

                      </td>

                      <td className="px-3 py-5">

                        <div className="flex items-center gap-2">

                          <input
                            type="checkbox"
                            checked={selectedCases.includes(item.id)}
                            onChange={() => toggleCase(item.id)}
                            title="Select case"
                            className="accent-sky-700"
                          />

                          <button
                            title="View case details"
                            onClick={() =>
                              alert(`Viewing ${item.id}`)
                            }
                            className="text-slate-400 transition hover:text-sky-700"
                          >

                            <ChevronRight size={21} />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan={10}
                      className="py-16 text-center text-sm text-slate-400"
                    >
                      No unassigned cases found.
                      Try changing your filters.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* =====================================
              PAGINATION
          ===================================== */}

          <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">

            <p className="text-xs text-slate-400">

              Showing{" "}

              {filteredCases.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}

              –

              {Math.min(
                currentPage * itemsPerPage,
                filteredCases.length
              )}

              {" "}of {filteredCases.length}

            </p>

            <div className="flex items-center gap-2">

              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.max(1, previous - 1)
                  )
                }
                className="flex items-center gap-1 rounded-lg border border-[#d5e2eb] px-4 py-2.5 text-xs text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >

                <ChevronLeft size={14} />

                Previous

              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (

                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 w-9 rounded-lg border text-xs transition ${
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
                onClick={() =>
                  setCurrentPage((previous) =>
                    Math.min(totalPages, previous + 1)
                  )
                }
                className="flex items-center gap-1 rounded-lg border border-[#b9d0df] px-4 py-2.5 text-xs font-medium text-[#287da8] transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
              >

                Next

                <ChevronRight size={14} />

              </button>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

};

export default UnassignedCases;