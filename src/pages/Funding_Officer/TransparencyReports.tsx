import { useState, useEffect, useCallback } from "react";
import {
  Search,
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
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Printer,
} from "lucide-react";
import type { FormEvent } from "react";
import { transparencyReportService } from "../../services/transparencyReportService";
import type {
  TransparencyReport,
  TransparencyMetrics,
} from "../../types/transparencyReport";

export default function TransparencyReports() {
  const [reports, setReports] = useState<TransparencyReport[]>([]);
  const [metrics, setMetrics] = useState<TransparencyMetrics>({
    verifiedContributionsAmount: "$4.82M",
    verifiedContributionsValue: 4820000,
    verifiedContributionsCount: "1,826 verified records",
    allocatedAmount: "$3.91M",
    allocatedValue: 3910000,
    allocatedPercentage: "81.1% of contributions",
    expenditureAmount: "$2.74M",
    expenditureValue: 2740000,
    expenditurePercentage: "56.8% of contributions",
    availableBalanceAmount: "$910K",
    availableBalanceValue: 910000,
    availableBalancePercentage: "18.9% unallocated",
    featuredReportTitle: "Flood Response 2025 · Public Funding Summary",
    featuredReportPeriod: "18–25 June 2025",
    featuredReportTag: "VERIFIED REPORTING",
    allocationAreas: [
      { name: "Shelter & accommodation", amount: "$1.24M", percentage: 100 },
      { name: "Food & water", amount: "$986K", percentage: 80 },
      { name: "Medical response", amount: "$742K", percentage: 60 },
      { name: "Logistics & transport", amount: "$558K", percentage: 45 },
      { name: "Accessibility support", amount: "$384K", percentage: 31 },
    ],
    completeness: [
      { name: "Donation verification", percentage: "99.1%", value: 99.1 },
      { name: "Allocation documentation", percentage: "96.8%", value: 96.8 },
      { name: "Expenditure receipts", percentage: "92.4%", value: 92.4 },
      { name: "Partner confirmations", percentage: "88.7%", value: 88.7 },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TransparencyReport | null>(null);

  const [search, setSearch] = useState("");
  const [reportType, setReportType] = useState("All report types");
  const [reportTitle, setReportTitle] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportPeriod, setReportPeriod] = useState("18–25 June 2025");
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [toast, setToast] = useState("");

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsData, reportsData] = await Promise.all([
        transparencyReportService.getMetrics(),
        transparencyReportService.getPaged({
          search: search.trim() || undefined,
          type: reportType !== "All report types" ? reportType : undefined,
          pageSize: 20,
        }),
      ]);
      setMetrics(metricsData);
      setReports(reportsData.items);
    } catch (err: unknown) {
      console.error("Failed to load transparency reports data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load transparency data."
      );
    } finally {
      setLoading(false);
    }
  }, [search, reportType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // CREATE REPORT
  const handleCreateReport = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!reportTitle.trim()) {
      notify("Please enter a report title.");
      return;
    }

    setSubmitting(true);
    try {
      await transparencyReportService.create({
        title: reportTitle.trim(),
        description: reportDescription.trim() || undefined,
        period: reportPeriod,
      });

      setReportTitle("");
      setReportDescription("");
      setShowCreateModal(false);
      notify("Report created successfully as draft.");
      loadData();
    } catch (err) {
      console.error("Failed to create report:", err);
      notify("Failed to create report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // PUBLISH REPORT
  const publishReport = async (id: string) => {
    setPublishing(true);
    try {
      await transparencyReportService.publish(id);
      setSelectedReport(null);
      notify("Report published successfully.");
      loadData();
    } catch (err) {
      console.error("Failed to publish report:", err);
      notify("Failed to publish report.");
    } finally {
      setPublishing(false);
    }
  };

  // DOWNLOAD / PRINT REPORT
  const downloadReport = () => {
    window.print();
    notify("Print / PDF export dialog opened.");
  };

  const downloadIndividualReport = (report: TransparencyReport) => {
    const content = [
      "CARELINK - TRANSPARENCY REPORT",
      "================================",
      `Report: ${report.title}`,
      `Reference: ${report.reference}`,
      `Date: ${report.date}`,
      `Status: ${report.status}`,
      `Period: ${report.period || "Current response"}`,
      "",
      "PUBLIC FUNDING SUMMARY",
      `Verified contributions: $${(report.verifiedContributions || 4820000) / 1000000}M`,
      `Allocated funds: $${(report.allocatedFunds || 3910000) / 1000000}M`,
      `Expenditure: $${(report.expenditure || 2740000) / 1000000}M`,
      `Available balance: $${(report.availableBalance || 910000) / 1000}K`,
      "",
      `Description: ${report.description || "Official CareLink humanitarian transparency summary."}`,
      `Author: ${report.author || "Maria Kone"}`,
      "Generated by CareLink Humanitarian Relief Management System.",
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.reference}-transparency-report.txt`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Report text summary downloaded.");
  };

  const getStatusStyle = (status: TransparencyReport["status"]) => {
    switch (status) {
      case "Published":
        return "bg-[#e5f6f0] text-[#078c70]";
      case "Draft":
        return "bg-[#fff3dd] text-[#b7791f]";
      case "Under Review":
        return "bg-[#fef3c7] text-[#92400e]";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#eef5f7] text-[#123e60] overflow-x-hidden">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-7 py-5">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[11px] mb-6">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={13} />
          <span className="text-slate-500">Funding & Donations</span>
          <ChevronRight size={13} />
          <span className="font-semibold text-[#123e60]">Transparency Reports</span>
        </div>

        {/* PAGE HEADING */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-medium tracking-tight">Transparency Reports</h1>
            <p className="text-[13px] text-slate-500 mt-1">
              Publish accountable summaries of donations, allocation, expenditure, and remaining funds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPolicyModal(true)}
              className="h-[42px] px-4 bg-white border border-[#b9cfda] rounded-xl text-[12px] font-semibold text-[#23749e] hover:bg-[#f5fafc] transition-colors shadow-2xs cursor-pointer"
            >
              Publishing policy
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[42px] px-4 bg-[#23749e] hover:bg-[#175c80] text-white rounded-xl text-[12px] font-semibold flex items-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus size={16} />
              Create report
            </button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-[13px]">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {/* FEATURED REPORT BANNER */}
        <section className="bg-[#143d5c] rounded-2xl px-6 py-5 mb-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md text-white">
          <div className="flex items-center gap-4">
            <div className="w-[48px] h-[48px] rounded-xl bg-[#68bca5] flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck size={24} className="text-[#123e60]" />
            </div>

            <div>
              <span className="inline-flex px-2 py-0.5 bg-[#e0f7ef] text-[#087b67] text-[10px] font-bold rounded mb-1">
                {metrics.featuredReportTag || "VERIFIED REPORTING"}
              </span>

              <h2 className="text-[16px] font-semibold tracking-tight">
                {metrics.featuredReportTitle}
              </h2>

              <p className="text-[11px] text-[#c5dce8] mt-0.5">
                Reporting period: {metrics.featuredReportPeriod} · Official verified records
              </p>
            </div>
          </div>

          <button
            onClick={downloadReport}
            className="h-[40px] px-4 bg-white text-[#23749e] font-semibold rounded-xl text-[12px] flex items-center gap-2 hover:bg-[#edf5f8] shrink-0 transition-colors cursor-pointer shadow-sm"
          >
            <Printer size={16} />
            Print / PDF
          </button>
        </section>

        {/* FINANCIAL SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-4">
          <SummaryCard
            icon={<Heart size={20} />}
            label="Verified contributions"
            amount={metrics.verifiedContributionsAmount}
            description={metrics.verifiedContributionsCount}
            color="blue"
          />

          <SummaryCard
            icon={<Share2 size={20} />}
            label="Allocated"
            amount={metrics.allocatedAmount}
            description={metrics.allocatedPercentage}
            color="blue"
          />

          <SummaryCard
            icon={<Receipt size={20} />}
            label="Expenditure"
            amount={metrics.expenditureAmount}
            description={metrics.expenditurePercentage}
            color="blue"
          />

          <SummaryCard
            icon={<TrendingUp size={20} />}
            label="Available balance"
            amount={metrics.availableBalanceAmount}
            description={metrics.availableBalancePercentage}
            color="green"
          />
        </section>

        {/* ALLOCATION AND COMPLETENESS */}
        <section className="grid grid-cols-1 xl:grid-cols-[2.1fr_0.9fr] gap-4 mb-6">
          {/* ALLOCATION BY RESPONSE AREA */}
          <div className="bg-white border border-[#d5e3e9] rounded-2xl shadow-sm overflow-hidden p-5">
            <div className="border-b border-[#d7e4e9] pb-3 mb-4">
              <h2 className="text-[14px] font-semibold text-[#123e60]">
                Allocation by response area
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {metrics.allocatedAmount} allocated across verified program categories
              </p>
            </div>

            <div className="space-y-5 pt-2">
              {metrics.allocationAreas.map((item) => (
                <div
                  key={item.name}
                  className="grid grid-cols-[140px_1fr_65px] sm:grid-cols-[160px_1fr_75px] items-center gap-4"
                >
                  <span className="text-[12px] font-medium text-[#365b76]">
                    {item.name}
                  </span>

                  <div className="w-full h-[8px] bg-[#e8eef1] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#65b9a2] rounded-full transition-all duration-700"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>

                  <span className="text-[12px] font-semibold text-right text-[#123e60]">
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* REPORTING COMPLETENESS */}
          <div className="bg-white border border-[#d5e3e9] rounded-2xl shadow-sm overflow-hidden p-5">
            <div className="border-b border-[#d7e4e9] pb-3 mb-4">
              <h2 className="text-[14px] font-semibold text-[#123e60]">
                Reporting completeness
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Current response period</p>
            </div>

            <div className="space-y-4">
              {metrics.completeness.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-[8px] h-[8px] rounded-full shrink-0 ${
                        item.value >= 95 ? "bg-[#68bca5]" : "bg-[#efa332]"
                      }`}
                    />
                    <span className="text-[12px] text-slate-700 truncate">
                      {item.name}
                    </span>
                  </div>

                  <span className="text-[12px] font-semibold text-[#123e60] shrink-0">
                    {item.percentage}
                  </span>
                </div>
              ))}

              <div className="bg-[#eaf7f3] rounded-xl p-3.5 flex items-start gap-2.5 border border-[#cbe8df] mt-5">
                <ShieldCheck size={18} className="text-[#168b72] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-[#078c70]">
                    Human-reviewed figures
                  </p>
                  <p className="text-[10px] text-[#568c83] mt-0.5 leading-relaxed">
                    All published totals undergo financial verification and supervisory sign-off.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REPORT LIBRARY */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-[#123e60]">
                Published and draft reports
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Manage transparent financial reporting records for public and donor accountability.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search reports..."
                  className="h-[38px] w-[160px] sm:w-[200px] pl-9 pr-3 bg-white border border-[#d5e3e9] rounded-xl text-[11px] outline-none focus:border-[#23749e] shadow-2xs"
                />
              </div>

              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="h-[38px] px-3 bg-white border border-[#d5e3e9] rounded-xl text-[11px] font-medium outline-none focus:border-[#23749e] shadow-2xs cursor-pointer"
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
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 bg-white rounded-2xl border border-[#d5e3e9]">
              <Loader2 size={32} className="animate-spin text-[#23749e]" />
              <p className="text-[13px]">Loading transparency reports...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-[#d5e3e9] rounded-2xl shadow-sm p-4 flex items-center justify-between gap-3 hover:border-[#91c9bb] hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-[38px] h-[38px] bg-[#e8f1f6] rounded-xl flex items-center justify-center shrink-0 text-[#23749e]">
                      <ShieldCheck size={20} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-[12px] font-semibold text-[#123e60] truncate">
                        {report.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {report.reference} · {report.date}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedReport(report)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${getStatusStyle(
                      report.status
                    )}`}
                  >
                    {report.status}
                  </button>
                </div>
              ))}

              {reports.length === 0 && (
                <div className="col-span-full bg-white rounded-2xl border border-[#d5e3e9] p-12 text-center">
                  <FileText size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-[13px] font-semibold text-slate-700">No reports found</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Try another search keyword or switch report category.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* CREATE REPORT MODAL */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <div className="mb-5">
            <div className="w-11 h-11 rounded-xl bg-[#e8f1f6] flex items-center justify-center mb-3 text-[#23749e]">
              <FileText size={22} />
            </div>

            <h2 className="text-[17px] font-semibold text-[#123e60]">
              Create transparency report
            </h2>

            <p className="text-[11px] text-slate-400 mt-1">
              Prepare a new public financial reporting document.
            </p>
          </div>

          <form onSubmit={handleCreateReport} className="space-y-4">
            <FormField label="Report title">
              <input
                required
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="e.g. Q3 Regional Humanitarian Financial Summary"
                className="w-full h-[44px] px-3 border border-[#d5e3e9] rounded-xl text-[12px] outline-none focus:border-[#23749e]"
              />
            </FormField>

            <FormField label="Report description">
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe key funding highlights, target beneficiaries and response programs..."
                rows={3}
                className="w-full p-3 border border-[#d5e3e9] rounded-xl text-[12px] outline-none focus:border-[#23749e] resize-none"
              />
            </FormField>

            <FormField label="Reporting period">
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="w-full h-[44px] px-3 border border-[#d5e3e9] rounded-xl text-[12px] outline-none bg-white focus:border-[#23749e]"
              >
                <option>18–25 June 2025</option>
                <option>01–07 July 2025</option>
                <option>Monthly report</option>
                <option>Quarterly report</option>
                <option>Annual report</option>
              </select>
            </FormField>

            <div className="bg-[#eef5f7] p-3.5 rounded-xl flex gap-2.5 border border-[#dce8ee]">
              <ShieldCheck size={18} className="text-[#23749e] shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-600 leading-relaxed">
                New reports are initialized as drafts and require supervisory sign-off before being marked as published.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#e4edf1]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 h-[42px] border border-[#d5e3e9] rounded-xl text-[12px] font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 h-[42px] bg-[#23749e] hover:bg-[#175c80] disabled:opacity-50 text-white rounded-xl text-[12px] font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create report"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* PUBLISHING POLICY MODAL */}
      {showPolicyModal && (
        <Modal onClose={() => setShowPolicyModal(false)}>
          <div className="w-11 h-11 rounded-xl bg-[#e5f6f0] flex items-center justify-center mb-4 text-[#078c70]">
            <ShieldCheck size={24} />
          </div>

          <h2 className="text-[17px] font-semibold text-[#123e60]">Publishing policy</h2>
          <p className="text-[11px] text-slate-400 mt-1 mb-5">
            CareLink transparency and financial reporting governance guidelines.
          </p>

          <div className="space-y-4">
            {[
              {
                title: "Verified financial information",
                description:
                  "Only verified donations and approved financial transactions are included in published reports.",
              },
              {
                title: "Allocation accountability",
                description:
                  "Every fund allocation must have an approved purpose, recipient institution, and supporting authorization.",
              },
              {
                title: "Expenditure verification",
                description:
                  "Expense records must be backed by receipts, payment evidence, and partner verification sign-offs.",
              },
              {
                title: "Authorised publication",
                description:
                  "Reports must be reviewed and approved by an authorized Funding Officer prior to public dissemination.",
              },
              {
                title: "Beneficiary data privacy",
                description:
                  "Individual donor and displaced beneficiary privacy is strictly safeguarded in public summaries.",
              },
            ].map((item, index) => (
              <div key={item.title} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#e8f1f6] text-[#23749e] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {index + 1}
                </div>

                <div>
                  <h3 className="text-[12px] font-semibold text-slate-800">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowPolicyModal(false)}
            className="w-full mt-6 h-11 bg-[#23749e] hover:bg-[#175c80] text-white rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
          >
            Close policy
          </button>
        </Modal>
      )}

      {/* REPORT DETAILS MODAL */}
      {selectedReport && (
        <Modal onClose={() => setSelectedReport(null)}>
          <div className="flex items-start justify-between pb-3 border-b border-[#e4edf1] mb-5">
            <div>
              <p className="text-[11px] font-mono font-semibold text-[#23749e]">
                {selectedReport.reference}
              </p>

              <h2 className="text-[17px] font-semibold text-[#123e60] mt-0.5">
                {selectedReport.title}
              </h2>

              <p className="text-[11px] text-slate-400 mt-1">
                Period: {selectedReport.period || "18–25 June 2025"} · Published {selectedReport.date}
              </p>
            </div>

            <span
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold ${getStatusStyle(
                selectedReport.status
              )}`}
            >
              {selectedReport.status}
            </span>
          </div>

          <div className="bg-[#eef5f7] p-4 rounded-xl space-y-3 mb-5 border border-[#dce8ee]">
            <div className="flex justify-between items-center text-[12px]">
              <span className="text-slate-500">Verified contributions</span>
              <strong className="text-slate-800">$4.82M</strong>
            </div>

            <div className="flex justify-between items-center text-[12px]">
              <span className="text-slate-500">Allocated funds</span>
              <strong className="text-slate-800">$3.91M</strong>
            </div>

            <div className="flex justify-between items-center text-[12px]">
              <span className="text-slate-500">Expenditure</span>
              <strong className="text-slate-800">$2.74M</strong>
            </div>

            <div className="flex justify-between items-center border-t border-[#d5e3e9] pt-3 text-[12px]">
              <span className="text-slate-600 font-medium">Available balance</span>
              <strong className="text-[#078c70] text-[13px]">$910K</strong>
            </div>
          </div>

          {selectedReport.description && (
            <div className="mb-5 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
              {selectedReport.description}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#e4edf1]">
            <button
              onClick={() => downloadIndividualReport(selectedReport)}
              className="px-3.5 h-[38px] border border-[#d5e3e9] rounded-xl text-[11px] font-medium flex items-center gap-1.5 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download size={14} />
              Download summary
            </button>

            {selectedReport.status !== "Published" && (
              <button
                onClick={() => publishReport(selectedReport.id)}
                disabled={publishing}
                className="px-4 h-[38px] bg-[#23749e] hover:bg-[#175c80] disabled:opacity-50 text-white rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {publishing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                Publish report
              </button>
            )}

            <button
              onClick={() => setSelectedReport(null)}
              className="px-4 h-[38px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* FLOATING TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] bg-[#143d5c] text-white rounded-xl px-4 py-3 shadow-xl flex items-center gap-3 text-[12px] animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 size={18} className="text-[#57d6ad]" />
          <span>{toast}</span>
          <button
            onClick={() => setToast("")}
            className="text-slate-400 hover:text-white ml-2 cursor-pointer"
          >
            <X size={14} />
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
    <div className="bg-white border border-[#d5e3e9] rounded-2xl shadow-sm p-4 flex items-center gap-3.5">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          color === "green"
            ? "bg-[#e5f6f0] text-[#159b79]"
            : "bg-[#e8f1f6] text-[#23749e]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 font-medium">{label}</p>
        <h3 className="text-[22px] font-bold leading-tight mt-0.5 text-[#123e60]">
          {amount}
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// =====================================
// MODAL COMPONENT
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
      className="fixed inset-0 z-[80] bg-[#102d42]/45 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-[480px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-red-500 rounded-lg p-1 transition-colors cursor-pointer"
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
      <span className="block text-[11px] font-semibold text-slate-700 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
