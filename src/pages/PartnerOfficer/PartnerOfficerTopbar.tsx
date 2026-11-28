import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Globe,
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { notificationService } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import { TOPBAR_THEME, getUserInitials } from "../../constants/layoutTheme";

interface TopbarProps {
  onMenuClick: () => void;
}

const PartnerOfficerTopbar = ({ onMenuClick }: TopbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [language, setLanguage] = useState("English");
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  const displayName = user?.fullName || user?.userName || "Partner Officer";
  const displayEmail = user?.email || "";
  const initials = getUserInitials(displayName, "PO");

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const metrics = await notificationService.getMetrics("partner");
        if (isMounted) {
          setUnreadCount(metrics.unread);
        }
      } catch {
        // Fallback default
      }
    };
    fetchUnread();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <header className={TOPBAR_THEME.header}>
      {/* Left section */}
      <div className={TOPBAR_THEME.leftSection}>
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className={TOPBAR_THEME.mobileMenuBtn}
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>

        {/* Search */}
        <div className={TOPBAR_THEME.searchContainer}>
          <Search size={16} className="shrink-0 text-[#8296AA]" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crises, referrals, partners, documents..."
            className={TOPBAR_THEME.searchInput}
          />

          <span className={TOPBAR_THEME.searchShortcut}>⌘ K</span>
        </div>
      </div>

      {/* Right section */}
      <div className={TOPBAR_THEME.rightSection}>
        {/* Active operation */}
        <div className={TOPBAR_THEME.contextBlock}>
          <div>
            <p className={TOPBAR_THEME.contextLabel}>ACTIVE OPERATION</p>
            <p className={TOPBAR_THEME.contextValue}>Monsoon Floods 2025</p>
          </div>
        </div>

        {/* Language */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setLanguageOpen(!languageOpen);
              setProfileOpen(false);
            }}
            className={TOPBAR_THEME.actionBtn}
            title="Language"
          >
            <Globe size={15} />
            <span>EN</span>
          </button>

          {languageOpen && (
            <div className="absolute right-0 top-12 z-50 w-36 rounded-xl border border-[#D5E3E9] bg-white p-2 shadow-lg">
              {["English", "Sinhala", "Tamil"].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setLanguage(lang);
                    setLanguageOpen(false);
                  }}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-[#F5F9FB] ${
                    language === lang
                      ? "bg-[#EDF4F7] font-semibold text-[#287DA6]"
                      : "text-slate-600"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <Link
          to="/partner/notifications"
          className={TOPBAR_THEME.iconBtn}
          title="Notifications"
        >
          <Bell size={17} />

          {(unreadCount ?? 4) > 0 && (
            <span className={TOPBAR_THEME.notifBadge}>{unreadCount ?? 4}</span>
          )}
        </Link>

        {/* User profile */}
        <div className={TOPBAR_THEME.profileDivider}>
          <button
            type="button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setLanguageOpen(false);
            }}
            className={TOPBAR_THEME.profileTrigger}
          >
            <div className={TOPBAR_THEME.avatar}>{initials}</div>

            <div className="hidden sm:block">
              <p className={TOPBAR_THEME.userName}>{displayName}</p>
              <p className={TOPBAR_THEME.userRole}>Partner Officer</p>
            </div>

            <ChevronDown
              size={14}
              className="hidden text-[#8296AA] sm:block"
            />
          </button>

          {profileOpen && (
            <div className={TOPBAR_THEME.dropdownMenu}>
              <div className={TOPBAR_THEME.dropdownHeader}>
                <p className="truncate text-sm font-bold text-[#153E5D]">
                  {displayName}
                </p>
                <p className="truncate text-[13px] text-[#8296AA]">
                  {displayEmail}
                </p>
              </div>

              <div className="py-1">
                <Link
                  to="/partner/organisation-profile"
                  onClick={() => setProfileOpen(false)}
                  className={TOPBAR_THEME.dropdownItem}
                >
                  <User size={15} />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/partner/settings"
                  onClick={() => setProfileOpen(false)}
                  className={TOPBAR_THEME.dropdownItem}
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                  navigate("/login", { replace: true });
                }}
                className={TOPBAR_THEME.dropdownSignOut}
              >
                <LogOut size={15} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default PartnerOfficerTopbar;
