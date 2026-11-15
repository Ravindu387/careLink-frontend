
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Check,
  X,
  Filter,
  MoreHorizontal,
  Eye,
  UserPlus,
  CheckCircle2,
  FileText,
  ShieldAlert,
  Calendar,
} from "lucide-react";

type FlagStatus =
  | "Investigation Required"
  | "Under Review"
  | "Deferred"
  | "Resolved";

type Severity = "High" | "Medium" | "Low";

type Flag = {
  id: string;
  record: string;
  reason: string;
  amount: string;
  party: string;
  severity: Severity;
  flagged: string;
  status: FlagStatus;
  description: string;
  investigator: string;
};

const initialFlags: Flag[] = [
  {
    id: "FLG-208",
    record: "DON-88398",
    reason: "Unusual source pattern",
    amount: "$18,420",
    party: "Community Giving Circle",
    severity: "High",
    flagged: "22 Jun · 11:42",
    status: "Investigation Required",
    description:
      "A contribution has been flagged due to an unusual funding source pattern. The transaction requires manual verification before further allocation.",
    investigator: "Not assigned",
  },
  {
    id: "FLG-204",
    record: "EXP-9008",
    reason: "Invoice amount variance",
    amount: "$42,600",
    party: "Health Response Unit",
    severity: "Medium",
    flagged: "22 Jun · 09:18",
    status: "Under Review",
    description:
      "The submitted invoice amount differs from the expected expenditure amount. Supporting financial documentation needs to be checked.",
    investigator: "M. Perera",
  },
  {
    id: "FLG-199",
    record: "ALL-4371",
    reason: "Duplicate allocation reference",
    amount: "$16,800",
    party: "Partner Network",
    severity: "High",
    flagged: "21 Jun · 16:05",
    status: "Under Review",
    description:
      "A possible duplicate allocation reference was detected. Review the associated allocation records and approval history.",
    investigator: "S. Fernando",
  },
  {
    id: "FLG-192",
    record: "DON-88374",
    reason: "Verification mismatch",
    amount: "$8,200",
    party: "Anonymous Donor",
    severity: "Low",
    flagged: "21 Jun · 12:40",
    status: "Deferred",
    description:
      "The submitted donor verification information does not fully match the available transaction information.",
    investigator: "Not assigned",
  },
  {
    id: "FLG-187",
    record: "EXP-8981",
    reason: "Unusual expenditure pattern",
    amount: "$12,500",
    party: "Logistics Unit",
    severity: "Medium",
    flagged: "20 Jun · 14:25",
    status: "Resolved",
    description:
      "The expenditure pattern was reviewed and supporting documents were accepted.",
    investigator: "A. Perera",
  },
];

export default function FlaggedTransactions() {
  const [flags, setFlags] = useState<Flag[]>(initialFlags);

  const [search, setSearch] = useState("");
  const [recordType, setRecordType] = useState("All record types");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("Date flagged");

  const [showPolicy, setShowPolicy] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [selectedFlag, setSelectedFlag] = useState<Flag | null>(null);
  const [toast, setToast] = useState("");

  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(4);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  // FILTER TRANSACTIONS

  const filteredFlags = useMemo(() => {
    return flags.filter((flag) => {
      const query = search.toLowerCase();

      const matchesSearch =
        flag.id.toLowerCase().includes(query) ||
        flag.record.toLowerCase().includes(query) ||
        flag.reason.toLowerCase().includes(query) ||
        flag.party.toLowerCase().includes(query);

      const matchesType =
        recordType === "All record types" ||
        flag.record.startsWith(
          recordType === "Donations"
            ? "DON"
            : recordType === "Expenditure"
              ? "EXP"
              : "ALL"
        );

      const matchesSeverity =
        severityFilter === "All severities" ||
        flag.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        flag.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesSeverity &&
        matchesStatus
      );
    });
  }, [flags, search, recordType, severityFilter, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFlags.length / rowsPerPage)
  );

  const currentFlags = filteredFlags.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // STATISTICS

  const openFlags = flags.filter(
    (f) =>
      f.status === "Investigation Required" ||
      f.status === "Under Review" ||
      f.status === "Deferred"
  ).length;

  const highPriority = flags.filter(
    (f) => f.severity === "High" && f.status !== "Resolved"
  ).length;

  const underReview = flags.filter(
    (f) => f.status === "Under Review"
  ).length;

  const resolved = flags.filter(
    (f) => f.status === "Resolved"
  ).length;

  // UPDATE STATUS

  const updateStatus = (id: string, status: FlagStatus) => {
    setFlags((previous) =>
      previous.map((flag) =>
        flag.id === id
          ? { ...flag, status }
          : flag
      )
    );

    setSelectedFlag((previous) =>
      previous?.id === id
        ? { ...previous, status }
        : previous
    );

    notify(`Transaction status updated to ${status}.`);
  };

  // ASSIGN INVESTIGATOR

  const assignInvestigator = (id: string) => {
    setFlags((previous) =>
      previous.map((flag) =>
        flag.id === id
          ? {
              ...flag,
              investigator: "Maria K.",
              status: "Under Review",
            }
          : flag
      )
    );

    setSelectedFlag((previous) =>
      previous?.id === id
        ? {
            ...previous,
            investigator: "Maria K.",
            status: "Under Review",
          }
        : previous
    );

    notify("Investigator assigned successfully.");
  };

  const severityStyle = (severity: Severity) => {
    switch (severity) {
      case "High":
        return "text-[#c62828]";
      case "Medium":
        return "text-[#a66b13]";
      case "Low":
        return "text-[#23749e]";
    }
  };

  const statusStyle = (status: FlagStatus) => {
    switch (status) {
      case "Investigation Required":
        return "bg-[#fdebed] text-[#c62828]";
      case "Under Review":
        return "bg-[#fff3dd] text-[#a66b13]";
      case "Deferred":
        return "bg-[#fff3dd] text-[#a66b13]";
      case "Resolved":
        return "bg-[#e5f6f0] text-[#078c70]";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eef5f7] text-[#123e60] overflow-x-hidden">

      {/* MAIN */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 py-5">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-8">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={11} />
          <span className="text-slate-500">
            Funding & Donations
          </span>
          <ChevronRight size={11} />
          <span className="font-semibold">
            Flagged Transactions
          </span>
        </div>

        {/* TITLE */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">

          <div>
            <h1 className="text-[24px] font-medium">
              Flagged Transactions
            </h1>

            <p className="text-[11px] text-slate-500 mt-1">
              Investigate suspicious donation, allocation, and expenditure records under human control.
            </p>
          </div>

          <button
            onClick={() => setShowPolicy(true)}
            className="h-[37px] px-4 bg-white border border-[#b9cfda] rounded-lg text-[10px] text-[#23749e] hover:bg-[#f5fafc]"
          >
            Investigation policy
          </button>
        </div>

        {/* WARNING BANNER */}

        <section className="bg-[#fff7f7] border border-[#ffc3c5] border-l-[3px] border-l-[#dc2626] rounded-lg px-3 py-3 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <AlertTriangle
              size={18}
              className="text-[#b91c1c] shrink-0"
            />

            <div>
              <p className="text-[10px] font-semibold text-[#a51e2a]">
                {openFlags} records require authorised investigation
              </p>

              <p className="text-[9px] text-[#a65d65] mt-0.5">
                Flags do not prove wrongdoing and must not trigger automatic rejection.
              </p>
            </div>
          </div>

          <div className="md:w-[50%] bg-[#fdebed] rounded-md px-3 py-1.5">
            <p className="text-[8px] font-semibold text-[#b91c1c]">
              {highPriority} high priority
            </p>
          </div>
        </section>

        {/* STATISTICS */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">

          <StatCard
            icon={<AlertTriangle size={19} />}
            label="Open flags"
            value={String(openFlags)}
            description="Across all record types"
            color="red"
          />

          <StatCard
            icon={<ShieldCheck size={19} />}
            label="High priority"
            value={String(highPriority)}
            description="$35,220 combined"
            color="red"
          />

          <StatCard
            icon={<Clock size={19} />}
            label="Under review"
            value={String(underReview)}
            description="Assigned investigators"
            color="orange"
          />

          <StatCard
            icon={<Check size={19} />}
            label="Resolved this month"
            value={String(resolved + 16)}
            description="12 cleared · 6 restricted"
            color="green"
          />

        </section>

        {/* SEARCH AND FILTERS */}

        <section className="flex flex-col xl:flex-row gap-2 mb-3">

          <div className="relative flex-1">

            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search flag, transaction, or party..."
              className="w-full h-[37px] bg-white border border-[#d5e3e9] rounded-lg pl-9 pr-3 text-[9px] outline-none focus:border-[#23749e]"
            />
          </div>

          <select
            value={recordType}
            onChange={(e) => {
              setRecordType(e.target.value);
              setPage(1);
            }}
            className="h-[37px] px-3 bg-white border border-[#d5e3e9] rounded-lg text-[9px] min-w-[110px] outline-none"
          >
            <option>All record types</option>
            <option>Donations</option>
            <option>Expenditure</option>
            <option>Allocations</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            className="h-[37px] px-3 bg-white border border-[#d5e3e9] rounded-lg text-[9px] min-w-[110px] outline-none"
          >
            <option>All severities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-[37px] px-3 bg-white border border-[#d5e3e9] rounded-lg text-[9px] min-w-[110px] outline-none"
          >
            <option>All statuses</option>
            <option>Investigation Required</option>
            <option>Under Review</option>
            <option>Deferred</option>
            <option>Resolved</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-[37px] px-3 bg-white border border-[#d5e3e9] rounded-lg text-[9px] min-w-[105px] outline-none"
          >
            <option>Date flagged</option>
            <option>Newest first</option>
            <option>Oldest first</option>
          </select>

          <button
            onClick={() => setShowMoreFilters(!showMoreFilters)}
            className={`h-[37px] px-3 border rounded-lg text-[9px] flex items-center justify-center gap-2 whitespace-nowrap ${
              showMoreFilters
                ? "bg-[#e8f1f6] border-[#23749e]"
                : "bg-white border-[#b9cfda]"
            }`}
          >
            <Filter size={13} />
            More filters
          </button>

        </section>

        {/* EXTRA FILTERS */}

        {showMoreFilters && (
          <div className="bg-white border border-[#d5e3e9] rounded-lg p-4 mb-3 flex flex-wrap items-center justify-between gap-3">

            <div>
              <p className="text-[9px] font-semibold mb-1">
                Investigation filters
              </p>
              <p className="text-[8px] text-slate-400">
                Refine flagged transaction records.
              </p>
            </div>

            <div className="flex gap-2">

              <button
                onClick={() => {
                  setSearch("");
                  setRecordType("All record types");
                  setSeverityFilter("All severities");
                  setStatusFilter("All statuses");
                  setDateFilter("Date flagged");
                  setPage(1);
                }}
                className="px-3 py-2 border border-[#d5e3e9] rounded-lg text-[9px]"
              >
                Clear filters
              </button>

              <button
                onClick={() => setShowMoreFilters(false)}
                className="px-3 py-2 bg-[#23749e] text-white rounded-lg text-[9px]"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* TRANSACTION TABLE */}

        <section className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px] text-left border-collapse">

              <thead className="bg-[#f6f9fa]">

                <tr className="border-b border-[#d5e3e9]">

                  {[
                    "Flag ID",
                    "Record",
                    "Reason",
                    "Amount",
                    "Associated Party",
                    "Severity",
                    "Flagged",
                    "Status",
                    "",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-3 py-3 text-[8px] font-medium text-slate-500 whitespace-nowrap"
                    >
                      {heading}
                    </th>
                  ))}

                </tr>
              </thead>

              <tbody>

                {currentFlags.map((flag) => (

                  <tr
                    key={flag.id}
                    className="border-b border-[#e5edf1] hover:bg-[#f7fafb] transition-colors"
                  >

                    <td className="px-3 py-3 text-[9px] font-semibold whitespace-nowrap">
                      {flag.id}
                    </td>

                    <td className="px-3 py-3 text-[9px] text-[#315d7b]">
                      {flag.record}
                    </td>

                    <td className="px-3 py-3 text-[9px]">
                      {flag.reason}
                    </td>

                    <td className="px-3 py-3 text-[9px] whitespace-nowrap">
                      {flag.amount}
                    </td>

                    <td className="px-3 py-3 text-[9px]">
                      {flag.party}
                    </td>

                    <td className={`px-3 py-3 text-[9px] font-medium ${severityStyle(flag.severity)}`}>
                      {flag.severity}
                    </td>

                    <td className="px-3 py-3">
                      <span className="inline-block px-2 py-1 bg-[#e8f1f6] text-[#23749e] rounded-md text-[8px] font-semibold whitespace-nowrap">
                        {flag.flagged}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-1 rounded-md text-[8px] font-semibold whitespace-nowrap ${statusStyle(flag.status)}`}>
                        {flag.status}
                      </span>
                    </td>

                    <td className="px-3 py-3">

                      <button
                        onClick={() => setSelectedFlag(flag)}
                        className="p-1.5 rounded hover:bg-[#e8f1f6] text-slate-500"
                        title="View investigation"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                    </td>

                  </tr>
                ))}

                {currentFlags.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">

                      <Search
                        size={25}
                        className="mx-auto text-slate-300 mb-2"
                      />

                      <p className="text-[11px] font-medium">
                        No flagged transactions found
                      </p>

                      <p className="text-[9px] text-slate-400 mt-1">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="px-3 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <p className="text-[9px] text-slate-400">
              Showing{" "}
              {filteredFlags.length === 0
                ? 0
                : (page - 1) * rowsPerPage + 1}
              –
              {Math.min(page * rowsPerPage, filteredFlags.length)}
              {" "}of {filteredFlags.length}
            </p>

            <div className="flex items-center gap-1.5">

              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-[30px] px-3 border border-[#d5e3e9] rounded-lg text-[9px] disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, i) => i + 1
              ).map((number) => (
                <button
                  key={number}
                  onClick={() => setPage(number)}
                  className={`w-[29px] h-[30px] rounded-lg text-[9px] border ${
                    page === number
                      ? "bg-[#23749e] text-white border-[#23749e]"
                      : "bg-white border-[#d5e3e9]"
                  }`}
                >
                  {number}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-[30px] px-3 border border-[#d5e3e9] rounded-lg text-[9px] disabled:opacity-40"
              >
                Next
              </button>

            </div>
          </div>

        </section>

      </main>

      {/* INVESTIGATION POLICY MODAL */}

      {showPolicy && (
        <Modal onClose={() => setShowPolicy(false)}>

          <div className="w-11 h-11 bg-[#fdebed] rounded-lg flex items-center justify-center mb-4">
            <ShieldAlert size={22} className="text-red-600" />
          </div>

          <h2 className="text-[16px] font-semibold">
            Investigation policy
          </h2>

          <p className="text-[9px] text-slate-400 mt-1 mb-5">
            Guidelines for reviewing suspicious financial transactions.
          </p>

          <div className="space-y-4">

            {[
              {
                title: "Human-led investigation",
                description:
                  "Every flagged transaction must be reviewed by an authorised investigator. Automated flags are indicators, not proof of wrongdoing.",
              },
              {
                title: "Evidence-based decisions",
                description:
                  "Investigators must examine transaction history, invoices, verification documents and supporting evidence.",
              },
              {
                title: "Fair treatment",
                description:
                  "Donors, partners and recipients must have an opportunity to clarify discrepancies before adverse decisions.",
              },
              {
                title: "Confidentiality",
                description:
                  "Investigation information and sensitive financial records must only be accessible to authorised personnel.",
              },
              {
                title: "Resolution and audit trail",
                description:
                  "All investigation decisions must be recorded with the responsible officer, evidence and resolution reason.",
              },
            ].map((item, index) => (
              <div key={item.title} className="flex gap-3">

                <div className="w-6 h-6 rounded-full bg-[#e8f1f6] text-[#23749e] flex items-center justify-center text-[9px] font-semibold shrink-0">
                  {index + 1}
                </div>

                <div>
                  <h3 className="text-[10px] font-semibold">
                    {item.title}
                  </h3>

                  <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowPolicy(false)}
            className="w-full mt-6 h-10 bg-[#23749e] text-white rounded-lg text-[10px] font-semibold"
          >
            Close policy
          </button>

        </Modal>
      )}

      {/* INVESTIGATION DETAILS MODAL */}

      {selectedFlag && (
        <Modal onClose={() => setSelectedFlag(null)}>

          <div className="flex items-start justify-between mb-5">

            <div>
              <p className="text-[9px] font-semibold text-[#23749e]">
                {selectedFlag.id}
              </p>

              <h2 className="text-[16px] font-semibold mt-1">
                Transaction investigation
              </h2>

              <p className="text-[9px] text-slate-400 mt-1">
                Record reference: {selectedFlag.record}
              </p>
            </div>

            <span className={`px-2 py-1 rounded-md text-[8px] font-semibold ${statusStyle(selectedFlag.status)}`}>
              {selectedFlag.status}
            </span>
          </div>

          {/* DETAILS */}

          <div className="bg-[#f5f9fa] rounded-lg p-4 space-y-3 mb-4">

            <DetailRow
              label="Reason"
              value={selectedFlag.reason}
            />

            <DetailRow
              label="Associated party"
              value={selectedFlag.party}
            />

            <DetailRow
              label="Transaction amount"
              value={selectedFlag.amount}
            />

            <DetailRow
              label="Severity"
              value={selectedFlag.severity}
            />

            <DetailRow
              label="Date flagged"
              value={selectedFlag.flagged}
            />

            <DetailRow
              label="Investigator"
              value={selectedFlag.investigator}
            />

          </div>

          {/* DESCRIPTION */}

          <div className="mb-5">

            <h3 className="text-[10px] font-semibold mb-2">
              Investigation notes
            </h3>

            <p className="text-[9px] text-slate-500 leading-relaxed bg-[#f5f9fa] p-3 rounded-lg">
              {selectedFlag.description}
            </p>
          </div>

          {/* ACTION BUTTONS */}

          <div className="space-y-2">

            {selectedFlag.status !== "Resolved" && (
              <button
                onClick={() => assignInvestigator(selectedFlag.id)}
                className="w-full h-10 border border-[#d5e3e9] rounded-lg text-[9px] flex items-center justify-center gap-2 hover:bg-[#f5f9fa]"
              >
                <UserPlus size={15} />
                Assign to me / Start review
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">

              {selectedFlag.status !== "Resolved" && (
                <>
                  <button
                    onClick={() => updateStatus(selectedFlag.id, "Deferred")}
                    className="h-10 bg-[#fff3dd] text-[#a66b13] rounded-lg text-[9px] font-semibold"
                  >
                    Defer
                  </button>

                  <button
                    onClick={() => updateStatus(selectedFlag.id, "Resolved")}
                    className="h-10 bg-[#e5f6f0] text-[#078c70] rounded-lg text-[9px] font-semibold flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={14} />
                    Resolve
                  </button>
                </>
              )}

              <button
                onClick={() => setSelectedFlag(null)}
                className="h-10 bg-[#23749e] text-white rounded-lg text-[9px] font-semibold col-span-2"
              >
                Close
              </button>
            </div>
          </div>

        </Modal>
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] bg-[#143d5c] text-white rounded-lg px-4 py-3 shadow-xl flex items-center gap-3 text-[10px]">
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

// =====================================
// STATISTICS CARD
// =====================================

function StatCard({
  icon,
  label,
  value,
  description,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
  color: "red" | "orange" | "green";
}) {
  const colors = {
    red: "bg-[#fdebed] text-[#dc2626]",
    orange: "bg-[#fff3dd] text-[#d28b18]",
    green: "bg-[#e5f6f0] text-[#159b79]",
  };

  return (
    <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm p-3.5 flex items-center gap-3">

      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colors[color]}`}>
        {icon}
      </div>

      <div>
        <p className="text-[8px] text-slate-400">
          {label}
        </p>

        <h3 className="text-[21px] font-bold leading-tight mt-0.5">
          {value}
        </h3>

        <p className="text-[8px] text-slate-400 mt-0.5">
          {description}
        </p>
      </div>

    </div>
  );
}

// =====================================
// MODAL
// =====================================

function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] bg-[#102d42]/45 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-5 relative">

        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-red-500"
        >
          <X size={18} />
        </button>

        {children}

      </div>
    </div>
  );
}

// =====================================
// DETAIL ROW
// =====================================

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#e3ebef] pb-2 last:border-0 last:pb-0">

      <span className="text-[9px] text-slate-500">
        {label}
      </span>

      <span className="text-[9px] font-semibold text-right">
        {value}
      </span>

    </div>
  );
}
