/**
 * Standardized CareLink Sidebar & Topbar visual design tokens.
 * Ensures all 9 role dashboards share an identical visual shell
 * and enterprise-grade Inter typography scale while preserving
 * each role's distinct menus, routes, and functionality.
 */
export const SIDEBAR_THEME = {
  widthExpanded: "w-[288px]",
  widthCollapsed: "w-[76px]",
  asideBase:
    "fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden bg-[#153E5D] text-white border-r border-white/10 transition-all duration-300",
  overlay: "fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden",
  header:
    "flex h-[68px] shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3.5",
  logoBadge:
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#63BDA6] text-[#153E5D] shadow-sm",
  brandTitle:
    "truncate text-[17px] font-bold leading-tight tracking-tight text-white",
  brandSubtitle: "mt-0.5 truncate text-xs font-medium tracking-tight text-[#A9C8DD]",
  collapseBtn:
    "hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#A9C8DD] transition hover:bg-white/15 hover:text-white lg:flex",
  mobileCloseBtn:
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden",
  statusCardWrapper: "shrink-0 px-3.5 pt-3.5 pb-1",
  statusCard:
    "rounded-xl border border-white/10 bg-white/[0.07] p-3 transition hover:bg-white/[0.11]",
  statusIndicatorRow: "mb-1.5 flex items-center justify-between gap-2",
  statusDot: "h-2 w-2 shrink-0 rounded-full bg-[#63BDA6]",
  statusLabel:
    "text-xs font-bold uppercase tracking-wider text-[#63BDA6]",
  statusTitle: "text-sm font-bold leading-snug text-white truncate",
  statusSubtitle: "mt-1 text-xs text-[#A9C8DD] truncate",
  navScroll:
    "min-h-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30",
  sectionHeadingBtn:
    "mb-2 flex w-full items-center justify-between px-3 text-xs font-bold uppercase tracking-[0.08em] text-[#8BAFC5] transition hover:text-white",
  sectionHeadingLabel:
    "mb-2 px-3 text-xs font-bold uppercase tracking-[0.08em] text-[#8BAFC5]",
  menuList: "space-y-1 pb-6",
  menuItemBase:
    "group relative flex min-h-[42px] w-full items-center justify-between gap-3 rounded-lg border-l-[3px] px-3 py-2 text-left text-sm transition-all duration-200",
  menuItemActive:
    "border-[#63BDA6] bg-[#287DA6] font-semibold text-white shadow-sm",
  menuItemInactive:
    "border-transparent font-medium text-[#D1E1EC] hover:bg-white/10 hover:text-white",
  iconActive: "shrink-0 text-white",
  iconInactive: "shrink-0 text-[#B8D0DF] group-hover:text-white",
  badge:
    "ml-auto flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#E64D5A] px-1.5 text-xs font-semibold text-white shadow-xs",
  footer: "shrink-0 border-t border-white/10 p-3.5",
  profileRow: "flex items-center gap-3 rounded-lg p-1.5",
  avatar:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#287DA6] text-xs font-bold text-white shadow-xs",
  userName: "truncate text-sm font-semibold text-white",
  userRole: "mt-0.5 truncate text-xs text-[#A9C8DD]",
  signOutBtn:
    "mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-2 text-sm font-semibold text-white transition hover:border-rose-400/30 hover:bg-rose-500/20 hover:text-rose-100",
} as const;

export const TOPBAR_THEME = {
  header:
    "sticky top-0 z-30 flex h-[68px] w-full shrink-0 items-center justify-between gap-4 border-b border-[#D5E3E9] bg-white px-4 sm:px-6",
  leftSection: "flex min-w-0 flex-1 items-center gap-3",
  mobileMenuBtn:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D5E3E9] text-[#153E5D] transition hover:bg-[#F5F9FB] lg:hidden",
  searchContainer:
    "relative flex h-[40px] w-full max-w-[460px] items-center gap-2.5 rounded-lg border border-[#D5E3E9] bg-[#F8FAFB] px-3 transition-all focus-within:border-[#287DA6] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#287DA6]/15",
  searchInput:
    "w-full min-w-0 bg-transparent text-sm text-[#153E5D] outline-none placeholder:text-[#8296AA]",
  searchShortcut:
    "hidden shrink-0 rounded border border-[#D5E3E9] bg-white px-1.5 py-0.5 font-mono text-xs text-[#8296AA] sm:block",
  rightSection: "flex shrink-0 items-center gap-2 sm:gap-2.5",
  contextBlock:
    "hidden items-center gap-2 border-r border-[#D5E3E9] pr-3.5 text-right md:flex",
  contextLabel:
    "text-xs font-semibold uppercase tracking-wider text-[#8296AA]",
  contextValue: "mt-0.5 text-[13px] font-bold text-[#153E5D]",
  actionBtn:
    "flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D5E3E9] bg-white px-3 text-sm font-semibold text-[#45647D] transition hover:bg-[#F5F9FB] hover:text-[#153E5D]",
  iconBtn:
    "relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#D5E3E9] bg-white text-[#45647D] transition hover:bg-[#F5F9FB] hover:text-[#153E5D]",
  notifBadge:
    "absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#E64D5A] px-1 text-xs font-semibold text-white shadow-xs",
  profileDivider: "relative border-l border-[#D5E3E9] pl-2.5 sm:pl-3",
  profileTrigger:
    "flex items-center gap-2.5 rounded-lg p-1 text-left transition hover:bg-[#F5F9FB]",
  avatar:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#287DA6] text-xs font-bold text-white shadow-xs",
  userName: "text-sm font-semibold leading-tight text-[#153E5D]",
  userRole: "mt-0.5 text-xs font-medium text-[#8296AA]",
  dropdownMenu:
    "absolute right-0 top-12 z-50 w-56 rounded-xl border border-[#D5E3E9] bg-white p-2 shadow-xl",
  dropdownHeader: "border-b border-slate-100 px-3 py-2",
  dropdownItem:
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-[#F5F9FB] hover:text-[#153E5D]",
  dropdownSignOut:
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50",
} as const;

export function getUserInitials(name?: string | null, fallback = "U"): string {
  if (!name || !name.trim()) return fallback;
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || fallback
  );
}
