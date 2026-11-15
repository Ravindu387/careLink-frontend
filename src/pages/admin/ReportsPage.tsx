import { useState } from "react";
import {
  Users,
  ShieldCheck,
  Clock3,
  Activity,
  BriefcaseBusiness,
  Link2,
  LockKeyhole,
  Database,
  ChartNoAxesColumnIncreasing,
  ChevronRight,
} from "lucide-react";

const roleData = [
  { label: "Citizen", value: "8,420", width: "100%" },
  { label: "Volunteer", value: "4,218", width: "50%" },
  { label: "Case Manager", value: "2,184", width: "26%" },
  { label: "Partner Officer", value: "1,284", width: "15%" },
  { label: "Operations Staff", value: "2,376", width: "28%" },
];

const reports = [
  { title: "User & Access Report", icon: Users },
  { title: "Privileged Access Review", icon: ShieldCheck },
  { title: "Organisation Activity", icon: BriefcaseBusiness },
  { title: "Integration Performance", icon: Link2 },
  { title: "Security Event Summary", icon: LockKeyhole },
  { title: "Audit Activity Report", icon: Clock3 },
  { title: "Data Governance Report", icon: Database },
  { title: "Platform Performance", icon: ChartNoAxesColumnIncreasing },
];

const stats = [
  { label: "Monthly active users", value: "14,842", note: "80.3% of registered", icon: Users, tone: "blue" },
  { label: "Access reviews completed", value: "96%", note: "142 privileged users", icon: ShieldCheck, tone: "green" },
  { label: "Security response time", value: "18m", note: "-22% this month", icon: Clock3, tone: "blue" },
  { label: "Platform availability", value: "99.94%", note: "30-day average", icon: Activity, tone: "green" },
];

function StatCard({ item }: { item: (typeof stats)[number] }) {
  const Icon = item.icon;
  return (
    <div className="flex min-h-[68px] items-center gap-3 rounded-lg border border-[#D8E5EB] bg-white px-3 py-3 shadow-[0_4px_12px_rgba(24,62,86,0.05)]">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.tone === "green" ? "bg-[#E5F6F1] text-[#159879]" : "bg-[#E8F2F8] text-[#2383B5]"}`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] text-slate-500">{item.label}</p>
        <p className="mt-0.5 text-[18px] font-bold leading-5 text-[#123B5C]">{item.value}</p>
        <p className="mt-0.5 text-[8px] text-slate-400">{item.note}</p>
      </div>
    </div>
  );
}

function AdoptionChart() {
  return (
    <div className="h-[218px] w-full px-3 pb-2 pt-2">
      <svg viewBox="0 0 700 190" preserveAspectRatio="none" className="h-[185px] w-full" role="img" aria-label="Monthly active users trend from January to July">
        <defs>
          <linearGradient id="adoptionFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#63B9A4" stopOpacity=".18" />
            <stop offset="100%" stopColor="#63B9A4" stopOpacity=".04" />
          </linearGradient>
        </defs>
        <path d="M5 150 C70 139 115 129 175 133 S250 128 300 115 S365 105 410 110 S485 98 535 84 S620 62 695 55 L695 178 L5 178 Z" fill="url(#adoptionFill)" />
        <path d="M5 150 C70 139 115 129 175 133 S250 128 300 115 S365 105 410 110 S485 98 535 84 S620 62 695 55" fill="none" stroke="#2785B2" strokeWidth="3.5" strokeLinecap="round" />
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((month, i) => (
          <text key={month} x={5 + i * 115} y="188" fill="#8295A5" fontSize="8">{month}</text>
        ))}
      </svg>
    </div>
  );
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("01–30 June 2025");
  const [organisation, setOrganisation] = useState("All organisations");
  const [region, setRegion] = useState("All regions");
  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: "01–30 June 2025",
    organisation: "All organisations",
    region: "All regions",
  });

  const applyFilters = () => {
    setAppliedFilters({ dateRange, organisation, region });
  };

  const openReport = (title: string) => {
    // Replace with report route navigation or API request when report pages are ready.
    window.alert(`${title}\n\nReport preview will be available here.`);
  };

  return (
    <main className="min-h-screen bg-[#EFF6F7] px-4 py-5 md:px-6">
      {/* Report filters */}
      <section className="mb-4 grid grid-cols-1 gap-3 rounded-xl border border-[#D8E5EB] bg-white p-3 shadow-[0_4px_12px_rgba(24,62,86,0.04)] md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="block">
          <span className="mb-2 block text-[9px] font-medium text-slate-500">Date range</span>
          <select
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value)}
            className="h-11 w-full rounded-lg border border-[#D5E3EA] bg-white px-3 text-[10px] text-[#173B59] outline-none focus:border-[#2785B2] focus:ring-2 focus:ring-[#2785B2]/10"
          >
            <option>01–30 June 2025</option>
            <option>01–31 May 2025</option>
            <option>01–30 April 2025</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-[9px] font-medium text-slate-500">Organisation</span>
          <select
            value={organisation}
            onChange={(event) => setOrganisation(event.target.value)}
            className="h-11 w-full rounded-lg border border-[#D5E3EA] bg-white px-3 text-[10px] text-[#173B59] outline-none focus:border-[#2785B2] focus:ring-2 focus:ring-[#2785B2]/10"
          >
            <option>All organisations</option>
            <option>National Disaster Authority</option>
            <option>CareLink Shelter Network</option>
            <option>Global Relief Network</option>
            <option>Community Response Alliance</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-[9px] font-medium text-slate-500">Region</span>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="h-11 w-full rounded-lg border border-[#D5E3EA] bg-white px-3 text-[10px] text-[#173B59] outline-none focus:border-[#2785B2] focus:ring-2 focus:ring-[#2785B2]/10"
          >
            <option>All regions</option>
            <option>Western Province</option>
            <option>Central Province</option>
            <option>Southern Province</option>
            <option>Northern Province</option>
            <option>Eastern Province</option>
            <option>North Western Province</option>
            <option>North Central Province</option>
            <option>Uva Province</option>
            <option>Sabaragamuwa Province</option>
          </select>
        </label>

        <div className="flex items-end">
          <button
            type="button"
            onClick={applyFilters}
            className="h-11 w-full rounded-lg border border-[#B9D0DC] bg-white px-5 text-[10px] font-semibold text-[#176F9F] transition hover:bg-[#EDF6FA] xl:w-auto"
          >
            Apply filters
          </button>
        </div>
      </section>

      {/* Applied filter summary */}
      {(appliedFilters.organisation !== "All organisations" ||
        appliedFilters.region !== "All regions" ||
        appliedFilters.dateRange !== "01–30 June 2025") && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-[9px] text-slate-500">
          <span className="font-semibold text-[#173B59]">Applied:</span>
          <span className="rounded-full bg-white px-3 py-1.5">{appliedFilters.dateRange}</span>
          <span className="rounded-full bg-white px-3 py-1.5">{appliedFilters.organisation}</span>
          <span className="rounded-full bg-white px-3 py-1.5">{appliedFilters.region}</span>
        </div>
      )}

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => <StatCard key={item.label} item={item} />)}
      </section>

      {/* Analytics */}
      <section className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[2.1fr_1fr]">
        <div className="overflow-hidden rounded-lg border border-[#D8E5EB] bg-white shadow-[0_4px_12px_rgba(24,62,86,0.05)]">
          <div className="flex items-center justify-between border-b border-[#DCE7EC] px-3 py-3">
            <div>
              <h2 className="text-[11px] font-medium text-[#173B59]">User adoption trend</h2>
              <p className="mt-1 text-[8px] text-slate-400">Monthly active users</p>
            </div>
            <span className="rounded-md bg-[#E6F7F1] px-2 py-1 text-[8px] font-semibold text-[#16896F]">+8.4%</span>
          </div>
          <AdoptionChart />
        </div>

        <div className="rounded-lg border border-[#D8E5EB] bg-white shadow-[0_4px_12px_rgba(24,62,86,0.05)]">
          <div className="border-b border-[#DCE7EC] px-3 py-3">
            <h2 className="text-[11px] font-medium text-[#173B59]">Users by role</h2>
            <p className="mt-1 text-[8px] text-slate-400">18,482 registered users</p>
          </div>
          <div className="space-y-5 px-3 py-4">
            {roleData.map((role) => (
              <div key={role.label} className="grid grid-cols-[80px_1fr_38px] items-center gap-2">
                <span className="text-[8px] text-[#526C80]">{role.label}</span>
                <div className="h-[6px] overflow-hidden rounded-full bg-[#E8EEF1]">
                  <div className="h-full rounded-full bg-[#63B9A4]" style={{ width: role.width }} />
                </div>
                <span className="text-right text-[8px] font-semibold text-[#173B59]">{role.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Report library */}
      <section className="mt-4">
        <h2 className="mb-2 text-[11px] font-medium text-[#173B59]">Report library</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.title}
                type="button"
                onClick={() => openReport(report.title)}
                className="group flex min-h-[62px] items-center gap-3 rounded-lg border border-[#D8E5EB] bg-white px-3 py-3 text-left shadow-[0_4px_12px_rgba(24,62,86,0.05)] transition hover:-translate-y-0.5 hover:border-[#8CBBD0] hover:shadow-md"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F2F8] text-[#2383B5]"><Icon size={17}/></span>
                <span className="flex-1 text-[9px] font-semibold text-[#173B59]">{report.title}</span>
                <ChevronRight size={16} className="shrink-0 text-[#29465B] transition group-hover:translate-x-0.5"/>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
