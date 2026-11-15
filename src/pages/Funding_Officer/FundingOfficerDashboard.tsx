
import { useState } from "react";
import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronRight,
  Download,
  Plus,
  Heart,
  Package,
  Share2,
  Receipt,
  Megaphone,
  Clock,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  MoreHorizontal,
  Users,
  ChartNoAxesColumnIncreasing,
  FileText,
  Wallet,
  Check,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ============================================
// TYPES
// ============================================

type Donation = {
  reference: string;
  donor: string;
  type: string;
  amount: string;
  campaign: string;
  received: string;
  verification: "Verified" | "Pending";
  allocation: "Partially Allocated" | "Unallocated" | "Allocated";
};

type QuickAction = {
  label: string;
  icon: typeof Plus;
};

type AlertItem = {
  title: string;
  description: string;
  type: "critical" | "warning" | "info";
};

// ============================================
// SAMPLE DATA
// ============================================

const donations: Donation[] = [
  {
    reference: "DON-88421",
    donor: "Global Relief Foundation",
    type: "Monetary",
    amount: "$125,000",
    campaign: "Flood Response 2025",
    received: "22 Jun",
    verification: "Verified",
    allocation: "Partially Allocated",
  },
  {
    reference: "DON-88418",
    donor: "Anonymous Individual",
    type: "Monetary",
    amount: "$2,500",
    campaign: "Emergency Shelter Fund",
    received: "22 Jun",
    verification: "Pending",
    allocation: "Unallocated",
  },
  {
    reference: "DON-88412",
    donor: "Riverton Foods Ltd",
    type: "Material",
    amount: "4,800 food packs",
    campaign: "Flood Response 2025",
    received: "21 Jun",
    verification: "Verified",
    allocation: "Allocated",
  },
];

const alerts: AlertItem[] = [
  {
    title: "High-risk contribution pattern",
    description: "DON-88398 · $18,420",
    type: "critical",
  },
  {
    title: "Invoice variance requires review",
    description: "EXP-9008 · $42,600",
    type: "warning",
  },
  {
    title: "16 donations awaiting verification",
    description: "Combined value $82,400",
    type: "warning",
  },
  {
    title: "Campaign report due tomorrow",
    description: "Flood Response 2025",
    type: "info",
  },
];

const quickActions: QuickAction[] = [
  { label: "Record Donation", icon: Plus },
  { label: "Add Donor", icon: Users },
  { label: "Create Campaign", icon: Megaphone },
  { label: "Allocate Funds", icon: Share2 },
  { label: "Record Expense", icon: Receipt },
  { label: "Transparency Report", icon: TrendingUp },
];

const chartData = [
  { day: "Mon", received: 42, allocated: 30 },
  { day: "Tue", received: 55, allocated: 35 },
  { day: "Wed", received: 38, allocated: 42 },
  { day: "Thu", received: 72, allocated: 50 },
  { day: "Fri", received: 60, allocated: 55 },
  { day: "Sat", received: 78, allocated: 60 },
  { day: "Today", received: 52, allocated: 40 },
];

// ============================================
// MAIN DASHBOARD
// ============================================

export default function FundingOfficerDashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedDonation, setSelectedDonation] =
    useState<string | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [message, setMessage] = useState("");

  const filteredDonations = donations.filter((donation) =>
    [
      donation.reference,
      donation.donor,
      donation.campaign,
      donation.type,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3000);
  };

  const handleExport = () => {
    const headers = [
      "Reference",
      "Donor",
      "Type",
      "Amount",
      "Campaign",
      "Received",
      "Verification",
      "Allocation",
    ];

    const rows = donations.map((d) => [
      d.reference,
      d.donor,
      d.type,
      d.amount,
      d.campaign,
      d.received,
      d.verification,
      d.allocation,
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
    link.download = "funding-dashboard-report.csv";
    link.click();

    URL.revokeObjectURL(url);
    showMessage("Report exported successfully.");

  };

  return (
    <div className="min-h-screen w-full bg-[#eef5f7] text-[#123e60] overflow-x-hidden">

      {/* =====================================
          SCROLLABLE DASHBOARD CONTENT
      ===================================== */}

      <main className="w-full max-w-[1600px] mx-auto px-5 md:px-8 py-4 pb-10">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[9px] mb-7">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={11} />
          <span className="text-slate-500">
            Funding & Donations
          </span>
          <ChevronRight size={11} />
          <span className="font-semibold">
            Funding & Donation Dashboard
          </span>
        </div>

        {/* PAGE TITLE */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

          <div>
            <h1 className="text-[21px] font-medium">
              Funding & Donation Dashboard
            </h1>

            <p className="text-[10px] text-slate-500 mt-1.5">
              Monitor verified contributions, allocations,
              expenditure, campaigns, and transparency risks.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={handleExport}
              className="h-[34px] px-3 border border-[#a9c5d5] bg-white rounded-lg text-[10px] text-[#1c638a] flex items-center gap-2 hover:bg-slate-50"
            >
              <Download size={13} />
              Export summary
            </button>

           <button
      onClick={() => navigate("/funding-officer/donations")}
      className="h-[34px] px-3 bg-[#23749e] hover:bg-[#175c80] text-white rounded-lg text-[10px] font-semibold flex items-center gap-2"
    >
      <Plus size={14} />
      Record donation
    </button>
          </div>
        </div>

        {/* DEMONSTRATION NOTICE */}

        <div className="min-h-[40px] bg-[#f0f9fc] border border-[#c7dfe9] border-l-2 border-l-[#23749e] rounded-lg px-3 flex items-center justify-between gap-3 mb-3">

          <div className="flex items-center gap-2">
            <ShieldCheck
              size={14}
              className="text-[#23749e]"
            />

            <div>
              <p className="text-[9px] font-semibold">
                Demonstration financial data
              </p>

              <p className="text-[8px] text-slate-500">
                All amounts and records shown are illustrative
                and are not real payment transactions.
              </p>
            </div>
          </div>

          <span className="text-[7px] text-slate-400 whitespace-nowrap">
            Updated just now
          </span>
        </div>

        {/* =====================================
            FINANCIAL SUMMARY CARDS
        ===================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 mb-3">

          <StatCard
            icon={Heart}
            label="Monetary donations"
            value="$4.82M"
            note="+$218K this week"
            color="blue"
          />

          <StatCard
            icon={Package}
            label="Material contributions"
            value="$1.34M"
            note="Estimated verified value"
            color="green"
          />

          <StatCard
            icon={Share2}
            label="Allocated funds"
            value="$3.91M"
            note="81.1% of donations"
            color="blue"
          />

          <StatCard
            icon={Receipt}
            label="Recorded expenditure"
            value="$2.74M"
            note="70.0% of allocations"
            color="blue"
          />

          <StatCard
            icon={Megaphone}
            label="Active campaigns"
            value="12"
            note="4 above 70% target"
            color="blue"
          />

          <StatCard
            icon={Clock}
            label="Pending verification"
            value="16"
            note="$82,400 combined"
            color="orange"
          />

          <StatCard
            icon={TrendingUp}
            label="Available balance"
            value="$910K"
            note="Unallocated verified funds"
            color="green"
          />

          <StatCard
            icon={AlertTriangle}
            label="Flagged records"
            value="5"
            note="2 high priority"
            color="red"
          />
        </div>

        {/* =====================================
            CHART + CAMPAIGN PERFORMANCE
        ===================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-[1.28fr_1fr] gap-2.5 mb-3">

          {/* RECEIVED AND ALLOCATED CHART */}

          <section className="bg-white rounded-lg border border-[#d3e2e9] shadow-sm overflow-hidden">

            <div className="h-[49px] px-3 flex items-center justify-between border-b border-[#d7e4e9]">
              <div>
                <h2 className="text-[11px] font-medium">
                  Funds received and allocated
                </h2>

                <p className="text-[8px] text-slate-400 mt-1">
                  Last seven days · USD
                </p>
              </div>

              <span className="bg-[#e5f6f1] text-[#159b79] rounded px-2 py-1 text-[8px] font-semibold">
                +$218K received
              </span>
            </div>

            {/* BAR CHART */}

            <div className="px-5 pt-5 pb-3">

              <div className="relative h-[140px]">

                {/* GRID LINES */}

                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="border-t border-[#edf1f3] w-full"
                    />
                  ))}
                </div>

                {/* BARS */}

                <div className="absolute inset-0 flex items-end justify-around gap-2 px-2">

                  {chartData.map((item) => (
                    <div
                      key={item.day}
                      className="h-full flex flex-col justify-end items-center flex-1"
                    >
                      <div className="flex items-end gap-1 h-full">

                        <div
                          title={`Received: ${item.received}`}
                          className="w-[7px] sm:w-[8px] bg-[#287ba7] rounded-t-sm hover:bg-[#165b83] transition-colors"
                          style={{
                            height: `${item.received}%`,
                          }}
                        />

                        <div
                          title={`Allocated: ${item.allocated}`}
                          className="w-[7px] sm:w-[8px] bg-[#60bba5] rounded-t-sm hover:bg-[#299d83] transition-colors"
                          style={{
                            height: `${item.allocated}%`,
                          }}
                        />
                      </div>

                      <span className="absolute text-[7px] text-slate-400 translate-y-4">
                        {item.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* LEGEND */}

              <div className="flex justify-center gap-4 mt-7">
                <Legend color="#287ba7" label="Received" />
                <Legend color="#60bba5" label="Allocated" />
              </div>
            </div>
          </section>

          {/* CAMPAIGN PERFORMANCE */}

          <section className="bg-white rounded-lg border border-[#d3e2e9] shadow-sm overflow-hidden">

            <div className="h-[49px] px-3 flex items-center justify-between border-b border-[#d7e4e9]">
              <div>
                <h2 className="text-[11px] font-medium">
                  Campaign performance
                </h2>

                <p className="text-[8px] text-slate-400 mt-1">
                  Active emergency appeals
                </p>
              </div>

              <button
                onClick={() =>
                  showMessage("Opening campaign overview...")
                }
                className="text-[8px] text-[#23749e] flex items-center gap-1"
              >
                View campaigns
                <ChevronRight size={12} />
              </button>
            </div>

            <div>
              <CampaignRow
                name="Flood Response 2025"
                amount="$1.84M of $2.5M"
                percentage={73.6}
              />

              <CampaignRow
                name="Emergency Shelter Fund"
                amount="$612K of $850K"
                percentage={72}
              />

              <CampaignRow
                name="Clean Water Appeal"
                amount="$318K of $420K"
                percentage={75.7}
              />

              <CampaignRow
                name="Medical Relief"
                amount="$498K of $680K"
                percentage={72.9}
              />
            </div>
          </section>
        </div>

        {/* =====================================
            RECENT DONATIONS + ATTENTION REQUIRED
        ===================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-[1.28fr_0.58fr] gap-2.5 mb-4">

          {/* RECENT DONATION RECORDS */}

          <section className="bg-white rounded-lg border border-[#d3e2e9] shadow-sm overflow-hidden">

            <div className="h-[49px] px-3 flex items-center justify-between border-b border-[#d7e4e9]">

              <div>
                <h2 className="text-[11px] font-medium">
                  Recent donation records
                </h2>

                <p className="text-[8px] text-slate-400 mt-1">
                  Latest verified and pending contributions
                </p>
              </div>

              <button
                onClick={() =>
                  showMessage("Opening all donation records...")
                }
                className="text-[8px] text-[#23749e] flex items-center gap-1"
              >
                View all
                <ChevronRight size={12} />
              </button>
            </div>

            {/* TABLE */}

            <div className="w-full overflow-x-auto">

              <table className="w-full text-left min-w-[700px]">

                <thead>
                  <tr className="bg-[#f5f8f9] text-[7px] text-slate-500 border-b border-[#d7e4e9]">
                    <th className="px-2.5 py-3 font-medium">Reference</th>
                    <th className="px-2 py-3 font-medium">Donor</th>
                    <th className="px-2 py-3 font-medium">Type</th>
                    <th className="px-2 py-3 font-medium">Amount / Quantity</th>
                    <th className="px-2 py-3 font-medium">Campaign</th>
                    <th className="px-2 py-3 font-medium">Received</th>
                    <th className="px-2 py-3 font-medium">Verification</th>
                    <th className="px-2 py-3 font-medium">Allocation</th>
                    <th className="px-2 py-3"></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDonations.map((donation) => (
                    <tr
                      key={donation.reference}
                      className="border-b border-[#e6edf0] hover:bg-[#f8fbfc] transition"
                    >
                      <td className="px-2.5 py-3 text-[8px] font-semibold whitespace-nowrap">
                        {donation.reference}
                      </td>

                      <td className="px-2 py-3 text-[8px] whitespace-nowrap">
                        {donation.donor}
                      </td>

                      <td className="px-2 py-3 text-[8px]">
                        {donation.type}
                      </td>

                      <td className="px-2 py-3 text-[8px] whitespace-nowrap">
                        {donation.amount}
                      </td>

                      <td className="px-2 py-3 text-[8px] whitespace-nowrap">
                        {donation.campaign}
                      </td>

                      <td className="px-2 py-3 text-[8px]">
                        {donation.received}
                      </td>

                      <td className="px-2 py-3">
                        <StatusBadge
                          status={donation.verification}
                        />
                      </td>

                      <td className="px-2 py-3">
                        <StatusBadge
                          status={donation.allocation}
                        />
                      </td>

                      <td className="px-2 py-3">
                        <button
                          onClick={() =>
                            setSelectedDonation(
                              selectedDonation === donation.reference
                                ? null
                                : donation.reference
                            )
                          }
                          className="text-slate-500 hover:text-[#23749e]"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredDonations.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400">
                  No donation records found.
                </div>
              )}
            </div>

            {/* SELECTED DONATION DETAIL */}

            {selectedDonation && (
              <div className="p-3 bg-[#f0f7fa] border-t border-[#d7e4e9] flex justify-between items-center">
                <p className="text-[9px]">
                  Selected: <strong>{selectedDonation}</strong>
                </p>

                <button
                  onClick={() => setSelectedDonation(null)}
                  className="text-[#23749e] text-[9px]"
                >
                  Close
                </button>
              </div>
            )}

          </section>

          {/* ATTENTION REQUIRED */}

          <section className="bg-white rounded-lg border border-[#d3e2e9] shadow-sm overflow-hidden">

            <div className="h-[49px] px-3 flex items-center justify-between border-b border-[#d7e4e9]">

              <div>
                <h2 className="text-[11px] font-medium">
                  Attention required
                </h2>

                <p className="text-[8px] text-slate-400 mt-1">
                  Funding risks and pending actions
                </p>
              </div>

              <span className="bg-[#fdebed] text-[#d92d40] rounded px-2 py-1 text-[7px] font-semibold">
                5 flags
              </span>
            </div>

            {alerts.map((alert, index) => (
              <button
                key={alert.title}
                onClick={() =>
                  showMessage(`Reviewing: ${alert.title}`)
                }
                className="w-full min-h-[47px] px-2.5 py-2 flex items-center gap-2 border-b border-[#d7e4e9] hover:bg-[#f8fbfc] text-left"
              >
                <AlertIcon type={alert.type} />

                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-semibold">
                    {alert.title}
                  </p>

                  <p className="text-[7px] text-slate-400 mt-0.5">
                    {alert.description}
                  </p>
                </div>

                <ChevronRight
                  size={14}
                  className="shrink-0"
                />
              </button>
            ))}
          </section>
        </div>

        {/* =====================================
            QUICK ACTIONS - BOTTOM SECTION
        ===================================== */}

        <section className="mb-5">

          <h2 className="text-[10px] font-medium mb-2">
            Quick actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">

            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  onClick={() =>
                    showMessage(`${action.label} selected`)
                  }
                  className="min-h-[55px] bg-white border border-[#d3e2e9] rounded-lg px-2.5 flex items-center gap-2 hover:border-[#60bba5] hover:shadow-sm transition group"
                >
                  <span className="w-[29px] h-[29px] shrink-0 rounded-md bg-[#e8f2f6] text-[#23749e] flex items-center justify-center">
                    <Icon size={15} />
                  </span>

                  <span className="flex-1 text-left text-[8px] font-semibold">
                    {action.label}
                  </span>

                  <ChevronRight
                    size={14}
                    className="text-[#123e60] group-hover:translate-x-0.5 transition-transform"
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* FOOTER */}

        <footer className="border-t border-[#d7e4e9] pt-4 flex flex-col sm:flex-row justify-between gap-2 text-[8px] text-slate-400">
          <p>CareLink · Funding & Donations Management</p>
          <p>Demonstration environment · USD</p>
        </footer>
      </main>

      {/* TOAST MESSAGE */}

      {message && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#123e60] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-[10px]">
          <Check size={15} className="text-[#60d5ad]" />
          {message}

          <button onClick={() => setMessage("")}>
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// SUMMARY CARD
// ============================================

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  color,
}: {
  icon: typeof Heart;
  label: string;
  value: string;
  note: string;
  color: "blue" | "green" | "orange" | "red";
}) {
  const colors = {
    blue: "bg-[#e8f2f8] text-[#23749e]",
    green: "bg-[#e5f6f1] text-[#20a37e]",
    orange: "bg-[#fff4dd] text-[#d88a16]",
    red: "bg-[#ffebed] text-[#ef3340]",
  };

  return (
    <div className="min-h-[65px] bg-white rounded-lg border border-[#d3e2e9] shadow-sm p-3 flex items-center gap-2.5 hover:shadow-md transition">
      <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0 ${colors[color]}`}>
        <Icon size={16} />
      </div>

      <div className="min-w-0">
        <p className="text-[8px] text-slate-500">
          {label}
        </p>

        <p className="text-[17px] leading-5 font-bold text-[#123e60]">
          {value}
        </p>

        <p className="text-[7px] text-slate-400 mt-0.5">
          {note}
        </p>
      </div>
    </div>
  );
}

// ============================================
// CAMPAIGN ROW
// ============================================

function CampaignRow({
  name,
  amount,
  percentage,
}: {
  name: string;
  amount: string;
  percentage: number;
}) {
  return (
    <div className="min-h-[44px] px-3 py-2 border-b border-[#d7e4e9] flex items-center gap-3">

      <div className="w-[40%] min-w-0">
        <p className="text-[8px] font-semibold truncate">
          {name}
        </p>

        <p className="text-[7px] text-slate-400 mt-1">
          {amount}
        </p>
      </div>

      <div className="flex-1 h-[6px] bg-[#e9eff2] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#60bba5] rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <span className="text-[8px] font-semibold w-[32px] text-right">
        {percentage}%
      </span>
    </div>
  );
}

// ============================================
// STATUS BADGE
// ============================================

function StatusBadge({
  status,
}: {
  status: Donation["verification"] | Donation["allocation"];
}) {
  const styles: Record<Donation["verification"] | Donation["allocation"], string> = {
    Verified: "bg-[#e4f6f0] text-[#159b79]",
    Pending: "bg-[#fff3dd] text-[#c47b12]",
    Allocated: "bg-[#e4f6f0] text-[#159b79]",
    "Partially Allocated": "bg-[#e4f6f0] text-[#159b79]",
    Unallocated: "bg-[#e8f1f6] text-[#23749e]",
  };

  return (
    <span className={`inline-block whitespace-nowrap rounded px-2 py-1 text-[7px] font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

// ============================================
// CHART LEGEND
// ============================================

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-[6px] h-[6px] rounded-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-[7px] text-slate-500">
        {label}
      </span>
    </div>
  );
}

// ============================================
// ALERT ICON
// ============================================

function AlertIcon({
  type,
}: {
  type: AlertItem["type"];
}) {
  const styles = {
    critical: "bg-[#ffebed] text-[#ef3340]",
    warning: "bg-[#fff4dd] text-[#d88a16]",
    info: "bg-[#e8f2f8] text-[#23749e]",
  };

  return (
    <span className={`w-[25px] h-[25px] rounded-md flex items-center justify-center shrink-0 ${styles[type]}`}>
      {type === "critical" ? (
        <AlertTriangle size={13} />
      ) : type === "warning" ? (
        <Clock size={13} />
      ) : (
        <Clock size={13} />
      )}
    </span>
  );
}
