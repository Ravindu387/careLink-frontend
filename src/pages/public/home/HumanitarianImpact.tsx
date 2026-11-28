import React from "react";
import { Zap, Eye, Users2, ShieldCheck, Quote } from "lucide-react";

export const HumanitarianImpact: React.FC = () => {
  const pillars = [
    {
      icon: Zap,
      title: "Faster Coordination",
      description:
        "Direct triage cuts crucial response times during the golden hours of disaster, connecting affected citizens to nearby resources instantly.",
    },
    {
      icon: Eye,
      title: "Better Resource Visibility",
      description:
        "Comprehensive tracking of food packs, clean water, hygiene kits, and emergency shelters eliminates regional stock duplication.",
    },
    {
      icon: Users2,
      title: "Stronger Community Collaboration",
      description:
        "Grassroots volunteers, community leaders, and registered NGOs coordinate directly with national emergency authorities.",
    },
    {
      icon: ShieldCheck,
      title: "Transparent Operations",
      description:
        "Immutable audit logs record every request, referral, and dispatch from citizen submission to final delivery verification.",
    },
  ];

  return (
    <section className="py-20 lg:py-24 bg-gradient-to-b from-white to-[#EFF6F7] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#1D5F8A] bg-[#EFF6F7] px-3 py-1 rounded-full mb-3">
            HUMANITARIAN PURPOSE
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5C] tracking-tight">
            Every Action Can Make a Difference
          </h2>

          <p className="mt-3.5 text-[15px] sm:text-base text-slate-600 leading-relaxed font-normal">
            Behind every emergency request is a person, a family, or a community that needs support. CareLink helps humanitarian teams coordinate assistance while keeping people and accountability at the centre of every response.
          </p>
        </div>

        {/* 4 Impact Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-2xl bg-white p-7 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <span className="h-12 w-12 rounded-xl bg-[#EFF6F7] text-[#1D5F8A] flex items-center justify-center mb-5">
                  <Icon size={24} />
                </span>

                <h3 className="text-base sm:text-[17px] font-semibold text-[#123B5C] mb-2">
                  {pillar.title}
                </h3>

                <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Field Quote Card */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-[#123B5C] text-white p-8 sm:p-10 relative overflow-hidden shadow-xl">
          <div className="absolute right-4 top-4 text-white/10 pointer-events-none">
            <Quote size={120} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <span className="text-2xl sm:text-3xl font-black text-[#42B99A]">
                CL
              </span>
            </div>

            <div>
              <p className="text-[15px] sm:text-base md:text-lg font-medium leading-relaxed text-slate-100 italic">
                &ldquo;Coordinated disaster response is not just about technology; it is about saving lives when seconds count. Centralizing relief logistics and volunteer deployment enables humanitarian teams to reach isolated communities with dignity and speed.&rdquo;
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-2 text-[13px] sm:text-sm">
                <span className="font-bold text-[#42B99A]">
                  CareLink Disaster Coordination Advisory
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-300">
                  Sri Lanka Humanitarian Framework
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
