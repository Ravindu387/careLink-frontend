import React from "react";
import { CheckCircle2, ArrowRight, ShieldCheck, Clock, Users, Building } from "lucide-react";

interface AboutSectionProps {
  onScrollToSection: (sectionId: string) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onScrollToSection }) => {
  const benefits = [
    {
      title: "Connected Humanitarian Support",
      description:
        "Direct digital bridge connecting affected citizens, field responders, and authorized emergency coordinators with zero intermediaries.",
    },
    {
      title: "Transparent Resource Coordination",
      description:
        "Real-time visibility into stockpile levels, shelter capacity, and relief distribution routes to prevent bottlenecks and regional duplication.",
    },
    {
      title: "Human-Centred Decision Making",
      description:
        "AI recommendations assist triage and duplicate detection, while certified human officers always retain final operational authority.",
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-24 bg-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Authentic Humanitarian Relief Image + Floating Badges */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=85"
                alt="CareLink humanitarian volunteers coordinating disaster relief support"
                className="w-full h-[400px] sm:h-[480px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#123B5C]/80 via-transparent to-transparent" />

              {/* Floating Bottom Card */}
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 p-4 sm:p-5 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#42B99A]/20 text-[#123B5C] flex items-center justify-center shrink-0">
                    <ShieldCheck size={22} className="text-[#1D5F8A]" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-[#123B5C]">
                      Sri Lanka Disaster Response Coverage
                    </h4>
                    <p className="text-[13px] text-slate-600 font-medium">
                      Multi-agency coordination for flood and landslide-prone districts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Accent Ring */}
            <div className="hidden sm:block absolute -top-4 -left-4 w-24 h-24 rounded-full border-4 border-[#42B99A]/30 -z-10" />
            <div className="hidden sm:block absolute -bottom-4 -right-4 w-32 h-32 rounded-2xl bg-[#EFF6F7] -z-10" />
          </div>

          {/* Right Column: About Content */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF6F7] text-[#1D5F8A] text-xs font-semibold uppercase tracking-wider mb-3">
              <span>ABOUT CARELINK</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5C] tracking-tight leading-tight">
              Technology That Brings Help Closer
            </h2>

            <p className="mt-4 text-[15px] sm:text-base text-slate-600 leading-relaxed font-normal">
              During an emergency, every minute matters. CareLink helps connect affected communities with coordinated humanitarian support through a centralized platform designed for faster communication, better resource visibility, and accountable response.
            </p>

            {/* 3 Key Benefits */}
            <div className="mt-8 space-y-5">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-3.5">
                  <span className="h-6 w-6 rounded-full bg-[#42B99A]/20 text-[#42B99A] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} className="text-[#1D5F8A]" />
                  </span>
                  <div>
                    <h3 className="text-base sm:text-[17px] font-semibold text-[#123B5C]">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-sm sm:text-[15px] text-slate-600 leading-relaxed font-normal">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onScrollToSection("services")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#123B5C] text-white text-sm font-semibold hover:bg-[#1D5F8A] transition-all cursor-pointer shadow-xs"
              >
                <span>Explore Our Services</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() => onScrollToSection("how-it-works")}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>How Response Works</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
