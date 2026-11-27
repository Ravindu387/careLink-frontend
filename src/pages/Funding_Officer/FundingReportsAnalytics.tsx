
import { useEffect, useState } from "react";
import { apiClient } from "../../services/api";
import {
  Search,
  Globe,
  Bell,
  CircleHelp,
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
  CalendarDays,
  CheckCircle2,
  X,
} from "lucide-react";

type Report = {
  title: string;
  icon: React.ElementType;
  description: string;
};

const reports: Report[] = [
  {
    title: "Donation Register",
    icon: Heart,
    description: "View all donation records and contribution history.",
  },
  {
    title: "Donor Activity Report",
    icon: Users,
    description: "Analyse donor activity and contribution patterns.",
  },
  {
    title: "Campaign Performance",
    icon: Megaphone,
    description: "Review campaign targets and fundraising progress.",
  },
  {
    title: "Allocation Summary",
    icon: Share2,
    description: "Analyse allocated funds and distribution.",
  },
  {
    title: "Expenditure Report",
    icon: FileText,
    description: "Review expenditure and payment records.",
  },
  {
    title: "Material Contributions",
    icon: Box,
    description: "Review donated goods and material resources.",
  },
  {
    title: "Flag Investigation Report",
    icon: AlertTriangle,
    description: "Review flagged transactions and investigations.",
  },
  {
    title: "Transparency Report",
    icon: ShieldCheck,
    description: "Review financial transparency and accountability.",
  },
];

const sources = [
  { name: "Foundations", amount: "$2.18M" },
  { name: "Corporate", amount: "$1.46M" },
  { name: "International NGOs", amount: "$1.24M" },
  { name: "Community groups", amount: "$782K" },
  { name: "Individuals", amount: "$498K" },
];

export default function FundingReportsAnalytics() {
  const [dateRange, setDateRange] = useState("01-30 June 2025");
  const [campaign, setCampaign] = useState("All campaigns");
  const [currency, setCurrency] = useState("USD");

  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: "01-30 June 2025",
    campaign: "All campaigns",
    currency: "USD",
  });

  const [selectedReport, setSelectedReport] = useState<Report | null>(
    null
  );

  const [toast, setToast] = useState("");
  const [sourceList, setSourceList] = useState(sources);

  useEffect(() => {
    apiClient.get<any>("/funding-reports").then((res) => {
      if (Array.isArray(res?.sources) && res.sources.length) {
        setSourceList(
          res.sources.map((s: any) => ({
            name: s.name || s.source || "Source",
            amount: typeof s.amount === "number" ? `$${s.amount.toLocaleString()}` : String(s.amount || "$0"),
          }))
        );
      }
    }).catch(() => {});
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  const applyFilters = () => {
    setAppliedFilters({
      dateRange,
      campaign,
      currency,
    });

    showToast("Report filters applied successfully.");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const rows = [
      ["Funding Reports & Analytics"],
      ["Date range", appliedFilters.dateRange],
      ["Campaign", appliedFilters.campaign],
      ["Currency", appliedFilters.currency],
      [],
      ["Metric", "Value"],
      ["Funds received", "$4.82M"],
      ["Allocation rate", "81.1%"],
      ["Expenditure rate", "70.1%"],
      ["Verification rate", "99.1%"],
      [],
      ["Contribution source", "Amount"],
      ...sourceList.map((source) => [
        source.name,
        source.amount,
      ]),
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
    link.download = "funding-reports-analytics.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    showToast("Report exported successfully.");
  };

  return (
    <div className="min-h-screen bg-[#eef5f7] text-[#123e60]">

      {/* MAIN CONTENT */}

      <main className="max-w-[1600px] mx-auto px-5 md:px-7 py-5">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-xs mb-7">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={11} />
          <span className="text-slate-500">
            Funding & Donations
          </span>
          <ChevronRight size={11} />
          <span className="font-semibold">
            Funding Reports & Analytics
          </span>
        </div>

        {/* PAGE TITLE */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">

          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold">
              Funding Reports & Analytics
            </h1>

            <p className="text-[13px] text-slate-500 mt-1">
              Analyse contribution trends, allocation, expenditure, donor activity, and verification performance.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={handlePrint}
              className="h-[34px] px-3 bg-white border border-[#b9cfda] rounded-lg text-sm hover:bg-[#f5fafc] flex items-center gap-2"
            >
              <Printer size={13} />
              Print
            </button>

            <button
              onClick={handleExport}
              className="h-[34px] px-3 bg-[#287ba5] text-white rounded-lg text-sm font-semibold hover:bg-[#1e6388] flex items-center gap-2"
            >
              <Download size={13} />
              Export report
            </button>

          </div>
        </div>

        {/* FILTER SECTION */}

        <section className="bg-white border border-[#d5e3e9] rounded-lg p-3 mb-3">

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-2">

            <div>
              <label className="block text-sm text-slate-500 mb-1">
                Date range
              </label>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full h-[31px] px-2 border border-[#d5e3e9] rounded-md text-sm sm:text-[15px] outline-none bg-white"
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
              <label className="block text-sm text-slate-500 mb-1">
                Campaign
              </label>

              <select
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
                className="w-full h-[31px] px-2 border border-[#d5e3e9] rounded-md text-sm sm:text-[15px] outline-none bg-white"
              >
                <option>All campaigns</option>
                <option>Flood Response 2025</option>
                <option>Emergency Shelter Fund</option>
                <option>Clean Water Appeal</option>
                <option>Medical Relief</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-slate-500 mb-1">
                Currency
              </label>

              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-[31px] px-2 border border-[#d5e3e9] rounded-md text-sm sm:text-[15px] outline-none bg-white"
              >
                <option value="USD">USD</option>
                <option value="LKR">LKR</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={applyFilters}
                className="w-full h-[31px] px-3 border border-[#b9cfda] rounded-md text-sm hover:bg-[#edf6f8]"
              >
                Apply filters
              </button>
            </div>

          </div>

        </section>

        {/* SUMMARY CARDS */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 mb-3">

          <MetricCard
            title="Funds received"
            value="$4.82M"
            subtitle="+18.4% this month"
            icon={Heart}
            color="blue"
          />

          <MetricCard
            title="Allocation rate"
            value="81.1%"
            subtitle="$3.91M allocated"
            icon={Share2}
            color="green"
          />

          <MetricCard
            title="Expenditure rate"
            value="70.1%"
            subtitle="$2.74M recorded"
            icon={FileText}
            color="blue"
          />

          <MetricCard
            title="Verification rate"
            value="99.1%"
            subtitle="16 records pending"
            icon={ShieldCheck}
            color="green"
          />

        </section>

        {/* CHART AND SOURCE DISTRIBUTION */}

        <section className="grid grid-cols-1 lg:grid-cols-[3fr_0.92fr] gap-2.5 mb-4">

          {/* DONATION TREND CHART */}

          <div className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm overflow-hidden">

            <div className="px-3 py-3 border-b border-[#d5e3e9] flex items-center justify-between">

              <div>
                <h2 className="text-base sm:text-lg font-semibold">
                  Donation and allocation trend
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Monthly value · {appliedFilters.currency}
                </p>
              </div>

              <span className="bg-[#e5f6f0] text-[#159b79] rounded px-2 py-1 text-xs font-semibold">
                +18.4%
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
                    d="
                      M 0 148
                      C 90 138, 120 133, 200 132
                      S 290 137, 350 126
                      S 450 98, 500 102
                      S 570 112, 650 98
                      S 780 67, 850 55
                      S 950 38, 1000 35
                      L 1000 175
                      L 0 175 Z
                    "
                    fill="url(#trendFill)"
                  />

                  {/* LINE */}

                  <path
                    d="
                      M 0 148
                      C 90 138, 120 133, 200 132
                      S 290 137, 350 126
                      S 450 98, 500 102
                      S 570 112, 650 98
                      S 780 67, 850 55
                      S 950 38, 1000 35
                    "
                    fill="none"
                    stroke="#287ba5"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                </svg>

              </div>

              <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map(
                  (month) => (
                    <span key={month}>{month}</span>
                  )
                )}
              </div>

            </div>

          </div>

          {/* CONTRIBUTIONS BY SOURCE */}

          <div className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm overflow-hidden">

            <div className="px-3 py-3 border-b border-[#d5e3e9]">
              <h2 className="text-base sm:text-lg font-semibold">
                Contributions by source
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                $6.16M combined value
              </p>
            </div>

            <div className="p-3 space-y-4">

              {sources.map((source) => (
                <div
                  key={source.name}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="text-xs text-[#45657e]">
                    {source.name}
                  </span>

                  <span className="text-xs font-semibold text-[#123e60]">
                    {source.amount}
                  </span>
                </div>
              ))}

            </div>

          </div>

        </section>

        {/* REPORT LIBRARY */}

        <section className="mb-5">

          <h2 className="text-base sm:text-lg font-semibold mb-2">
            Report library
          </h2>

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

                  <span className="flex-1 text-xs font-medium">
                    {report.title}
                  </span>

                  <ChevronRight
                    size={15}
                    className="text-[#123e60] shrink-0"
                  />

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
              className="absolute top-4 right-4 text-slate-400"
            >
              <X size={18} />
            </button>

            <div className="w-11 h-11 bg-[#e8f1f6] text-[#287ba5] rounded-lg flex items-center justify-center mb-4">
              <selectedReport.icon size={22} />
            </div>

            <h2 className="text-lg sm:text-xl font-semibold">
              {selectedReport.title}
            </h2>

            <p className="text-[13px] text-slate-500 mt-2">
              {selectedReport.description}
            </p>

            <div className="bg-[#f4f8fa] p-3 rounded-lg mt-5 space-y-2">

              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Date range</span>
                <span>{appliedFilters.dateRange}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Campaign</span>
                <span>{appliedFilters.campaign}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Currency</span>
                <span>{appliedFilters.currency}</span>
              </div>

            </div>

            <button
              onClick={() => {
                showToast(`${selectedReport.title} selected.`);
                setSelectedReport(null);
              }}
              className="w-full h-10 bg-[#287ba5] text-white rounded-lg mt-5 text-sm font-semibold"
            >
              Open report
            </button>

          </div>

        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] bg-[#143d5c] text-white rounded-lg px-4 py-3 shadow-xl flex items-center gap-2 text-sm">
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
        <p className="text-xs text-slate-400">
          {title}
        </p>

        <p className="text-[18px] leading-5 font-bold text-[#123e60]">
          {value}
        </p>

        <p className="text-xs text-slate-400 mt-0.5">
          {subtitle}
        </p>
      </div>

    </div>
  );
}
