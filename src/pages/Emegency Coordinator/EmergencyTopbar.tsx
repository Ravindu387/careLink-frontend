import { useState, useEffect, useRef } from "react";
import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronRight,
  Menu,
  CheckCheck,
  PhoneCall,
  X,
  ExternalLink,
  MapPin,
  Clock,
  Radio,
  FileQuestion,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  emergencyTopbarService,
  type EmergencyTopbarState,
  type GlobalSearchResult,
} from "../../services/emergencyTopbarService";

interface EmergencyTopbarProps {
  onMenuClick: () => void;
}

export default function EmergencyTopbar({ onMenuClick }: EmergencyTopbarProps) {
  const navigate = useNavigate();

  const [topbarState, setTopbarState] = useState<EmergencyTopbarState | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const langContainerRef = useRef<HTMLDivElement>(null);

  // Load state on mount & periodically
  useEffect(() => {
    let isMounted = true;
    const fetchState = () => {
      emergencyTopbarService
        .getState()
        .then((data) => {
          if (isMounted) setTopbarState(data);
        })
        .catch(() => {});
    };

    fetchState();
    const interval = setInterval(fetchState, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setShowSearchDropdown(false);
        setNotificationsOpen(false);
        setHelpModalOpen(false);
        setLangMenuOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      emergencyTopbarService
        .searchGlobal(searchQuery)
        .then((res) => {
          setSearchResults(res);
          setShowSearchDropdown(true);
        })
        .finally(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (langContainerRef.current && !langContainerRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSearchResult = (result: GlobalSearchResult) => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    navigate(result.url);
  };

  const handleMarkNotificationRead = async (id: string, actionUrl?: string) => {
    await emergencyTopbarService.markNotificationRead(id);
    setTopbarState((prev) => {
      if (!prev) return null;
      const updated = prev.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        ...prev,
        notifications: updated,
        unreadNotificationCount: Math.max(0, updated.filter((n) => !n.isRead).length),
      };
    });
    if (actionUrl) {
      setNotificationsOpen(false);
      navigate(actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    await emergencyTopbarService.markAllNotificationsRead();
    setTopbarState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        unreadNotificationCount: 0,
        notifications: prev.notifications.map((n) => ({ ...n, isRead: true })),
      };
    });
  };

  const handleSelectLanguage = async (code: string) => {
    setLangMenuOpen(false);
    const updated = await emergencyTopbarService.updateLanguage(code);
    setTopbarState((prev) => (prev ? { ...prev, selectedLanguage: updated } : null));
  };

  const operationalArea = topbarState?.operationalArea ?? "Greater Riverton";
  const unreadCount = topbarState?.unreadNotificationCount ?? 0;
  const notifications = topbarState?.notifications ?? [];
  const helplines = topbarState?.helplines ?? [];
  const selectedLang = topbarState?.selectedLanguage ?? "EN";
  const coordinatorInitials = topbarState?.coordinatorInitials ?? "AM";
  const coordinatorName = topbarState?.coordinatorName ?? "Amina M.";
  const dutyStatus = topbarState?.dutyStatus ?? "On Duty";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
        {/* Global Search Bar */}
        <div ref={searchContainerRef} className="relative flex min-w-0 flex-1 items-center gap-3">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open sidebar menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex w-full max-w-[430px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition-all focus-within:border-[#287da5] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#287da5]/30">
            <Search size={15} className="shrink-0 text-slate-400" />

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) {
                  setSearchResults([]);
                  setShowSearchDropdown(false);
                }
              }}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
              placeholder="Search incidents, requests, locations, teams..."
              className="w-full min-w-0 bg-transparent text-[11px] outline-none placeholder:text-slate-400"
            />

            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchDropdown(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            ) : (
              <span className="hidden rounded border border-slate-200 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 sm:block">
                ⌘ K
              </span>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && (
            <div className="absolute left-0 top-[52px] z-50 w-full max-w-[460px] rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Search Results</span>
                {isSearching && <span className="text-[10px] text-[#287da5] animate-pulse">Searching...</span>}
              </div>

              <div className="max-h-[340px] overflow-y-auto p-1.5">
                {searchResults.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <FileQuestion size={24} className="mx-auto mb-1.5 text-slate-300" />
                    No active records match &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={`${item.category}-${item.id}`}
                      onClick={() => handleSelectSearchResult(item)}
                      className="group flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-[#edf4f7]"
                    >
                      <span className="mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 group-hover:bg-[#287da5] group-hover:text-white transition-colors">
                        {item.category}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-[#153f5e]">
                            {item.title}
                          </p>
                          <span className="ml-2 shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{item.subtitle}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions & Controls */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Operational Area Badge */}
          <div
            onClick={() => navigate("/emergency-coordinator/live-map")}
            className="hidden cursor-pointer text-right transition-opacity hover:opacity-80 md:block"
            title="Current Command Sector"
          >
            <p className="text-[8px] font-bold tracking-wider text-slate-400">OPERATIONAL AREA</p>
            <p className="text-[10px] font-bold text-[#153f5e] flex items-center justify-end gap-1">
              <MapPin size={10} className="text-[#287da5]" />
              {operationalArea}
            </p>
          </div>

          <ChevronRight size={16} className="hidden text-slate-400 md:block" />

          {/* Language Switcher */}
          <div ref={langContainerRef} className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Change Language"
            >
              <Globe size={16} />
              <span className="text-[9px] font-bold">{selectedLang}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 top-[44px] z-50 w-28 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {[
                  { code: "EN", name: "English" },
                  { code: "SI", name: "සිංහල" },
                  { code: "TA", name: "தமிழ்" },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => handleSelectLanguage(l.code)}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-[#edf4f7] ${
                      selectedLang === l.code ? "font-bold text-[#287da5]" : "text-slate-700"
                    }`}
                  >
                    <span>{l.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{l.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Hotline / Help Button */}
          <button
            onClick={() => setHelpModalOpen(true)}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Emergency Command Helplines"
          >
            <CircleHelp size={16} />
          </button>

          {/* Notifications Bell & Flyout */}
          <div ref={notifContainerRef} className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Incident & Operations Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[8px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Flyout */}
            {notificationsOpen && (
              <div className="absolute right-0 top-[48px] z-50 w-[360px] rounded-xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#153f5e]">Live Alerts & Broadcasts</span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.2 text-[9px] font-bold text-red-700">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-[10px] font-medium text-[#287da5] hover:text-[#153f5e] transition-colors"
                    >
                      <CheckCheck size={12} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications recorded
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 transition-colors ${
                          notif.isRead ? "bg-white" : "bg-[#edf4f7]/50"
                        } hover:bg-slate-50`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                notif.severity === "Critical"
                                  ? "bg-red-500"
                                  : notif.severity === "Warning"
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                              }`}
                            />
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                              {notif.category}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[9px] text-slate-400">
                            <Clock size={10} />
                            {notif.timeAgo}
                          </span>
                        </div>

                        <h4
                          onClick={() => handleMarkNotificationRead(notif.id, notif.actionUrl)}
                          className="mt-1 cursor-pointer text-xs font-semibold text-slate-800 hover:text-[#287da5] transition-colors leading-snug"
                        >
                          {notif.title}
                        </h4>
                        <p className="mt-0.5 text-[10px] text-slate-600 leading-relaxed">
                          {notif.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          {notif.actionUrl && (
                            <button
                              onClick={() => handleMarkNotificationRead(notif.id, notif.actionUrl)}
                              className="flex items-center gap-1 text-[9px] font-bold text-[#287da5] hover:underline"
                            >
                              <span>{notif.actionLabel ?? "Take Action"}</span>
                              <ExternalLink size={10} />
                            </button>
                          )}
                          {!notif.isRead && (
                            <button
                              onClick={() => handleMarkNotificationRead(notif.id)}
                              className="ml-auto text-[9px] text-slate-400 hover:text-slate-600"
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 border-l border-slate-200 pl-3 text-left transition-opacity hover:opacity-90"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#287da5] text-[10px] font-bold text-white shadow-xs">
                {coordinatorInitials}
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500"
                  title={dutyStatus}
                />
              </div>

              <div className="hidden sm:block">
                <p className="text-[10px] font-semibold text-[#153f5e]">{coordinatorName}</p>
                <p className="text-[9px] text-slate-400">{dutyStatus}</p>
              </div>

              <ChevronRight size={15} className="hidden text-slate-500 sm:block" />
            </button>

            {/* Profile Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute right-0 top-[48px] z-50 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl text-xs">
                <div className="border-b border-slate-100 p-2">
                  <p className="font-bold text-[#153f5e]">{coordinatorName}</p>
                  <p className="text-[10px] text-slate-500">Status: {dutyStatus}</p>
                  <p className="text-[9px] text-[#287da5] font-mono mt-0.5">Area: {operationalArea}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate("/emergency-coordinator/settings");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-slate-700 hover:bg-[#edf4f7]"
                  >
                    <UserCheck size={14} className="text-[#287da5]" />
                    Settings & Profile
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate("/login");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-red-600 hover:bg-red-50"
                  >
                    <X size={14} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Emergency Helpline Hotline Reference Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-red-100 p-2 text-red-700">
                  <PhoneCall size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#153f5e]">
                    Emergency Operations Helplines
                  </h3>
                  <p className="text-xs text-slate-500">
                    24/7 National Emergency Command & First Responder Contacts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-4 divide-y divide-slate-100">
              {helplines.map((line) => (
                <div key={line.number} className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{line.name}</span>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                        24x7 Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{line.description}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{line.department}</p>
                  </div>
                  <a
                    href={`tel:${line.number}`}
                    className="ml-4 flex items-center gap-1.5 rounded-lg bg-[#153f5e] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#287da5] transition-colors"
                  >
                    <Radio size={13} className="text-emerald-400" />
                    <span>{line.number}</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-[10px] text-slate-400">
                Direct EOC link encrypted via ReliefOS Telemetry.
              </span>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="rounded-lg bg-[#287da5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#153f5e]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
