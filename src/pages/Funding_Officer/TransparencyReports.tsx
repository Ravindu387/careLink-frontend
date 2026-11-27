
import { useEffect, useState } from "react";
import { apiClient } from "../../services/api";
import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronRight,
  ShieldCheck,
  Heart,
  Share2,
  Receipt,
  TrendingUp,
  Download,
  Plus,
  X,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Printer,
} from "lucide-react";
import type { FormEvent } from "react";

type Report = {
  id: string;
  title: string;
  reference: string;
  date: string;
  status: "Published" | "Draft" | "Under Review";
};

const initialReports: Report[] = [
  {
    id: "REP-204",
    title: "Weekly Funding Summary",
    reference: "REP-204",
    date: "25 Jun",
    status: "Published",
  },
  {
    id: "REP-198",
    title: "Campaign Allocation Detail",
    reference: "REP-198",
    date: "22 Jun",
    status: "Published",
  },
  {
    id: "REP-191",
    title: "Material Contributions Report",
    reference: "REP-191",
    date: "21 Jun",
    status: "Draft",
  },
  {
    id: "REP-184",
    title: "Partner Expenditure Summary",
    reference: "REP-184",
    date: "20 Jun",
    status: "Under Review",
  },
];

const allocationData = [
  { name: "Shelter & accommodation", amount: "$1.24M", percentage: 100 },
  { name: "Food & water", amount: "$986K", percentage: 80 },
  { name: "Medical response", amount: "$742K", percentage: 60 },
  { name: "Logistics & transport", amount: "$558K", percentage: 45 },
  { name: "Accessibility support", amount: "$384K", percentage: 31 },
];

const completenessData = [
  { name: "Donation verification", percentage: "99.1%", value: 99.1 },
  { name: "Allocation documentation", percentage: "96.8%", value: 96.8 },
  { name: "Expenditure receipts", percentage: "92.4%", value: 92.4 },
  { name: "Partner confirmations", percentage: "88.7%", value: 88.7 },
];

export default function TransparencyReports() {
  const [reports, setReports] = useState(initialReports);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState("All report types");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportPeriod, setReportPeriod] = useState("18–25 June 2025");

  const [toast, setToast] = useState("");

  useEffect(() => {
    apiClient.get<any>("/transparency-reports").then((res) => {
      const items = res?.items ?? (Array.isArray(res) ? res : null);
      if (items?.length) {
        setReports(
          items.map((r: any) => ({
            id: r.id || r.reference || "REP-200",
            title: r.title || "Transparency Report",
            reference: r.reference || r.id || "REP-200",
            date: r.date || "Today",
            status: (r.status as Report["status"]) || "Published",
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(search.toLowerCase()) ||
      report.reference.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      reportType === "All report types" ||
      report.title.toLowerCase().includes(reportType.toLowerCase());

    return matchesSearch && matchesType;
  });

  // CREATE REPORT

  const handleCreateReport = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!reportTitle.trim()) {
      notify("Please enter a report title.");
      return;
    }

    apiClient.post("/transparency-reports", {
      title: reportTitle,
      description: reportDescription,
      period: reportPeriod,
    }).catch(() => {});

    const newReport: Report = {
      id: `REP-${Math.floor(200 + Math.random() * 800)}`,
      title: reportTitle,
      reference: "REP-" + Math.floor(200 + Math.random() * 800),
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
      status: "Draft",
    };

    setReports((previous) => [newReport, ...previous]);
    setReportTitle("");
    setReportDescription("");
    setShowCreateModal(false);

    notify("Report created successfully.");
  };

  // PUBLISH REPORT

  const publishReport = (id: string) => {
    setReports((previous) =>
      previous.map((report) =>
        report.id === id
          ? { ...report, status: "Published" }
          : report
      )
    );

    setSelectedReport(null);
    notify("Report published successfully.");
  };

  // DOWNLOAD / PRINT REPORT

  const downloadReport = () => {
    window.print();
    notify("Print / PDF export opened.");
  };

  const downloadIndividualReport = (report: Report) => {
    const content = [
      "CARELINK - TRANSPARENCY REPORT",
      "================================",
      `Report: ${report.title}`,
      `Reference: ${report.reference}`,
      `Date: ${report.date}`,
      `Status: ${report.status}`,
      "",
      "PUBLIC FUNDING SUMMARY",
      "Verified contributions: $4.82M",
      "Allocated funds: $3.91M",
      "Expenditure: $2.74M",
      "Available balance: $910K",
      "",
      "This is demonstration data for CareLink.",
    ].join("\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${report.reference}-report.txt`;
    link.click();

    URL.revokeObjectURL(url);
    notify("Report downloaded.");
  };

  const getStatusStyle = (status: Report["status"]) => {
    switch (status) {
      case "Published":
        return "bg-[#e5f6f0] text-[#078c70]";
      case "Draft":
        return "bg-[#fff3dd] text-[#b7791f]";
      case "Under Review":
        return "bg-[#fff3dd] text-[#a66b13]";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eef5f7] text-[#123e60] overflow-x-hidden">

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 py-4">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-xs mb-8">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={11} />
          <span className="text-slate-500">
            Funding & Donations
          </span>
          <ChevronRight size={11} />
          <span className="font-semibold">
            Transparency Reports
          </span>
        </div>

        {/* PAGE HEADING */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
              Transparency Reports
            </h1>

            <p className="text-[13px] text-slate-500 mt-1">
              Publish accountable summaries of donations, allocation, expenditure, and remaining funds.
            </p>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={() => setShowPolicyModal(true)}
              className="h-[37px] px-4 bg-white border border-[#b9cfda] rounded-lg text-sm text-[#23749e] hover:bg-[#f5fafc]"
            >
              Publishing policy
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[37px] px-4 bg-[#23749e] text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#175c80]"
            >
              <Plus size={15} />
              Create report
            </button>
          </div>
        </div>

        {/* FEATURED REPORT BANNER */}

        <section className="bg-[#143d5c] rounded-xl px-5 py-5 mb-3 flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-[45px] h-[45px] rounded-lg bg-[#68bca5] flex items-center justify-center shrink-0">
              <ShieldCheck
                size={21}
                className="text-[#123e60]"
              />
            </div>

            <div>
              <span className="inline-flex px-2 py-1 bg-[#e0f7ef] text-[#087b67] text-xs font-bold rounded mb-1.5">
                VERIFIED REPORTING
              </span>

              <h2 className="text-base sm:text-lg font-semibold text-white">
                Flood Response 2025 · Public Funding Summary
              </h2>

              <p className="text-xs text-[#c5dce8] mt-1">
                Reporting period: 18–25 June 2025 · Demonstration data
              </p>
            </div>
          </div>

          <button
            onClick={downloadReport}
            className="h-[37px] px-4 bg-white rounded-lg text-sm text-[#23749e] flex items-center gap-2 hover:bg-[#edf5f8] shrink-0"
          >
            <Download size={15} />
            Download PDF
          </button>
        </section>

        {/* FINANCIAL SUMMARY CARDS */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">

          <SummaryCard
            icon={<Heart size={19} />}
            label="Verified contributions"
            amount="$4.82M"
            description="1,826 verified records"
            color="blue"
          />

          <SummaryCard
            icon={<Share2 size={19} />}
            label="Allocated"
            amount="$3.91M"
            description="81.1% of contributions"
            color="blue"
          />

          <SummaryCard
            icon={<Receipt size={19} />}
            label="Expenditure"
            amount="$2.74M"
            description="56.8% of contributions"
            color="blue"
          />

          <SummaryCard
            icon={<TrendingUp size={19} />}
            label="Available balance"
            amount="$910K"
            description="18.9% unallocated"
            color="green"
          />

        </section>

        {/* ALLOCATION AND COMPLETENESS */}

        <section className="grid grid-cols-1 xl:grid-cols-[2.1fr_0.9fr] gap-3 mb-5">

          {/* ALLOCATION BY RESPONSE AREA */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">

            <div className="px-4 py-4 border-b border-[#d7e4e9]">

              <h2 className="text-base sm:text-lg font-semibold">
                Allocation by response area
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                $3.91M allocated verified funds
              </p>
            </div>

            <div className="px-4 py-5 space-y-6">

              {allocationData.map((item) => (
                <div
                  key={item.name}
                  className="grid grid-cols-[115px_1fr_55px] sm:grid-cols-[120px_1fr_55px] items-center gap-3"
                >

                  <span className="text-xs text-[#365b76]">
                    {item.name}
                  </span>

                  <div className="w-full h-[7px] bg-[#e8eef1] rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#65b9a2] rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-semibold text-right">
                    {item.amount}
                  </span>

                </div>
              ))}

            </div>
          </div>

          {/* REPORTING COMPLETENESS */}

          <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm overflow-hidden">

            <div className="px-4 py-4 border-b border-[#d7e4e9]">

              <h2 className="text-base sm:text-lg font-semibold">
                Reporting completeness
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Current response period
              </p>
            </div>

            <div className="p-4 space-y-5">

              {completenessData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2"
                >

                  <div className="flex items-center gap-2 min-w-0">

                    <span
                      className={`w-[7px] h-[7px] rounded-full shrink-0 ${
                        item.value >= 95
                          ? "bg-[#68bca5]"
                          : "bg-[#efa332]"
                      }`}
                    />

                    <span className="text-xs truncate">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-xs font-semibold shrink-0">
                    {item.percentage}
                  </span>

                </div>
              ))}

              <div className="bg-[#eaf7f3] rounded-lg p-3 flex items-start gap-2">

                <ShieldCheck
                  size={17}
                  className="text-[#168b72] shrink-0"
                />

                <div>
                  <p className="text-xs font-semibold text-[#078c70]">
                    Human-reviewed figures
                  </p>

                  <p className="text-xs text-[#568c83] mt-1">
                    All published totals require authorised review.
                  </p>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* REPORT LIBRARY */}

        <section className="mb-8">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">

            <div>
              <h2 className="text-base sm:text-lg font-semibold">
                Published and draft reports
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Manage transparent financial reporting records.
              </p>
            </div>

            <div className="flex items-center gap-2">

              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="h-[34px] w-[155px] sm:w-[180px] pl-8 pr-2 bg-white border border-[#d5e3e9] rounded-lg text-sm sm:text-[15px] outline-none focus:border-[#23749e]"
                />
              </div>

              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="h-[34px] px-2 bg-white border border-[#d5e3e9] rounded-lg text-sm sm:text-[15px] outline-none"
              >
                <option>All report types</option>
                <option>Weekly</option>
                <option>Campaign</option>
                <option>Material</option>
                <option>Partner</option>
              </select>
            </div>
          </div>

          {/* REPORT CARDS */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">

            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm p-3 flex items-center justify-between gap-2 hover:border-[#91c9bb] transition-colors"
              >

                <div className="flex items-center gap-2.5 min-w-0">

                  <div className="w-[34px] h-[34px] bg-[#e8f1f6] rounded-lg flex items-center justify-center shrink-0">
                    <ShieldCheck
                      size={18}
                      className="text-[#23749e]"
                    />
                  </div>

                  <div className="min-w-0">

                    <h3 className="text-base font-semibold truncate">
                      {report.title}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      {report.reference} · {report.date}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedReport(report)}
                  className={`px-2 py-2 rounded-lg text-xs font-semibold whitespace-nowrap ${getStatusStyle(
                    report.status
                  )}`}
                >
                  {report.status}
                </button>

              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="col-span-full bg-white rounded-xl border border-[#d5e3e9] p-8 text-center">

                <FileText
                  size={25}
                  className="mx-auto text-slate-300 mb-2"
                />

                <p className="text-sm font-medium">
                  No reports found
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Try another search or report type.
                </p>
              </div>
            )}
          </div>
        </section>

      </main>

      {/* CREATE REPORT MODAL */}

      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>

          <div className="mb-5">

            <div className="w-10 h-10 rounded-lg bg-[#e8f1f6] flex items-center justify-center mb-3">
              <FileText size={20} className="text-[#23749e]" />
            </div>

            <h2 className="text-lg sm:text-xl font-semibold">
              Create transparency report
            </h2>

            <p className="text-xs text-slate-400 mt-1">
              Prepare a new public financial reporting document.
            </p>
          </div>

          <form onSubmit={handleCreateReport} className="space-y-4">

            <FormField label="Report title">
              <input
                required
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Enter report title"
                className="transparency-input"
              />
            </FormField>

            <FormField label="Report description">
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe the report contents..."
                rows={3}
                className="transparency-input resize-none"
              />
            </FormField>

            <FormField label="Reporting period">
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="transparency-input"
              >
                <option>18–25 June 2025</option>
                <option>01–07 July 2025</option>
                <option>Monthly report</option>
                <option>Quarterly report</option>
                <option>Annual report</option>
              </select>
            </FormField>

            <div className="bg-[#eef5f7] p-3 rounded-lg flex gap-2">

              <ShieldCheck
                size={16}
                className="text-[#23749e] shrink-0"
              />

              <p className="text-xs text-slate-500">
                New reports are saved as drafts and must be reviewed before publication.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 border border-[#d5e3e9] rounded-lg text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2.5 bg-[#23749e] text-white rounded-lg text-sm font-semibold"
              >
                Create report
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* PUBLISHING POLICY MODAL */}

      {showPolicyModal && (
        <Modal onClose={() => setShowPolicyModal(false)}>

          <div className="w-11 h-11 rounded-lg bg-[#e5f6f0] flex items-center justify-center mb-4">
            <ShieldCheck size={23} className="text-[#078c70]" />
          </div>

          <h2 className="text-lg sm:text-xl font-semibold">
            Publishing policy
          </h2>

          <p className="text-xs text-slate-400 mt-1 mb-5">
            CareLink transparency and financial reporting guidelines.
          </p>

          <div className="space-y-4">

            {[
              {
                title: "Verified financial information",
                description:
                  "Only verified donations and approved financial transactions should appear in published reports.",
              },
              {
                title: "Allocation accountability",
                description:
                  "Every fund allocation must have an approved purpose, recipient and supporting documentation.",
              },
              {
                title: "Expenditure verification",
                description:
                  "Expense records should include invoices, payment evidence and authorised verification.",
              },
              {
                title: "Authorised publication",
                description:
                  "Reports must be reviewed and approved by an authorised officer before public release.",
              },
              {
                title: "Data privacy",
                description:
                  "Personal donor and beneficiary information must not be exposed in public reports.",
              },
            ].map((item, index) => (
              <div key={item.title} className="flex gap-3">

                <div className="w-6 h-6 rounded-full bg-[#e8f1f6] text-[#23749e] flex items-center justify-center text-xs font-semibold shrink-0">
                  {index + 1}
                </div>

                <div>
                  <h3 className="text-base font-semibold">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowPolicyModal(false)}
            className="w-full mt-6 h-10 bg-[#23749e] text-white rounded-lg text-sm font-semibold"
          >
            Close policy
          </button>

        </Modal>
      )}

      {/* REPORT DETAILS MODAL */}

      {selectedReport && (
        <Modal onClose={() => setSelectedReport(null)}>

          <div className="flex items-start justify-between mb-5">

            <div>
              <p className="text-xs text-[#23749e] font-semibold">
                {selectedReport.reference}
              </p>

              <h2 className="text-lg sm:text-xl font-semibold mt-1">
                {selectedReport.title}
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Created {selectedReport.date}
              </p>
            </div>

            <span
              className={`px-2 py-1 rounded-md text-xs font-semibold ${getStatusStyle(
                selectedReport.status
              )}`}
            >
              {selectedReport.status}
            </span>
          </div>

          <div className="bg-[#eef5f7] p-4 rounded-lg space-y-3 mb-5">

            <div className="flex justify-between">
              <span className="text-xs text-slate-500">
                Verified contributions
              </span>
              <strong className="text-sm">$4.82M</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-slate-500">
                Allocated funds
              </span>
              <strong className="text-sm">$3.91M</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-xs text-slate-500">
                Expenditure
              </span>
              <strong className="text-sm">$2.74M</strong>
            </div>

            <div className="flex justify-between border-t border-[#d5e3e9] pt-3">
              <span className="text-xs text-slate-500">
                Available balance
              </span>
              <strong className="text-sm text-[#078c70]">
                $910K
              </strong>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">

            <button
              onClick={() => downloadIndividualReport(selectedReport)}
              className="px-3 py-2 border border-[#d5e3e9] rounded-lg text-sm flex items-center gap-2"
            >
              <Download size={13} />
              Download
            </button>

            {selectedReport.status !== "Published" && (
              <button
                onClick={() => publishReport(selectedReport.id)}
                className="px-3 py-2 bg-[#23749e] text-white rounded-lg text-sm flex items-center gap-2"
              >
                <CheckCircle2 size={13} />
                Publish report
              </button>
            )}

            <button
              onClick={() => setSelectedReport(null)}
              className="px-3 py-2 bg-[#eef5f7] rounded-lg text-sm"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] bg-[#143d5c] text-white rounded-lg px-4 py-3 shadow-xl flex items-center gap-3 text-sm">
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
// SUMMARY CARD
// =====================================

function SummaryCard({
  icon,
  label,
  amount,
  description,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  amount: string;
  description: string;
  color: "blue" | "green";
}) {
  return (
    <div className="bg-white border border-[#d5e3e9] rounded-xl shadow-sm p-3.5 flex items-center gap-3">

      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          color === "green"
            ? "bg-[#e5f6f0] text-[#159b79]"
            : "bg-[#e8f1f6] text-[#23749e]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs text-slate-400">
          {label}
        </p>

        <h3 className="text-[21px] font-bold leading-tight mt-0.5">
          {amount}
        </h3>

        <p className="text-xs text-slate-400 mt-0.5">
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
  children: React.ReactNode;
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
// FORM FIELD
// =====================================

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
