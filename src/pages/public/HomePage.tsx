import React, { useState, useEffect, useCallback } from "react";
import { Navbar, NAV_ITEMS } from "./home/Navbar";
import { HeroSection } from "./home/HeroSection";
import { EmergencyHighlights } from "./home/EmergencyHighlights";
import { ImpactStatistics } from "./home/ImpactStatistics";
import { AboutSection } from "./home/AboutSection";
import { ServicesSection } from "./home/ServicesSection";
import { HowItWorks } from "./home/HowItWorks";
import { HumanitarianImpact } from "./home/HumanitarianImpact";
import { PartnerSection } from "./home/PartnerSection";
import { CallToAction } from "./home/CallToAction";
import { Footer } from "./home/Footer";

export default function HomePage() {
  const [activeSection, setActiveSection] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      const valid = NAV_ITEMS.map((item) => item.id);
      if (valid.includes(hash)) {
        return hash;
      }
    }
    return "home";
  });

  // Track active section as user scrolls
  useEffect(() => {
    const sectionIds = ["home", "about", "services", "how-it-works", "response", "contact"];

    const handleScroll = () => {
      // Top of the page
      if (window.scrollY < 100) {
        setActiveSection("home");
        return;
      }

      // Bottom of the page: contact
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 80
      ) {
        setActiveSection("contact");
        return;
      }

      const scrollPosition = window.scrollY + 160;
      let currentSection = "home";

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPosition) {
          currentSection = id;
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll handler accounting for sticky header height
  const handleScrollToSection = useCallback((sectionId: string) => {
    setActiveSection(sectionId);

    if (sectionId === "home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-[#173B56] selection:bg-[#42B99A]/20 selection:text-[#123B5C]">
      {/* 1. Modern Glassmorphic Sticky Navbar */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleScrollToSection}
      />

      {/* Main Content Sections in Logical Humanitarian Flow */}
      <main>
        {/* 2. Hero Section with Sri Lanka Contextual Carousel & CTAs */}
        <HeroSection onScrollToSection={handleScrollToSection} />

        {/* 3. Emergency Highlights (Direct Action Cards) */}
        <EmergencyHighlights />

        {/* 4. Platform Impact & Benchmark Statistics */}
        <ImpactStatistics />

        {/* 5. About CareLink & Core Benefits */}
        <AboutSection onScrollToSection={handleScrollToSection} />

        {/* 6. Modular Services Grid */}
        <ServicesSection />

        {/* 7. How CareLink Coordinates a Response (4-Step Timeline) */}
        <HowItWorks />

        {/* 8. Humanitarian Impact & Mission Pillars */}
        <HumanitarianImpact />

        {/* 9. Verified Partner Organisations Framework */}
        <PartnerSection />

        {/* 10. Call to Action (Citizen, Volunteer, Partner) */}
        <CallToAction />
      </main>

      {/* 11. Comprehensive Brand Footer with National Hotlines */}
      <Footer onScrollToSection={handleScrollToSection} />
    </div>
  );
}
