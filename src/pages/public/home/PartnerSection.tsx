import React from "react";
import { Link } from "react-router-dom";
import { Building2, ShieldCheck, HeartHandshake, Check, ArrowRight } from "lucide-react";

export const PartnerSection: React.FC = () => {
  const verifiedAgencies = [
    {
      name: "National Disaster Management Centre",
      type: "Government Operational Agency",
      region: "Sri Lanka National Oversight",
      status: "Verified & Integrated",
    },
    {
      name: "District Disaster Management Units (DDMU)",
      type: "District Response Coordinators",
      region: "25 Administrative Districts",
      status: "Verified & Integrated",
    },
    {
      name: "Humanitarian Partner Organizations & NGOs",
      type: "Accredited Relief Partners",
      region: "Community & Field Deployments",
      status: "Admin Vetted & Active",
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-14">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#1D5F8A] bg-[#EFF6F7] px-3 py-1 rounded-full mb-3">
            MULTI-AGENCY COLLABORATION
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5C] tracking-tight">
            Working Together for Humanitarian Support
          </h2>

          <p className="mt-3.5 text-[15px] sm:text-base text-slate-600 leading-relaxed font-normal">
            CareLink operates alongside verified national agencies, regional disaster management units, and accredited non-governmental humanitarian organisations across Sri Lanka.
          </p>
        </div>

        {/* Real Verified Agency Framework Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {verifiedAgencies.map((agency) => (
            <div
              key={agency.name}
              className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 flex flex-col justify-between hover:bg-white hover:border-[#42B99A]/60 hover:shadow-md transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#123B5C] shadow-2xs">
                    <Building2 size={20} className="text-[#1D5F8A]" />
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <Check size={12} />
                    <span>{agency.status}</span>
                  </span>
                </div>

                <h3 className="text-base sm:text-[17px] font-semibold text-[#123B5C]">
                  {agency.name}
                </h3>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  {agency.type}
                </p>

                <p className="mt-2 text-sm text-slate-600 font-normal">
                  {agency.region}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/60 text-[13px] text-[#1D5F8A] font-semibold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#42B99A]" />
                <span>Inter-Agency Coordination</span>
              </div>
            </div>
          ))}
        </div>

        {/* Invitation Callout Card */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#EFF6F7] border border-slate-200 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-[#123B5C]">
              Represent a Humanitarian Organisation or NGO?
            </h3>
            <p className="mt-1.5 text-sm sm:text-[15px] text-slate-600 max-w-xl font-normal leading-relaxed">
              Register your organisation to coordinate relief supplies, request assistance referrals, and access shared disaster event data. All partner registrations require administrative review.
            </p>
          </div>

          <Link
            to="/register?role=organisation"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#123B5C] text-white text-sm font-semibold hover:bg-[#1D5F8A] transition-all shadow-xs"
          >
            <span>Register Organisation</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};
