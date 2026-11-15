import React, { useMemo, useState } from "react";

import {
  Menu,
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  ChevronLeft,
  Download,
  Filter,
  X,
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

interface PriorityCase {
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
  minutes: number;
}

// ==========================================
// DEMONSTRATION DATA
// ==========================================

const initialCases: PriorityCase[] = [
  {
    id: "REQ-2841",
    category: "Emergency shelter",
    applicant: "D. Jayawardena - 6 people",
    location: "Riverside, North Ward",
    priority: "Critical",
    aiPriority: "Critical",
    confidence: "94% confidence",
    verification: "Evidence pending",
    assigned: "You",
    age: "18 min",
    status: "Under Review",
    event: "Flood Response",
    minutes: 18,
  },
  {
    id: "REQ-2839",
    category: "Medical supplies",
    applicant: "Community Clinic - 48 people",
    location: "Old Town, Sector 4",
    priority: "High",
    aiPriority: "High",
    confidence: "91% confidence",
    verification: "Verified",
    assigned: "You",
    age: "34 min",
    status: "Assigned",
    event: "Flood Response",
    minutes: 34,
  },
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
    minutes: 49,
  },
  {
    id: "REQ-2821",
    category: "Rescue assistance",
    applicant: "P. Nadarajah - 5 people",
    location: "North Ward",
    priority: "Critical",
    aiPriority: "Critical",
    confidence: "96% confidence",
    verification: "Verified",
    assigned: "You",
    age: "1h 34m",
    status: "Escalated",
    event: "Storm Response",
    minutes: 94,
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
    minutes: 128,
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const PriorityQueue: React.FC = () => {

  const [cases, setCases] = useState<PriorityCase[]>(initialCases);

  const [activeTab, setActiveTab] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");

  const [eventFilter, setEventFilter] =
    useState("All crisis events");

  const [priorityFilter, setPriorityFilter] =
    useState("All priorities");

  const [categoryFilter, setCategoryFilter] =
    useState("All categories");

  const [statusFilter, setStatusFilter] =
    useState("All statuses");

  const [dateFilter, setDateFilter] =
    useState("Date range");

  const [showFilters, setShowFilters] = useState(false);

  const [showPolicy, setShowPolicy] = useState(false);

  const [selectedCases, setSelectedCases] =
    useState<string[]>([]);

  const [selectedCase, setSelectedCase] =
    useState<PriorityCase | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  // ==========================================
  // FILTER CASES
  // ==========================================

  const filteredCases = useMemo(() => {

    return cases.filter((item) => {

      const searchMatch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const eventMatch =
        eventFilter === "All crisis events" ||
        item.event === eventFilter;

      const priorityMatch =
        priorityFilter === "All priorities" ||
        item.priority === priorityFilter;

      const categoryMatch =
        categoryFilter === "All categories" ||
        item.category === categoryFilter;

      const statusMatch =
        statusFilter === "All statuses" ||
        item.status === statusFilter;

      const dateMatch =
        dateFilter === "Date range" ||
        dateFilter === "All time" ||
        (dateFilter === "Last 1 hour" && item.minutes <= 60) ||
        (dateFilter === "Last 24 hours" && item.minutes <= 1440);

      const tabMatch =
        activeTab === "All" ||
        (activeTab === "Critical" &&
          item.priority === "Critical") ||
        (activeTab === "Due soon" &&
          item.minutes <= 60) ||
        (activeTab === "Pending information" &&
          item.status === "Pending Info") ||
        (activeTab === "Recently updated" &&
          ["Under Review", "Assigned"].includes(item.status));

      return (
        searchMatch &&
        eventMatch &&
        priorityMatch &&
        categoryMatch &&
        statusMatch &&
        dateMatch &&
        tabMatch
      );

    });

  }, [
    cases,
    searchTerm,
    eventFilter,
    priorityFilter,
    categoryFilter,
    statusFilter,
    dateFilter,
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
      "Confidence",
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
      item.confidence,
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
    link.download = "priority-queue.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // ==========================================
  // RESET FILTERS
  // ==========================================

  const resetFilters = () => {

    setSearchTerm("");
    setEventFilter("All crisis events");
    setPriorityFilter("All priorities");
    setCategoryFilter("All categories");
    setStatusFilter("All statuses");
    setDateFilter("Date range");
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
  // CLAIM SELECTED CASES
  // ==========================================

  const handleBulkAction = () => {

    if (selectedCases.length === 0) {
      alert("Please select at least one case.");
      return;
    }

    const confirmClaim = window.confirm(
      `Claim ${selectedCases.length} selected case(s)?`
    );

    if (!confirmClaim) return;

    setCases((previous) =>
      previous.map((item) =>
        selectedCases.includes(item.id)
          ? {
              ...item,
              assigned: "You",
              status: "Assigned",
            }
          : item
      )
    );

    setSelectedCases([]);

    alert("Selected cases have been assigned in this demo.");

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

      case "Under Review":
        return "bg-orange-100 text-orange-700";

      case "Assigned":
        return "bg-emerald-100 text-emerald-700";

      case "Escalated":
        return "bg-red-100 text-red-700";

      case "Submitted":
        return "bg-amber-100 text-amber-700";

      case "Pending Info":
        return "bg-amber-100 text-amber-700";

      default:
        return "bg-slate-100 text-slate-700";

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

        {/* Breadcrumb */}

        <div className="mb-9 flex items-center gap-2 text-xs text-slate-400">

          <span>Operations</span>

          <ChevronRight size={13} />

          <span>Case Management</span>

          <ChevronRight size={13} />

          <span className="font-semibold text-slate-800">
            Priority Queue
          </span>

        </div>

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">
              Priority Queue
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Act on critical, high-priority, and SLA-risk cases.
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
            SLA ALERT
        ===================================== */}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 border-l-[4px] border-l-red-600 bg-[#fff5f5] px-4 py-4">

          <div className="flex items-center gap-3">

            <AlertTriangle
              size={22}
              className="text-red-700"
            />

            <div>

              <p className="text-xs font-bold text-red-900">
                3 critical cases are overdue
              </p>

              <p className="mt-1 text-xs text-red-800">
                Prioritise immediate life-safety reviews before lower-risk work.
              </p>

            </div>

          </div>

          <button
            onClick={() => setShowPolicy(true)}
            className="rounded-lg border border-[#b9d0df] bg-white px-5 py-3 text-xs font-semibold text-[#287da8] transition hover:bg-sky-50"
          >
            View SLA policy
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
                  5
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

          {/* Event Filter */}

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

          {/* Priority Filter */}

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

          {/* Category Filter */}

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >
            <option>All categories</option>
            <option>Emergency shelter</option>
            <option>Medical supplies</option>
            <option>Food & water</option>
            <option>Rescue assistance</option>
            <option>Medicine</option>
          </select>

          {/* Status Filter */}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >
            <option>All statuses</option>
            <option>Under Review</option>
            <option>Assigned</option>
            <option>Submitted</option>
            <option>Escalated</option>
            <option>Pending Info</option>
          </select>

          {/* Date Filter */}

          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >
            <option>Date range</option>
            <option>Last 1 hour</option>
            <option>Last 24 hours</option>
            <option>All time</option>
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

        {/* Advanced Filters */}

        {showFilters && (

          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">

            <div>

              <p className="text-sm font-semibold text-slate-700">
                Advanced filters
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Filter priority cases by their urgency and response status.
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
            PRIORITY QUEUE TABLE
        ===================================== */}

        <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.06)]">

          {/* Table Header */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d5e2eb] px-5 py-4">

            <div>

              <h2 className="text-base font-medium text-[#173e5b]">
                Priority Queue
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {filteredCases.length} demonstration cases
              </p>

            </div>

            <button
              onClick={handleBulkAction}
              className="rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-xs font-medium text-[#287da8] transition hover:bg-sky-50"
            >

              Bulk actions

              {selectedCases.length > 0 &&
                ` (${selectedCases.length})`}

            </button>

          </div>

          {/* Table */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left">

              <thead className="bg-[#f7f9fa]">

                <tr className="border-b border-[#d5e2eb] text-[11px] font-semibold text-slate-500">

                  <th className="px-3 py-4">
                    <input
                      type="checkbox"
                      checked={
                        currentCases.length > 0 &&
                        currentCases.every((item) =>
                          selectedCases.includes(item.id)
                        )
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCases((previous) => [
                            ...new Set([
                              ...previous,
                              ...currentCases.map((item) => item.id),
                            ]),
                          ]);
                        } else {
                          setSelectedCases((previous) =>
                            previous.filter(
                              (id) =>
                                !currentCases.some(
                                  (item) => item.id === id
                                )
                            )
                          );
                        }
                      }}
                      className="accent-sky-700"
                    />
                  </th>

                  <th className="px-3 py-4">Case</th>

                  <th className="px-3 py-4">
                    Category & Applicant
                  </th>

                  <th className="px-3 py-4">Location</th>

                  <th className="px-3 py-4">Reported</th>

                  <th className="px-3 py-4">AI Priority</th>

                  <th className="px-3 py-4">Verification</th>

                  <th className="px-3 py-4">Assigned</th>

                  <th className="px-3 py-4">Age</th>

                  <th className="px-3 py-4">Status</th>

                  <th className="px-3 py-4"></th>

                </tr>

              </thead>

              <tbody>

                {currentCases.length > 0 ? (

                  currentCases.map((item) => (

                    <tr
                      key={item.id}
                      className="border-b border-[#e5edf2] transition hover:bg-[#f8fbfd]"
                    >

                      <td className="px-3 py-5">

                        <input
                          type="checkbox"
                          checked={selectedCases.includes(item.id)}
                          onChange={() => toggleCase(item.id)}
                          className="accent-sky-700"
                        />

                      </td>

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

                        <button
                          title="View case details"
                          onClick={() => setSelectedCase(item)}
                          className="text-slate-400 transition hover:text-sky-700"
                        >
                          <ChevronRight size={21} />
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan={11}
                      className="py-16 text-center text-sm text-slate-400"
                    >
                      No priority cases found. Try changing your filters.
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

      {/* =====================================
          CASE DETAILS MODAL
      ===================================== */}

      {selectedCase && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-[#173e5b]">
                  Priority Case Details
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedCase.id}
                </p>

              </div>

              <button
                onClick={() => setSelectedCase(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="space-y-4">

              {[
                ["Category", selectedCase.category],
                ["Applicant", selectedCase.applicant],
                ["Location", selectedCase.location],
                ["Priority", selectedCase.priority],
                ["AI Priority", selectedCase.aiPriority],
                ["AI Confidence", selectedCase.confidence],
                ["Verification", selectedCase.verification],
                ["Assigned", selectedCase.assigned],
                ["Age", selectedCase.age],
                ["Status", selectedCase.status],
              ].map(([label, value]) => (

                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-slate-100 pb-3"
                >

                  <span className="text-xs text-slate-400">
                    {label}
                  </span>

                  <span className="text-right text-xs font-semibold text-slate-700">
                    {value}
                  </span>

                </div>

              ))}

            </div>

            <button
              onClick={() => setSelectedCase(null)}
              className="mt-6 w-full rounded-lg bg-[#287da8] py-3 text-sm font-semibold text-white hover:bg-[#17678f]"
            >
              Close
            </button>

          </div>

        </div>

      )}

      {/* =====================================
          SLA POLICY MODAL
      ===================================== */}

      {showPolicy && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <ShieldAlert
                  size={22}
                  className="text-red-600"
                />

                <h2 className="text-lg font-semibold text-[#173e5b]">
                  SLA Policy
                </h2>

              </div>

              <button
                onClick={() => setShowPolicy(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="space-y-4">

              <div className="rounded-lg bg-red-50 p-4">

                <p className="text-sm font-semibold text-red-800">
                  Critical Priority
                </p>

                <p className="mt-1 text-xs text-red-700">
                  Immediate review. Verify or escalate within 30 minutes.
                </p>

              </div>

              <div className="rounded-lg bg-orange-50 p-4">

                <p className="text-sm font-semibold text-orange-800">
                  High Priority
                </p>

                <p className="mt-1 text-xs text-orange-700">
                  Review as soon as possible and prioritise urgent needs.
                </p>

              </div>

              <div className="rounded-lg bg-yellow-50 p-4">

                <p className="text-sm font-semibold text-yellow-800">
                  Medium Priority
                </p>

                <p className="mt-1 text-xs text-yellow-700">
                  Process according to operational capacity.
                </p>

              </div>

              <div className="rounded-lg bg-emerald-50 p-4">

                <p className="text-sm font-semibold text-emerald-800">
                  Low Priority
                </p>

                <p className="mt-1 text-xs text-emerald-700">
                  Handle through the normal case management workflow.
                </p>

              </div>

            </div>

            <button
              onClick={() => setShowPolicy(false)}
              className="mt-6 w-full rounded-lg bg-[#287da8] py-3 text-sm font-semibold text-white hover:bg-[#17678f]"
            >
              Close policy
            </button>

          </div>

        </div>

      )}

    </div>

  );
};

export default PriorityQueue;