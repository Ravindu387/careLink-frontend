import { useState } from "react";
import {
  Settings, LockKeyhole, Bell, Database, Grid2X2, ChevronRight,
  ShieldCheck, Globe, Save, Check
} from "lucide-react";

type SectionKey = "General" | "Security" | "Authentication" | "Notifications" | "Data & Retention" | "Feature Controls";

const sections: { name: SectionKey; icon: typeof Settings }[] = [
  { name: "General", icon: Settings },
  { name: "Security", icon: LockKeyhole },
  { name: "Authentication", icon: LockKeyhole },
  { name: "Notifications", icon: Bell },
  { name: "Data & Retention", icon: Database },
  { name: "Feature Controls", icon: Grid2X2 },
];

const initialValues: Record<string, string | boolean> = {
  platformName: "ReliefOS Humanitarian Platform",
  language: "English",
  timezone: "UTC+05:30 · Colombo",
  supportEmail: "support@reliefos.org",
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

const fieldClass = "h-11 w-full rounded-lg border border-[#D5E3EA] bg-white px-3 text-[10px] text-[#173B59] outline-none transition focus:border-[#2785B2] focus:ring-2 focus:ring-[#2785B2]/10";
const labelClass = "mb-2 block text-[9px] font-semibold text-[#173B59]";

export default function SystemSettings() {
  const [active, setActive] = useState<SectionKey>("General");
  const [values, setValues] = useState(initialValues);
  const [saved, setSaved] = useState(false);

  const update = (key: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const saveChanges = () => {
    // Demo persistence. Replace this with your ASP.NET Core settings API.
    localStorage.setItem("reliefos-system-settings", JSON.stringify(values));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 3500);
  };

  const Toggle = ({ setting, title, description }: { setting: string; title: string; description: string }) => {
    const checked = Boolean(values[setting]);
    return (
      <div className="flex min-h-[65px] items-center justify-between gap-4 border-b border-[#D8E5EA] py-3 last:border-b-0">
        <div><p className="text-[9px] font-semibold text-[#173B59]">{title}</p><p className="mt-1 text-[9px] text-slate-500">{description}</p></div>
        <button type="button" role="switch" aria-checked={checked} onClick={() => update(setting, !checked)} className={`relative h-6 w-10 shrink-0 rounded-full transition ${checked ? "bg-[#63B9A4]" : "bg-[#C8D5DA]"}`}><span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all ${checked ? "left-[19px]" : "left-[3px]"}`}/></button>
      </div>
    );
  };

  const TextField = ({ label, setting, type = "text" }: { label: string; setting: string; type?: string }) => (
    <label className="block"><span className={labelClass}>{label}</span><input type={type} value={String(values[setting] ?? "")} onChange={(e) => update(setting, e.target.value)} className={fieldClass}/></label>
  );

  const SelectField = ({ label, setting, options }: { label: string; setting: string; options: string[] }) => (
    <label className="block"><span className={labelClass}>{label}</span><select value={String(values[setting] ?? "")} onChange={(e) => update(setting, e.target.value)} className={fieldClass}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
  );

  const PanelHeading = ({ title }: { title: string }) => (
    <div className="mb-4 border-b border-[#D8E5EA] pb-5"><h2 className="text-[14px] font-medium text-[#173B59]">{title}</h2><p className="mt-1 text-[9px] text-slate-500">Changes apply across the production environment and are recorded in the audit log.</p></div>
  );

  return (
    <main className="min-h-screen bg-[#EFF6F7] px-4 py-6 md:px-7">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-8 flex items-center gap-2 text-[9px] text-slate-500"><span>Administration</span><ChevronRight size={12}/><span className="font-semibold text-[#173B59]">System Settings</span></div>
          <h1 className="text-[26px] font-medium tracking-tight text-[#123B5C]">System Settings</h1>
          <p className="mt-2 text-xs text-slate-500">Configure global platform behaviour, security, notifications, and data governance.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="flex items-center gap-1 text-[10px] font-semibold text-[#24977C]"><Check size={14}/>Changes saved</span>}
          <button onClick={saveChanges} className="flex h-11 items-center gap-2 rounded-lg bg-[#2785B2] px-4 text-[10px] font-semibold text-white shadow-sm hover:bg-[#1D6F98]"><Save size={14}/>Save changes</button>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[296px_minmax(0,1fr)]">
        <nav className="rounded-xl border border-[#D7E5EA] bg-white p-2 shadow-[0_8px_22px_rgba(28,67,88,0.06)]">
          {sections.map(({ name, icon: Icon }) => {
            const selected = active === name;
            return <button key={name} onClick={() => setActive(name)} className={`mb-1 flex h-[52px] w-full items-center gap-3 rounded-lg px-3 text-left text-[10px] transition last:mb-0 ${selected ? "bg-[#E7F1F7] font-semibold text-[#1878A9]" : "text-slate-500 hover:bg-slate-50 hover:text-[#173B59]"}`}><Icon size={19} className={selected ? "text-[#2785B2]" : "text-[#718DA2]"}/><span className="flex-1">{name}</span><ChevronRight size={17} className={selected ? "text-[#2785B2]" : "text-[#718DA2]"}/></button>;
          })}
        </nav>

        <section className="min-h-[330px] rounded-xl border border-[#D7E5EA] bg-white p-5 shadow-[0_8px_22px_rgba(28,67,88,0.06)] md:p-6">
          {active === "General" && <>
            <PanelHeading title="General settings"/>
            <div className="grid gap-x-4 gap-y-5 md:grid-cols-2">
              <TextField label="Platform name" setting="platformName"/>
              <SelectField label="Default language" setting="language" options={["English","Sinhala","Tamil"]}/>
              <SelectField label="Default time zone" setting="timezone" options={["UTC+05:30 · Colombo","UTC · Coordinated Universal Time","UTC+00:00 · London","UTC+08:00 · Singapore"]}/>
              <TextField label="Support email" setting="supportEmail" type="email"/>
              <label className="block md:col-span-2"><span className={labelClass}>Maintenance notice</span><textarea rows={4} value={String(values.maintenanceNotice)} onChange={e=>update("maintenanceNotice",e.target.value)} className="w-full resize-y rounded-lg border border-[#D5E3EA] p-3 text-[10px] text-[#173B59] outline-none focus:border-[#2785B2]"/></label>
            </div>
          </>}

          {active === "Security" && <>
            <PanelHeading title="Security settings"/>
            <Toggle setting="twoFactor" title="Enforce two-factor authentication" description="Required for all privileged roles"/>
            <Toggle setting="compromisedPasswords" title="Block compromised passwords" description="Check passwords against breach datasets"/>
            <Toggle setting="suspiciousSession" title="Automatic suspicious-session revocation" description="Revoke sessions when risk threshold is exceeded"/>
            <Toggle setting="adminApproval" title="Administrator action approval" description="Require secondary approval for critical changes"/>
          </>}

          {active === "Authentication" && <>
            <PanelHeading title="Authentication settings"/>
            <div className="grid gap-x-4 gap-y-5 md:grid-cols-2">
              <TextField label="Session timeout (minutes)" setting="sessionTimeout" type="number"/>
              <TextField label="Maximum failed attempts" setting="failedAttempts" type="number"/>
              <TextField label="Password minimum length" setting="passwordLength" type="number"/>
              <TextField label="Reset link expiry (minutes)" setting="resetExpiry" type="number"/>
            </div>
            <div className="mt-5"><Toggle setting="partnerSSO" title="Allow partner organisation SSO" description="Subject to approved identity-provider configuration"/></div>
          </>}

          {active === "Notifications" && <>
            <PanelHeading title="Notifications settings"/>
            <Toggle setting="securityAlerts" title="Security event alerts" description="In-app and administrator email"/>
            <Toggle setting="integrationAlerts" title="Integration failure alerts" description="In-app and administrator email"/>
            <Toggle setting="roleRequests" title="Privileged role requests" description="In-app and administrator email"/>
            <Toggle setting="failedJobs" title="Failed delivery jobs" description="In-app and administrator email"/>
            <Toggle setting="dailySummary" title="Daily platform health summary" description="In-app and administrator email"/>
          </>}

          {active === "Data & Retention" && <>
            <PanelHeading title="Data & Retention settings"/>
            <div className="grid gap-x-4 gap-y-5 md:grid-cols-2">
              <SelectField label="Audit retention" setting="auditRetention" options={["1 year","3 years","5 years","7 years","10 years"]}/>
              <SelectField label="Inactive account retention" setting="inactiveRetention" options={["6 months","12 months","24 months","36 months"]}/>
              <SelectField label="Export expiry" setting="exportExpiry" options={["1 hour","6 hours","12 hours","24 hours","7 days"]}/>
              <SelectField label="Log aggregation period" setting="logAggregation" options={["7 days","30 days","90 days","180 days"]}/>
            </div>
            <div className="mt-7 flex items-center gap-3 rounded-lg bg-[#EDF7FA] px-4 py-4 text-[9px] text-[#39718B]"><ShieldCheck size={19} className="shrink-0"/>Retention reductions require legal and data-protection approval.</div>
          </>}

          {active === "Feature Controls" && <>
            <PanelHeading title="Feature Controls settings"/>
            <Toggle setting="aiDecision" title="AI decision-support centre" description="Enabled in production"/>
            <Toggle setting="citizenRegistration" title="Public citizen registration" description="Enabled in production"/>
            <Toggle setting="partnerSharing" title="Partner resource sharing" description="Enabled in production"/>
            <Toggle setting="smsDelivery" title="SMS notification delivery" description="Enabled in production"/>
            <Toggle setting="demandForecasts" title="Experimental demand forecasts" description="Limited pilot access"/>
          </>}
        </section>
      </div>
      <p className="mt-4 flex items-center gap-2 text-[9px] text-slate-400"><Globe size={12}/>Production environment · Settings changes should be reviewed and recorded.</p>
    </main>
  );
}
