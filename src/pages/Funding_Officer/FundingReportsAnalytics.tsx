import { useCallback, useEffect, useState } from "react";
import {
  ChevronRight,
  Download,
  Printer,
  Heart,
  Share2,
  FileText,
  ShieldCheck,
  Users,
  Megaphone,
  Box,
  AlertTriangle,
  CheckCircle2,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fundingReportsService } from "../../services/fundingReportsService";
import type { FundingAnalyticsReport } from "../../types/fundingReports";

type ReportItem = {
  title: string;
  icon: React.ElementType;
  description: string;
  path: string;
};

const reports: ReportItem[] = [
  {
    title: "Donation Register",
    icon: Heart,
    description: "View all donation records and contribution history.",
    path: "/funding-officer/donations",
  },
  {
    title: "Donor Activity Report",
    icon: Users,
    description: "Analyse donor activity and contribution patterns.",
    path: "/funding-officer/donors",
  },
  {
    title: "Campaign Performance",
    icon: Megaphone,
    description: "Review campaign targets and fundraising progress.",
    path: "/funding-officer/campaigns",
  },
  {
    title: "Allocation Summary",
    icon: Share2,
    description: "Analyse allocated funds and distribution.",
    path: "/funding-officer/allocations",
  },
  {
    title: "Expenditure Report",
    icon: FileText,
    description: "Review expenditure and payment records.",
    path: "/funding-officer/expenditure",
  },
  {
    title: "Material Contributions",
    icon: Box,
    description: "Review donated goods and material resources.",
    path: "/funding-officer/resources",
  },
  {
    title: "Flag Investigation Report",
    icon: AlertTriangle,
    description: "Review flagged transactions and investigations.",
    path: "/funding-officer/flagged",
  },
  {
    title: "Transparency Report",
    icon: ShieldCheck,
    description: "Review financial transparency and accountability.",
    path: "/funding-officer/transparency",
  },
];

export default function FundingReportsAnalytics() {
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState("01-30 June 2025");
  const [campaign, setCampaign] = useState("All campaigns");
  const [currency, setCurrency] = useState("USD");

  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: "01-30 June 2025",
    campaign: "All campaigns",
    currency: "USD",
  });

  const [data, setData] = useState<FundingAnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const fetchAnalytics = useCallback(async (filters: typeof appliedFilters) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fundingReportsService.getAnalytics({
        dateRange: filters.dateRange,
        campaign: filters.campaign,
        currency: filters.currency,
      });
      setData(result);
    } catch {
      setError("Failed to load funding reports & analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(appliedFilters);
  }, [fetchAnalytics, appliedFilters]);

  const applyFilters = () => {
    const newFilters = {
      dateRange,
      campaign,
      currency,
    };
    setAppliedFilters(newFilters);
    showToast("Report filters applied successfully.");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!data) return;

    const rows = [
      ["Funding Reports & Analytics"],
      ["Date range", appliedFilters.dateRange],
      ["Campaign", appliedFilters.campaign],
      ["Currency", appliedFilters.currency],
      [],
      ["Metric", "Value", "Notes"],
      ["Funds received", data.metrics.fundsReceivedDisplay, data.metrics.fundsReceivedGrowth],
      ["Allocation rate", `${data.metrics.allocationRate}%`, data.metrics.allocatedSubtitle],
      ["Expenditure rate", `${data.metrics.expenditureRate}%`, data.metrics.expenditureSubtitle],
      ["Verification rate", `${data.metrics.verificationRate}%`, data.metrics.verificationSubtitle],
      [],
      ["Contribution source", "Amount", "Percentage"],
      ...data.sources.map((source) => [
        source.name,
        source.displayAmount,
        `${source.percentage}%`,
      ]),
      [],
      ["Total Combined Value", data.combinedSourceDisplay],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `funding-reports-analytics-${appliedFilters.currency.toLowerCase()}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    showToast("Report exported successfully.");
  };

  const metrics = data?.metrics;
  const sources = data?.sources ?? [];
  const campaignOptions = data?.availableCampaigns ?? [
    "All campaigns",
    "Flood Response 2025",
    "Emergency Shelter Fund",
    "Clean Water Appeal",
    "Medical Relief",
  ];

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60]">
      {/* MAIN CONTENT */}
      <main className="max-w-[1600px] mx-auto px-5 md:px-7 py-5">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-[9px] mb-7">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={11} />
          <span className="text-slate-500">Funding &amp; Donations</span>
          <ChevronRight size={11} />
          <span className="font-semibold">Funding Reports &amp; Analytics</span>
        </div>

        {/* PAGE TITLE */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-[23px] font-medium">Funding Reports &amp; Analytics</h1>
            <p className="text-[10px] text-slate-500 mt-1">
              Analyse contribution trends, allocation, expenditure, donor activity, and verification performance.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="h-[34px] px-3 bg-white border border-[#b9cfda] rounded-lg text-[9px] hover:bg-[#f5fafc] flex items-center gap-2"
            >
              <Printer size={13} />
              Print
            </button>

            <button
              onClick={handleExport}
              disabled={loading || !data}
              className="h-[34px] px-3 bg-[#287ba5] text-white rounded-lg text-[9px] font-semibold hover:bg-[#1e6388] flex items-center gap-2 disabled:opacity-50"
            >
              <Download size={13} />
              Export report
            </button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600 text-[10px]">
              <AlertCircle size={15} />
              {error}
            </div>
            <button
              onClick={() => fetchAnalytics(appliedFilters)}
              className="text-[9px] text-red-600 flex items-center gap-1 hover:underline"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}

        {/* FILTER SECTION */}
        <section className="bg-white border border-[#d5e3e9] rounded-lg p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <div>
              <label className="block text-[8px] text-slate-500 mb-1">Date range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full h-[31px] px-2 border border-[#d5e3e9] rounded-md text-[9px] outline-none bg-white"
              >
                <option>01-30 June 2025</option>
                <option>01-31 May 2025</option>
                <option>01-30 April 2025</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>All time</option>
              </select>
            </div>

            <div>
              <label className="block text-[8px] text-slate-500 mb-1">Campaign</label>
              <select
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full h-[31px] px-2 border border-[#d5e3e9] rounded-md text-[9px] outline-none bg-white"
              >
                {campaignOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[8px] text-slate-500 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-[31px] px-2 border border-[#d5e3e9] rounded-md text-[9px] outline-none bg-white"
              >
                <option value="USD">USD ($)</option>
                <option value="LKR">LKR (Rs.)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full h-[31px] px-3 bg-[#287ba5] text-white rounded-md text-[9px] font-medium hover:bg-[#1f6386] transition"
              >
                Apply filters
              </button>
            </div>
          </div>
        </section>

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 mb-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm p-3 flex items-center gap-2.5 min-h-[64px] animate-pulse"
              >
                <div className="w-[31px] h-[31px] rounded-lg bg-slate-100" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-2 bg-slate-100 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-2 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : (
            <>
              <MetricCard
                title="Funds received"
                value={metrics?.fundsReceivedDisplay ?? "$4.82M"}
                subtitle={metrics?.fundsReceivedGrowth ?? "+18.4% this month"}
                icon={Heart}
                color="blue"
              />

              <MetricCard
                title="Allocation rate"
                value={`${metrics?.allocationRate ?? 81.1}%`}
                subtitle={metrics?.allocatedSubtitle ?? "$3.91M allocated"}
                icon={Share2}
                color="green"
              />

              <MetricCard
                title="Expenditure rate"
                value={`${metrics?.expenditureRate ?? 70.1}%`}
                subtitle={metrics?.expenditureSubtitle ?? "$2.74M recorded"}
                icon={FileText}
                color="blue"
              />

              <MetricCard
                title="Verification rate"
                value={`${metrics?.verificationRate ?? 99.1}%`}
                subtitle={metrics?.verificationSubtitle ?? "16 records pending"}
                icon={ShieldCheck}
                color="green"
              />
            </>
          )}
        </section>

        {/* CHART AND SOURCE DISTRIBUTION */}
        <section className="grid grid-cols-1 lg:grid-cols-[3fr_0.92fr] gap-2.5 mb-4">
          {/* DONATION TREND CHART */}
          <div className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm overflow-hidden">
            <div className="px-3 py-3 border-b border-[#d5e3e9] flex items-center justify-between">
              <div>
                <h2 className="text-[11px] font-medium">Donation and allocation trend</h2>
                <p className="text-[8px] text-slate-400 mt-1">
                  Monthly value · {appliedFilters.currency}
                </p>
              </div>

              <span className="bg-[#e5f6f0] text-[#159b79] rounded px-2 py-1 text-[8px] font-semibold">
                {data?.trend.growth ?? "+18.4%"}
              </span>
            </div>

            <div className="px-3 pt-5 pb-3">
              <div className="w-full h-[185px]">
                <svg
                  viewBox="0 0 1000 190"
                  preserveAspectRatio="none"
                  className="w-full h-full"
                >
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5bbba3" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#5bbba3" stopOpacity="0.10" />
                    </linearGradient>
                  </defs>

                  {/* GRID LINES */}
                  {[40, 85, 130, 175].map((y) => (
                    <line
                      key={y}
                      x1="0"
                      y1={y}
                      x2="1000"
                      y2={y}
                      stroke="#e6eef1"
                      strokeWidth="1"
                    />
                  ))}

                  {/* AREA */}
                  <path
                    d={
                      data?.trend.svgAreaD ??
                      "M 0 148 C 90 138, 120 133, 200 132 S 290 137, 350 126 S 450 98, 500 102 S 570 112, 650 98 S 780 67, 850 55 S 950 38, 1000 35 L 1000 175 L 0 175 Z"
                    }
                    fill="url(#trendFill)"
                  />

                  {/* LINE */}
                  <path
                    d={
                      data?.trend.svgLineD ??
                      "M 0 148 C 90 138, 120 133, 200 132 S 290 137, 350 126 S 450 98, 500 102 S 570 112, 650 98 S 780 67, 850 55 S 950 38, 1000 35"
                    }
                    fill="none"
                    stroke="#287ba5"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-[7px] text-slate-400 mt-1 px-1">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </div>
          </div>

          {/* CONTRIBUTIONS BY SOURCE */}
          <div className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm overflow-hidden">
            <div className="px-3 py-3 border-b border-[#d5e3e9]">
              <h2 className="text-[10px] font-medium">Contributions by source</h2>
              <p className="text-[8px] text-slate-400 mt-1">
                {data?.combinedSourceDisplay ?? "$6.16M combined value"}
              </p>
            </div>

            <div className="p-3 space-y-4">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 animate-pulse">
                      <div className="h-2.5 bg-slate-100 rounded w-1/3" />
                      <div className="h-2.5 bg-slate-200 rounded w-1/4" />
                    </div>
                  ))
                : sources.map((source) => (
                    <div key={source.name} className="flex items-center justify-between gap-2">
                      <span className="text-[8px] text-[#45657e]">{source.name}</span>
                      <span className="text-[8px] font-semibold text-[#123e60]">
                        {source.displayAmount}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* REPORT LIBRARY */}
        <section className="mb-5">
          <h2 className="text-[10px] font-medium mb-2">Report library</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
            {reports.map((report) => {
              const Icon = report.icon;

              return (
                <button
                  key={report.title}
                  onClick={() => setSelectedReport(report)}
                  className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm min-h-[57px] px-3 flex items-center gap-3 hover:border-[#55bba1] hover:bg-[#f8fcfb] transition-all text-left"
                >
                  <div className="w-[29px] h-[29px] bg-[#e8f1f6] text-[#287ba5] rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>

                  <span className="flex-1 text-[8px] font-medium">{report.title}</span>

                  <ChevronRight size={15} className="text-[#123e60] shrink-0" />
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* REPORT DETAILS MODAL */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 bg-[#102d42]/45 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedReport(null);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-[420px] p-5 relative">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
            >
              <X size={18} />
            </button>

            <div className="w-11 h-11 bg-[#e8f1f6] text-[#287ba5] rounded-lg flex items-center justify-center mb-4">
              <selectedReport.icon size={22} />
            </div>

            <h2 className="text-[16px] font-semibold">{selectedReport.title}</h2>
            <p className="text-[10px] text-slate-500 mt-2">{selectedReport.description}</p>

            <div className="bg-[#f4f8fa] p-3 rounded-lg mt-5 space-y-2">
              <div className="flex justify-between text-[9px]">
                <span className="text-slate-500">Date range</span>
                <span className="font-medium">{appliedFilters.dateRange}</span>
              </div>

              <div className="flex justify-between text-[9px]">
                <span className="text-slate-500">Campaign</span>
                <span className="font-medium">{appliedFilters.campaign}</span>
              </div>

              <div className="flex justify-between text-[9px]">
                <span className="text-slate-500">Currency</span>
                <span className="font-medium">{appliedFilters.currency}</span>
              </div>
            </div>

            <button
              onClick={() => {
                const target = selectedReport.path;
                setSelectedReport(null);
                navigate(target);
              }}
              className="w-full h-10 bg-[#287ba5] text-white rounded-lg mt-5 text-[10px] font-semibold hover:bg-[#1e6388] transition"
            >
              Open report
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] bg-[#143d5c] text-white rounded-lg px-4 py-3 shadow-xl flex items-center gap-2 text-[10px]">
          <CheckCircle2 size={15} />
          {toast}
        </div>
      )}
    </div>
  );
}

// =====================================
// REUSABLE METRIC CARD
// =====================================

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  color: "blue" | "green";
}) {
  return (
    <div className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm p-3 flex items-center gap-2.5 min-h-[64px]">
      <div
        className={`w-[31px] h-[31px] rounded-lg flex items-center justify-center shrink-0 ${
          color === "green"
            ? "bg-[#e5f6f0] text-[#159b79]"
            : "bg-[#e8f1f6] text-[#287ba5]"
        }`}
      >
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] text-slate-400">{title}</p>
        <p className="text-[18px] leading-5 font-bold text-[#123e60]">{value}</p>
        <p className="text-[7px] text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
