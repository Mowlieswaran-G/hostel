import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOutUser } from "../firebase/auth";
import { clearMockSession } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import toast from "react-hot-toast";
import {
  RiDashboardLine,
  RiBuilding2Line,
  RiGroupLine,
  RiBookmarkLine,
  RiToolsLine,
  RiMapPinLine,
  RiCheckboxMultipleLine,
  RiWrenchLine,
  RiLogoutBoxLine,
  RiHomeLine,
  RiShieldLine,
  RiThermometerLine,
} from "react-icons/ri";

const roleNavItems = {
  resident: [
    { label: "Dashboard", to: "/resident", icon: RiDashboardLine },
    { label: "Book Room", to: "/resident/room-booking", icon: RiBuilding2Line },
    { label: "My Bookings", to: "/resident/my-bookings", icon: RiBookmarkLine },
    { label: "Maintenance", to: "/resident/maintenance", icon: RiToolsLine },
    { label: "Outing", to: "/resident/outing", icon: RiMapPinLine },
  ],
  warden: [
    { label: "Dashboard", to: "/warden", icon: RiDashboardLine },
    { label: "Bookings", to: "/warden/bookings", icon: RiCheckboxMultipleLine },
    { label: "Maintenance", to: "/warden/maintenance", icon: RiWrenchLine },
    { label: "Outings", to: "/warden/outings", icon: RiMapPinLine },
  ],
  technician: [
    { label: "Dashboard", to: "/technician", icon: RiDashboardLine },
    { label: "Heatmap", to: "/technician/heatmap", icon: RiThermometerLine },
  ],
};

const roleColors = {
  resident: { accent: "#6947ff", label: "Resident", icon: RiHomeLine },
  warden: { accent: "#22c55e", label: "Warden", icon: RiShieldLine },
  technician: { accent: "#f59e0b", label: "Technician", icon: RiWrenchLine },
};

export default function Navbar() {
  const { profile, role, logoutContext } = useAuth();
  const navigate = useNavigate();
  const items = roleNavItems[role] || [];
  const config = roleColors[role] || roleColors.resident;
  const Icon = config.icon;

  const handleLogout = async () => {
    logoutContext(); // clear context state and local session
    await signOutUser().catch(() => {}); // clear Firebase session (for residents)
    toast.success("Signed out successfully");
    navigate("/login");
  };

  return (
    <>
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <nav
        className="glass-nav flex flex-col w-64 shrink-0 min-h-screen pt-12 pb-8 px-5 z-20"
        style={{ minWidth: "16rem" }}
      >
        {/* Logo Section — spacious top padding & bottom margin */}
        <div className="flex items-center gap-3.5 px-2 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[color:var(--text-primary)] font-black text-xl shadow-md shrink-0"
            style={{
              background: `linear-gradient(135deg, ${config.accent}, ${config.accent}aa)`,
            }}
          >
            S
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-[color:var(--text-primary)] text-base leading-tight truncate">
              SmartHostel
            </p>
            <p
              className="text-xs font-medium mt-0.5"
              style={{ color: config.accent }}
            >
              {config.label}
            </p>
          </div>
        </div>

        {/* Navigation Section Header */}
        <div className="px-2 mb-3 mt-2">
          <p
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Menu
          </p>
        </div>

        {/* Nav Items — spacious vertical gap */}
        <div className="flex flex-col gap-2.5 flex-1">
          {items.map(({ label, to, icon: NavIcon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === `/${role}`}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <NavIcon size={19} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* User profile section */}
        <div
          className="mt-auto pt-5 border-t"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div className="flex items-center gap-3 px-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[color:var(--text-primary)] font-bold text-sm shrink-0 shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${config.accent}, ${config.accent}88)`,
              }}
            >
              <Icon size={16} />
            </div>
            <div className="min-w-0">
              <p
                className="text-sm font-semibold text-[color:var(--text-primary)] truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {profile?.name || "User"}
              </p>
              <p
                className="text-xs truncate"
                style={{ color: "var(--text-muted)" }}
              >
                {profile?.email || ""}
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Top-right header bar ──────────────────────────────────── */}
      <header className="topbar">
        <div className="topbar-actions">
          {/* Single Icon Appearance Toggle */}
          <ThemeToggle />

          {/* Divider */}
          <span className="topbar-divider" />

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="topbar-signout"
            title="Sign out"
          >
            <RiLogoutBoxLine size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>
    </>
  );
}
