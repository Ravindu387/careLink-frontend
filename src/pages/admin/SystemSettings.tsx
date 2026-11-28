import { useState, useEffect } from "react";
import {
  Settings,
  LockKeyhole,
  Bell,
  Database,
  Grid2X2,
  ChevronRight,
  ShieldCheck,
  Save,
  Check,
  RefreshCw,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { settingsService } from "../../services/settingsService";
import type { SystemSettings as SystemSettingsType } from "../../types/settings";

type SectionKey =
  | "General"
  | "Security"
  | "Authentication"
  | "Notifications"
  | "Data & Retention"
  | "Feature Controls";

const sections: { name: SectionKey; icon: typeof Settings }[] = [
  { name: "General", icon: Settings },
  { name: "Security", icon: LockKeyhole },
  { name: "Authentication", icon: LockKeyhole },
  { name: "Notifications", icon: Bell },
  { name: "Data & Retention", icon: Database },
  { name: "Feature Controls", icon: Grid2X2 },
];

const defaultSettings: SystemSettingsType = {
  platformName: "CareLink Humanitarian Aid Platform",
  language: "English",
  timezone: "UTC+05:30 · Colombo",
  supportEmail: "support@carelink.org",
  maintenanceNotice: "No active maintenance notice",
  twoFactor: true,
  compromisedPasswords: true,
  suspiciousSession: true,
  adminApproval: true,
  sessionTimeout: "20",
  failedAttempts: "5",
  passwordLength: "12",
  resetExpiry: "30",
  partnerSSO: true,
  securityAlerts: true,
  integrationAlerts: true,
  roleRequests: true,
  failedJobs: true,
  dailySummary: true,
  auditRetention: "7 years",
  inactiveRetention: "24 months",
  exportExpiry: "24 hours",
  logAggregation: "90 days",
  aiDecision: true,
  citizenRegistration: true,
  partnerSharing: true,
  smsDelivery: true,
  demandForecasts: false,
};

const fieldClass =
  "h-11 w-full rounded-lg border border-[#D5E3EA] bg-white px-3 text-sm sm:text-[15px] text-[#173B59] outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-[#2785B2]/10";
const labelClass = "mb-2 block text-xs font-semibold text-[#173B59]";

export default function SystemSettings() {
  const [active, setActive] = useState<SectionKey>("General");
  const [values, setValues] = useState<SystemSettingsType>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await settingsService.getSettings();
        if (data) setValues(data);
      } catch (err: any) {
        setError(err.message || "Failed to load system settings from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const update = (key: keyof SystemSettingsType, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await settingsService.updateSettings(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset all settings to defaults?")) return;
    setSaving(true);
    setError(null);
    try {
      const reset = await settingsService.resetDefaults();
      setValues(reset);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to reset settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="font-sans text-[#123B5C]">
      {/* BREADCRUMB */}
      <div className="flex h-9 items-center justify-between border-b border-[#64C9AD]/40 bg-white px-6 text-[13px] text-slate-500">
        <div className="flex items-center gap-2">
          <span>Administration</span>
          <ChevronRight size={11} />
          <span className="font-semibold text-[#123B5C]">System Settings</span>
        </div>

        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <Check size={12} /> Settings saved & synced
            </span>
          )}
          <span className="text-xs text-slate-400">
            Last updated: {values.lastUpdatedAt ? new Date(values.lastUpdatedAt).toLocaleDateString() : "Just now"}
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] space-y-4 px-4 py-6 md:px-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold tracking-tight text-[#123B5C]">
              System Settings & Configuration
            </h1>
            <p className="mt-1 text-[13px] text-slate-500">
              Configure platform parameters, security safeguards, retention rules, and feature controls.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={saving || loading}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RotateCcw size={12} />
              Reset Defaults
            </button>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-1.5 rounded-lg bg-[#123B5C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1D5F8A] disabled:opacity-50"
            >
              {saving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
          {/* NAV TABS */}
          <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isSelected = active === sec.name;

              return (
                <button
                  key={sec.name}
                  onClick={() => setActive(sec.name)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                    isSelected
                      ? "bg-[#123B5C] text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={15} />
                  <span>{sec.name}</span>
                </button>
              );
            })}
          </div>

          {/* FORM BODY */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <RefreshCw size={24} className="animate-spin text-[#2785B2]" />
              </div>
            ) : (
              <>
                {active === "General" && (
                  <div className="space-y-4">
                    <h2 className="text-lg sm:text-xl font-bold text-[#123B5C]">General Platform Configuration</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Platform Name</label>
                        <input
                          className={fieldClass}
                          value={values.platformName}
                          onChange={(e) => update("platformName", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Support & Triage Email</label>
                        <input
                          className={fieldClass}
                          value={values.supportEmail}
                          onChange={(e) => update("supportEmail", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Timezone</label>
                        <input
                          className={fieldClass}
                          value={values.timezone}
                          onChange={(e) => update("timezone", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Language</label>
                        <input
                          className={fieldClass}
                          value={values.language}
                          onChange={(e) => update("language", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {active === "Security" && (
                  <div className="space-y-4">
                    <h2 className="text-lg sm:text-xl font-bold text-[#123B5C]">Security Safeguards & Access Rules</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { key: "twoFactor", title: "Mandatory Two-Factor Authentication for Admins", desc: "Require 2FA verification for SystemAdmin and EmergencyCoordinator roles." },
                        { key: "compromisedPasswords", title: "Compromised Password Screening", desc: "Reject passwords found in global breach intelligence corpuses." },
                        { key: "suspiciousSession", title: "Suspicious Session Detection", desc: "Flag concurrent sessions or sudden geographical shifts." },
                        { key: "adminApproval", title: "Privileged Role Dual-Authorization", desc: "Require secondary administrator signoff for new Coordinator role promotions." },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                            <p className="text-[13px] text-slate-500">{item.desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-[#123B5C]"
                            checked={!!(values as any)[item.key]}
                            onChange={(e) => update(item.key as any, e.target.checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {active === "Authentication" && (
                  <div className="space-y-4">
                    <h2 className="text-lg sm:text-xl font-bold text-[#123B5C]">Authentication & Password Rules</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Session Inactivity Timeout (minutes)</label>
                        <input
                          className={fieldClass}
                          value={values.sessionTimeout}
                          onChange={(e) => update("sessionTimeout", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Max Failed Login Attempts</label>
                        <input
                          className={fieldClass}
                          value={values.failedAttempts}
                          onChange={(e) => update("failedAttempts", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Minimum Password Length</label>
                        <input
                          className={fieldClass}
                          value={values.passwordLength}
                          onChange={(e) => update("passwordLength", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Password Reset Token Expiry (minutes)</label>
                        <input
                          className={fieldClass}
                          value={values.resetExpiry}
                          onChange={(e) => update("resetExpiry", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {active === "Notifications" && (
                  <div className="space-y-4">
                    <h2 className="text-lg sm:text-xl font-bold text-[#123B5C]">Alerts & Broadcast Delivery</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { key: "securityAlerts", title: "High-Severity Security Broadcasts", desc: "Dispatch push alerts on account lockouts or unauthorized API access." },
                        { key: "integrationAlerts", title: "Integration Degradation Alerts", desc: "Notify when external data connectors experience ping failures." },
                        { key: "roleRequests", title: "Role Assignment Notifications", desc: "Alert user when their role permissions or organization affiliation changes." },
                        { key: "dailySummary", title: "Daily Operational Briefing", desc: "Send daily crisis triage and resource summaries at 08:00 AM." },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                            <p className="text-[13px] text-slate-500">{item.desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-[#123B5C]"
                            checked={!!(values as any)[item.key]}
                            onChange={(e) => update(item.key as any, e.target.checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {active === "Data & Retention" && (
                  <div className="space-y-4">
                    <h2 className="text-lg sm:text-xl font-bold text-[#123B5C]">Data Retention & Archival Policies</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelClass}>Audit Log Retention Period</label>
                        <input
                          className={fieldClass}
                          value={values.auditRetention}
                          onChange={(e) => update("auditRetention", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Inactive Account Archival Threshold</label>
                        <input
                          className={fieldClass}
                          value={values.inactiveRetention}
                          onChange={(e) => update("inactiveRetention", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Report Export Download Expiry</label>
                        <input
                          className={fieldClass}
                          value={values.exportExpiry}
                          onChange={(e) => update("exportExpiry", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Log Aggregation Window</label>
                        <input
                          className={fieldClass}
                          value={values.logAggregation}
                          onChange={(e) => update("logAggregation", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {active === "Feature Controls" && (
                  <div className="space-y-4">
                    <h2 className="text-lg sm:text-xl font-bold text-[#123B5C]">Operational Feature Flags</h2>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { key: "aiDecision", title: "AI Triage Recommendation Assistance", desc: "Enable automated triage proposals in AI Recommendation Review module." },
                        { key: "citizenRegistration", title: "Public Citizen Self-Registration", desc: "Permit unaffected and affected citizens to register self-service accounts." },
                        { key: "partnerSharing", title: "Cross-Agency Data Sharing Protocol", desc: "Allow verified NGOs to view anonymized district assistance needs." },
                        { key: "smsDelivery", title: "Critical SMS Broadcast Dispatch", desc: "Allow emergency SMS alerts to verified evacuees." },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                            <p className="text-[13px] text-slate-500">{item.desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-[#123B5C]"
                            checked={!!(values as any)[item.key]}
                            onChange={(e) => update(item.key as any, e.target.checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
