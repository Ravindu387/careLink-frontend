import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Globe,
  CircleHelp,
  Bell,
  ChevronDown,
  Menu,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { TOPBAR_THEME, getUserInitials } from "../../constants/layoutTheme";

interface FundingTopbarProps {
  onMenuClick: () => void;
}

export default function FundingTopbar({ onMenuClick }: FundingTopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = user?.fullName || "Maria K.";
  const displayEmail = user?.email || "funding@carelink.org";
  const initials = getUserInitials(displayName, "MK");

  return (
    <header className={TOPBAR_THEME.header}>
      {/* LEFT - SEARCH */}
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
            placeholder="Search donations, donors, campaigns, references..."
            className={TOPBAR_THEME.searchInput}
          />

          <span className={TOPBAR_THEME.searchShortcut}>⌘ K</span>
        </div>
      </div>

      {/* RIGHT - ACTIONS */}
      <div className={TOPBAR_THEME.rightSection}>
        {/* CURRENCY */}
        <div className={TOPBAR_THEME.contextBlock}>
          <div>
            <p className={TOPBAR_THEME.contextLabel}>REPORTING CURRENCY</p>
            <p className={TOPBAR_THEME.contextValue}>USD · $</p>
          </div>
        </div>

        {/* LANGUAGE */}
        <button type="button" className={TOPBAR_THEME.actionBtn}>
          <Globe size={15} />
          <span>EN</span>
        </button>

        {/* HELP */}
        <button
          type="button"
          className={`hidden sm:flex ${TOPBAR_THEME.iconBtn}`}
          title="Help"
        >
          <CircleHelp size={17} />
        </button>

        {/* NOTIFICATIONS */}
        <button
          type="button"
          onClick={() => navigate("/funding-officer/notifications")}
          className={TOPBAR_THEME.iconBtn}
          title="Notifications"
        >
          <Bell size={17} />
          <span className={TOPBAR_THEME.notifBadge}>9</span>
        </button>

        {/* USER */}
        <div className={TOPBAR_THEME.profileDivider}>
          <button
            type="button"
            onClick={() => setProfileOpen((p) => !p)}
            className={TOPBAR_THEME.profileTrigger}
          >
            <div className={TOPBAR_THEME.avatar}>{initials}</div>

            <div className="hidden sm:block">
              <p className={TOPBAR_THEME.userName}>{displayName}</p>
              <p className={TOPBAR_THEME.userRole}>Funding Officer</p>
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
                    navigate("/funding-officer/settings");
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
                    navigate("/funding-officer/settings");
                  }}
                  className={TOPBAR_THEME.dropdownItem}
                >
                  <Settings size={15} />
                  <span>Funding Settings</span>
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
