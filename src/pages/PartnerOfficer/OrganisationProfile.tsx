
import {
  Users,
  Truck,
  Package,
  Map,
  CheckCircle2,
  Clock3,
  Edit,
  Eye,
} from "lucide-react";

const OrganisationProfile = () => {
  return (
    <div className="min-h-screen bg-[#eff5f7] p-5 md:p-7">

      {/* Page Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-3 text-xs text-slate-500">
            Partner Coordination <span className="mx-2">›</span>
            <span className="font-semibold text-slate-800">
              Organisation Profile
            </span>
          </p>

          <h1 className="text-2xl font-semibold text-[#153e5b]">
            Organisation Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage verified capability, operational coverage, contacts,
            and data-sharing status.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Eye size={15} />
            Preview public profile
          </button>

          <button className="flex items-center gap-2 rounded-lg bg-[#267ba4] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1c668a]">
            <Edit size={15} />
            Edit profile
          </button>
        </div>
      </div>

      {/* Organisation Summary */}
      <div className="mb-5 rounded-xl border border-[#d7e5eb] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#153e5b] text-xl font-bold text-white">
              GR
            </div>

            <div>
              <span className="rounded bg-[#e3f5f0] px-2 py-1 text-[9px] font-bold text-[#26977c]">
                VERIFIED PARTNER
              </span>

              <h2 className="mt-2 text-lg font-semibold text-[#153e5b]">
                Global Relief Network
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                International NGO · ORG-027 · Registered 18 March 2011
              </p>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Food Security", "WASH", "Community Health", "Emergency Logistics"].map((item) => (
                  <span key={item} className="rounded-md bg-[#edf4f7] px-2 py-1 text-[9px] text-[#42677e]">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Completeness */}
          <div className="w-full max-w-48">
            <p className="text-[9px] font-medium text-slate-500">
              PROFILE COMPLETENESS
            </p>

            <p className="mt-1 text-xl font-bold text-[#153e5b]">94%</p>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[94%] rounded-full bg-[#60b89f]" />
            </div>

            <p className="mt-1 text-[9px] text-slate-400">
              2 items to review
            </p>
          </div>
        </div>
      </div>

      {/* Organisation Details + Verification */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Organisation Details */}
        <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">
          <div className="border-b border-[#d7e5eb] px-4 py-3">
            <h3 className="text-sm font-medium text-[#153e5b]">
              Organisation details
            </h3>
            <p className="mt-1 text-[10px] text-slate-500">
              Verified legal and operational information
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
            {[
              ["Legal name", "Global Relief Network International"],
              ["Registration number", "NGO-2011-0482"],
              ["Organisation type", "International NGO"],
              ["Head office", "Central Ward, Greater Riverton"],
              ["Primary contact", "Sara Khan - Partner Officer"],
              ["Emergency line", "+94 11 555 0142"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[10px] text-slate-400">{label}</p>
                <p className="mt-1 text-xs font-semibold text-[#183e58]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification & Agreements */}
        <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">
          <div className="border-b border-[#d7e5eb] px-4 py-3">
            <h3 className="text-sm font-medium text-[#153e5b]">
              Verification & Agreements
            </h3>
            <p className="mt-1 text-[10px] text-slate-500">
              Partner assurance and sharing controls
            </p>
          </div>

          {[
            {
              title: "Organisation verification",
              subtitle: "Verified",
              status: "Current",
              done: true,
            },
            {
              title: "Data sharing agreement",
              subtitle: "Active · expires 18 Mar 2026",
              status: "Current",
              done: true,
            },
            {
              title: "Safeguarding attestation",
              subtitle: "Review due in 18 days",
              status: "Due Soon",
              done: false,
            },
            {
              title: "Banking verification",
              subtitle: "Verified",
              status: "Current",
              done: true,
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-3 border-b border-[#d7e5eb] px-4 py-4 last:border-0"
            >
              {item.done ? (
                <CheckCircle2 className="shrink-0 text-[#55b99c]" size={17} />
              ) : (
                <Clock3 className="shrink-0 text-[#55b99c]" size={17} />
              )}

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-[#153e5b]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[9px] text-slate-400">
                  {item.subtitle}
                </p>
              </div>

              <span
                className={`min-w-24 rounded-md px-2 py-1 text-center text-[9px] font-medium ${
                  item.done
                    ? "bg-[#e3f5f0] text-[#26977c]"
                    : "bg-[#fff3dc] text-[#b7791f]"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Operational Capability */}
      <div className="overflow-hidden rounded-xl border border-[#d7e5eb] bg-white shadow-sm">

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d7e5eb] px-4 py-3">
          <div>
            <h3 className="text-sm font-medium text-[#153e5b]">
              Operational capability
            </h3>
            <p className="mt-1 text-[10px] text-slate-500">
              Capacity visible to authorised coordination partners
            </p>
          </div>

          <button className="rounded-lg border border-[#b9d0dc] px-4 py-2 text-[10px] font-medium text-[#267ba4] hover:bg-[#f0f7fa]">
            Update capability
          </button>
        </div>

        <div className="grid grid-cols-1 divide-y divide-[#d7e5eb] sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
          {[
            {
              title: "Personnel",
              value: "84 active staff",
              sub: "62 deployable today",
              icon: Users,
            },
            {
              title: "Fleet",
              value: "18 vehicles",
              sub: "14 available",
              icon: Truck,
            },
            {
              title: "Stock",
              value: "8 resource categories",
              sub: "68% available",
              icon: Package,
            },
            {
              title: "Coverage",
              value: "6 districts",
              sub: "4 active now",
              icon: Map,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-3 border-[#d7e5eb] p-4 lg:border-r last:border-r-0"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eaf3f8] text-[#2683b1]">
                  <Icon size={21} />
                </div>

                <div>
                  <p className="text-[9px] text-slate-500">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[#153e5b]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[9px] text-slate-400">
                    {item.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default OrganisationProfile;
