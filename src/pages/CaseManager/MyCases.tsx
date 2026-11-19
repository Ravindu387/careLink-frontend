import React, { useMemo, useState } from "react";

import {
  Menu,
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  Download,
  Plus,
  Filter,
  ChevronDown,
  ChevronLeft,
  MoreHorizontal,
  X,
} from "lucide-react";

// ==============================
// Types
// ==============================

interface Case {
  id: string;
  category: string;
  applicant: string;
  location: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  confidence: string;
  verification: string;
  assigned: string;
  age: string;
  status: "Under Review" | "Assigned" | "Escalated" | "Submitted";
  event: string;
}

// ==============================
// Sample Cases
// ==============================

const caseData: Case[] = [
  {
    id: "REQ-2841",
    category: "Emergency shelter",
    applicant: "D. Jayawardena - 6 people",
    location: "Riverside, North Ward",
    priority: "Critical",
    confidence: "94% confidence",
    verification: "Evidence pending",
    assigned: "You",
    age: "18 min",
    status: "Under Review",
    event: "Flood Response",
  },
  {
    id: "REQ-2839",
    category: "Medical supplies",
    applicant: "Community Clinic - 48 people",
    location: "Old Town, Sector 4",
    priority: "High",
    confidence: "91% confidence",
    verification: "Verified",
    assigned: "You",
    age: "34 min",
    status: "Assigned",
    event: "Flood Response",
  },
  {
    id: "REQ-2821",
    category: "Rescue assistance",
    applicant: "P. Nadarajah - 5 people",
    location: "North Ward",
    priority: "Critical",
    confidence: "96% confidence",
    verification: "Verified",
    assigned: "You",
    age: "1h 34m",
    status: "Escalated",
    event: "Flood Response",
  },
  {
    id: "REQ-2818",
    category: "Food & water",
    applicant: "S. Fernando - 4 people",
    location: "Eastbank, Sector 2",
    priority: "High",
    confidence: "88% confidence",
    verification: "Verified",
    assigned: "You",
    age: "2h 15m",
    status: "Assigned",
    event: "Storm Response",
  },
  {
    id: "REQ-2805",
    category: "Emergency shelter",
    applicant: "R. Silva - 3 people",
    location: "West Ward",
    priority: "Medium",
    confidence: "85% confidence",
    verification: "Evidence pending",
    assigned: "You",
    age: "3h 20m",
    status: "Submitted",
    event: "Flood Response",
  },
  {
    id: "REQ-2798",
    category: "Medical supplies",
    applicant: "K. Perera - 2 people",
    location: "South Ward",
    priority: "High",
    confidence: "90% confidence",
    verification: "Verified",
    assigned: "You",
    age: "4h 10m",
    status: "Under Review",
    event: "Flood Response",
  },
];

// ==============================
// Main Component
// ==============================

const MyCases: React.FC = () => {

  const [activeTab, setActiveTab] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");

  const [priorityFilter, setPriorityFilter] = useState("All priorities");

  const [categoryFilter, setCategoryFilter] = useState("All categories");

  const [statusFilter, setStatusFilter] = useState("All statuses");

  const [eventFilter, setEventFilter] = useState("All crisis events");

  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCases, setSelectedCases] = useState<string[]>([]);

  const itemsPerPage = 3;

  // ==============================
  // Filtering
  // ==============================

  const filteredCases = useMemo(() => {
    return caseData.filter((item) => {

      const searchMatch =
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());

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
        (activeTab === "Critical" && item.priority === "Critical") ||
        (activeTab === "Due soon" &&
          ["Critical", "High"].includes(item.priority)) ||
        (activeTab === "Pending information" &&
          item.verification === "Evidence pending") ||
        (activeTab === "Recently updated" &&
          ["Under Review", "Assigned"].includes(item.status));

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

  // ==============================
  // Pagination
  // ==============================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCases.length / itemsPerPage)
  );

  const currentCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==============================
  // Export CSV
  // ==============================

  const exportCases = () => {
    const headers = [
      "Case ID",
      "Category",
      "Applicant",
      "Location",
      "Priority",
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
      item.verification,
      item.assigned,
      item.age,
      item.status,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row.map((value) => `"${value}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "my-cases.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // ==============================
  // Select Cases
  // ==============================

  const toggleCase = (id: string) => {
    setSelectedCases((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  // ==============================
  // Reset Filters
  // ==============================

  const resetFilters = () => {
    setSearchTerm("");
    setPriorityFilter("All priorities");
    setCategoryFilter("All categories");
    setStatusFilter("All statuses");
    setEventFilter("All crisis events");
    setActiveTab("All");
    setCurrentPage(1);
  };

  // ==============================
  // Badge Styles
  // ==============================

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

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // ==============================
  // Tabs
  // ==============================

  const tabs = [
    "All",
    "Critical",
    "Due soon",
    "Pending information",
    "Recently updated",
  ];

  // ==============================
  // JSX
  // ==============================

  return (

    <div className="min-h-screen bg-[#eff6f8] text-slate-800">

   

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="mx-auto max-w-[1600px] px-5 py-6 lg:px-9">

        {/* Breadcrumb */}

        <div className="mb-9 flex items-center gap-2 text-xs text-slate-400">

          <span>Operations</span>

          <ChevronRight size={13} />

          <span>Case Management</span>

          <ChevronRight size={13} />

          <span className="font-semibold text-slate-800">
            My Cases
          </span>

        </div>

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="mb-9 flex flex-wrap items-center justify-between gap-5">

          <div>

            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">
              My Cases
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage assigned assistance cases and response actions.
            </p>

          </div>

          <div className="flex gap-3">

            <button
              onClick={exportCases}
              className="flex items-center gap-3 rounded-lg border border-[#b9d0df] bg-white px-5 py-3 text-sm font-medium text-[#287da8] transition hover:bg-sky-50"
            >
              <Download size={18} />
              Export
            </button>

            <button
              onClick={() => alert("Create Case page coming soon!")}
              className="flex items-center gap-3 rounded-lg bg-[#287da8] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#17678f]"
            >
              <Plus size={19} />
              Create case
            </button>

          </div>

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
                  3
                </span>
              )}

              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#287da8]" />
              )}

            </button>

          ))}

        </div>

        {/* =====================================
            FILTER SECTION
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
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none focus:border-sky-500"
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
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none focus:border-sky-500"
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
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none focus:border-sky-500"
          >
            <option>All categories</option>
            <option>Emergency shelter</option>
            <option>Medical supplies</option>
            <option>Rescue assistance</option>
            <option>Food & water</option>
          </select>

          {/* Status Filter */}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none focus:border-sky-500"
          >
            <option>All statuses</option>
            <option>Under Review</option>
            <option>Assigned</option>
            <option>Escalated</option>
            <option>Submitted</option>
          </select>

          {/* Date Filter */}

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

        {/* More filters expanded */}

        {showFilters && (

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sky-100 bg-white p-4">

            <div>
              <p className="text-sm font-semibold">
                Advanced filters
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Manage your case filtering options.
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

          {/* Table Header */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d5e2eb] px-5 py-5">

            <div>

              <h2 className="text-base font-medium text-[#173e5b]">
                My Cases
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                {filteredCases.length === 0
                  ? "No cases found"
                  : `Showing ${filteredCases.length} demonstration cases`}
              </p>

            </div>

            <button
              onClick={() => {
                if (selectedCases.length > 0) {
                  alert(
                    `Selected ${selectedCases.length} cases`
                  );
                } else {
                  alert("Please select cases first.");
                }
              }}
              className="rounded-lg border border-[#b9d0df] bg-white px-4 py-3 text-xs font-medium text-[#287da8] transition hover:bg-sky-50"
            >
              Bulk actions
              {selectedCases.length > 0 &&
                ` (${selectedCases.length})`}
            </button>

          </div>

          {/* Table */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1150px] text-left">

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
                          {item.priority}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {item.confidence}
                        </p>

                      </td>

                      <td className="whitespace-nowrap px-3 py-5 text-[11px] text-slate-600">
                        {item.verification}
                      </td>

                      <td className="px-3 py-5 text-[11px] text-slate-600">
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
                          onClick={() =>
                            alert(`Viewing case ${item.id}`)
                          }
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
                      No cases found. Try changing your filters.
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

export default MyCases;