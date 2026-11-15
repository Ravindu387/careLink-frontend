
import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Search,
  ChevronRight,
  ChevronDown,
  Plus,
  Filter,
  Megaphone,
  TrendingUp,
  Heart,
  Clock,
  X,
  Archive,
  CalendarDays,
  Target,
} from "lucide-react";

type Campaign = {
  id: string;
  name: string;
  event: string;
  period: string;
  raised: number;
  target: number;
  status: "Active" | "Completed" | "Archived";
  endDate: string;
};

const initialCampaigns: Campaign[] = [
  {
    id: "CAM-104",
    name: "Flood Response 2025",
    event: "Monsoon Floods 2025",
    period: "18 Jun–31 Jul",
    raised: 1840000,
    target: 2500000,
    status: "Active",
    endDate: "2025-07-31",
  },
  {
    id: "CAM-108",
    name: "Emergency Shelter Fund",
    event: "Monsoon Floods 2025",
    period: "20 Jun–15 Aug",
    raised: 612000,
    target: 850000,
    status: "Active",
    endDate: "2025-08-15",
  },
  {
    id: "CAM-112",
    name: "Clean Water Appeal",
    event: "Monsoon Floods 2025",
    period: "19 Jun–20 Jul",
    raised: 318000,
    target: 420000,
    status: "Active",
    endDate: "2025-07-20",
  },
  {
    id: "CAM-117",
    name: "Medical Relief",
    event: "Monsoon Floods 2025",
    period: "18 Jun–31 Aug",
    raised: 496000,
    target: 680000,
    status: "Active",
    endDate: "2025-08-31",
  },
];

const formatMoney = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }

  return `$${(amount / 1000).toFixed(0)}K`;
};

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);

  const [search, setSearch] = useState("");
  const [crisisFilter, setCrisisFilter] = useState("All crisis events");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [progressFilter, setProgressFilter] = useState("Any progress");
  const [dateFilter, setDateFilter] = useState("Date range");

  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [toast, setToast] = useState("");

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    event: "Monsoon Floods 2025",
    target: "",
    startDate: "",
    endDate: "",
  });

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3000);
  };

  // CALCULATE DASHBOARD STATISTICS

  const activeCampaigns = campaigns.filter(
    (c) => c.status === "Active"
  );

  const combinedTarget = activeCampaigns.reduce(
    (total, c) => total + c.target,
    0
  );

  const totalRaised = activeCampaigns.reduce(
    (total, c) => total + c.raised,
    0
  );

  const endingSoon = activeCampaigns.filter((c) => {
    const remaining =
      (new Date(c.endDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);

    return remaining >= 0 && remaining <= 14;
  }).length;

  // FILTER CAMPAIGNS

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch = (
        campaign.name +
        campaign.id +
        campaign.event
      )
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesArchive = showArchived
        ? campaign.status === "Archived"
        : campaign.status !== "Archived";

      const matchesCrisis =
        crisisFilter === "All crisis events" ||
        campaign.event === crisisFilter;

      const matchesStatus =
        statusFilter === "All statuses" ||
        campaign.status === statusFilter;

      const percentage =
        campaign.target > 0
          ? (campaign.raised / campaign.target) * 100
          : 0;

      const matchesProgress =
        progressFilter === "Any progress" ||
        (progressFilter === "Below 50%" && percentage < 50) ||
        (progressFilter === "50% - 75%" &&
          percentage >= 50 &&
          percentage <= 75) ||
        (progressFilter === "Above 75%" && percentage > 75);

      return (
        matchesSearch &&
        matchesArchive &&
        matchesCrisis &&
        matchesStatus &&
        matchesProgress
      );
    });
  }, [
    campaigns,
    search,
    showArchived,
    crisisFilter,
    statusFilter,
    progressFilter,
  ]);

  // CREATE CAMPAIGN

  const handleCreateCampaign = (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !newCampaign.name.trim() ||
      !newCampaign.target ||
      !newCampaign.startDate ||
      !newCampaign.endDate
    ) {
      notify("Please complete all required fields.");
      return;
    }

    const target = Number(newCampaign.target);

    if (
      !Number.isFinite(target) ||
      target <= 0 ||
      newCampaign.endDate < newCampaign.startDate
    ) {
      notify("Please enter a valid target and date range.");
      return;
    }

    const campaign: Campaign = {
      id: `CAM-${Math.floor(100 + Math.random() * 900)}`,
      name: newCampaign.name,
      event: newCampaign.event,
      period: `${new Date(newCampaign.startDate).toLocaleDateString(
        "en-GB",
        { day: "2-digit", month: "short" }
      )}–${new Date(newCampaign.endDate).toLocaleDateString(
        "en-GB",
        { day: "2-digit", month: "short" }
      )}`,
      raised: 0,
      target,
      status: "Active",
      endDate: newCampaign.endDate,
    };

    setCampaigns((previous) => [campaign, ...previous]);
    setShowArchived(false);
    setSearch("");
    setCrisisFilter("All crisis events");
    setStatusFilter("All statuses");
    setProgressFilter("Any progress");

    setNewCampaign({
      name: "",
      event: "Monsoon Floods 2025",
      target: "",
      startDate: "",
      endDate: "",
    });

    setShowCreateModal(false);
    notify("Campaign created successfully.");
  };

  // ARCHIVE CAMPAIGN

  const archiveCampaign = (id: string) => {
    setCampaigns((previous) =>
      previous.map((campaign) =>
        campaign.id === id
          ? { ...campaign, status: "Archived" }
          : campaign
      )
    );

    setSelectedCampaign(null);
    notify("Campaign archived successfully.");
  };

  // RESTORE CAMPAIGN

  const restoreCampaign = (id: string) => {
    setCampaigns((previous) =>
      previous.map((campaign) =>
        campaign.id === id
          ? { ...campaign, status: "Active" }
          : campaign
      )
    );

    setSelectedCampaign(null);
    notify("Campaign restored successfully.");
  };

  // VIEW CAMPAIGN DETAILS

  const viewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  return (
    <div className="w-full min-h-full bg-[#eef5f7] text-[#123e60] overflow-x-hidden">

      {/* MAIN CONTENT */}

      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-5 lg:px-8 py-4 pb-8">

        {/* BREADCRUMB */}

        <div className="flex items-center gap-2 text-[8px] mb-7">
          <span className="text-slate-500">Operations</span>
          <ChevronRight size={10} />
          <span className="text-slate-500">
            Funding & Donations
          </span>
          <ChevronRight size={10} />
          <span className="font-semibold">Campaigns</span>
        </div>

        {/* PAGE TITLE */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">

          <div>
            <h1 className="text-[21px] font-medium">
              Campaigns
            </h1>

            <p className="text-[9px] text-slate-500 mt-1">
              Manage humanitarian appeals, targets, material needs,
              allocation, and public reporting.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`h-[31px] px-3 border rounded-lg text-[9px] flex items-center gap-2 ${
                showArchived
                  ? "bg-[#e4f0f5] border-[#23749e] text-[#23749e]"
                  : "bg-white border-[#b5cbd8] text-[#23749e]"
              }`}
            >
              <Archive size={12} />
              {showArchived ? "Active campaigns" : "Archived campaigns"}
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="h-[31px] px-3 bg-[#23749e] text-white rounded-lg text-[9px] font-semibold flex items-center gap-2 hover:bg-[#175c80]"
            >
              <Plus size={13} />
              Create campaign
            </button>
          </div>
        </div>

        {/* STATISTICS */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 mb-3">

          <StatCard
            icon={<Megaphone size={16} />}
            iconColor="blue"
            title="Active campaigns"
            value={activeCampaigns.length.toString()}
            subtitle="4 above 70% target"
          />

          <StatCard
            icon={<TrendingUp size={16} />}
            iconColor="blue"
            title="Combined target"
            value={formatMoney(combinedTarget)}
            subtitle="Across active appeals"
          />

          <StatCard
            icon={<Heart size={16} />}
            iconColor="green"
            title="Amount raised"
            value={formatMoney(totalRaised)}
            subtitle={
              combinedTarget > 0
                ? `${((totalRaised / combinedTarget) * 100).toFixed(1)}% of target`
                : "No funds raised"
            }
          />

          <StatCard
            icon={<Clock size={16} />}
            iconColor="orange"
            title="Ending soon"
            value={endingSoon.toString()}
            subtitle="Within 14 days"
          />

        </section>

        {/* SEARCH AND FILTERS */}

        <section className="flex flex-col lg:flex-row gap-2 mb-2.5">

          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaign title or ID..."
              className="w-full h-[31px] bg-white border border-[#d5e3e9] rounded-lg pl-8 pr-3 text-[8px] outline-none focus:border-[#39ae90]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex gap-2">

            <FilterSelect
              value={crisisFilter}
              onChange={setCrisisFilter}
              options={[
                "All crisis events",
                "Monsoon Floods 2025",
                "Other Emergencies",
              ]}
            />

            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                "All statuses",
                "Active",
                "Completed",
              ]}
            />

            <FilterSelect
              value={progressFilter}
              onChange={setProgressFilter}
              options={[
                "Any progress",
                "Below 50%",
                "50% - 75%",
                "Above 75%",
              ]}
            />

            <FilterSelect
              value={dateFilter}
              onChange={setDateFilter}
              options={[
                "Date range",
                "Last 7 days",
                "Last 30 days",
                "Last 90 days",
              ]}
            />

            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className="h-[31px] px-3 bg-white border border-[#b5cbd8] rounded-lg text-[8px] flex items-center justify-center gap-1.5 hover:bg-slate-50 whitespace-nowrap"
            >
              <Filter size={11} />
              More filters
            </button>
          </div>
        </section>

        {/* ADDITIONAL FILTERS */}

        {showMoreFilters && (
          <div className="bg-white border border-[#d5e3e9] rounded-lg p-3 mb-3 flex flex-wrap gap-4 items-end">

            <div>
              <label className="block text-[8px] text-slate-500 mb-1">
                Minimum target ($)
              </label>
              <input
                type="number"
                placeholder="Minimum amount"
                className="h-[30px] border border-[#d5e3e9] rounded-md px-2 text-[9px]"
              />
            </div>

            <div>
              <label className="block text-[8px] text-slate-500 mb-1">
                Maximum target ($)
              </label>
              <input
                type="number"
                placeholder="Maximum amount"
                className="h-[30px] border border-[#d5e3e9] rounded-md px-2 text-[9px]"
              />
            </div>

            <button
              onClick={() => {
                setShowMoreFilters(false);
                notify("Additional filters applied.");
              }}
              className="bg-[#23749e] text-white rounded-md px-4 py-2 text-[9px]"
            >
              Apply filters
            </button>
          </div>
        )}

        {/* CAMPAIGN CARDS */}

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">

          {filteredCampaigns.map((campaign) => {
            const percentage =
              campaign.target > 0
                ? (campaign.raised / campaign.target) * 100
                : 0;

            return (
              <article
                key={campaign.id}
                className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm p-3.5 hover:shadow-md transition-shadow"
              >

                {/* CARD TOP */}

                <div className="flex items-center justify-between mb-2.5">

                  <span
                    className={`px-2 py-1 rounded text-[7px] font-semibold ${
                      campaign.status === "Active"
                        ? "bg-[#e4f6f0] text-[#159b79]"
                        : campaign.status === "Completed"
                        ? "bg-[#e8f1f6] text-[#23749e]"
                        : "bg-[#f0f1f3] text-slate-500"
                    }`}
                  >
                    {campaign.status}
                  </span>

                  <span className="text-[7px] text-slate-400">
                    {campaign.id}
                  </span>
                </div>

                {/* CAMPAIGN DETAILS */}

                <h2 className="text-[11px] font-medium mb-1">
                  {campaign.name}
                </h2>

                <p className="text-[8px] text-slate-400 mb-3">
                  {campaign.event} · {campaign.period}
                </p>

                {/* AMOUNT AND TARGET */}

                <div className="flex items-center justify-between text-[8px] mb-2">

                  <span>
                    <strong>{formatMoney(campaign.raised)}</strong>
                    <span className="text-slate-500 ml-1">
                      raised
                    </span>
                  </span>

                  <span>
                    Target{" "}
                    <strong>{formatMoney(campaign.target)}</strong>
                  </span>
                </div>

                {/* PROGRESS BAR */}

                <div className="w-full h-[6px] bg-[#e8eef1] rounded-full overflow-hidden">

                  <div
                    className="h-full bg-[#62b9a0] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                    }}
                  />
                </div>

                {/* CARD BOTTOM */}

                <div className="flex items-center justify-between mt-2.5">

                  <span className="text-[8px] font-semibold">
                    {percentage.toFixed(1)}% funded
                  </span>

                  <div className="flex items-center gap-2">

                    {campaign.status === "Archived" && (
                      <button
                        onClick={() => restoreCampaign(campaign.id)}
                        className="text-[8px] text-[#159b79]"
                      >
                        Restore
                      </button>
                    )}

                    <button
                      onClick={() => viewCampaign(campaign)}
                      className="text-[8px] text-[#23749e] flex items-center gap-1 hover:underline"
                    >
                      View campaign
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>

              </article>
            );
          })}

        </section>

        {/* EMPTY STATE */}

        {filteredCampaigns.length === 0 && (
          <div className="bg-white border border-[#d5e3e9] rounded-lg py-16 text-center mt-3">

            <Search
              size={25}
              className="mx-auto text-slate-300 mb-3"
            />

            <h3 className="text-[12px] font-medium">
              No campaigns found
            </h3>

            <p className="text-[9px] text-slate-400 mt-1">
              Try changing your search or filter settings.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCrisisFilter("All crisis events");
                setStatusFilter("All statuses");
                setProgressFilter("Any progress");
                setShowArchived(false);
              }}
              className="text-[#23749e] text-[9px] mt-3"
            >
              Clear filters
            </button>
          </div>
        )}

      </main>

      {/* CREATE CAMPAIGN MODAL */}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4">

          <form
            onSubmit={handleCreateCampaign}
            className="bg-white rounded-xl shadow-xl w-full max-w-[440px] p-5"
          >

            <div className="flex items-center justify-between mb-5">

              <div>
                <h2 className="text-[16px] font-semibold">
                  Create campaign
                </h2>

                <p className="text-[9px] text-slate-400 mt-1">
                  Create a new humanitarian fundraising appeal.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">

              <FormField label="Campaign name">
                <input
                  required
                  value={newCampaign.name}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter campaign name"
                  className="campaign-input"
                />
              </FormField>

              <FormField label="Crisis event">
                <select
                  value={newCampaign.event}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      event: e.target.value,
                    })
                  }
                  className="campaign-input"
                >
                  <option>Monsoon Floods 2025</option>
                  <option>Other Emergencies</option>
                </select>
              </FormField>

              <FormField label="Fundraising target (USD)">
                <input
                  type="number"
                  required
                  min="1"
                  value={newCampaign.target}
                  onChange={(e) =>
                    setNewCampaign({
                      ...newCampaign,
                      target: e.target.value,
                    })
                  }
                  placeholder="e.g. 500000"
                  className="campaign-input"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">

                <FormField label="Start date">
                  <input
                    type="date"
                    required
                    value={newCampaign.startDate}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        startDate: e.target.value,
                      })
                    }
                    className="campaign-input"
                  />
                </FormField>

                <FormField label="End date">
                  <input
                    type="date"
                    required
                    min={newCampaign.startDate || undefined}
                    value={newCampaign.endDate}
                    onChange={(e) =>
                      setNewCampaign({
                        ...newCampaign,
                        endDate: e.target.value,
                      })
                    }
                    className="campaign-input"
                  />
                </FormField>

              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-[10px]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-[#23749e] text-white rounded-lg text-[10px] font-semibold hover:bg-[#175c80]"
              >
                Create campaign
              </button>
            </div>

          </form>
        </div>
      )}

      {/* CAMPAIGN DETAILS MODAL */}

      {selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-[#102d42]/40 flex items-center justify-center p-4">

          <div className="bg-white rounded-xl shadow-xl w-full max-w-[430px] p-5">

            <div className="flex justify-between items-start">

              <div>
                <span className="text-[8px] text-[#23749e] font-semibold">
                  {selectedCampaign.id}
                </span>

                <h2 className="text-[17px] font-semibold mt-1">
                  {selectedCampaign.name}
                </h2>
              </div>

              <button
                onClick={() => setSelectedCampaign(null)}
                className="text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">

              <DetailItem
                label="Amount raised"
                value={formatMoney(selectedCampaign.raised)}
                icon={<Heart size={15} />}
              />

              <DetailItem
                label="Fundraising target"
                value={formatMoney(selectedCampaign.target)}
                icon={<Target size={15} />}
              />

              <DetailItem
                label="Crisis event"
                value={selectedCampaign.event}
                icon={<Megaphone size={15} />}
              />

              <DetailItem
                label="Campaign period"
                value={selectedCampaign.period}
                icon={<CalendarDays size={15} />}
              />

            </div>

            <div className="mt-5">

              <div className="flex justify-between text-[9px] mb-2">
                <span>Funding progress</span>

                <strong>
                  {(
                    (selectedCampaign.raised /
                      selectedCampaign.target) *
                    100
                  ).toFixed(1)}%
                </strong>
              </div>

              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#62b9a0] rounded-full"
                  style={{
                    width: `${Math.min(
                      (selectedCampaign.raised /
                        selectedCampaign.target) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between mt-6 gap-2">

              {selectedCampaign.status === "Archived" ? (
                <button
                  onClick={() =>
                    restoreCampaign(selectedCampaign.id)
                  }
                  className="px-4 py-2 bg-[#e4f6f0] text-[#159b79] rounded-lg text-[9px]"
                >
                  Restore campaign
                </button>
              ) : (
                <button
                  onClick={() =>
                    archiveCampaign(selectedCampaign.id)
                  }
                  className="px-4 py-2 bg-[#fff3dd] text-[#bd7b17] rounded-lg text-[9px]"
                >
                  Archive campaign
                </button>
              )}

              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-4 py-2 bg-[#23749e] text-white rounded-lg text-[9px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}

      {toast && (
        <div className="fixed bottom-5 right-5 z-[60] bg-[#123e60] text-white rounded-lg px-4 py-3 shadow-xl text-[10px] flex items-center gap-3">
          {toast}

          <button onClick={() => setToast("")}>
            <X size={13} />
          </button>
        </div>
      )}

    </div>
  );
}

// ==========================================
// STATISTICS CARD
// ==========================================

function StatCard({
  icon,
  iconColor,
  title,
  value,
  subtitle,
}: {
  icon: ReactNode;
  iconColor: "blue" | "green" | "orange";
  title: string;
  value: string;
  subtitle: string;
}) {
  const colors = {
    blue: "bg-[#e8f1f6] text-[#23749e]",
    green: "bg-[#e4f6f0] text-[#159b79]",
    orange: "bg-[#fff3dd] text-[#bd7b17]",
  };

  return (
    <div className="bg-white border border-[#d5e3e9] rounded-lg shadow-sm p-3 flex items-center gap-3 min-h-[64px]">

      <div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0 ${colors[iconColor]}`}>
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[7px] text-slate-400">
          {title}
        </p>

        <h3 className="text-[18px] font-bold leading-5">
          {value}
        </h3>

        <p className="text-[7px] text-slate-400 mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// FILTER SELECT
// ==========================================

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="relative min-w-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none w-full lg:w-[105px] h-[31px] bg-white border border-[#d5e3e9] rounded-lg pl-2 pr-6 text-[8px] outline-none focus:border-[#39ae90] cursor-pointer"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <ChevronDown
        size={11}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  );
}

// ==========================================
// FORM FIELD
// ==========================================

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[9px] font-medium mb-1.5">
        {label}
      </span>

      {children}
    </label>
  );
}

// ==========================================
// DETAIL ITEM
// ==========================================

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="bg-[#f5f8f9] rounded-lg p-3">
      <div className="flex items-center gap-2 text-[#23749e] mb-2">
        {icon}
        <span className="text-[8px] text-slate-500">
          {label}
        </span>
      </div>

      <p className="text-[10px] font-semibold break-words">
        {value}
      </p>
    </div>
  );
}
