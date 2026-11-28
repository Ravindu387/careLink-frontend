import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Globe,
  HelpCircle,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { TOPBAR_THEME, getUserInitials } from "../../constants/layoutTheme";

interface CaseManagerTopbarProps {
  onMenuClick?: () => void;
}

export default function CaseManagerTopbar({
  onMenuClick,
}: CaseManagerTopbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const displayName = user?.fullName || "Amina M.";
  const displayEmail = user?.email || "casemanager@carelink.org";
  const initials = getUserInitials(displayName, "AM");

  return (
    <header className={TOPBAR_THEME.header}>
      {/* LEFT SECTION - MOBILE MENU & SEARCH BAR */}
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search case ID, applicant, location..."
            className={TOPBAR_THEME.searchInput}
          />

          <span className={TOPBAR_THEME.searchShortcut}>⌘ K</span>
        </div>
      </div>

      {/* RIGHT NAVIGATION */}
      <div className={TOPBAR_THEME.rightSection}>
        <div className={TOPBAR_THEME.contextBlock}>
          <div>
            <p className={TOPBAR_THEME.contextLabel}>OPERATIONAL AREA</p>
            <p className={TOPBAR_THEME.contextValue}>Greater Riverton</p>
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
          <HelpCircle size={17} />
        </button>

        {/* NOTIFICATIONS */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className={TOPBAR_THEME.iconBtn}
            title="Notifications"
          >
            <Bell size={17} />
            <span className={TOPBAR_THEME.notifBadge}>11</span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-[280px] rounded-xl border border-[#D5E3E9] bg-white p-4 shadow-xl">
              <h3 className="text-base font-bold text-[#153E5D]">
                Notifications
              </h3>

              <div className="mt-3 space-y-3">
                <div className="border-b border-slate-100 pb-2.5">
                  <p className="text-sm font-semibold text-[#153E5D]">
                    New assistance request
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#8296AA]">
                    A new case requires verification.
                  </p>
                </div>

                <div className="border-b border-slate-100 pb-2.5">
                  <p className="text-sm font-semibold text-[#153E5D]">
                    Critical case escalated
                  </p>
                  <p className="mt-0.5 text-[13px] text-[#8296AA]">
                    A case needs immediate attention.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowNotifications(false);
                  navigate("/case-manager/notifications");
                }}
                className="mt-3 w-full text-center text-sm font-semibold text-[#287DA6] hover:underline"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* USER PROFILE */}
        <div className={TOPBAR_THEME.profileDivider}>
          <button
            type="button"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className={TOPBAR_THEME.profileTrigger}
          >
            <div className={TOPBAR_THEME.avatar}>{initials}</div>

            <div className="hidden sm:block">
              <p className={TOPBAR_THEME.userName}>{displayName}</p>
              <p className={TOPBAR_THEME.userRole}>Case Manager</p>
            </div>

            <ChevronDown
              size={14}
              className="hidden text-[#8296AA] sm:block"
            />
          </button>

          {showProfile && (
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
                    setShowProfile(false);
                    navigate("/case-manager/settings");
                  }}
                  className={TOPBAR_THEME.dropdownItem}
                >
                  <User size={15} />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    navigate("/case-manager/settings");
                  }}
                  className={TOPBAR_THEME.dropdownItem}
                >
                  <Settings size={15} />
                  <span>Account Settings</span>
                </button>
              </div>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  setShowProfile(false);
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
