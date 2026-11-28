import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Globe,
  Accessibility,
  Bell,
  ChevronDown,
  Menu,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { TOPBAR_THEME, getUserInitials } from "../../constants/layoutTheme";

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = user?.fullName || "Samira Khan";
  const displayEmail = user?.email || "citizen@carelink.org";
  const initials = getUserInitials(displayName, "SK");

  return (
    <header className={TOPBAR_THEME.header}>
      {/* Left Side - Mobile Menu & Search */}
      <div className={TOPBAR_THEME.leftSection}>
        <button
          type="button"
          onClick={onMenuClick}
          className={TOPBAR_THEME.mobileMenuBtn}
          aria-label="Open navigation"
        >
          <Menu size={19} />
        </button>

        <div className={TOPBAR_THEME.searchContainer}>
          <Search size={16} className="shrink-0 text-[#8296AA]" />

          <input
            type="text"
            placeholder="Search help, shelters, services..."
            className={TOPBAR_THEME.searchInput}
          />

          <span className={TOPBAR_THEME.searchShortcut}>⌘ K</span>
        </div>
      </div>

      {/* Right Side */}
      <div className={TOPBAR_THEME.rightSection}>
        <div className={TOPBAR_THEME.contextBlock}>
          <div>
            <p className={TOPBAR_THEME.contextLabel}>COMMUNITY SECTOR</p>
            <p className={TOPBAR_THEME.contextValue}>North Ward</p>
          </div>
        </div>

        {/* Language */}
        <button type="button" className={TOPBAR_THEME.actionBtn}>
          <Globe size={15} />
          <span>EN</span>
        </button>

        {/* Accessibility */}
        <button
          type="button"
          onClick={() => navigate("/citizen/profile")}
          className={`hidden sm:flex ${TOPBAR_THEME.iconBtn}`}
          aria-label="Accessibility"
          title="Accessibility & Profile"
        >
          <Accessibility size={17} />
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => navigate("/citizen/notifications")}
          className={TOPBAR_THEME.iconBtn}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={17} />
          <span className={TOPBAR_THEME.notifBadge}>4</span>
        </button>

        {/* User Profile */}
        <div className={TOPBAR_THEME.profileDivider}>
          <button
            type="button"
            onClick={() => setProfileOpen((p) => !p)}
            className={TOPBAR_THEME.profileTrigger}
            aria-label="Open profile"
          >
            <div className={TOPBAR_THEME.avatar}>{initials}</div>

            <div className="hidden sm:block">
              <p className={TOPBAR_THEME.userName}>{displayName}</p>
              <p className={TOPBAR_THEME.userRole}>Citizen</p>
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
                    navigate("/citizen/profile");
                  }}
                  className={TOPBAR_THEME.dropdownItem}
                >
                  <User size={15} />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/citizen/profile");
                  }}
                  className={TOPBAR_THEME.dropdownItem}
                >
                  <Settings size={15} />
                  <span>Profile & Settings</span>
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
