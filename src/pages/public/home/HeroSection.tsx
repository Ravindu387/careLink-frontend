import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  AlertTriangle,
  Users,
  Compass,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export interface HeroSlide {
  label: string;
  title: string;
  description: string;
  trustMessage: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  imageUrl: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    label: "ONE PLATFORM. UNITED RESPONSE.",
    title: "Connecting Communities. Coordinating Relief. Saving Lives.",
    description:
      "CareLink brings citizens, volunteers, humanitarian organisations, and emergency response teams together to coordinate critical assistance when communities need it most.",
    trustMessage: "Human-centred coordination · Transparent response · Stronger communities",
    primaryCtaText: "Request Emergency Assistance",
    primaryCtaLink: "/register?role=citizen",
    secondaryCtaText: "Explore Our Services",
    secondaryCtaLink: "#services",
    imageUrl:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=2000&q=85",
  },
  {
    label: "DISASTER RESPONSE & FLOOD RESILIENCE",
    title: "Rapid Emergency Support Where Help is Needed Most",
    description:
      "From flood-prone river basins to landslide risk zones across Sri Lanka, CareLink connects verified requests with nearby rescue teams and available emergency shelters.",
    trustMessage: "Real-time shelter capacity · Verified rescue triage · Rapid dispatch",
    primaryCtaText: "Find Shelter Support",
    primaryCtaLink: "/citizen/shelters",
    secondaryCtaText: "How Response Works",
    secondaryCtaLink: "#how-it-works",
    imageUrl:
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=2000&q=85",
  },
  {
    label: "HUMANITARIAN VOLUNTEER CORPS",
    title: "Empowering Volunteers. Protecting Vulnerable Families.",
    description:
      "Mobilize medical skills, transport logistics, and community food supplies with zero administrative delay and complete end-to-end operational transparency.",
    trustMessage: "Accredited volunteer deployment · Multi-agency aid tracking",
    primaryCtaText: "Join as a Volunteer",
    primaryCtaLink: "/register?role=volunteer",
    secondaryCtaText: "Register an Organisation",
    secondaryCtaLink: "/register?role=organisation",
    imageUrl:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=2000&q=85",
  },
];

interface HeroSectionProps {
  onScrollToSection: (sectionId: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onScrollToSection }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isAuthenticated, user } = useAuth();

  const currentSlide = HERO_SLIDES[activeSlide];

  // Preload hero images to avoid white flashing during transitions
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.imageUrl;
    });
  }, []);

  // Continuous auto-sliding every 5 seconds (5000ms) with clean timer lifecycle
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Clean up any pending auto-resume timeouts on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  // Temporary pause on interaction with automatic resume
  const temporarilyPause = useCallback((durationMs = 4000) => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, durationMs);
  }, []);

  const handlePointerEnter = (e: React.PointerEvent) => {
    // Only pause for genuine desktop mouse hover, not mobile touch taps
    if (e.pointerType === "mouse") {
      setIsPaused(true);
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      // Safety auto-resume after 8s even if mouse cursor rests motionless
      pauseTimeoutRef.current = setTimeout(() => {
        setIsPaused(false);
      }, 8000);
    }
  };

  const handlePointerLeave = () => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    setIsPaused(false);
  };

  const handlePrevSlide = () => {
    setActiveSlide((current) => (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    temporarilyPause(4000);
  };

  const handleNextSlide = () => {
    setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    temporarilyPause(4000);
  };

  const handleSelectSlide = (index: number) => {
    setActiveSlide(index);
    temporarilyPause(4000);
  };

  const handleCtaClick = (link: string, e: React.MouseEvent) => {
    if (link.startsWith("#")) {
      e.preventDefault();
      onScrollToSection(link.replace("#", ""));
    }
  };

  // If citizen is logged in, point them directly to Request Help page
  const resolvedPrimaryLink =
    isAuthenticated && user && currentSlide.primaryCtaLink === "/register?role=citizen"
      ? "/citizen/request-help"
      : currentSlide.primaryCtaLink;

  return (
    <section
      id="home"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="relative z-10 flex min-h-[700px] sm:min-h-[740px] md:min-h-[780px] lg:min-h-[820px] items-center overflow-hidden bg-[#123B5C] text-white scroll-mt-20 pt-20 sm:pt-24 md:pt-28 pb-32 sm:pb-36 md:pb-40 lg:pb-44"
      aria-label="CareLink Humanitarian Hero Carousel"
    >
      {/* Background Images with smooth crossfade */}
      {HERO_SLIDES.map((slide, index) => (
        <div
          key={slide.imageUrl}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            activeSlide === index ? "opacity-100 z-0" : "opacity-0 pointer-events-none -z-1"
          }`}
          style={{ backgroundImage: `url("${slide.imageUrl}")` }}
          aria-hidden={activeSlide !== index}
        />
      ))}

      {/* Layered Gradient Overlay for contrast & readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#071F33]/95 via-[#0F324E]/85 to-[#123B5C]/60 z-1" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#071F33]/40 to-[#071F33]/80 z-2" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 md:py-8">
        <div className="max-w-3xl">
          {/* Small Category Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 backdrop-blur-md mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="h-2 w-2 rounded-full bg-[#42B99A] animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-slate-100 uppercase">
              {currentSlide.label}
            </span>
          </div>

          {/* Main Heading with stable height to prevent layout shifts */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold leading-[1.15] tracking-tight text-white drop-shadow-sm min-h-[120px] sm:min-h-[135px] flex items-center">
            {currentSlide.title}
          </h1>

          {/* Description */}
          <p className="mt-4 sm:mt-5 text-[15px] sm:text-base md:text-lg leading-relaxed text-slate-200 max-w-2xl font-normal drop-shadow-xs min-h-[56px] sm:min-h-[64px]">
            {currentSlide.description}
          </p>

          {/* Call to Action Buttons */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 sm:gap-4">
            <Link
              to={resolvedPrimaryLink}
              onClick={(e) => handleCtaClick(resolvedPrimaryLink, e)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#42B99A] text-[#123B5C] font-semibold text-sm shadow-lg shadow-teal-900/30 hover:bg-[#52c9aa] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <AlertTriangle size={17} className="text-[#123B5C]" />
              <span>{currentSlide.primaryCtaText}</span>
            </Link>

            <Link
              to={currentSlide.secondaryCtaLink}
              onClick={(e) => handleCtaClick(currentSlide.secondaryCtaLink, e)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-md text-white font-semibold text-sm transition-all transform hover:-translate-y-0.5"
            >
              <span>{currentSlide.secondaryCtaText}</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Trust Message Indicator */}
          <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center gap-4 text-[13px] sm:text-sm font-medium text-slate-300">
            <div className="inline-flex items-center gap-1.5 text-slate-200">
              <ShieldCheck size={16} className="text-[#42B99A]" />
              <span>{currentSlide.trustMessage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation Controls */}
      <button
        type="button"
        onClick={handlePrevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-6 lg:left-8 top-[46%] md:top-[48%] -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/30 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        type="button"
        onClick={handleNextSlide}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-6 lg:right-8 top-[46%] md:top-[48%] -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/30 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
      >
        <ChevronRight size={22} />
      </button>

      {/* Slide Indicators: positioned inside hero and comfortably above the overlapping card */}
      <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 lg:bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {HERO_SLIDES.map((slide, idx) => (
          <button
            key={slide.title}
            type="button"
            onClick={() => handleSelectSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              activeSlide === idx
                ? "w-8 h-2.5 bg-[#42B99A] shadow-md shadow-teal-900/50"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
};
