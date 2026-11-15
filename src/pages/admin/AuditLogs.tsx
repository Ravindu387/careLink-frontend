import { useMemo, useState } from "react";
import {
  LockKeyhole, Search, Download, ChevronRight, MoreHorizontal, X,
  ShieldCheck, FileText, Eye, Copy
} from "lucide-react";

type AuditRecord = {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  record: string;
  change: string;
  rationale: string;
  type: string;
};

const initialRecords: AuditRecord[] = [
  { id: "AUD-482194", action: "User role updated", actor: "Alex Kimani", timestamp: "22 Jun · 13:51", record: "USR-10458", change: "Partner Officer → Coordinator", rationale: "Approved request", type: "User" },
  { id: "AUD-482188", action: "Account disabled", actor: "Marta Silva", timestamp: "22 Jun · 13:28", record: "USR-10312", change: "Active → Disabled", rationale: "Security policy", type: "User" },
  { id: "AUD-482174", action: "Organisation verified", actor: "Alex Kimani", timestamp: "22 Jun · 12:52", record: "ORG-042", change: "Pending → Verified", rationale: "Documents reviewed", type: "Organisation" },
  { id: "AUD-482161", action: "System setting changed", actor: "System Service", timestamp: "22 Jun · 12:10", record: "SECURITY", change: "30 min → 20 min", rationale: "Policy deployment", type: "System" },
  { id: "AUD-482142", action: "Integration retried", actor: "Devon Chen", timestamp: "22 Jun · 11:43", record: "INT-004", change: "Failed → Healthy", rationale: "Manual retry", type: "Integration" },
  { id: "AUD-482130", action: "Permission updated", actor: "Alex Kimani", timestamp: "22 Jun · 11:20", record: "ROLE-006", change: "View only → Manage", rationale: "Role review", type: "Role" },
  { id: "AUD-482119", action: "Shelter record created", actor: "Marta Silva", timestamp: "22 Jun · 10:55", record: "SHL-091", change: "New record", rationale: "Operational update", type: "Shelter" },
  { id: "AUD-482105", action: "Report exported", actor: "Devon Chen", timestamp: "22 Jun · 10:12", record: "RPT-221", change: "Generated → Exported", rationale: "Requested report", type: "Report" },
];

const inputClass = "h-11 rounded-lg border border-[#D5E3EA] bg-white px-3 text-[11px] text-[#29445A] outline-none focus:border-[#2785B2]";
const labelClass = "mb-2 block text-[10px] font-semibold text-[#34495B]";

export default function AuditLogs() {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All action types");
  const [userFilter, setUserFilter] = useState("All users");
  const [recordFilter, setRecordFilter] = useState("All record types");
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showRetention, setShowRetention] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [exportTitle, setExportTitle] = useState("Audit Export");
  const [environment, setEnvironment] = useState("Production");
  const [scope, setScope] = useState("Selected record");
  const [approvalType, setApprovalType] = useState("Standard administrator approval");
  const [rationale, setRationale] = useState("");
  const [exportSuccess, setExportSuccess] = useState(false);
  const pageSize = 5;

  const filtered = useMemo(() => records.filter((r) => {
    const q = search.toLowerCase();
    return `${r.id} ${r.action} ${r.actor} ${r.record} ${r.change} ${r.rationale}`.toLowerCase().includes(q)
      && (actionFilter === "All action types" || r.action === actionFilter)
      && (userFilter === "All users" || r.actor === userFilter)
      && (recordFilter === "All record types" || r.type === recordFilter);
  }), [records, search, actionFilter, userFilter, recordFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const downloadAuditLog = () => {
    const rows = [["Event ID", "Action", "Actor", "Timestamp", "Associated Record", "Previous to New", "Rationale", "Record Type"],
      ...filtered.map((r) => [r.id, r.action, r.actor, r.timestamp, r.record, r.change, r.rationale, r.type])];
    const csv = rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "carelink-audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const confirmExport = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rationale.trim()) return;
    // Demo UI: export the currently filtered audit records and add a local audit event.
    downloadAuditLog();
    setRecords((prev) => [{
      id: `AUD-${482200 + prev.length}`,
      action: "Audit log exported",
      actor: "Alex Kimani",
      timestamp: "Just now",
      record: "AUDIT-EXPORT",
      change: "Export requested → Completed",
      rationale: rationale.trim(),
      type: "Report",
    }, ...prev]);
    setExportSuccess(true);
    setShowExport(false);
    setRationale("");
  };

  const openExport = () => {
    setExportTitle("Audit Export");
    setScope("Selected record");
    setRationale("");
    setExportSuccess(false);
    setShowExport(true);
  };

  return (
    <main className="min-h-screen bg-[#EFF6F7] px-4 py-6 md:px-6 lg:px-7">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[9px] text-slate-500"><span>Administration</span><ChevronRight size={12}/><span className="font-semibold text-[#123B5C]">Audit Logs</span></div>
          <h1 className="text-2xl font-medium tracking-tight text-[#123B5C] md:text-[27px]">Audit Logs</h1>
          <p className="mt-2 text-xs text-slate-500">Review immutable records of user, administrative, system, and AI-related activity.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowRetention(true)} className="rounded-lg border border-[#B9D1DD] bg-white px-4 py-3 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50">Retention policy</button>
          <button onClick={openExport} className="flex items-center gap-2 rounded-lg bg-[#2785B2] px-4 py-3 text-[10px] font-semibold text-white hover:bg-[#1D6F98]"><Download size={15}/>Export audit log</button>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3 rounded-lg border border-[#D5E0E5] border-l-[3px] border-l-[#718A99] bg-[#F5F8F9] px-4 py-3">
        <LockKeyhole size={18} className="shrink-0 text-[#527185]"/>
        <div className="min-w-0 flex-1"><p className="text-[10px] font-bold text-[#344F61]">Read-only audit records</p><p className="mt-1 text-[9px] text-slate-500">Audit events cannot be edited or deleted through this interface.</p></div>
        <span className="hidden text-[9px] text-slate-500 sm:block">Retention: 7 years</span>
      </div>

      <div className="mb-4 flex flex-col gap-2 xl:flex-row">
        <div className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-lg border border-[#D7E5EA] bg-white px-3"><Search size={17} className="text-slate-400"/><input value={search} onChange={(e) => {setSearch(e.target.value);setCurrentPage(1);}} placeholder="Search event ID, action, user, or record..." className="w-full bg-transparent text-[10px] outline-none placeholder:text-slate-400"/></div>
        <select value={actionFilter} onChange={(e)=>{setActionFilter(e.target.value);setCurrentPage(1);}} className={inputClass}><option>All action types</option>{[...new Set(records.map(r=>r.action))].map(v=><option key={v}>{v}</option>)}</select>
        <select value={userFilter} onChange={(e)=>{setUserFilter(e.target.value);setCurrentPage(1);}} className={inputClass}><option>All users</option>{[...new Set(records.map(r=>r.actor))].map(v=><option key={v}>{v}</option>)}</select>
        <select value={recordFilter} onChange={(e)=>{setRecordFilter(e.target.value);setCurrentPage(1);}} className={inputClass}><option>All record types</option>{[...new Set(records.map(r=>r.type))].map(v=><option key={v}>{v}</option>)}</select>
        <button onClick={()=>setShowFilters(!showFilters)} className="h-11 rounded-lg border border-[#B9D1DD] bg-white px-4 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50">More filters</button>
      </div>
      {showFilters && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D7E5EA] bg-white p-4"><p className="text-[10px] text-slate-500">Audit records are read-only. Use the filters above to narrow the visible records.</p><button onClick={()=>{setSearch("");setActionFilter("All action types");setUserFilter("All users");setRecordFilter("All record types");setCurrentPage(1);}} className="text-[10px] font-semibold text-[#2785B2]">Clear filters</button></div>}

      <section className="overflow-visible rounded-xl border border-[#D7E5EA] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead><tr className="border-b border-[#D7E5EA] bg-[#F6F9FA] text-[9px] font-medium text-slate-500"><th className="px-3 py-3">Event ID</th><th className="px-3 py-3">Action</th><th className="px-3 py-3">Actor</th><th className="px-3 py-3">Timestamp</th><th className="px-3 py-3">Associated Record</th><th className="px-3 py-3">Previous → New</th><th className="px-3 py-3">Rationale</th><th className="px-3 py-3"></th></tr></thead>
            <tbody>{visible.map((r)=><tr key={r.id} className="border-b border-[#E5EDF1] text-[9px] text-slate-600 hover:bg-[#F8FBFC]"><td className="px-3 py-4 font-bold text-[#123B5C]">{r.id}</td><td className="px-3 py-4">{r.action}</td><td className="px-3 py-4">{r.actor}</td><td className="px-3 py-4 whitespace-nowrap">{r.timestamp}</td><td className="px-3 py-4">{r.record}</td><td className="px-3 py-4">{r.change}</td><td className="px-3 py-4"><span className="rounded-md bg-[#EDF2F5] px-2 py-1 text-[8px] font-semibold text-[#557084]">{r.rationale}</span></td><td className="relative px-3 py-4"><button onClick={()=>setMenuId(menuId===r.id?null:r.id)} aria-label={`Actions for ${r.id}`} className="rounded p-1 text-slate-500 hover:bg-slate-100"><MoreHorizontal size={17}/></button>{menuId===r.id&&<div className="absolute right-8 top-8 z-20 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-xl"><button onClick={()=>{setSelectedRecord(r);setMenuId(null);}} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[10px] hover:bg-slate-50"><Eye size={13}/>View event</button><button onClick={()=>{navigator.clipboard?.writeText(r.id);setMenuId(null);}} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[10px] hover:bg-slate-50"><Copy size={13}/>Copy event ID</button></div>}</td></tr>)}
            {visible.length===0&&<tr><td colSpan={8} className="px-4 py-12 text-center text-xs text-slate-400">No audit records match your search.</td></tr>}</tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row"><p className="text-[9px] text-slate-500">Showing {filtered.length?(currentPage-1)*pageSize+1:0}–{Math.min(currentPage*pageSize,filtered.length)} of {filtered.length===records.length?"482,194":filtered.length.toLocaleString()}</p><div className="flex items-center gap-1.5"><button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} className="rounded-lg border border-[#D7E5EA] px-3 py-2 text-[9px] text-[#2785B2] disabled:opacity-40">Previous</button>{Array.from({length:totalPages},(_,i)=>i+1).map(p=><button key={p} onClick={()=>setCurrentPage(p)} className={`rounded-lg border px-3 py-2 text-[9px] ${p===currentPage?"border-[#2785B2] bg-[#2785B2] text-white":"border-[#D7E5EA] text-[#123B5C]"}`}>{p}</button>)}<button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>Math.min(totalPages,p+1))} className="rounded-lg border border-[#B9D1DD] px-3 py-2 text-[9px] text-[#2785B2] disabled:opacity-40">Next</button></div></div>
      </section>

      {/* AUDIT EXPORT MODAL */}
      {showExport&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)setShowExport(false);}}><div className="w-full max-w-[750px] overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#D7E5EA] px-6 py-5"><div><p className="text-[9px] font-bold tracking-wider text-[#56B69E]">SECURE ADMINISTRATIVE ACTION</p><h2 className="mt-2 text-lg font-medium text-[#34495B]">Audit Export</h2></div><button onClick={()=>setShowExport(false)} aria-label="Close"><X size={20}/></button></div>
        <form onSubmit={confirmExport} className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-2"><label><span className={labelClass}>Action title <b className="text-red-500">*</b></span><input required value={exportTitle} onChange={e=>setExportTitle(e.target.value)} className={`${inputClass} w-full`}/></label><label><span className={labelClass}>Environment</span><select value={environment} onChange={e=>setEnvironment(e.target.value)} className={`${inputClass} w-full`}><option>Production</option><option>Staging</option><option>Development</option></select></label><label><span className={labelClass}>Scope</span><select value={scope} onChange={e=>setScope(e.target.value)} className={`${inputClass} w-full`}><option>Selected record</option><option>Current filtered results</option><option>All available records</option></select></label><label><span className={labelClass}>Approval type</span><select value={approvalType} onChange={e=>setApprovalType(e.target.value)} className={`${inputClass} w-full`}><option>Standard administrator approval</option><option>Dual administrator approval</option><option>Emergency approval</option></select></label></div>
          <label className="block"><span className={labelClass}>Administrative rationale <b className="text-red-500">*</b></span><textarea required value={rationale} onChange={e=>setRationale(e.target.value)} rows={4} placeholder="Explain the authorised reason for this change..." className="w-full rounded-lg border border-[#D5E3EA] p-3 text-[11px] outline-none focus:border-[#2785B2]"/></label>
          <div className="flex items-start gap-3 rounded-lg bg-[#FFF6E4] px-3 py-3 text-[9px] leading-5 text-[#94621B]"><ShieldCheck size={18} className="mt-0.5 shrink-0"/>This operation is performed locally for demonstration. In production it requires backend permission enforcement.</div>
          <div className="flex justify-end gap-2 pt-1"><button type="button" onClick={()=>setShowExport(false)} className="rounded-lg border border-[#B9D1DD] px-5 py-3 text-[10px] font-semibold text-[#2785B2]">Cancel</button><button type="submit" disabled={!rationale.trim()} className="rounded-lg bg-[#2785B2] px-5 py-3 text-[10px] font-semibold text-white disabled:opacity-40">Confirm &amp; record</button></div>
        </form>
      </div></div>}

      {/* RETENTION POLICY MODAL */}
      {showRetention&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"><div className="w-full max-w-md rounded-xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-5"><div><p className="text-[9px] font-bold tracking-wider text-[#56B69E]">AUDIT GOVERNANCE</p><h2 className="mt-1 text-lg font-medium text-[#123B5C]">Retention policy</h2></div><button onClick={()=>setShowRetention(false)} aria-label="Close"><X size={20}/></button></div><div className="space-y-4 p-5 text-[10px] text-slate-600"><div className="rounded-lg bg-[#F4F8FA] p-4"><p className="text-slate-400">Current retention period</p><p className="mt-1 text-2xl font-semibold text-[#123B5C]">7 years</p></div><p>Audit records are read-only and retained for compliance, security investigation, and operational accountability.</p><div><p className="font-semibold text-[#123B5C]">Policy controls</p><ul className="mt-2 list-disc space-y-2 pl-5"><li>Audit events cannot be edited through this interface.</li><li>Deletion and archival are managed by authorised backend policy.</li><li>Export actions should be recorded with an administrative rationale.</li></ul></div></div><div className="flex justify-end border-t p-4"><button onClick={()=>setShowRetention(false)} className="rounded-lg bg-[#2785B2] px-5 py-2.5 text-[10px] font-semibold text-white">Close</button></div></div></div>}

      {/* AUDIT EVENT DETAILS */}
      {selectedRecord&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"><div className="w-full max-w-lg rounded-xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-5"><div><p className="text-[9px] font-bold tracking-wider text-[#56B69E]">READ-ONLY AUDIT RECORD</p><h2 className="mt-1 text-lg font-medium text-[#123B5C]">{selectedRecord.id}</h2></div><button onClick={()=>setSelectedRecord(null)} aria-label="Close"><X size={20}/></button></div><div className="grid grid-cols-2 gap-5 p-5 text-[10px]">{[["Action",selectedRecord.action],["Actor",selectedRecord.actor],["Timestamp",selectedRecord.timestamp],["Associated record",selectedRecord.record],["Previous → New",selectedRecord.change],["Rationale",selectedRecord.rationale],["Record type",selectedRecord.type]].map(([k,v])=><div key={k}><p className="text-slate-400">{k}</p><p className="mt-1 font-semibold text-[#123B5C]">{v}</p></div>)}</div><div className="flex items-center gap-2 border-t p-4"><FileText size={15} className="text-[#2785B2]"/><p className="text-[9px] text-slate-500">This audit record is immutable.</p><button onClick={()=>setSelectedRecord(null)} className="ml-auto rounded-lg bg-[#2785B2] px-5 py-2.5 text-[10px] font-semibold text-white">Close</button></div></div></div>}
      {exportSuccess&&<div className="fixed bottom-5 right-5 z-[110] rounded-lg bg-[#E5F6F1] px-4 py-3 text-[10px] font-semibold text-[#16866A] shadow-lg">Audit export completed in demo mode.</div>}
    </main>
  );
}
