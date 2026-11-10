import { useState, useEffect } from "react";
import {
  Heart,
  ShieldAlert,
  Users,
  Package,
  House,
  Truck,
  Brain,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Menu,
  X,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const services = [
  {
    icon: ShieldAlert,
    title: "Emergency Incident Management",
    description:
      "Monitor active crises, verify requests, and coordinate time-sensitive response.",
  },
  {
    icon: Brain,
    title: "AI-Assisted Decision Support",
    description:
      "Surface actionable recommendations while keeping decisions under human control.",
  },
  {
    icon: Truck,
    title: "Resource & Logistics Coordination",
    description:
      "Track supplies, coordinate needs, allocations, and emergency deliveries.",
  },
  {
    icon: House,
    title: "Shelter Management",
    description:
      "Understand capacity, accessibility, services, and incoming allocations.",
  },
  {
    icon: Users,
    title: "Volunteer Coordination",
    description:
      "Match verified skills and availability to meaningful response tasks.",
  },
  {
    icon: Heart,
    title: "Donations & Aid Tracking",
    description:
      "Support transparent campaigns, allocations, and expenditure reporting.",
  },
];

const slides = [
  {
    label: "HUMANITY IN ACTION",
    title: "Together, We Can Make a Difference",
    description:
      "Connecting communities, coordinating emergency response, and delivering humanitarian aid where it matters most.",
    image:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=2000&q=85",
  },
  {
    label: "STRONGER COMMUNITIES",
    title: "Every Helping Hand Matters",
    description:
      "Bringing volunteers, relief teams, and affected communities together when support matters most.",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=2000&q=85",
  },
  {
    label: "COORDINATED RESPONSE",
    title: "Relief That Reaches Everyone",
    description:
      "Making disaster response more connected, transparent, and accessible for everyone.",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=2000&q=85",
  },
];

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

function Link({ to, href, ...props }: LinkProps) {
  return <a href={to || href} {...props} />;
}

const navItems = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Our Services", id: "services" },
  { label: "Emergency Response", id: "response" },
  { label: "Contact", id: "contact" },
];

function Navbar() {
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (["home", "services", "about", "response", "contact"].includes(hash)) {
        return hash;
      }
    }
    return "home";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect the currently visible section while scrolling
  useEffect(() => {
    // Sections strictly in physical top-to-bottom DOM order
    const domSectionIds = ["home", "services", "about", "response", "contact"];

    const handleScroll = () => {
      // Top of page: home
      if (window.scrollY < 80) {
        setActiveSection("home");
        return;
      }

      // Bottom of page: contact
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 60;

      if (isAtBottom) {
        setActiveSection("contact");
        return;
      }

      const scrollPosition = window.scrollY + 140;
      let current = "home";

      for (const id of domSectionIds) {
        const section = document.getElementById(id);
        if (section && section.offsetTop <= scrollPosition) {
          current = id;
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Scroll smoothly to section accounting for fixed navbar height
  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);

    if (sectionId === "home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    const section = document.getElementById(sectionId);
    if (section) {
      const headerOffset = 64;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const getNavClass = (sectionId: string) => {
    const isActive = activeSection === sectionId;

    return `relative py-2 text-sm transition-all duration-200 border-b-2 cursor-pointer ${
      isActive
        ? "text-[#123B5C] border-[#42B99A] font-semibold"
        : "text-slate-600 border-transparent font-medium hover:text-[#123B5C] hover:border-[#42B99A]/50"
    }`;
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white border-b border-gray-200">
      <nav className="max-w-[1330px] mx-auto px-5 lg:px-8 h-[60px] flex items-center justify-between">

        {/* Logo and Brand */}
        <Link
          to="/"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("home");
          }}
          className="flex items-center gap-3 shrink-0 cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#123B5C] rounded-lg flex items-center justify-center">
            <Heart
              size={22}
              className="text-white"
              strokeWidth={2}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#123B5C]">
              Humanitarian Aid Platform
            </span>

            <span className="text-[11px] text-[#74899A] mt-0.5">
              Coordinated Response. Human Decisions.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7 lg:gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={getNavClass(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-[#1D5F8A] border border-[#1D5F8A] rounded-md hover:bg-[#EFF6F7] transition-all duration-200"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold text-white bg-[#123B5C] rounded-md hover:bg-[#1D5F8A] transition-all duration-200"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#123B5C] cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? (
            <X size={25} />
          ) : (
            <Menu size={25} />
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="flex flex-col px-5 py-4 gap-1.5">

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-md text-sm transition-all cursor-pointer ${
                  activeSection === item.id
                    ? "bg-[#EFF6F7] text-[#123B5C] font-semibold border-l-4 border-[#42B99A]"
                    : "text-[#173B56] font-medium hover:bg-slate-50 hover:text-[#123B5C]"
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="flex flex-col gap-2.5 mt-3 pt-3 border-t border-gray-200">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 text-sm font-semibold text-[#1D5F8A] border border-[#1D5F8A] rounded-md"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 text-sm font-semibold text-white bg-[#123B5C] rounded-md"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slide = slides[activeSlide];

  const changeSlide = (direction: number) => {
    setActiveSlide((current) =>
      (current + direction + slides.length) % slides.length
    );
  };

  // Automatically advance carousel slides every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, activeSlide]);

  return (
    <section
      id="home"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative flex min-h-[540px] items-center overflow-hidden bg-[#123B5C] text-white md:min-h-[570px] scroll-mt-20"
    >
      {/* Background Slides with smooth cross-fade */}
      {slides.map((item, index) => (
        <div
          key={item.image}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            activeSlide === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{ backgroundImage: `url("${item.image}")` }}
        />
      ))}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#082f50]/95 via-[#123B5C]/80 to-[#092d49]/40 z-[1]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:px-12">
        <div className="max-w-2xl">
          <span className="mb-5 inline-block rounded bg-white/15 px-3 py-1.5 text-xs font-semibold tracking-wider text-white">
            {slide.label}
          </span>

          <h1 className="max-w-xl text-4xl sm:text-5xl lg:text-[56px] font-bold leading-tight tracking-tight">
            {slide.title}
          </h1>

          <p className="mt-5 max-w-xl text-base font-normal leading-relaxed text-slate-200">
            {slide.description}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/assistance"
              className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#123B5C] transition hover:bg-slate-100"
            >
              <Heart size={16} />
              Request Emergency Assistance
            </a>

            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-md border border-white/70 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore Our Response
              <ArrowRight size={16} />
            </a>
          </div>

          <p className="mt-5 flex items-center gap-2 text-xs font-normal text-slate-300">
            <ShieldAlert size={14} />
            Secure, accountable, human-centred coordination
          </p>
        </div>
      </div>

      <button
        onClick={() => changeSlide(-1)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/20 text-white hover:bg-white/20 cursor-pointer"
      >
        <ChevronLeft size={20} />
      </button>

      <button
        onClick={() => changeSlide(1)}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/20 text-white hover:bg-white/20 cursor-pointer"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((item, index) => (
          <button
            key={item.title}
            onClick={() => setActiveSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
              activeSlide === index ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { icon: ShieldAlert, value: "3", label: "Active Emergencies" },
    { icon: Heart, value: "5,979+", label: "People Assisted" },
    { icon: Package, value: "40%", label: "Available Relief Resources" },
    { icon: Users, value: "1,126", label: "Active Volunteers" },
  ];

  return (
    <section className="bg-[#EFF6F7] px-5 py-16">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-xs font-semibold tracking-widest text-[#1D5F8A]">
          DEMONSTRATION RESPONSE OVERVIEW
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-[#123B5C]">
          Coordinating help where it matters most
        </h2>
        <p className="mt-2 text-sm font-normal text-[#74899A]">
          Sample figures shown for coursework demonstration purposes only.
        </p>

        <div className="mx-auto mt-9 grid max-w-4xl grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-lg border border-[#B9DED7] border-b-2 border-b-[#42B99A] bg-white p-5 text-left shadow-sm"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#EFF6F7] text-[#1D5F8A]">
                  <Icon size={18} />
                </span>
                <h3 className="mt-3 text-3xl font-bold text-[#123B5C]">
                  {stat.value}
                </h3>
                <p className="mt-1 text-xs font-medium text-[#74899A]">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="bg-white px-5 py-20 scroll-mt-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-widest text-[#1D5F8A]">
            ONE CONNECTED PLATFORM
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[#123B5C]">
            Built for coordinated humanitarian response
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-normal leading-relaxed text-[#74899A]">
            Purpose-built tools bring people, decisions, and resources together
            without losing sight of human accountability.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <a
                href="/services"
                key={service.title}
                className="group rounded-lg border border-[#C5E2DD] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6F7] text-[#1D5F8A]">
                  <Icon size={19} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[#123B5C]">
                  {service.title}
                </h3>
                <p className="mt-2 min-h-10 text-sm font-normal leading-relaxed text-[#74899A]">
                  {service.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#1D5F8A]">
                  Discover the platform
                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  const benefits = [
    "Connect verified needs with available support",
    "Coordinate faster across organizational boundaries",
    "Keep critical decisions explainable and auditable",
  ];

  return (
    <section id="about" className="bg-white px-5 pb-20 scroll-mt-20">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-xl bg-[#EFF6F7] md:grid-cols-2">
        <div className="min-h-[300px]">
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=85"
            alt="Humanitarian volunteers preparing relief supplies"
            className="h-full min-h-[300px] w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center p-8 md:p-12">
          <p className="text-xs font-semibold tracking-widest text-[#1D5F8A]">
            HUMANITARIAN IMPACT
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-[#123B5C]">
            Every Action Matters
          </h2>
          <p className="mt-4 text-sm font-normal leading-relaxed text-[#173B56]">
            During an emergency, a verified request, an available vehicle, a
            safe shelter space, or one skilled volunteer can change an
            outcome. This platform helps response teams coordinate emergency
            requests, relief resources, volunteers, shelters, and partner
            organizations efficiently while maintaining privacy, transparency,
            and human accountability.
          </p>

          <div className="mt-5 space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-sm font-normal text-[#173B56]">
                <CheckCircle2 size={16} className="shrink-0 text-[#42B99A]" />
                {benefit}
              </div>
            ))}
          </div>

          <a
            href="/about"
            className="mt-7 inline-flex w-fit items-center gap-2 rounded-md border border-[#1D5F8A] px-4 py-2.5 text-sm font-semibold text-[#1D5F8A] hover:bg-white transition-colors"
          >
            Learn More <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section id="response" className="relative overflow-hidden bg-[#123B5C] px-5 py-16 text-white scroll-mt-20">
      <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[35px] border-white/5" />
      <div className="relative mx-auto flex max-w-7xl flex-col justify-between gap-7 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#42B99A]">
            READY TO HELP?
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-white">
            Be Part of the Response
          </h2>
          <p className="mt-3 text-sm font-normal text-slate-200">
            Help connect people in need with the support they deserve.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/assistance"
            className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-[#123B5C] hover:bg-slate-100 transition-colors"
          >
            Request Assistance
          </a>
          <a
            href="/register?role=volunteer"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#42B99A] px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Join as a Volunteer <ArrowRight size={14} className="inline" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Facebook({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function Instagram({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function Linkedin({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function Footer() {
  return (
    <footer id="contact" className="bg-[#0D304D] px-5 py-12 text-white scroll-mt-20">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#42B99A]">
              <Heart size={20} />
            </span>
            <div>
              <h3 className="text-sm font-semibold">Humanitarian Aid Platform</h3>
              <p className="text-[11px] font-normal text-slate-300">
                Coordinated Response. Human Decisions.
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm font-normal leading-relaxed text-slate-300">
            A connected coordination platform connecting affected communities
            with verified humanitarian support.
          </p>
          <div className="mt-5 flex gap-3 text-slate-300">
            <a href="#" aria-label="Facebook" className="hover:text-white transition-colors"><Facebook size={16} /></a>
            <a href="#" aria-label="Instagram" className="hover:text-white transition-colors"><Instagram size={16} /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-white transition-colors"><Linkedin size={16} /></a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-base font-semibold text-white">Quick Links</h4>
          <div className="space-y-3 text-sm font-normal text-slate-300">
            <a href="#home" className="block hover:text-white transition-colors">Home</a>
            <a href="#about" className="block hover:text-white transition-colors">About</a>
            <a href="#services" className="block hover:text-white transition-colors">Our Services</a>
            <a href="/login" className="block hover:text-white transition-colors">Login</a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-base font-semibold text-white">Get Support</h4>
          <div className="space-y-3 text-sm font-normal text-slate-300">
            <a href="/assistance" className="block hover:text-white transition-colors">Request Assistance</a>
            <a href="/emergency" className="block hover:text-white transition-colors">Emergency Guidance</a>
            <a href="/updates" className="block hover:text-white transition-colors">Nearby Shelters</a>
            <a href="/accessibility" className="block hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-base font-semibold text-white">Contact</h4>
          <div className="space-y-3 text-sm font-normal text-slate-300">
            <p className="flex items-center gap-2"><Mail size={15} /> support@carelink.org</p>
            <p className="flex items-center gap-2"><Phone size={15} /> +94 000 000 000</p>
            <p className="flex items-center gap-2"><MapPin size={15} /> Humanitarian Coordination Centre</p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-5 text-center text-[11px] font-normal text-slate-400 md:flex md:justify-between">
        <p>© 2026 CareLink. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Privacy Policy · Terms of Service · Accessibility</p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#173B56] pt-[60px]">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <ServicesSection />
      <ImpactSection />
      <CallToAction />
      <Footer />
    </div>
  );
}
