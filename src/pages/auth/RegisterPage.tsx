
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  UserRound,
  Users,
  Building2,
  HandHeart,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Mail,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";

// Background image slider
const backgroundImages = [
  "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200",
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200",
  "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200",
];

type AccountType =
  | "citizen"
  | "volunteer"
  | "organisation"
  | "donor";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Automatically change background image every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((previous) => (previous + 1) % backgroundImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const [accountType, setAccountType] = useState<AccountType>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const role = params.get("role");
      if (role === "volunteer") return "volunteer";
      if (role === "organisation" || role === "organization") return "organisation";
      if (role === "donor") return "donor";
    }
    return "citizen";
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organisationName: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const accountTypes = [
    {
      id: "citizen" as AccountType,
      title: "Affected Citizen",
      description: "Request and track support",
      icon: UserRound,
    },
    {
      id: "volunteer" as AccountType,
      title: "Volunteer",
      description: "Offer skills during responses",
      icon: HandHeart,
    },
    {
      id: "organisation" as AccountType,
      title: "Partner Organisation",
      description: "Coordinate verified operations",
      icon: Building2,
    },
    {
      id: "donor" as AccountType,
      title: "Donor",
      description: "Support transparent campaigns",
      icon: Users,
    },
  ];

  const updateField = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleContinue = async () => {
    setError(null);

    if (step === 2) {
      if (
        !formData.firstName.trim() ||
        !formData.lastName.trim() ||
        !formData.email.trim() ||
        !formData.phone.trim() ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        setError("Please complete all required fields.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (formData.password.length < 6) {
        setError("Password must contain at least 6 characters.");
        return;
      }

      if (
        accountType === "organisation" &&
        !formData.organisationName.trim()
      ) {
        setError("Please enter your organisation name.");
        return;
      }
    }

    if (step < 3) {
      setStep((previous) => previous + 1);
    } else {
      // Step 3 submission: Call backend API
      setIsLoading(true);
      setError(null);

      const roleMap: Record<AccountType, string> = {
        citizen: "Citizen",
        volunteer: "Volunteer",
        organisation: "Citizen",
        donor: "Citizen",
      };

      try {
        const authData: any = await register({
          fullName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          password: formData.password,
          phoneNumber: formData.phone.trim(),
          address: formData.address.trim() || undefined,
          role: roleMap[accountType] || "Citizen",
        });

        if (authData?.token && authData?.user) {
          const userRoles = authData.user.roles || [];
          const has = (r: string) => userRoles.some((role: string) => role.toLowerCase() === r.toLowerCase());
          if (has("Admin") || has("SystemAdmin")) {
            navigate("/admin/dashboard", { replace: true });
          } else if (has("EmergencyCoordinator") || has("IncidentManager")) {
            navigate("/coordinator/dashboard", { replace: true });
          } else if (has("PartnerOfficer")) {
            navigate("/partner/dashboard", { replace: true });
          } else if (has("Volunteer") || has("VolunteerCoordinator")) {
            navigate("/volunteer/dashboard", { replace: true });
          } else {
            navigate("/citizen/dashboard", { replace: true });
          }
        } else {
          setRegisteredSuccess(true);
        }
      } catch (err: any) {
        setError(err.message || "Registration failed. Please check your information.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((previous) => previous - 1);
    }
  };

  const inputClass =
    "h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-[#123B5C] outline-none transition placeholder:text-slate-400 focus:border-[#2784B5] focus:ring-2 focus:ring-blue-100";

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">

      {/* LEFT BRANDING PANEL */}
      <section className="relative flex min-h-[420px] w-full flex-col justify-between overflow-hidden bg-[#123B5C] px-8 py-8 text-white lg:sticky lg:top-0 lg:h-screen lg:w-[42%] lg:px-16">

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
        <a
          href="/"
          className="relative z-10 flex items-center gap-3"
        >
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

        {/* Branding Content */}
        <div className="relative z-10 my-12 max-w-lg lg:my-0">

          <span className="inline-block rounded-md bg-white px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#123B5C]">
            HUMANITARIAN OPERATIONS
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
            One secure place to coordinate every response.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
            Trusted workflows for citizens, response teams,
            partner organisations and public agencies.
          </p>

          <div className="mt-7 space-y-4">
            {[
              "Human-reviewed critical decisions",
              "Role-based operational access",
              "Auditable coordination across organisations",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3"
              >
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
        <p className="relative z-10 text-[10px] text-slate-400">
          Demonstration environment · Never use real personal data
        </p>
      </section>

      {/* RIGHT REGISTRATION PANEL */}
      <section className="relative flex min-h-screen w-full items-center justify-center bg-[#EFF6F7] px-6 py-16 lg:w-[58%] lg:px-12">

        {/* Back to Website */}
        <a
          href="/"
          className="absolute left-7 top-7 flex items-center gap-2 text-xs text-slate-600 transition hover:text-[#123B5C]"
        >
          <ArrowLeft size={14} />
          Back to website
        </a>

        <div className="w-full max-w-[620px]">

          {/* Platform Logo */}
          <div className="mb-8 flex items-center justify-center gap-3">
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

          {registeredSuccess ? (
            <div className="rounded-xl border border-[#42B99A]/30 bg-white p-8 text-center shadow-md">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EFF6F7] text-[#123B5C]">
                <Mail size={32} className="text-[#208D70]" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#123B5C]">Check your email</h3>
              <p className="mt-2 text-sm text-slate-600">
                We've sent a verification link to <strong className="text-[#123B5C]">{formData.email}</strong>.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Please check your inbox (and spam folder) and click the link to verify your account before signing in.
              </p>
              {resendMessage && (
                <div className="mt-4 rounded-md bg-[#EFF6F7] p-2.5 text-xs font-medium text-[#123B5C] border border-[#64C9AD]">
                  {resendMessage}
                </div>
              )}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto rounded-lg bg-[#123B5C] px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-[#1D5F8A] transition"
                >
                  Proceed to Sign In
                </button>
                <button
                  type="button"
                  disabled={isResending}
                  onClick={async () => {
                    setIsResending(true);
                    setResendMessage(null);
                    try {
                      const msg = await authService.resendVerification(formData.email);
                      setResendMessage(msg);
                    } catch (err: any) {
                      setResendMessage(err.message || "Could not resend verification email.");
                    } finally {
                      setIsResending(false);
                    }
                  }}
                  className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  {isResending ? "Resending..." : "Resend Verification Email"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Indicator */}
              <div className="mb-7">
                <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-[#2784B5]">
                  CREATE AN ACCOUNT · STEP {step} OF 3
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((number) => (
                    <div
                      key={number}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        step >= number
                          ? "bg-[#123B5C]"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-[#123B5C] md:text-3xl">
                How will you use the platform?
              </h1>

              <p className="mt-3 text-xs leading-6 text-slate-600">
                Choose the account type that best describes you.
                Staff roles are provisioned separately.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">

                {accountTypes.map((type) => {
                  const Icon = type.icon;
                  const selected = accountType === type.id;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setAccountType(type.id)}
                      className={`flex min-h-[74px] items-center gap-3 rounded-lg border bg-white px-3 py-3 text-left transition-all duration-200 ${
                        selected
                          ? "border-2 border-[#123B5C] bg-[#F0F6F8]"
                          : "border-[#75C9B4] hover:border-[#123B5C]"
                      }`}
                    >
                      {/* Radio */}
                      <div
                        className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                          selected
                            ? "border-[#123B5C]"
                            : "border-slate-400"
                        }`}
                      >
                        {selected && (
                          <div className="h-2 w-2 rounded-full bg-[#123B5C]" />
                        )}
                      </div>

                      {/* Icon */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF6F7] text-[#123B5C]">
                        <Icon size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-semibold text-[#123B5C]">
                          {type.title}
                        </h3>

                        <p className="mt-1 text-[10px] text-slate-600">
                          {type.description}
                        </p>
                      </div>

                    </button>
                  );
                })}

              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-[#123B5C] md:text-3xl">
                Create your account
              </h1>

              <p className="mt-3 text-xs leading-6 text-slate-600">
                Enter your details to set up your platform account.
              </p>

              <form className="mt-6 space-y-4">

                {accountType === "organisation" && (
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#173B56]">
                      Organisation name *
                    </label>

                    <input
                      required
                      value={formData.organisationName}
                      onChange={(e) =>
                        updateField("organisationName", e.target.value)
                      }
                      placeholder="Enter organisation name"
                      className={inputClass}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#173B56]">
                      First name *
                    </label>

                    <input
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        updateField("firstName", e.target.value)
                      }
                      placeholder="First name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#173B56]">
                      Last name *
                    </label>

                    <input
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        updateField("lastName", e.target.value)
                      }
                      placeholder="Last name"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#173B56]">
                    Email address *
                  </label>

                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    placeholder="Enter your email address"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#173B56]">
                    Phone number *
                  </label>

                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value)
                    }
                    placeholder="Enter your phone number"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold text-[#173B56]">
                    Address
                  </label>

                  <input
                    value={formData.address}
                    onChange={(e) =>
                      updateField("address", e.target.value)
                    }
                    placeholder="Enter your address"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#173B56]">
                      Password *
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) =>
                          updateField("password", e.target.value)
                        }
                        placeholder="Minimum 6 characters"
                        className={`${inputClass} pr-10`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Must be at least 6 characters
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-[#173B56]">
                      Confirm password *
                    </label>

                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          updateField("confirmPassword", e.target.value)
                        }
                        placeholder="Confirm password"
                        className={`${inputClass} pr-10`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                        aria-label="Toggle confirm password visibility"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

              </form>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-[#123B5C] md:text-3xl">
                Review your details
              </h1>

              <p className="mt-3 text-xs leading-6 text-slate-600">
                Check your information before completing registration.
              </p>

              <div className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-5">

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Account type
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#123B5C]">
                    {accountTypes.find(
                      (type) => type.id === accountType
                    )?.title}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Full name
                  </p>

                  <p className="mt-1 text-sm text-[#123B5C]">
                    {formData.firstName} {formData.lastName}
                  </p>
                </div>

                {accountType === "organisation" && (
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Organisation
                    </p>

                    <p className="mt-1 text-sm text-[#123B5C]">
                      {formData.organisationName}
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Email address
                  </p>

                  <p className="mt-1 text-sm text-[#123B5C]">
                    {formData.email}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Phone number
                  </p>

                  <p className="mt-1 text-sm text-[#123B5C]">
                    {formData.phone}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-lg bg-white p-4">
                <ShieldCheck
                  size={19}
                  className="shrink-0 text-[#2784B5]"
                />

                <p className="text-xs leading-5 text-slate-600">
                  Your information will be used to create your
                  humanitarian platform account. Please ensure
                  that your details are correct.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-7 flex items-center justify-between">

            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
                step === 1
                  ? "invisible"
                  : "border border-slate-300 bg-white text-[#123B5C] hover:bg-slate-100"
              }`}
            >
              <ArrowLeft size={14} />
              Previous
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg bg-[#123B5C] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#1D5F8A] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && step === 3 ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>{step === 3 ? "Create Account" : "Continue"}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
          </>
          )}

          {/* Login Link */}
          <p className="mt-6 text-center text-xs text-slate-600">
            Already registered?{" "}
            <a
              href="/login"
              className="font-semibold text-[#2784B5] hover:underline"
            >
              Sign in
            </a>
          </p>

          {/* Security Footer */}
          <div className="mt-7 border-t border-[#42B99A] pt-5">
            <p className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck
                size={15}
                className="text-[#123B5C]"
              />
              Protected access · Activity is logged for security
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}
