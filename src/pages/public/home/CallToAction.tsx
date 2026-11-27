import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, HeartHandshake, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export const CallToAction: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const citizenLink =
    isAuthenticated && user ? "/citizen/request-help" : "/register?role=citizen";

  return (
    <section
      id="response"
      className="relative overflow-hidden bg-[#123B5C] py-20 lg:py-24 text-white scroll-mt-20"
      aria-label="CareLink Call to Action"
    >
      {/* Decorative Background Circles */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full border-[50px] border-white/5" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 rounded-full border-[40px] border-white/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#42B99A] bg-white/10 px-3.5 py-1 rounded-full mb-4 border border-white/10">
          JOIN THE RELIEF NETWORK
        </span>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight max-w-3xl mx-auto leading-tight">
          Together, We Can Build a Stronger Response.
        </h2>

        <p className="mt-4 sm:mt-5 max-w-2xl mx-auto text-[15px] sm:text-base leading-relaxed text-slate-200 font-normal">
          Whether you need assistance, want to volunteer, or represent a humanitarian organisation, there is a place for you in the CareLink response network.
        </p>

        {/* 3 Role-Specific CTA Buttons */}
        <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-5">
          <Link
            to={citizenLink}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#42B99A] text-[#123B5C] font-semibold text-sm shadow-lg shadow-teal-950/40 hover:bg-[#52c9aa] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <AlertCircle size={17} />
            <span>Request Assistance</span>
          </Link>

          <Link
            to="/register?role=volunteer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#123B5C] font-semibold text-sm shadow-md hover:bg-slate-100 transition-all transform hover:-translate-y-0.5"
          >
            <HeartHandshake size={17} className="text-[#1D5F8A]" />
            <span>Join as a Volunteer</span>
          </Link>

          <Link
            to="/register?role=organisation"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/40 bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-all transform hover:-translate-y-0.5"
          >
            <Building2 size={17} />
            <span>Register an Organisation</span>
          </Link>
        </div>

        {/* Trust & Security Note */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 text-[13px] sm:text-sm text-slate-300">
          <ShieldCheck size={16} className="text-[#42B99A]" />
          <span>
            Partner Organisation accounts require administrative approval before operational access is granted.
          </span>
        </div>
      </div>
    </section>
  );
};
