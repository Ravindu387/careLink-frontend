import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Users,
  BriefcaseBusiness,
  Database,
  ChartNoAxesCombined,
  Settings,
  Search,
  Plus,
  Download,
  MoreHorizontal,
  ChevronRight,
  X,
  Check,
  LockKeyhole,
  Eye,
  Copy,
} from "lucide-react";

type RoleStatus = "Protected" | "Active" | "Inactive";

type Role = {
  id: string;
  name: string;
  purpose: string;
  users: number;
  permissions: number;
  organisations: number;
  status: RoleStatus;
  type: string;
};

const initialRoles: Role[] = [
  { id: "ROLE-001", name: "System Administrator", purpose: "Full system administration", users: 8, permissions: 12, organisations: 6, status: "Protected", type: "System" },
  { id: "ROLE-002", name: "Emergency Coordinator", purpose: "Cross-operation coordination", users: 142, permissions: 10, organisations: 9, status: "Active", type: "Operational" },
  { id: "ROLE-003", name: "Case Manager", purpose: "Assistance case management", users: 384, permissions: 7, organisations: 4, status: "Active", type: "Operational" },
  { id: "ROLE-004", name: "Resource Manager", purpose: "Inventory and logistics", users: 96, permissions: 8, organisations: 5, status: "Active", type: "Operational" },
  { id: "ROLE-005", name: "Shelter Administrator", purpose: "Shelter operations", users: 128, permissions: 7, organisations: 4, status: "Active", type: "Operational" },
  { id: "ROLE-006", name: "Volunteer Coordinator", purpose: "Volunteer operations", users: 74, permissions: 6, organisations: 3, status: "Active", type: "Operational" },
  { id: "ROLE-007", name: "Field Officer", purpose: "Field assessments and updates", users: 215, permissions: 6, organisations: 7, status: "Active", type: "Operational" },
  { id: "ROLE-008", name: "Citizen", purpose: "Public portal access", users: 18482, permissions: 4, organisations: 1, status: "Active", type: "Public" },
  { id: "ROLE-009", name: "Auditor", purpose: "Read-only compliance access", users: 12, permissions: 5, organisations: 2, status: "Active", type: "System" },
];

const permissionCategories = [
  { name: "Identity & users", count: 8, icon: Users, permissions: ["View users", "Create users", "Edit user profiles", "Disable accounts", "Reset passwords", "Manage user verification", "Assign roles", "View user activity"] },
  { name: "Cases & decisions", count: 12, icon: ShieldCheck, permissions: ["View assistance cases", "Create cases", "Edit cases", "Assign cases", "Change case priority", "Approve recommendations", "Reject recommendations", "Close cases"] },
  { name: "Organisations", count: 6, icon: BriefcaseBusiness, permissions: ["View organisations", "Register organisations", "Edit organisation details", "Verify organisations", "Suspend organisations", "Manage memberships"] },
  { name: "Resources & data", count: 10, icon: Database, permissions: ["View inventory", "Manage inventory", "Manage shelters", "View resource requests", "Approve resource allocation", "Export operational data"] },
  { name: "Reports & exports", count: 7, icon: ChartNoAxesCombined, permissions: ["View reports", "Generate reports", "Export reports", "View audit reports", "Schedule reports"] },
  { name: "System configuration", count: 9, icon: Settings, permissions: ["View system settings", "Edit system settings", "Manage integrations", "View security events", "Manage notifications", "View audit logs"] },
];

function StatusBadge({ status }: { status: RoleStatus }) {
  const style =
    status === "Protected"
      ? "bg-[#F1ECFC] text-[#7653B8]"
      : status === "Active"
        ? "bg-[#E5F6F1] text-[#16866A]"
        : "bg-slate-100 text-slate-500";
  return <span className={`rounded-md px-2.5 py-1 text-[9px] font-semibold ${style}`}>{status}</span>;
}

export default function RolesPermissions() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All role types");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<(typeof permissionCategories)[number] | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [detailRole, setDetailRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [rolePurpose, setRolePurpose] = useState("");
  const [roleType, setRoleType] = useState("Operational");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filteredRoles = useMemo(() => roles.filter((role) => {
    const matchesSearch = `${role.id} ${role.name} ${role.purpose}`.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "All role types" || role.type === typeFilter;
    const matchesStatus = statusFilter === "All statuses" || role.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  }), [roles, search, typeFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / pageSize));
  const visibleRoles = filteredRoles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const createRole = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!roleName.trim() || selectedPermissions.length === 0) return;
    const newRole: Role = {
      id: `ROLE-${String(Math.max(0, ...roles.map((r) => Number(r.id.split("-")[1]))) + 1).padStart(3, "0")}`,
      name: roleName.trim(),
      purpose: rolePurpose.trim() || "Custom platform role",
      users: 0,
      permissions: selectedPermissions.length,
      organisations: 0,
      status: "Active",
      type: roleType,
    };
    setRoles((previous) => [...previous, newRole]);
    setShowCreateModal(false);
    setRoleName("");
    setRolePurpose("");
    setRoleType("Operational");
    setSelectedPermissions([]);
    setSearch("");
    setTypeFilter("All role types");
    setStatusFilter("All statuses");
    setCurrentPage(Math.ceil((roles.length + 1) / pageSize));
  };

  const exportMatrix = () => {
    const rows = [["Role ID", "Role Name", "Purpose", "Assigned Users", "Permissions", "Organisations", "Status"], ...roles.map((r) => [r.id, r.name, r.purpose, r.users, r.permissions, r.organisations, r.status])];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "carelink-roles-permissions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions((current) => current.includes(permission) ? current.filter((p) => p !== permission) : [...current, permission]);
  };

  return (
    <main className="min-h-screen bg-[#EFF6F7] px-4 py-6 md:px-6 lg:px-7">
      <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[9px] text-slate-500">
            <span>Administration</span><ChevronRight size={12} />
            <span className="font-semibold text-[#123B5C]">Roles &amp; Permissions</span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-[#123B5C] md:text-[26px]">Roles &amp; Permissions</h1>
          <p className="mt-2 text-xs text-slate-500">Define least-privilege access and review effective permissions across the platform.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportMatrix} className="flex items-center gap-2 rounded-lg border border-[#B9D1DD] bg-white px-4 py-3 text-[10px] font-semibold text-[#2785B2] hover:bg-sky-50"><Download size={14} />Export matrix</button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-lg bg-[#2785B2] px-4 py-3 text-[10px] font-semibold text-white hover:bg-[#1D6F98]"><Plus size={15} />Create role</button>
        </div>
      </div>

      <div className="mb-4 flex items-start gap-3 rounded-lg border border-[#D9C9F5] border-l-[3px] border-l-[#8060C8] bg-[#F4EFFC] px-4 py-3">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#7653B8]" />
        <div><p className="text-[10px] font-bold text-[#60449A]">Role changes require authorised review</p><p className="mt-1 text-[9px] text-[#806BA8]">Protected system roles cannot be deleted or assigned through public registration.</p></div>
      </div>

      <div className="mb-4 flex flex-col gap-2 xl:flex-row">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-lg border border-[#D7E5EA] bg-white px-3">
          <Search size={16} className="text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Search role name or permission..." className="w-full bg-transparent text-[10px] outline-none placeholder:text-slate-400" />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} className="h-10 rounded-lg border border-[#D7E5EA] bg-white px-3 text-[10px] outline-none"><option>All role types</option><option>System</option><option>Operational</option><option>Public</option></select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="h-10 rounded-lg border border-[#D7E5EA] bg-white px-3 text-[10px] outline-none"><option>All statuses</option><option>Protected</option><option>Active</option><option>Inactive</option></select>
        <button onClick={() => setShowMoreFilters(!showMoreFilters)} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#B9D1DD] bg-white px-4 text-[10px] font-medium text-[#2785B2] hover:bg-sky-50">More filters</button>
      </div>

      {showMoreFilters && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#D7E5EA] bg-white p-4"><p className="text-[10px] text-slate-500">Filter roles by type and current status using the selectors above.</p><button onClick={() => { setSearch(""); setTypeFilter("All role types"); setStatusFilter("All statuses"); setCurrentPage(1); }} className="text-[10px] font-semibold text-[#2785B2]">Clear filters</button></div>}

      <section className="overflow-visible rounded-xl border border-[#D7E5EA] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div><h2 className="text-xs font-semibold text-[#123B5C]">Configured roles</h2><p className="mt-1 text-[9px] text-slate-400">{roles.length} system roles · 3 protected</p></div>
          <button onClick={() => setShowMatrix(true)} className="rounded-lg border border-[#B9D1DD] px-4 py-2.5 text-[9px] font-medium text-[#2785B2] hover:bg-sky-50">Permission matrix</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead><tr className="border-y border-[#D7E5EA] bg-[#F6F9FA] text-[9px] font-medium text-slate-500">
              <th className="px-3 py-3">Role ID</th><th className="px-3 py-3">Role Name</th><th className="px-3 py-3">Purpose</th><th className="px-3 py-3">Assigned Users</th><th className="px-3 py-3">Permissions</th><th className="px-3 py-3">Organisations</th><th className="px-3 py-3">Status</th><th className="px-3 py-3"></th>
            </tr></thead>
            <tbody>
              {visibleRoles.map((role) => <tr key={role.id} className="border-b border-[#E5EDF1] text-[9px] text-slate-600 hover:bg-[#F8FBFC]">
                <td className="px-3 py-4 font-bold text-[#123B5C]">{role.id}</td><td className="px-3 py-4 font-medium text-[#315C7B]">{role.name}</td><td className="px-3 py-4">{role.purpose}</td><td className="px-3 py-4">{role.users.toLocaleString()}</td><td className="px-3 py-4">{role.permissions}</td><td className="px-3 py-4">{role.organisations}</td><td className="px-3 py-4"><StatusBadge status={role.status} /></td>
                <td className="relative px-3 py-4"><button onClick={() => setMenuId(menuId === role.id ? null : role.id)} aria-label={`Actions for ${role.name}`} className="rounded p-1 text-slate-500 hover:bg-slate-100"><MoreHorizontal size={17} /></button>
                  {menuId === role.id && <div className="absolute right-8 top-8 z-20 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-xl">
                    <button onClick={() => { setDetailRole(role); setMenuId(null); }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[10px] hover:bg-slate-50"><Eye size={13} />View role</button>
                    <button onClick={() => { setRoleName(role.name); setRolePurpose(role.purpose); setRoleType(role.type); setSelectedPermissions([]); setShowCreateModal(true); setMenuId(null); }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[10px] hover:bg-slate-50"><Copy size={13} />Use as template</button>
                    {role.status !== "Protected" && <button onClick={() => { setRoles((current) => current.map((r) => r.id === role.id ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r)); setMenuId(null); }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[10px] hover:bg-slate-50"><LockKeyhole size={13} />{role.status === "Active" ? "Deactivate" : "Activate"}</button>}
                  </div>}
                </td>
              </tr>)}
              {visibleRoles.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-xs text-slate-400">No roles found. Try another search or filter.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row"><p className="text-[9px] text-slate-500">Showing {filteredRoles.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredRoles.length)} of {filteredRoles.length}</p><div className="flex items-center gap-1.5"><button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="rounded-lg border border-[#D7E5EA] px-3 py-2 text-[9px] text-[#2785B2] disabled:opacity-40">Previous</button>{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => <button key={page} onClick={() => setCurrentPage(page)} className={`rounded-lg border px-3 py-2 text-[9px] ${currentPage === page ? "border-[#2785B2] bg-[#2785B2] text-white" : "border-[#D7E5EA] text-[#123B5C]"}`}>{page}</button>)}<button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="rounded-lg border border-[#B9D1DD] px-3 py-2 text-[9px] text-[#2785B2] disabled:opacity-40">Next</button></div></div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-xs font-medium text-[#123B5C]">Permission categories</h2>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
          {permissionCategories.map((category) => { const Icon = category.icon; return <button key={category.name} onClick={() => setSelectedCategory(category)} className="flex items-center gap-3 rounded-xl border border-[#D7E5EA] bg-white p-3 text-left shadow-sm transition hover:border-[#91C5D8] hover:shadow-md">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E8F2F8] text-[#2785B2]"><Icon size={18} /></span><span className="min-w-0 flex-1"><span className="block text-[9px] font-bold text-[#123B5C]">{category.name}</span><span className="mt-1 block text-[9px] text-slate-400">{category.count} permissions</span></span><ChevronRight size={17} className="text-[#123B5C]" />
          </button>; })}
        </div>
      </section>

      {/* CREATE ROLE MODAL */}
      {showCreateModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
        <div className="max-h-[92vh] w-full max-w-[700px] overflow-y-auto rounded-xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><p className="text-[9px] font-bold tracking-wider text-[#56B69E]">SECURE ADMINISTRATIVE ACTION</p><h2 className="mt-2 text-lg font-medium text-[#34495B]">Create role</h2></div><button onClick={() => setShowCreateModal(false)} aria-label="Close"><X size={20} /></button></div>
          <form onSubmit={createRole} className="space-y-5 p-6">
            <div className="grid gap-4 md:grid-cols-2"><label className="text-[10px] font-semibold text-[#34495B]">Role name *<input required value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="Enter role name" className="mt-2 h-11 w-full rounded-lg border border-[#D5E3EA] px-3 text-[11px] font-normal outline-none focus:border-[#2785B2]" /></label><label className="text-[10px] font-semibold text-[#34495B]">Role type<select value={roleType} onChange={(e) => setRoleType(e.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#D5E3EA] bg-white px-3 text-[11px] font-normal outline-none"><option>Operational</option><option>System</option><option>Public</option></select></label></div>
            <label className="block text-[10px] font-semibold text-[#34495B]">Purpose / description<textarea value={rolePurpose} onChange={(e) => setRolePurpose(e.target.value)} rows={2} placeholder="Describe what this role is responsible for..." className="mt-2 w-full rounded-lg border border-[#D5E3EA] p-3 text-[11px] font-normal outline-none focus:border-[#2785B2]" /></label>
            <div><div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-semibold text-[#34495B]">Assign permissions *</p><span className="text-[9px] text-slate-400">{selectedPermissions.length} selected</span></div><div className="max-h-64 space-y-3 overflow-y-auto rounded-lg border border-[#D5E3EA] p-3">{permissionCategories.map((category) => <div key={category.name}><p className="mb-2 text-[10px] font-bold text-[#2785B2]">{category.name}</p><div className="grid gap-2 sm:grid-cols-2">{category.permissions.map((permission) => <label key={permission} className="flex items-center gap-2 text-[10px] text-slate-600"><input type="checkbox" checked={selectedPermissions.includes(permission)} onChange={() => togglePermission(permission)} className="accent-[#2785B2]" />{permission}</label>)}</div></div>)}</div></div>
            <div className="flex items-start gap-2 rounded-lg bg-[#F4EFFC] p-3 text-[9px] leading-5 text-[#7653B8]"><ShieldCheck size={16} className="mt-0.5 shrink-0" />Assign only the permissions required for this role. Protected system roles cannot be modified here.</div>
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowCreateModal(false)} className="rounded-lg border border-[#C7D8E2] px-5 py-3 text-[10px] font-semibold text-[#2785B2]">Cancel</button><button type="submit" disabled={!roleName.trim() || selectedPermissions.length === 0} className="rounded-lg bg-[#2785B2] px-5 py-3 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Create role</button></div>
          </form>
        </div>
      </div>}

      {/* PERMISSION MATRIX MODAL */}
      {showMatrix && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"><div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-5"><div><p className="text-[9px] font-bold tracking-wider text-[#56B69E]">ACCESS CONTROL</p><h2 className="mt-1 text-lg font-medium text-[#123B5C]">Permission matrix</h2></div><button onClick={() => setShowMatrix(false)} aria-label="Close"><X size={20} /></button></div><div className="max-h-[70vh] overflow-auto p-5"><table className="w-full min-w-[700px] text-left"><thead><tr className="bg-[#F6F9FA] text-[9px] text-slate-500"><th className="p-3">Role</th>{permissionCategories.map((c) => <th key={c.name} className="p-3">{c.name}</th>)}</tr></thead><tbody>{roles.map((role) => <tr key={role.id} className="border-b text-[9px] text-slate-600"><td className="p-3 font-semibold text-[#123B5C]">{role.name}</td>{permissionCategories.map((category, index) => <td key={category.name} className="p-3"><span className={index < Math.min(3, Math.ceil(role.permissions / 3)) ? "text-emerald-600" : "text-slate-300"}>{index < Math.min(3, Math.ceil(role.permissions / 3)) ? <Check size={15} /> : "—"}</span></td>)}</tr>)}</tbody></table></div><div className="flex justify-end border-t p-4"><button onClick={() => setShowMatrix(false)} className="rounded-lg bg-[#2785B2] px-5 py-2.5 text-[10px] font-semibold text-white">Close</button></div></div></div>}

      {/* CATEGORY PERMISSIONS MODAL */}
      {selectedCategory && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"><div className="w-full max-w-lg rounded-xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-5"><div><p className="text-[9px] font-bold tracking-wider text-[#56B69E]">PERMISSION CATEGORY</p><h2 className="mt-1 text-lg font-medium text-[#123B5C]">{selectedCategory.name}</h2></div><button onClick={() => setSelectedCategory(null)} aria-label="Close"><X size={20} /></button></div><div className="space-y-3 p-5">{selectedCategory.permissions.map((permission) => <div key={permission} className="flex items-center gap-2 rounded-lg border border-[#E5EDF1] p-3 text-[10px] text-slate-600"><ShieldCheck size={15} className="text-[#2785B2]" />{permission}</div>)}</div><div className="flex justify-end border-t p-4"><button onClick={() => setSelectedCategory(null)} className="rounded-lg bg-[#2785B2] px-5 py-2.5 text-[10px] font-semibold text-white">Close</button></div></div></div>}

      {/* ROLE DETAILS MODAL */}
      {detailRole && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102B40]/55 p-4"><div className="w-full max-w-md rounded-xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-5"><div><p className="text-[9px] font-bold tracking-wider text-[#56B69E]">ROLE DETAILS</p><h2 className="mt-1 text-lg font-medium text-[#123B5C]">{detailRole.name}</h2></div><button onClick={() => setDetailRole(null)} aria-label="Close"><X size={20} /></button></div><div className="grid grid-cols-2 gap-5 p-5 text-[10px]"><div><p className="text-slate-400">Role ID</p><p className="mt-1 font-semibold text-[#123B5C]">{detailRole.id}</p></div><div><p className="text-slate-400">Role type</p><p className="mt-1 font-semibold text-[#123B5C]">{detailRole.type}</p></div><div><p className="text-slate-400">Purpose</p><p className="mt-1 font-semibold text-[#123B5C]">{detailRole.purpose}</p></div><div><p className="text-slate-400">Assigned users</p><p className="mt-1 font-semibold text-[#123B5C]">{detailRole.users.toLocaleString()}</p></div><div><p className="text-slate-400">Permissions</p><p className="mt-1 font-semibold text-[#123B5C]">{detailRole.permissions}</p></div><div><p className="text-slate-400">Organisations</p><p className="mt-1 font-semibold text-[#123B5C]">{detailRole.organisations}</p></div><div><p className="text-slate-400">Status</p><div className="mt-1"><StatusBadge status={detailRole.status} /></div></div></div><div className="flex justify-end border-t p-4"><button onClick={() => setDetailRole(null)} className="rounded-lg bg-[#2785B2] px-5 py-2.5 text-[10px] font-semibold text-white">Close</button></div></div></div>}
    </main>
  );
}
