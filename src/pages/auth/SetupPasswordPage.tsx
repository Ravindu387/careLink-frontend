import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Heart,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Clock,
  XCircle,
} from "lucide-react";
import { authService } from "../../services/authService";
import { CareLinkLogo } from "../../components/common/CareLinkLogo";

type TokenState = "idle" | "validating" | "valid" | "expired" | "used" | "invalid";

export default function SetupPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [token, setToken] = useState(() => searchParams.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [tokenState, setTokenState] = useState<TokenState>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const tokenParam = searchParams.get("token");
    if (emailParam && tokenParam) {
      setTokenState("validating");
      setError(null);
      authService
        .verifySetupToken(emailParam, tokenParam)
        .then(() => {
          setTokenState("valid");
        })
        .catch((err: any) => {
          const msg = (err.message || "").toLowerCase();
          if (
            !msg.startsWith("invalid") &&
            (msg.includes("expired") || msg.includes("expired_token"))
          ) {
            setTokenState("expired");
            setError(
              "This account setup link has expired. Please contact your CareLink administrator to resend a new invitation."
            );
          } else if (
            msg.includes("already been used") ||
            msg.includes("token_already_used")
          ) {
            setTokenState("used");
            setError(
              "This account setup link has already been used. You may proceed directly to sign in."
            );
          } else {
            setTokenState("invalid");
            setError(
              err.message ||
                "This account setup link is invalid. Please check your invitation email or contact an administrator."
            );
          }
        });
    }
  }, [searchParams]);

  const passwordStrength = useMemo(() => {
    if (!newPassword) return { label: "", color: "bg-slate-200", width: "0%" };
    let score = 0;
    if (newPassword.length >= 6) score++;
    if (newPassword.length >= 10) score++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score++;
    if (/\d/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 1) {
      return { label: "Weak", color: "bg-rose-500", width: "33%" };
    }
    if (score <= 2) {
      return { label: "Fair", color: "bg-amber-500", width: "66%" };
    }
    return { label: "Strong", color: "bg-emerald-500", width: "100%" };
  }, [newPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !token.trim()) {
      setError("Email address and setup token are required.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const msg = await authService.setupPassword({
        email: email.trim(),
        token: token.trim(),
        newPassword,
        confirmPassword,
      });
      setCompletedMessage(msg);
    } catch (err: any) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("expired")) {
        setTokenState("expired");
      } else if (msg.includes("already been used")) {
        setTokenState("used");
      }
      setError(
        err.message ||
          "Failed to complete account setup. The token may be invalid, expired, or already used."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EFF6F7] px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <CareLinkLogo size="auth" />
          <h2 className="mt-3 text-lg font-bold text-[#123B5C]">CareLink</h2>
          <p className="text-xs text-slate-500">
            Connecting Help. Saving Lives.
          </p>
        </div>

        {completedMessage ? (
          <div className="text-center" data-testid="setup-success-state">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={30} />
            </div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] mt-4 font-bold text-[#123B5C]">
              Account Setup Complete
            </h1>
            <p className="mt-2 text-sm leading-5 text-slate-600">
              {completedMessage}
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 w-full rounded-lg bg-[#123B5C] py-3 text-sm font-semibold text-white shadow hover:bg-[#1D5F8A]"
            >
              Proceed to Sign In
            </button>
          </div>
        ) : tokenState === "expired" ? (
          <div className="text-center" data-testid="setup-expired-state">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Clock size={30} />
            </div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] mt-4 font-bold text-[#123B5C]">
              Setup Link Expired
            </h1>
            <p className="mt-2 text-sm leading-5 text-slate-600">
              {error ||
                "This account setup link has expired. Please contact your CareLink administrator to request a new invitation email."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 w-full rounded-lg border border-slate-300 bg-white py-3 text-sm font-semibold text-[#123B5C] hover:bg-slate-50"
            >
              Return to Sign In
            </button>
          </div>
        ) : tokenState === "invalid" || tokenState === "used" ? (
          <div className="text-center" data-testid="setup-invalid-state">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <XCircle size={30} />
            </div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] mt-4 font-bold text-[#123B5C]">
              {tokenState === "used" ? "Setup Link Already Used" : "Invalid Setup Link"}
            </h1>
            <p className="mt-2 text-sm leading-5 text-slate-600">
              {error ||
                "This setup link is invalid or has already been used. Please contact your CareLink administrator if you need assistance."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-6 w-full rounded-lg bg-[#123B5C] py-3 text-sm font-semibold text-white shadow hover:bg-[#1D5F8A]"
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 rounded bg-sky-50 px-2.5 py-1 text-xs font-bold text-[#2785B2]">
                <LockKeyhole size={12} /> SINGLE-USE SETUP LINK
              </span>
              <h1 className="text-2xl sm:text-[28px] lg:text-[30px] mt-2 font-bold text-[#123B5C]">
                Set up your CareLink account
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Create a secure password for your account. Your email address is
                your username.
              </p>
            </div>

            {tokenState === "validating" && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                <Loader2 size={15} className="animate-spin text-[#2785B2]" />
                <span>Verifying setup token...</span>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="setup-email"
                  className="mb-1.5 block text-sm font-semibold text-[#173B56]"
                >
                  Email address (Username)
                </label>
                <input
                  id="setup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@carelink.org"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm sm:text-[15px] text-[#123B5C] outline-none focus:border-[#2784B5]"
                />
              </div>

              {!searchParams.get("token") && (
                <div>
                  <label
                    htmlFor="setup-token"
                    className="mb-1.5 block text-sm font-semibold text-[#173B56]"
                  >
                    Setup Token
                  </label>
                  <input
                    id="setup-token"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your setup token"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm sm:text-[15px] text-[#123B5C] outline-none focus:border-[#2784B5]"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="setup-new-password"
                  className="mb-1.5 block text-sm font-semibold text-[#173B56]"
                >
                  New password *
                </label>
                <div className="relative">
                  <input
                    id="setup-new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm sm:text-[15px] text-[#123B5C] outline-none focus:border-[#2784B5]"
                  />
                  <button
                    type="button"
                    aria-label="Toggle new password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: passwordStrength.width }}
                      />
                    </div>
                    <p className="mt-1 text-[13px] text-slate-500">
                      Password strength:{" "}
                      <span className="font-semibold text-[#123B5C]">
                        {passwordStrength.label}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="setup-confirm-password"
                  className="mb-1.5 block text-sm font-semibold text-[#173B56]"
                >
                  Confirm password *
                </label>
                <div className="relative">
                  <input
                    id="setup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-sm text-[#123B5C] outline-none focus:border-[#2784B5]"
                  />
                  <button
                    type="button"
                    aria-label="Toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || tokenState === "validating"}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#123B5C] text-sm font-semibold text-white shadow hover:bg-[#1D5F8A] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Activating Account...</span>
                  </>
                ) : (
                  <span>Complete Setup &amp; Activate</span>
                )}
              </button>
            </form>
          </>
        )}

        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[13px] text-slate-500">
            <ShieldCheck size={14} className="text-[#42B99A]" />
            Single-use token · Expires after 24 hours
          </p>
        </div>
      </div>
    </main>
  );
}
