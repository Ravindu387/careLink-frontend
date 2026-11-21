import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Heart,
  ArrowLeft,
  Check,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Background image slider
const backgroundImages = [
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200",
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200",
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentImage, setCurrentImage] = useState(0);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Automatically change background image every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((previous) =>
        (previous + 1) % backgroundImages.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const authData = await login({ email, password });
      const userRoles = authData.user.roles || [];

      // Redirect based on role or original intended location
      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
        return;
      }

      const has = (r: string) => userRoles.some((role: string) => role.toLowerCase() === r.toLowerCase());

      if (has("Admin") || has("SystemAdmin")) {
        navigate("/admin/dashboard", { replace: true });
      } else if (has("EmergencyCoordinator") || has("IncidentManager")) {
        navigate("/coordinator/dashboard", { replace: true });
      } else if (has("PartnerOfficer")) {
        navigate("/partner/dashboard", { replace: true });
      } else if (has("Volunteer") || has("VolunteerCoordinator")) {
        navigate("/volunteer/dashboard", { replace: true });
      } else if (has("Citizen")) {
        navigate("/citizen/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">

      {/* LEFT BRANDING PANEL */}
      <section className="relative flex min-h-[400px] w-full flex-col justify-between overflow-hidden bg-[#123B5C] px-8 py-8 text-white lg:min-h-screen lg:w-[42%] lg:px-16">

        {/* AUTOMATIC BACKGROUND IMAGE SLIDER */}
        {backgroundImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              currentImage === index
                ? "opacity-30"
                : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[#123B5C]/80" />

        {/* Background Decoration */}
        <div className="pointer-events-none absolute -bottom-48 -right-48 h-[520px] w-[520px] rounded-full border-[65px] border-white/[0.025]" />

        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[390px] w-[390px] rounded-full border-[65px] border-white/[0.035]" />

        {/* Logo */}
        <a href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#42B99A] text-[#123B5C]">
            <Heart size={23} />
          </div>

          <div>
            <h2 className="text-sm font-bold">
              Humanitarian Aid Platform
            </h2>

            <p className="mt-1 text-[10px] text-slate-300">
              Coordinated response. Human decisions.
            </p>
          </div>
        </a>

        {/* Main Content */}
        <div className="relative z-10 my-12 max-w-lg lg:my-0">
          <span className="inline-block rounded-md bg-white px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#123B5C]">
            HUMANITARIAN OPERATIONS
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            One secure place to coordinate every response.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
            Trusted workflows for citizens, response teams, partner
            organisations and public agencies.
          </p>

          <div className="mt-7 space-y-4">
            {[
              "Human-reviewed critical decisions",
              "Role-based operational access",
              "Auditable coordination across organisations",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Check
                  size={17}
                  className="shrink-0 text-[#42B99A]"
                />

                <span className="text-xs font-medium text-white">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>


        {/* Footer */}
        <p className="relative z-10 mt-5 text-[10px] text-slate-400">
          Demonstration environment · Never use real personal data
        </p>
      </section>

      {/* RIGHT LOGIN PANEL */}
      <section className="relative flex min-h-screen w-full items-center justify-center bg-[#EFF6F7] px-6 py-12 lg:w-[58%] lg:px-12">

        {/* Back to Website */}
        <a
          href="/"
          className="absolute left-7 top-7 flex items-center gap-2 text-xs text-slate-600 transition hover:text-[#123B5C]"
        >
          <ArrowLeft size={14} />
          Back to website
        </a>

        {/* Login Form */}
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#123B5C] text-white">
              <Heart size={22} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#123B5C]">
                Humanitarian Aid Platform
              </h2>

              <p className="mt-1 text-[10px] text-slate-500">
                Coordinated response. Human decisions.
              </p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#2784B5]">
              SECURE ACCOUNT ACCESS
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#123B5C]">
              Welcome back
            </h1>

            <p className="mt-3 text-xs leading-6 text-slate-600">
              Sign in to your authorised humanitarian response workspace.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold text-[#173B56]"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-[#123B5C] outline-none transition placeholder:text-slate-400 focus:border-[#2784B5] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold text-[#173B56]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-16 text-sm text-[#123B5C] outline-none transition placeholder:text-slate-400 focus:border-[#2784B5] focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-medium text-[#2784B5]"
                >
                  {showPassword ? (
                    <>
                      <EyeOff size={14} /> Hide
                    </>
                  ) : (
                    <>
                      <Eye size={14} /> Show
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-blue-600"
                />

                Remember me
              </label>

              <a
                href="/forgot-password"
                className="text-xs font-medium text-[#2784B5] hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#123B5C] text-sm font-semibold text-white shadow-md transition hover:bg-[#1D5F8A] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </form>

          {/* Register */}
          <p className="mt-5 text-center text-xs text-slate-600">
            New to the platform?{" "}
            <a
              href="/register"
              className="font-semibold text-[#2784B5] hover:underline"
            >
              Create an account
            </a>
          </p>

          {/* Security Footer */}
          <div className="mt-7 border-t border-[#42B99A] pt-5">
            <p className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck size={15} className="text-[#123B5C]" />
              Protected access · Activity is logged for security
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}