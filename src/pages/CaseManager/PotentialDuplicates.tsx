import React, { useMemo, useState } from "react";

import {
  Menu,
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  ChevronLeft,
  Filter,
  X,
  Copy,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSearch,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

interface DuplicateCase {
  id: string;
  primaryCase: string;
  duplicateCase: string;
  factors: string;
  score: number;
  confidence: "High" | "Medium" | "Low";
  status: "Awaiting Review" | "Deferred" | "Confirmed" | "Not Duplicate";
  category: string;
  detected: string;
  description: string;
}

// ==========================================
// DEMONSTRATION DATA
// ==========================================

const initialDuplicates: DuplicateCase[] = [
  {
    id: "DUP-118",
    primaryCase: "REQ-2841",
    duplicateCase: "REQ-2798",
    factors: "Same phone · 120m proximity · Similar household",
    score: 92,
    confidence: "High",
    status: "Awaiting Review",
    category: "Emergency shelter",
    detected: "10 min ago",
    description:
      "Both requests contain similar applicant contact information and household details.",
  },
  {
    id: "DUP-114",
    primaryCase: "REQ-2836",
    duplicateCase: "REQ-2811",
    factors: "Same address · Matching category",
    score: 88,
    confidence: "High",
    status: "Awaiting Review",
    category: "Food & water",
    detected: "25 min ago",
    description:
      "Both requests have the same reported address and assistance category.",
  },
  {
    id: "DUP-107",
    primaryCase: "REQ-2789",
    duplicateCase: "REQ-2774",
    factors: "Shared contact · Similar description",
    score: 76,
    confidence: "Medium",
    status: "Deferred",
    category: "Medical supplies",
    detected: "1 hour ago",
    description:
      "Requests share contact information and have similar descriptions.",
  },
  {
    id: "DUP-102",
    primaryCase: "REQ-2761",
    duplicateCase: "REQ-2742",
    factors: "80m proximity · Same family size",
    score: 69,
    confidence: "Low",
    status: "Awaiting Review",
    category: "Emergency shelter",
    detected: "2 hours ago",
    description:
      "Both requests were submitted from nearby locations with matching household sizes.",
  },
  {
    id: "DUP-099",
    primaryCase: "REQ-2735",
    duplicateCase: "REQ-2721",
    factors: "Same phone · Matching location",
    score: 95,
    confidence: "High",
    status: "Awaiting Review",
    category: "Rescue assistance",
    detected: "3 hours ago",
    description:
      "The applicant phone number and reported location match.",
  },
  {
    id: "DUP-095",
    primaryCase: "REQ-2701",
    duplicateCase: "REQ-2689",
    factors: "Similar description · Same category",
    score: 81,
    confidence: "Medium",
    status: "Deferred",
    category: "Food & water",
    detected: "4 hours ago",
    description:
      "The descriptions and assistance categories are similar.",
  },
  {
    id: "DUP-091",
    primaryCase: "REQ-2650",
    duplicateCase: "REQ-2632",
    factors: "Same address · Shared contact",
    score: 97,
    confidence: "High",
    status: "Confirmed",
    category: "Medical supplies",
    detected: "5 hours ago",
    description:
      "The requests have matching contact details and address information.",
  },
  {
    id: "DUP-087",
    primaryCase: "REQ-2605",
    duplicateCase: "REQ-2588",
    factors: "Nearby location · Similar household",
    score: 72,
    confidence: "Medium",
    status: "Awaiting Review",
    category: "Emergency shelter",
    detected: "Yesterday",
    description:
      "The requests have similar household information and nearby locations.",
  },
  {
    id: "DUP-081",
    primaryCase: "REQ-2540",
    duplicateCase: "REQ-2519",
    factors: "Similar description · Matching category",
    score: 64,
    confidence: "Low",
    status: "Not Duplicate",
    category: "Food & water",
    detected: "Yesterday",
    description:
      "Review determined that these are separate valid assistance requests.",
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const PotentialDuplicates: React.FC = () => {

  const [duplicates, setDuplicates] =
    useState<DuplicateCase[]>(initialDuplicates);

  const [searchTerm, setSearchTerm] = useState("");

  const [similarityFilter, setSimilarityFilter] =
    useState("All similarity levels");

  const [reviewFilter, setReviewFilter] =
    useState("All review states");

  const [categoryFilter, setCategoryFilter] =
    useState("All categories");

  const [dateFilter, setDateFilter] =
    useState("Date detected");

  const [showFilters, setShowFilters] = useState(false);

  const [showPolicy, setShowPolicy] = useState(false);

  const [selectedDuplicate, setSelectedDuplicate] =
    useState<DuplicateCase | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  // ==========================================
  // FILTER DATA
  // ==========================================

  const filteredDuplicates = useMemo(() => {

    return duplicates.filter((item) => {

      const search = searchTerm.toLowerCase();

      const searchMatch =
        item.id.toLowerCase().includes(search) ||
        item.primaryCase.toLowerCase().includes(search) ||
        item.duplicateCase.toLowerCase().includes(search) ||
        item.factors.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search);

      const similarityMatch =
        similarityFilter === "All similarity levels" ||
        (similarityFilter === "High" && item.score >= 85) ||
        (similarityFilter === "Medium" &&
          item.score >= 70 &&
          item.score < 85) ||
        (similarityFilter === "Low" && item.score < 70);

      const reviewMatch =
        reviewFilter === "All review states" ||
        item.status === reviewFilter;

      const categoryMatch =
        categoryFilter === "All categories" ||
        item.category === categoryFilter;

      const dateMatch =
        dateFilter === "Date detected" ||
        (dateFilter === "Today" &&
          item.detected !== "Yesterday") ||
        (dateFilter === "Last 24 hours" &&
          true);

      return (
        searchMatch &&
        similarityMatch &&
        reviewMatch &&
        categoryMatch &&
        dateMatch
      );

    });

  }, [
    duplicates,
    searchTerm,
    similarityFilter,
    reviewFilter,
    categoryFilter,
    dateFilter,
  ]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredDuplicates.length / itemsPerPage)
  );

  const currentDuplicates = filteredDuplicates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==========================================
  // RESET FILTERS
  // ==========================================

  const resetFilters = () => {
    setSearchTerm("");
    setSimilarityFilter("All similarity levels");
    setReviewFilter("All review states");
    setCategoryFilter("All categories");
    setDateFilter("Date detected");
    setCurrentPage(1);
  };

  // ==========================================
  // UPDATE REVIEW STATUS
  // ==========================================

  const updateStatus = (
    id: string,
    status: DuplicateCase["status"]
  ) => {

    setDuplicates((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, status }
          : item
      )
    );

    setSelectedDuplicate(null);
  };

  // ==========================================
  // EXPORT CSV
  // ==========================================

  const handleExport = () => {

    const headers = [
      "Match ID",
      "Primary Case",
      "Possible Duplicate",
      "Similarity Factors",
      "Score",
      "Confidence",
      "Status",
      "Category",
      "Detected",
    ];

    const rows = filteredDuplicates.map((item) => [
      item.id,
      item.primaryCase,
      item.duplicateCase,
      item.factors,
      `${item.score}%`,
      item.confidence,
      item.status,
      item.category,
      item.detected,
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
    link.download = "potential-duplicates.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  // ==========================================
  // BADGE STYLES
  // ==========================================

  const confidenceStyle = (confidence: string) => {

    switch (confidence) {

      case "High":
        return "bg-red-50 text-red-600";

      case "Medium":
        return "bg-orange-50 text-orange-700";

      default:
        return "bg-sky-50 text-sky-700";

    }

  };

  const statusStyle = (status: string) => {

    switch (status) {

      case "Awaiting Review":
        return "bg-orange-50 text-orange-700";

      case "Deferred":
        return "bg-amber-50 text-amber-700";

      case "Confirmed":
        return "bg-emerald-50 text-emerald-700";

      default:
        return "bg-slate-100 text-slate-600";

    }

  };

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
            Potential Duplicates
          </span>

        </div>

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">
              Potential Duplicates
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Compare possible duplicate requests without automatically
              deleting valid humanitarian cases.
            </p>

          </div>

          <button
            onClick={() => setShowPolicy(true)}
            className="rounded-lg border border-[#b9d0df] bg-white px-5 py-3 text-sm font-medium text-[#287da8] transition hover:bg-sky-50"
          >
            Detection policy
          </button>

        </div>

        {/* =====================================
            HUMAN REVIEW ALERT
        ===================================== */}

        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#d9c8fa] border-l-[4px] border-l-[#7654c8] bg-[#f4efff] px-4 py-4">

          <Copy
            size={22}
            className="shrink-0 text-[#7654c8]"
          />

          <div>

            <p className="text-xs font-bold text-[#6040a8]">
              Human review is required
            </p>

            <p className="mt-1 text-xs text-[#7654c8]">
              Similarity detection flags possible matches only.
              Cases remain separate until an authorised reviewer decides otherwise.
            </p>

          </div>

        </div>

        {/* =====================================
            SEARCH & FILTERS
        ===================================== */}

        <section className="mb-4 flex flex-wrap items-center gap-3">

          {/* SEARCH */}

          <div className="flex min-w-[230px] flex-1 items-center gap-3 rounded-lg border border-[#d2e0e9] bg-white px-4 py-3">

            <Search size={19} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search duplicate pair or request ID..."
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

          {/* SIMILARITY FILTER */}

          <select
            value={similarityFilter}
            onChange={(e) => {
              setSimilarityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>All similarity levels</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>

          </select>

          {/* REVIEW STATE */}

          <select
            value={reviewFilter}
            onChange={(e) => {
              setReviewFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>All review states</option>
            <option>Awaiting Review</option>
            <option>Deferred</option>
            <option>Confirmed</option>
            <option>Not Duplicate</option>

          </select>

          {/* CATEGORY */}

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
            <option>Food & water</option>
            <option>Medical supplies</option>
            <option>Rescue assistance</option>

          </select>

          {/* DATE */}

          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>Date detected</option>
            <option>Today</option>
            <option>Last 24 hours</option>

          </select>

          {/* MORE FILTERS */}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-3 rounded-lg border border-[#b9d0df] bg-white px-5 py-3 text-xs font-semibold text-[#287da8] hover:bg-sky-50"
          >

            <Filter size={17} />

            More filters

          </button>

        </section>

        {/* =====================================
            ADVANCED FILTERS
        ===================================== */}

        {showFilters && (

          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">

            <div>

              <p className="text-sm font-semibold text-slate-700">
                Advanced filters
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Manage duplicate detection and review filters.
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
            DUPLICATE TABLE
        ===================================== */}

        <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.06)]">

          {/* TABLE HEADER */}

          <div className="hidden border-b border-[#d5e2eb] bg-[#f7f9fa] lg:block">

            <div className="grid grid-cols-[1fr_1.2fr_1.7fr_4fr_0.8fr_1.2fr_1.8fr_35px] items-center text-[10px] font-semibold text-slate-500">

              {[
                "Match ID",
                "Primary Case",
                "Possible Duplicate",
                "Similarity Factors",
                "Score",
                "Confidence",
                "Status",
                "",
              ].map((heading, index) => (

                <div key={index} className="px-3 py-4">
                  {heading}
                </div>

              ))}

            </div>

          </div>

          {/* TABLE BODY */}

          <div className="divide-y divide-[#e5edf2]">

            {currentDuplicates.length > 0 ? (

              currentDuplicates.map((item) => (

                <div
                  key={item.id}
                  onClick={() => setSelectedDuplicate(item)}
                  className="grid cursor-pointer grid-cols-1 gap-3 p-4 transition hover:bg-[#f8fbfd] lg:grid-cols-[1fr_1.2fr_1.7fr_4fr_0.8fr_1.2fr_1.8fr_35px] lg:items-center lg:gap-0 lg:px-0 lg:py-4"
                >

                  {/* MATCH ID */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Match ID
                    </span>

                    <p className="text-[11px] font-bold text-[#173e5b]">
                      {item.id}
                    </p>

                  </div>

                  {/* PRIMARY CASE */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Primary Case
                    </span>

                    <p className="text-[11px] text-slate-600">
                      {item.primaryCase}
                    </p>

                  </div>

                  {/* POSSIBLE DUPLICATE */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Possible Duplicate
                    </span>

                    <p className="text-[11px] text-slate-600">
                      {item.duplicateCase}
                    </p>

                  </div>

                  {/* SIMILARITY FACTORS */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Similarity Factors
                    </span>

                    <p className="text-[11px] leading-5 text-slate-600">
                      {item.factors}
                    </p>

                  </div>

                  {/* SCORE */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Score
                    </span>

                    <p className="text-xs font-bold text-[#7654c8]">
                      {item.score}%
                    </p>

                  </div>

                  {/* CONFIDENCE */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Confidence
                    </span>

                    <span
                      className={`inline-block rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${confidenceStyle(
                        item.confidence
                      )}`}
                    >
                      {item.confidence}
                    </span>

                  </div>

                  {/* STATUS */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Status
                    </span>

                    <span
                      className={`inline-block whitespace-nowrap rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${statusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                  </div>

                  {/* VIEW */}

                  <div className="flex justify-end px-3">

                    <ChevronRight
                      size={21}
                      className="text-slate-400"
                    />

                  </div>

                </div>

              ))

            ) : (

              <div className="py-16 text-center">

                <FileSearch
                  size={35}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm font-medium text-slate-600">
                  No potential duplicates found
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try changing your search or filters.
                </p>

              </div>

            )}

          </div>

          {/* =====================================
              PAGINATION
          ===================================== */}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e5edf2] px-5 py-4">

            <p className="text-xs text-slate-400">

              Showing{" "}

              {filteredDuplicates.length === 0
                ? 0
                : (currentPage - 1) * itemsPerPage + 1}

              –

              {Math.min(
                currentPage * itemsPerPage,
                filteredDuplicates.length
              )}

              {" "}of {filteredDuplicates.length}

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
          DUPLICATE REVIEW MODAL
      ===================================== */}

      {selectedDuplicate && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">

            {/* MODAL HEADER */}

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold text-[#173e5b]">
                  Duplicate Review
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Match ID: {selectedDuplicate.id}
                </p>

              </div>

              <button
                onClick={() => setSelectedDuplicate(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* SIMILARITY SCORE */}

            <div className="mb-5 rounded-xl bg-purple-50 p-5 text-center">

              <p className="text-xs font-medium text-purple-700">
                Similarity Score
              </p>

              <h3 className="mt-2 text-4xl font-bold text-purple-700">
                {selectedDuplicate.score}%
              </h3>

              <p className="mt-2 text-xs text-purple-600">
                {selectedDuplicate.confidence} confidence
              </p>

            </div>

            {/* CASE COMPARISON */}

            <div className="mb-5 grid grid-cols-2 gap-3">

              <div className="rounded-lg border border-slate-200 p-4">

                <p className="text-[10px] text-slate-400">
                  Primary Case
                </p>

                <p className="mt-2 text-sm font-bold text-[#173e5b]">
                  {selectedDuplicate.primaryCase}
                </p>

              </div>

              <div className="rounded-lg border border-slate-200 p-4">

                <p className="text-[10px] text-slate-400">
                  Possible Duplicate
                </p>

                <p className="mt-2 text-sm font-bold text-[#173e5b]">
                  {selectedDuplicate.duplicateCase}
                </p>

              </div>

            </div>

            {/* DETAILS */}

            <div className="space-y-4">

              {[
                ["Category", selectedDuplicate.category],
                ["Similarity Factors", selectedDuplicate.factors],
                ["Detection Time", selectedDuplicate.detected],
                ["Review Status", selectedDuplicate.status],
                ["Description", selectedDuplicate.description],
              ].map(([label, value]) => (

                <div
                  key={label}
                  className="border-b border-slate-100 pb-3"
                >

                  <p className="text-[10px] text-slate-400">
                    {label}
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-700">
                    {value}
                  </p>

                </div>

              ))}

            </div>

            {/* REVIEW ACTIONS */}

            <div className="mt-6 space-y-3">

              <p className="text-xs font-semibold text-slate-700">
                Review decision
              </p>

              <button
                onClick={() =>
                  updateStatus(
                    selectedDuplicate.id,
                    "Confirmed"
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-xs font-semibold text-white hover:bg-emerald-700"
              >

                <CheckCircle2 size={16} />

                Confirm Duplicate

              </button>

              <button
                onClick={() =>
                  updateStatus(
                    selectedDuplicate.id,
                    "Not Duplicate"
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >

                <ShieldCheck size={16} />

                Mark as Not Duplicate

              </button>

              <button
                onClick={() =>
                  updateStatus(
                    selectedDuplicate.id,
                    "Deferred"
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 py-3 text-xs font-semibold text-orange-700 hover:bg-orange-100"
              >

                <Clock size={16} />

                Defer Review

              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================
          DETECTION POLICY MODAL
      ===================================== */}

      {showPolicy && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">

              <div className="flex items-center gap-2">

                <ShieldCheck
                  size={22}
                  className="text-purple-600"
                />

                <h2 className="text-lg font-semibold text-[#173e5b]">
                  Duplicate Detection Policy
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

              <div className="rounded-lg bg-purple-50 p-4">

                <p className="text-sm font-semibold text-purple-800">
                  Similarity Score
                </p>

                <p className="mt-1 text-xs leading-5 text-purple-700">
                  The system compares requests using contact details,
                  location, household size, category and descriptions.
                </p>

              </div>

              <div className="rounded-lg bg-red-50 p-4">

                <p className="text-sm font-semibold text-red-800">
                  High Similarity (85% – 100%)
                </p>

                <p className="mt-1 text-xs text-red-700">
                  Requires priority human review.
                </p>

              </div>

              <div className="rounded-lg bg-orange-50 p-4">

                <p className="text-sm font-semibold text-orange-800">
                  Medium Similarity (70% – 84%)
                </p>

                <p className="mt-1 text-xs text-orange-700">
                  Requires additional information and review.
                </p>

              </div>

              <div className="rounded-lg bg-sky-50 p-4">

                <p className="text-sm font-semibold text-sky-800">
                  Low Similarity (Below 70%)
                </p>

                <p className="mt-1 text-xs text-sky-700">
                  Can be reviewed according to normal procedures.
                </p>

              </div>

              <p className="text-xs leading-5 text-slate-500">
                Important: Potential matches must never be automatically
                deleted or merged. An authorised human reviewer must
                make the final decision.
              </p>

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

export default PotentialDuplicates;