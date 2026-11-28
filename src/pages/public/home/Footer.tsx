import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, HeartHandshake, Shield, ExternalLink, LifeBuoy } from "lucide-react";
import { CareLinkLogo } from "../../../components/common/CareLinkLogo";

interface FooterProps {
  onScrollToSection: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onScrollToSection }) => {
  const handleNavClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    onScrollToSection(sectionId);
  };

  return (
    <footer id="contact" className="bg-[#092238] text-white pt-16 pb-12 scroll-mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-slate-800">
          {/* Brand Info (col-span-4) */}
          <div className="lg:col-span-4">
            <Link
              to="/"
              onClick={(e) => handleNavClick("home", e)}
              className="inline-block cursor-pointer"
            >
              <CareLinkLogo
                size="header"
                showText
                titleClassName="text-white font-extrabold text-2xl"
                subtitleClassName="text-[#42B99A] font-semibold text-xs"
                tagline="Connecting Help. Saving Lives."
              />
            </Link>

            <p className="mt-4 text-sm sm:text-[15px] text-slate-300 leading-relaxed font-normal max-w-sm">
              A secure humanitarian crisis management and emergency response coordination platform connecting citizens, volunteers, response teams, and partner organisations across Sri Lanka.
            </p>

            <div className="mt-6 flex items-center gap-2 text-[13px] text-slate-300">
              <Shield size={16} className="text-[#42B99A]" />
              <span>Sri Lanka Disaster Response Coordination Framework</span>
            </div>
          </div>

          {/* Quick Links (col-span-2) */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <a
                  href="#home"
                  onClick={(e) => handleNavClick("home", e)}
                  className="hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleNavClick("about", e)}
                  className="hover:text-white transition-colors"
                >
                  About CareLink
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick("services", e)}
                  className="hover:text-white transition-colors"
                >
                  Our Services
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => handleNavClick("how-it-works", e)}
                  className="hover:text-white transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Get Support (col-span-3) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Get Support
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <Link
                  to="/register?role=citizen"
                  className="hover:text-white transition-colors"
                >
                  Request Assistance (Citizens)
                </Link>
              </li>
              <li>
                <Link
                  to="/register?role=volunteer"
                  className="hover:text-white transition-colors"
                >
                  Register as a Volunteer
                </Link>
              </li>
              <li>
                <Link
                  to="/register?role=organisation"
                  className="hover:text-white transition-colors"
                >
                  Partner Organisation Application
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-white transition-colors"
                >
                  Emergency Shelter Overview
                </Link>
              </li>
            </ul>
          </div>

          {/* National Hotlines & Contact (col-span-3) */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Emergency Hotlines
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 space-y-1.5">
                <p className="font-semibold text-slate-200">National Emergency Services:</p>
                <p className="flex items-center justify-between text-slate-300">
                  <span>Disaster Management (DMC):</span>
                  <span className="font-bold text-[#42B99A]">117</span>
                </p>
                <p className="flex items-center justify-between text-slate-300">
                  <span>Suwa Seriya Ambulance:</span>
                  <span className="font-bold text-[#42B99A]">1990</span>
                </p>
                <p className="flex items-center justify-between text-slate-300">
                  <span>Police Emergency Hotline:</span>
                  <span className="font-bold text-[#42B99A]">119</span>
                </p>
              </div>

              <div className="pt-2 space-y-1.5 text-[13px]">
                <p className="flex items-center gap-2">
                  <Mail size={14} className="text-[#42B99A] shrink-0" />
                  <span>support@carelink.org</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#42B99A] shrink-0" />
                  <span>National Disaster Centre, Colombo, Sri Lanka</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-slate-400">
          <p>© 2026 CareLink Humanitarian Aid Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Academic Architecture Demonstration</span>
            <span>·</span>
            <span>Privacy & Data Protection</span>
            <span>·</span>
            <span>Human-Centred Response</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
