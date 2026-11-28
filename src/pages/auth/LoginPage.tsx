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
  FileUp,
  CheckCircle2,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import type { RegisterDocumentUpload } from "../../types/auth";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";
import {
  getDashboardPathForRoles,
  isPathAllowedForRoles,
} from "../../constants/roles";

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

  // Additional Information submission state for Pending Partner Organisations
  const [requiresAdditionalInfo, setRequiresAdditionalInfo] = useState(false);
  const [additionalInfoResponse, setAdditionalInfoResponse] = useState("");
  const [additionalDocs, setAdditionalDocs] = useState<RegisterDocumentUpload[]>([]);
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [infoSuccessMessage, setInfoSuccessMessage] = useState<string | null>(null);

  const [currentImage, setCurrentImage] = useState(0);

  const {
    login,
    isAuthenticated,
    isLoading: isAuthLoading,
    user: currentUser,
    dashboardPath,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If user is already authenticated with an active account and valid role, redirect automatically to their dashboard
  useEffect(() => {
    if (
      !isAuthLoading &&
      isAuthenticated &&
      currentUser &&
      currentUser.isActive !== false &&
      (!currentUser.accountStatus || currentUser.accountStatus === "Active") &&
      !currentUser.requiresPasswordSetup &&
      dashboardPath
    ) {
      navigate(dashboardPath, { replace: true });
    }
  }, [
    isAuthLoading,
    isAuthenticated,
    currentUser,
    dashboardPath,
    navigate,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((previous) => (previous + 1) % backgroundImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleAdditionalFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedTypes.includes(file.type) && !["pdf", "jpg", "jpeg", "png"].includes(ext)) {
      setError("Only PDF, JPG, JPEG, and PNG files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must not exceed 10 MB.");
      return;
    }

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file."));
      reader.readAsDataURL(file);
    });

    setAdditionalDocs((prev) => [
      ...prev,
      {
        category: "SupportingDocument",
        fileName: file.name,
        contentType: file.type || "application/pdf",
        fileSizeBytes: file.size,
        base64Content: base64,
      },
    ]);
    e.target.value = "";
  };

  const handleAdditionalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!additionalInfoResponse.trim()) {
      setError("Please enter the requested verification details.");
      return;
    }

    setIsSubmittingInfo(true);
    setError(null);
    try {
      const msg = await authService.submitPartnerAdditionalInfo({
        email: email.trim(),
        password,
        responseText: additionalInfoResponse.trim(),
        additionalDocuments: additionalDocs,
      });
      setInfoSuccessMessage(msg);
      setRequiresAdditionalInfo(false);
      setAdditionalInfoResponse("");
      setAdditionalDocs([]);
    } catch (err: any) {
      setError(err.message || "Failed to submit additional information.");
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfoSuccessMessage(null);
    setIsLoading(true);

    try {
      const authData = await login({ email: email.trim(), password });
      const authenticatedUser = authData.user;

      if (
        authenticatedUser.requiresPasswordSetup ||
        authenticatedUser.accountStatus === "PendingPasswordSetup"
      ) {
        navigate("/setup-password", { replace: true });
        return;
      }

      if (
        authenticatedUser.isActive === false ||
        (authenticatedUser.accountStatus &&
          authenticatedUser.accountStatus !== "Active")
      ) {
        setError(
          `Your account status is "${authenticatedUser.accountStatus}". Protected operational access is not permitted.`
        );
        return;
      }

      const userRoles = authenticatedUser.roles || [];
      const targetDashboard = getDashboardPathForRoles(userRoles);

      if (!targetDashboard) {
        setError(
          "Your account does not have a valid role claim assigned. Please contact a System Administrator."
        );
        return;
      }

      // Preserve the originally requested protected URL ONLY if it belongs to the user's authorized role
      const fromPath = (location.state as any)?.from?.pathname;
      if (fromPath && isPathAllowedForRoles(fromPath, userRoles)) {
        navigate(fromPath, { replace: true });
        return;
      }

      navigate(targetDashboard, { replace: true });
    } catch (err: any) {
      const msg = err.message || "Invalid email or password.";
      setError(msg);
      if (
        msg.includes("ADDITIONAL_INFO_REQUIRED") ||
        msg.toLowerCase().includes("additional information is required")
      ) {
        setRequiresAdditionalInfo(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* LEFT BRANDING PANEL */}
      <section className="relative flex min-h-[400px] w-full flex-col justify-between overflow-hidden bg-[#123B5C] px-8 py-8 text-white lg:min-h-screen lg:w-[42%] lg:px-16">
        {backgroundImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              currentImage === index ? "opacity-30" : "opacity-0"
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}

        <div className="absolute inset-0 bg-[#123B5C]/80" />

        <div className="pointer-events-none absolute -bottom-48 -right-48 h-[520px] w-[520px] rounded-full border-[65px] border-white/[0.025]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[390px] w-[390px] rounded-full border-[65px] border-white/[0.035]" />

        <a href="/" className="relative z-10 flex items-center gap-3">
          <CareLinkLogo size="header" showText tagline="Connecting Help. Saving Lives." />
        </a>

        <div className="relative z-10 my-12 max-w-lg lg:my-0">
          <span className="inline-block rounded-md bg-white px-3 py-1.5 text-xs font-bold tracking-wide text-[#123B5C]">
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
                <Check size={17} className="shrink-0 text-[#42B99A]" />
                <span className="text-sm font-medium text-white">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 mt-5 text-[13px] text-slate-400">
          Demonstration environment · Never use real personal data
        </p>
      </section>

      {/* RIGHT LOGIN PANEL */}
      <section className="relative flex min-h-screen w-full items-center justify-center bg-[#EFF6F7] px-6 py-12 lg:w-[58%] lg:px-12">
        <a
          href="/"
          className="absolute left-7 top-7 flex items-center gap-2 text-[13px] font-medium text-slate-600 transition hover:text-[#123B5C]"
        >
          <ArrowLeft size={14} />
          Back to website
        </a>

        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3.5">
            <CareLinkLogo
              size="sidebar"
              showText
              titleClassName="text-[#123B5C]"
              subtitleClassName="text-slate-500"
              tagline="Connecting Help. Saving Lives."
            />
          </div>

          <div className="mb-7">
            <p className="text-xs font-bold tracking-[0.16em] text-[#2784B5]">
              SECURE ACCOUNT ACCESS
            </p>
            <h1 className="mt-3 text-[28px] sm:text-[32px] font-bold tracking-tight text-[#123B5C]">
              Welcome back
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-slate-600">
              Sign in with your registered email address (your CareLink username).
            </p>
          </div>

          {infoSuccessMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              <span>{infoSuccessMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {requiresAdditionalInfo && (
            <form
              onSubmit={handleAdditionalInfoSubmit}
              className="mb-6 space-y-3 rounded-xl border border-amber-300 bg-amber-50/70 p-4"
            >
              <p className="text-sm font-bold text-amber-900">
                Submit Requested Verification Information
              </p>
              <p className="text-sm text-amber-800">
                Provide the clarification or additional documents requested by the administrator to resume verification review.
              </p>
              <textarea
                rows={3}
                required
                value={additionalInfoResponse}
                onChange={(e) => setAdditionalInfoResponse(e.target.value)}
                placeholder="Enter your clarification or additional verification details..."
                className="w-full rounded-lg border border-amber-300 bg-white p-2.5 text-sm sm:text-[15px] text-[#123B5C] outline-none focus:border-[#2784B5]"
              />
              <div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-[#123B5C] hover:bg-slate-50">
                  <FileUp size={14} />
                  <span>Attach Supporting Document (PDF/JPG/PNG)</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleAdditionalFileChange}
                    className="hidden"
                  />
                </label>
                {additionalDocs.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {additionalDocs.map((doc, idx) => (
                      <div
                        key={`${doc.fileName}-${idx}`}
                        className="flex items-center justify-between rounded bg-white px-2.5 py-1 text-xs text-[#123B5C]"
                      >
                        <span className="truncate">{doc.fileName}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setAdditionalDocs((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmittingInfo}
                className="w-full rounded-lg bg-[#123B5C] py-2 text-sm font-semibold text-white hover:bg-[#1D5F8A] disabled:opacity-60"
              >
                {isSubmittingInfo ? "Submitting..." : "Submit Additional Information"}
              </button>
            </form>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#173B56]"
              >
                Email address (Username)
              </label>

              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm sm:text-[15px] text-[#123B5C] outline-none transition placeholder:text-slate-400 focus:border-[#2784B5] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#173B56]"
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
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-16 text-sm sm:text-[15px] text-[#123B5C] outline-none transition placeholder:text-slate-400 focus:border-[#2784B5] focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-sm font-medium text-[#2784B5]"
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

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-blue-600"
                />
                Remember me
              </label>

              <a
                href="/setup-password"
                className="text-[13px] font-medium text-[#2784B5] hover:underline"
              >
                Complete account setup
              </a>
            </div>

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

          <p className="mt-5 text-center text-sm text-slate-600">
            New to the platform?{" "}
            <a
              href="/register"
              className="font-semibold text-[#2784B5] hover:underline"
            >
              Create an account
            </a>
          </p>

          <div className="mt-7 border-t border-[#42B99A] pt-5">
            <p className="flex items-center justify-center gap-2 text-[13px] text-slate-500">
              <ShieldCheck size={15} className="text-[#123B5C]" />
              Protected access · Activity is logged for security
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
