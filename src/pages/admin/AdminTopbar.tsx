import { useState, useEffect } from "react";
import {
  Search,
  Menu,
  Globe,
  Bell,
  Plus,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { notificationService } from "../../services/notificationService";
import { TOPBAR_THEME, getUserInitials } from "../../constants/layoutTheme";

type Props = {
  onMenu: () => void;
};

export default function AdminTopbar({ onMenu }: Props) {
  const [search, setSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    let isCancelled = false;
    const fetchUnread = async () => {
      try {
        const stats = await notificationService.getStats();
        if (!isCancelled) {
          setUnreadCount(stats.unreadCount);
        }
      } catch {
        // Fallback silently if offline
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/admin/requests?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const displayName = user?.fullName || "System Administrator";
  const displayEmail = user?.email || "admin@carelink.org";

  return (
    <header className={TOPBAR_THEME.header}>
      {/* LEFT SECTION */}
      <div className={TOPBAR_THEME.leftSection}>
        <button
          type="button"
          onClick={onMenu}
          className={TOPBAR_THEME.mobileMenuBtn}
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>

        <div className={TOPBAR_THEME.searchContainer}>
          <Search size={16} className="shrink-0 text-[#8296AA]" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search requests, people, locations..."
            className={TOPBAR_THEME.searchInput}
          />

          <span className={TOPBAR_THEME.searchShortcut}>⌘ K</span>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className={TOPBAR_THEME.rightSection}>
        <div className={TOPBAR_THEME.contextBlock}>
          <div>
            <p className={TOPBAR_THEME.contextLabel}>OPERATIONAL AREA</p>
            <p className={TOPBAR_THEME.contextValue}>Greater Riverton</p>
          </div>
        </div>

        <button type="button" className={TOPBAR_THEME.actionBtn}>
          <Globe size={15} />
          <span>EN</span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/notifications")}
          title="Notifications"
          className={TOPBAR_THEME.iconBtn}
        >
          <Bell size={17} />
          {unreadCount > 0 && (
            <span className={TOPBAR_THEME.notifBadge}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/requests")}
          className="hidden h-9 items-center gap-1.5 rounded-lg bg-[#153E5D] px-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#287DA6] sm:flex"
        >
          <Plus size={14} />
          <span>New request</span>
        </button>

        <div className={TOPBAR_THEME.profileDivider}>
          <button
            type="button"
            onClick={() => setProfileOpen((p) => !p)}
            className={TOPBAR_THEME.profileTrigger}
          >
            <div className={TOPBAR_THEME.avatar}>
              {getUserInitials(displayName, "SA")}
            </div>

            <div className="hidden sm:block">
              <p className={TOPBAR_THEME.userName}>{displayName}</p>
              <p className={TOPBAR_THEME.userRole}>System Administrator</p>
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
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/admin/users");
                  }}
                  className={TOPBAR_THEME.dropdownItem}
                >
                  <User size={15} />
                  <span>User Management</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/admin/settings");
                  }}
                  className={TOPBAR_THEME.dropdownItem}
                >
                  <Settings size={15} />
                  <span>System Settings</span>
                </button>
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
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
