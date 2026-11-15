import React, { useMemo, useState } from "react";

import {
  Menu,
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronRight,
  Download,
  ShieldCheck,
  Check,
  MessageSquare,
  X,
  Filter,
  ChevronLeft,
  ClipboardCheck,
} from "lucide-react";

// ==========================================
// TYPES
// ==========================================

interface VerificationCase {
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
  submissionAge: string;
}

// ==========================================
// SAMPLE DATA
// ==========================================

const initialCases: VerificationCase[] = [
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
    submissionAge: "18 min",
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
    submissionAge: "49 min",
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
    submissionAge: "2h 08m",
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
    status: "Under Review",
    submissionAge: "1h 34m",
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

const CaseVerification: React.FC = () => {

  const [cases] = useState<VerificationCase[]>(initialCases);

  const [searchTerm, setSearchTerm] = useState("");

  const [evidenceFilter, setEvidenceFilter] =
    useState("All evidence states");

  const [priorityFilter, setPriorityFilter] =
    useState("All priorities");

  const [categoryFilter, setCategoryFilter] =
    useState("All categories");

  const [ageFilter, setAgeFilter] =
    useState("Submission age");

  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCase, setSelectedCase] =
    useState<VerificationCase | null>(null);

  const [showPolicy, setShowPolicy] = useState(false);

  const itemsPerPage = 3;

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

      const evidenceMatch =
        evidenceFilter === "All evidence states" ||
        item.verification === evidenceFilter;

      const priorityMatch =
        priorityFilter === "All priorities" ||
        item.priority === priorityFilter;

      const categoryMatch =
        categoryFilter === "All categories" ||
        item.category === categoryFilter;

      const ageMatch =
        ageFilter === "Submission age" ||
        (ageFilter === "Last 1 hour" &&
          !item.age.includes("h")) ||
        (ageFilter === "Last 24 hours" &&
          true);

      return (
        searchMatch &&
        evidenceMatch &&
        priorityMatch &&
        categoryMatch &&
        ageMatch
      );

    });

  }, [
    cases,
    searchTerm,
    evidenceFilter,
    priorityFilter,
    categoryFilter,
    ageFilter,
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
  // RESET FILTERS
  // ==========================================

  const resetFilters = () => {

    setSearchTerm("");
    setEvidenceFilter("All evidence states");
    setPriorityFilter("All priorities");
    setCategoryFilter("All categories");
    setAgeFilter("Submission age");
    setCurrentPage(1);

  };

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
    link.download = "case-verification.csv";
    link.click();

    URL.revokeObjectURL(url);
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

      case "Submitted":
        return "bg-amber-100 text-amber-700";

      case "Pending Info":
        return "bg-amber-100 text-amber-700";

      case "Verified":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-slate-100 text-slate-700";

    }

  };

  // ==========================================
  // STATISTICS
  // ==========================================

  const statistics = [
    {
      title: "Awaiting review",
      value: "14",
      description: "3 critical priority",
      icon: ShieldCheck,
      color: "orange",
    },
    {
      title: "Verified today",
      value: "92",
      description: "96% passed",
      icon: Check,
      color: "green",
    },
    {
      title: "Information requested",
      value: "18",
      description: "Awaiting response",
      icon: MessageSquare,
      color: "blue",
    },
    {
      title: "Rejected today",
      value: "4",
      description: "All with rationale",
      icon: X,
      color: "red",
    },
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
            Case Verification
          </span>

        </div>

        {/* =====================================
            PAGE HEADER
        ===================================== */}

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h1 className="text-3xl font-medium tracking-tight text-[#173e5b]">
              Case Verification
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review citizen evidence, contact details, locations,
              and eligibility before assignment.
            </p>

          </div>

          <button
            onClick={() => setShowPolicy(true)}
            className="rounded-lg border border-[#b9d0df] bg-white px-5 py-3 text-sm font-medium text-[#287da8] transition hover:bg-sky-50"
          >
            Verification policy
          </button>

        </div>

        {/* =====================================
            VERIFICATION ALERT
        ===================================== */}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#f6d28a] border-l-[4px] bg-[#fff8e9] px-4 py-4">

          <div className="flex items-center gap-3">

            <ShieldCheck
              size={24}
              className="text-amber-700"
            />

            <div>

              <p className="text-sm font-bold text-amber-900">
                14 cases awaiting evidence review
              </p>

              <p className="mt-1 text-xs text-amber-800">
                Critical requests should be verified or escalated
                within 30 minutes.
              </p>

            </div>

          </div>

          <span className="rounded-md bg-[#fff2d9] px-4 py-2 text-[10px] font-semibold text-amber-800">
            Oldest: 42 min
          </span>

        </div>

        {/* =====================================
            STATISTICS CARDS
        ===================================== */}

        <section className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {statistics.map((item, index) => {

            const Icon = item.icon;

            const iconColors: Record<string, string> = {
              orange: "bg-orange-50 text-amber-700",
              green: "bg-emerald-50 text-emerald-600",
              blue: "bg-sky-50 text-sky-600",
              red: "bg-red-50 text-red-600",
            };

            return (

              <div
                key={index}
                className="flex items-center gap-4 rounded-xl border border-[#d5e2eb] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconColors[item.color]}`}
                >

                  <Icon size={23} />

                </div>

                <div>

                  <p className="text-xs text-slate-400">
                    {item.title}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-[#173e5b]">
                    {item.value}
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-500">
                    {item.description}
                  </p>

                </div>

              </div>

            );

          })}

        </section>

        {/* =====================================
            SEARCH & FILTERS
        ===================================== */}

        <section className="mb-4 flex flex-wrap items-center gap-3">

          {/* Search */}

          <div className="flex min-w-[230px] flex-1 items-center gap-3 rounded-lg border border-[#d2e0e9] bg-white px-4 py-3">

            <Search size={19} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search cases awaiting verification..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            />

          </div>

          {/* Evidence State */}

          <select
            value={evidenceFilter}
            onChange={(e) => {
              setEvidenceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>All evidence states</option>
            <option>Evidence pending</option>
            <option>Contact verified</option>
            <option>Needs information</option>
            <option>Verified</option>

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
            <option>Emergency shelter</option>
            <option>Food & water</option>
            <option>Medicine</option>
            <option>Rescue assistance</option>

          </select>

          {/* Submission Age */}

          <select
            value={ageFilter}
            onChange={(e) => {
              setAgeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-[#d2e0e9] bg-white px-3 py-3 text-xs outline-none"
          >

            <option>Submission age</option>
            <option>Last 1 hour</option>
            <option>Last 24 hours</option>

          </select>

          {/* More Filters */}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-3 rounded-lg border border-[#b9d0df] bg-white px-5 py-3 text-xs font-semibold text-[#287da8] hover:bg-sky-50"
          >

            <Filter size={17} />

            More filters

          </button>

        </section>

        {/* Advanced Filters */}

        {showFilters && (

          <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">

            <div>

              <p className="text-sm font-semibold">
                Advanced filters
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Manage case verification filters.
              </p>

            </div>

            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-sky-700 hover:underline"
            >
              Clear filters
            </button>

          </div>

        )}

        {/* =====================================
            VERIFICATION TABLE
        ===================================== */}

        <div className="overflow-hidden rounded-xl border border-[#d5e2eb] bg-white shadow-[0_8px_25px_rgba(30,64,90,0.06)]">

          {/* Table Header */}

          <div className="hidden border-b border-[#d5e2eb] bg-[#f7f9fa] lg:block">

            <div className="grid grid-cols-[1fr_2fr_1.8fr_1fr_1.2fr_1.7fr_1.2fr_0.8fr_1.1fr_30px] items-center text-[10px] font-semibold text-slate-500">

              {[
                "Case",
                "Category & Applicant",
                "Location",
                "Reported",
                "AI Priority",
                "Verification",
                "Assigned",
                "Age",
                "Status",
                "",
              ].map((heading, index) => (

                <div key={index} className="px-3 py-4">
                  {heading}
                </div>

              ))}

            </div>

          </div>

          {/* Table Rows */}

          <div className="divide-y divide-[#e5edf2]">

            {currentCases.length > 0 ? (

              currentCases.map((item) => (

                <div
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  className="grid cursor-pointer grid-cols-1 gap-3 p-4 transition hover:bg-[#f8fbfd] lg:grid-cols-[1fr_2fr_1.8fr_1fr_1.2fr_1.7fr_1.2fr_0.8fr_1.1fr_30px] lg:items-center lg:gap-0 lg:px-0 lg:py-4"
                >

                  {/* Case ID */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Case
                    </span>

                    <p className="text-[11px] font-bold text-[#173e5b]">
                      {item.id}
                    </p>

                  </div>

                  {/* Category */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Category & Applicant
                    </span>

                    <p className="text-[11px] font-semibold text-[#173e5b]">
                      {item.category}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      {item.applicant}
                    </p>

                  </div>

                  {/* Location */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Location
                    </span>

                    <p className="text-[11px] text-slate-600">
                      {item.location}
                    </p>

                  </div>

                  {/* Reported */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Reported
                    </span>

                    <span
                      className={`inline-block rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${priorityStyle(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>

                  </div>

                  {/* AI Priority */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      AI Priority
                    </span>

                    <p className="text-[11px] font-semibold text-slate-700">
                      {item.aiPriority}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      {item.confidence}
                    </p>

                  </div>

                  {/* Verification */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Verification
                    </span>

                    <p className="text-[11px] text-slate-600">
                      {item.verification}
                    </p>

                  </div>

                  {/* Assigned */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Assigned
                    </span>

                    <p className="text-[11px] text-slate-600">
                      {item.assigned}
                    </p>

                  </div>

                  {/* Age */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Age
                    </span>

                    <p className="text-[11px] text-slate-600">
                      {item.age}
                    </p>

                  </div>

                  {/* Status */}

                  <div className="px-3">

                    <span className="mb-1 block text-[9px] text-slate-400 lg:hidden">
                      Status
                    </span>

                    <span
                      className={`inline-block whitespace-nowrap rounded-md px-2 py-1.5 text-[10px] font-semibold ${statusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                  </div>

                  {/* View */}

                  <div className="flex justify-end px-3">

                    <ChevronRight
                      size={20}
                      className="text-slate-400"
                    />

                  </div>

                </div>

              ))

            ) : (

              <div className="py-16 text-center">

                <ClipboardCheck
                  size={35}
                  className="mx-auto mb-3 text-slate-300"
                />

                <p className="text-sm font-medium text-slate-600">
                  No verification cases found
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
                className="flex items-center gap-1 rounded-lg border border-[#d5e2eb] px-4 py-2.5 text-xs text-slate-500 hover:bg-slate-50 disabled:opacity-40"
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
                      ? "border-[#287da8] bg-[#287da8] text-white"
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
                className="flex items-center gap-1 rounded-lg border border-[#b9d0df] px-4 py-2.5 text-xs font-medium text-[#287da8] hover:bg-sky-50 disabled:opacity-40"
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
                  Case Verification Details
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
                ["AI Confidence", selectedCase.confidence],
                ["Verification", selectedCase.verification],
                ["Assigned", selectedCase.assigned],
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
          VERIFICATION POLICY MODAL
      ===================================== */}

      {showPolicy && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-lg font-semibold text-[#173e5b]">
                Verification Policy
              </h2>

              <button
                onClick={() => setShowPolicy(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <div className="space-y-4 text-sm text-slate-600">

              <div>
                <h3 className="font-semibold text-slate-800">
                  1. Evidence Review
                </h3>

                <p className="mt-1 text-xs leading-6">
                  Review submitted documents, photographs and
                  supporting evidence before approving a case.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  2. Contact Verification
                </h3>

                <p className="mt-1 text-xs leading-6">
                  Confirm applicant contact information and
                  validate the reported location.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  3. Priority Review
                </h3>

                <p className="mt-1 text-xs leading-6">
                  Critical requests should be reviewed or
                  escalated within 30 minutes.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  4. Decision Recording
                </h3>

                <p className="mt-1 text-xs leading-6">
                  Record verification decisions with clear
                  reasons and supporting information.
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

export default CaseVerification;