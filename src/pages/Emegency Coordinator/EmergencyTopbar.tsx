import { useState, useEffect, useRef } from "react";
import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronDown,
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
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  emergencyTopbarService,
  type EmergencyTopbarState,
  type GlobalSearchResult,
} from "../../services/emergencyTopbarService";
import { TOPBAR_THEME, getUserInitials } from "../../constants/layoutTheme";

interface EmergencyTopbarProps {
  onMenuClick: () => void;
}

export default function EmergencyTopbar({ onMenuClick }: EmergencyTopbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [topbarState, setTopbarState] =
    useState<EmergencyTopbarState | null>(null);
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
      if (
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        langContainerRef.current &&
        !langContainerRef.current.contains(e.target as Node)
      ) {
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
        unreadNotificationCount: Math.max(
          0,
          updated.filter((n) => !n.isRead).length
        ),
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
    setTopbarState((prev) =>
      prev ? { ...prev, selectedLanguage: updated } : null
    );
  };

  const operationalArea = topbarState?.operationalArea ?? "Greater Riverton";
  const unreadCount = topbarState?.unreadNotificationCount ?? 0;
  const notifications = topbarState?.notifications ?? [];
  const helplines = topbarState?.helplines ?? [];
  const selectedLang = topbarState?.selectedLanguage ?? "EN";
  const coordinatorName =
    user?.fullName || topbarState?.coordinatorName || "Amina M.";
  const coordinatorInitials = getUserInitials(
    coordinatorName,
    topbarState?.coordinatorInitials ?? "AM"
  );
  const dutyStatus = topbarState?.dutyStatus ?? "On Duty";

  return (
    <>
      <header className={TOPBAR_THEME.header}>
        {/* Global Search Bar */}
        <div
          ref={searchContainerRef}
          className={`relative ${TOPBAR_THEME.leftSection}`}
        >
          <button
            type="button"
            onClick={onMenuClick}
            className={TOPBAR_THEME.mobileMenuBtn}
            aria-label="Open sidebar menu"
          >
            <Menu size={19} />
          </button>

          <div className={TOPBAR_THEME.searchContainer}>
            <Search size={16} className="shrink-0 text-[#8296AA]" />

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
              className={TOPBAR_THEME.searchInput}
            />

            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchDropdown(false);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            ) : (
              <span className={TOPBAR_THEME.searchShortcut}>⌘ K</span>
            )}
          </div>

          {/* Search Dropdown Results */}
          {showSearchDropdown && (
            <div className="absolute left-0 top-[52px] z-50 w-full max-w-[460px] rounded-xl border border-[#D5E3E9] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Search Results</span>
                {isSearching && (
                  <span className="animate-pulse text-sm text-[#287DA6]">
                    Searching...
                  </span>
                )}
              </div>

              <div className="max-h-[340px] overflow-y-auto p-1.5">
                {searchResults.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <FileQuestion
                      size={24}
                      className="mx-auto mb-1.5 text-slate-300"
                    />
                    No active records match &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={`${item.category}-${item.id}`}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className="group flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-[#EDF4F7]"
                    >
                      <span className="mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 transition-colors group-hover:bg-[#287DA6] group-hover:text-white">
                        {item.category}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-semibold text-slate-800 group-hover:text-[#153E5D]">
                            {item.title}
                          </p>
                          <span className="ml-2 shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-700">
                            {item.badge}
                          </span>
                        </div>
                        <p className="truncate text-[13px] text-slate-500">
                          {item.subtitle}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Actions & Controls */}
        <div className={TOPBAR_THEME.rightSection}>
          {/* Operational Area Badge */}
          <div
            onClick={() => navigate("/emergency-coordinator/live-map")}
            className={`cursor-pointer transition-opacity hover:opacity-80 ${TOPBAR_THEME.contextBlock}`}
            title="Current Command Sector"
          >
            <div>
              <p className={TOPBAR_THEME.contextLabel}>OPERATIONAL AREA</p>
              <p className="mt-0.5 flex items-center justify-end gap-1 text-sm font-bold text-[#153E5D]">
                <MapPin size={10} className="text-[#287DA6]" />
                {operationalArea}
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div ref={langContainerRef} className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className={TOPBAR_THEME.actionBtn}
              title="Change Language"
            >
              <Globe size={15} />
              <span>{selectedLang}</span>
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 top-12 z-50 w-28 rounded-xl border border-[#D5E3E9] bg-white py-1 shadow-lg">
                {[
                  { code: "EN", name: "English" },
                  { code: "SI", name: "සිංහල" },
                  { code: "TA", name: "தமிழ்" },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => handleSelectLanguage(l.code)}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-[#F5F9FB] ${
                      selectedLang === l.code
                        ? "font-bold text-[#287DA6]"
                        : "text-slate-700"
                    }`}
                  >
                    <span>{l.name}</span>
                    <span className="font-mono text-[13px] text-slate-400">
                      {l.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Hotline / Help Button */}
          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className={TOPBAR_THEME.iconBtn}
            title="Emergency Command Helplines"
          >
            <CircleHelp size={17} />
          </button>

          {/* Notifications Bell & Flyout */}
          <div ref={notifContainerRef} className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className={TOPBAR_THEME.iconBtn}
              title="Incident & Operations Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className={TOPBAR_THEME.notifBadge}>{unreadCount}</span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-[360px] rounded-xl border border-[#D5E3E9] bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#153E5D]">
                      Live Alerts & Broadcasts
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-700">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-sm font-medium text-[#287DA6] transition-colors hover:text-[#153E5D]"
                    >
                      <CheckCheck size={12} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-[380px] divide-y divide-slate-100 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications recorded
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 transition-colors ${
                          notif.isRead ? "bg-white" : "bg-[#EDF4F7]/50"
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
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              {notif.category}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={10} />
                            {notif.timeAgo}
                          </span>
                        </div>

                        <h4
                          onClick={() =>
                            handleMarkNotificationRead(
                              notif.id,
                              notif.actionUrl
                            )
                          }
                          className="mt-1 cursor-pointer text-sm font-semibold leading-snug text-slate-800 transition-colors hover:text-[#287DA6]"
                        >
                          {notif.title}
                        </h4>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                          {notif.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          {notif.actionUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                handleMarkNotificationRead(
                                  notif.id,
                                  notif.actionUrl
                                )
                              }
                              className="flex items-center gap-1 text-sm font-bold text-[#287DA6] hover:underline"
                            >
                              <span>{notif.actionLabel ?? "Take Action"}</span>
                              <ExternalLink size={10} />
                            </button>
                          )}
                          {!notif.isRead && (
                            <button
                              type="button"
                              onClick={() =>
                                handleMarkNotificationRead(notif.id)
                              }
                              className="ml-auto text-sm text-slate-400 hover:text-slate-600"
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
          <div className={TOPBAR_THEME.profileDivider}>
            <button
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={TOPBAR_THEME.profileTrigger}
            >
              <div className={`relative ${TOPBAR_THEME.avatar}`}>
                {coordinatorInitials}
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white bg-emerald-500"
                  title={dutyStatus}
                />
              </div>

              <div className="hidden sm:block">
                <p className={TOPBAR_THEME.userName}>{coordinatorName}</p>
                <p className={TOPBAR_THEME.userRole}>Emergency Coordinator</p>
              </div>

              <ChevronDown
                size={14}
                className="hidden text-[#8296AA] sm:block"
              />
            </button>

            {profileDropdownOpen && (
              <div className={TOPBAR_THEME.dropdownMenu}>
                <div className={TOPBAR_THEME.dropdownHeader}>
                  <p className="font-bold text-sm text-[#153E5D]">
                    {coordinatorName}
                  </p>
                  <p className="text-[13px] text-[#8296AA]">
                    Status: {dutyStatus}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[#287DA6]">
                    Area: {operationalArea}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate("/emergency-coordinator/settings");
                    }}
                    className={TOPBAR_THEME.dropdownItem}
                  >
                    <UserCheck size={15} className="text-[#287DA6]" />
                    <span>Settings & Profile</span>
                  </button>
                </div>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                    navigate("/login", { replace: true });
                  }}
                  className={TOPBAR_THEME.dropdownSignOut}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
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
                  <h3 className="text-base font-bold text-[#153E5D]">
                    Emergency Operations Helplines
                  </h3>
                  <p className="text-xs text-slate-500">
                    24/7 National Emergency Command & First Responder Contacts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-4 divide-y divide-slate-100">
              {helplines.map((line) => (
                <div
                  key={line.number}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-800">
                        {line.name}
                      </span>
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-700">
                        24x7 Active
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-slate-500">
                      {line.description}
                    </p>
                    <p className="mt-0.5 font-mono text-[13px] text-slate-400">
                      {line.department}
                    </p>
                  </div>
                  <a
                    href={`tel:${line.number}`}
                    className="ml-4 flex items-center gap-1.5 rounded-lg bg-[#153E5D] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#287DA6]"
                  >
                    <Radio size={13} className="text-emerald-400" />
                    <span>{line.number}</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-[13px] text-slate-400">
                Direct EOC link encrypted via CareLink Telemetry.
              </span>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="rounded-lg bg-[#287DA6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#153E5D]"
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
