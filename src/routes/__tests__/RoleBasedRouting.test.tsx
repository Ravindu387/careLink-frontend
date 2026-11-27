import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import {
  OFFICIAL_ROLES,
  ROLE_BASE_PATHS,
  ROLE_DASHBOARD_PATHS,
  normalizeAppRole,
  normalizeUserRoles,
  getDashboardPathForRoles,
  isPathAllowedForRoles,
  formatRoleLabel,
  type AppRole,
} from "../../constants/roles";
import { AuthProvider } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import ProtectedRoute from "../ProtectedRoute";
import AccessDeniedPage from "../../pages/public/AccessDeniedPage";
import NotFoundPage from "../../pages/public/NotFoundPage";
import { SIDEBAR_THEME, TOPBAR_THEME } from "../../constants/layoutTheme";
import AdminSidebar from "../../pages/admin/AdminSidebar";
import AdminTopbar from "../../pages/admin/AdminTopbar";
import CaseManagerSidebar from "../../pages/CaseManager/CaseManagerSidebar";
import CaseManagerTopbar from "../../pages/CaseManager/CaseManagerTopbar";
import CitizenSidebar from "../../pages/citizen/Sidebar";
import CitizenTopbar from "../../pages/citizen/Topbar";
import EmergencySidebar from "../../pages/Emegency Coordinator/EmergencySidebar";
import EmergencyTopbar from "../../pages/Emegency Coordinator/EmergencyTopbar";
import FundingSidebar from "../../pages/Funding_Officer/FundingSidebar";
import FundingTopbar from "../../pages/Funding_Officer/FundingTopbar";
import PartnerOfficerSidebar from "../../pages/PartnerOfficer/PartnerOfficerSidebar";
import PartnerOfficerTopbar from "../../pages/PartnerOfficer/PartnerOfficerTopbar";
import ResourceSidebar from "../../pages/ResourceManager/Sidebar";
import ResourceTopbar from "../../pages/ResourceManager/Topbar";
import ShelterSidebar from "../../pages/Shelter_Administrator/ShelterSidebar";
import ShelterTopbar from "../../pages/Shelter_Administrator/ShelterTopbar";
import VolunteerSidebar from "../../pages/VolunteerCoordinator/VolunteerSidebar";
import VolunteerTopbar from "../../pages/VolunteerCoordinator/VolunteerTopbar";

// Helper to create a valid (non-expired) mock JWT token
function createValidJwtToken(role: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      sub: "user-123",
      role,
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  );
  return `${header}.${payload}.signature`;
}

function seedAuthenticatedSession(
  roles: string[],
  overrides: Partial<{
    isActive: boolean;
    accountStatus: string;
    requiresPasswordSetup: boolean;
    fullName: string;
    email: string;
  }> = {}
) {
  const token = createValidJwtToken(roles[0] || "");
  const user = {
    id: "user-123",
    userName: overrides.email || "user@carelink.org",
    fullName: overrides.fullName || "Test User",
    email: overrides.email || "user@carelink.org",
    roles,
    permissions: [],
    isActive: overrides.isActive ?? true,
    accountStatus: overrides.accountStatus ?? "Active",
    requiresPasswordSetup: overrides.requiresPasswordSetup ?? false,
  };
  localStorage.setItem("carelink_token", token);
  localStorage.setItem("carelink_user", JSON.stringify(user));
  vi.spyOn(authService, "getMe").mockResolvedValue(user as any);
}

describe("CareLink 9-Role Routing, Normalization & Route Protection", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("1. Official 9 Roles & Exact Dashboard Path Mapping", () => {
    const expectedRoleMappings: Array<{
      role: AppRole;
      basePath: string;
      dashboardPath: string;
      aliases: string[];
    }> = [
      {
        role: "Admin",
        basePath: "/admin",
        dashboardPath: "/admin/dashboard",
        aliases: ["Admin", "SystemAdmin", "System Administrator"],
      },
      {
        role: "CaseManager",
        basePath: "/case-manager",
        dashboardPath: "/case-manager/dashboard",
        aliases: ["CaseManager", "Case Manager", "IncidentManager", "Incident Manager"],
      },
      {
        role: "Citizen",
        basePath: "/citizen",
        dashboardPath: "/citizen/dashboard",
        aliases: ["Citizen", "Affected Citizen"],
      },
      {
        role: "EmergencyCoordinator",
        basePath: "/emergency-coordinator",
        dashboardPath: "/emergency-coordinator/dashboard",
        aliases: ["EmergencyCoordinator", "Emergency Coordinator"],
      },
      {
        role: "FundingOfficer",
        basePath: "/funding-officer",
        dashboardPath: "/funding-officer/dashboard",
        aliases: ["FundingOfficer", "Funding Officer", "Donor"],
      },
      {
        role: "PartnerOfficer",
        basePath: "/partner",
        dashboardPath: "/partner/dashboard",
        aliases: ["PartnerOfficer", "Partner Officer", "Partner Organisation Officer"],
      },
      {
        role: "ResourceManager",
        basePath: "/resource-manager",
        dashboardPath: "/resource-manager/dashboard",
        aliases: ["ResourceManager", "Resource Manager", "LogisticsManager", "Logistics Manager"],
      },
      {
        role: "ShelterAdministrator",
        basePath: "/shelter-admin",
        dashboardPath: "/shelter-admin/dashboard",
        aliases: ["ShelterAdministrator", "Shelter Administrator", "ShelterAdmin"],
      },
      {
        role: "VolunteerCoordinator",
        basePath: "/volunteer-coordinator",
        dashboardPath: "/volunteer-coordinator/dashboard",
        aliases: ["VolunteerCoordinator", "Volunteer Coordinator", "Volunteer"],
      },
    ];

    it("defines all 9 official CareLink roles", () => {
      expect(OFFICIAL_ROLES).toHaveLength(9);
      expect(OFFICIAL_ROLES).toEqual([
        "Admin",
        "CaseManager",
        "Citizen",
        "EmergencyCoordinator",
        "FundingOfficer",
        "PartnerOfficer",
        "ResourceManager",
        "ShelterAdministrator",
        "VolunteerCoordinator",
      ]);
    });

    it.each(expectedRoleMappings)(
      "maps $role and its aliases to basePath $basePath and dashboard $dashboardPath",
      ({ role, basePath, dashboardPath, aliases }) => {
        expect(ROLE_BASE_PATHS[role]).toBe(basePath);
        expect(ROLE_DASHBOARD_PATHS[role]).toBe(dashboardPath);

        for (const alias of aliases) {
          expect(normalizeAppRole(alias)).toBe(role);
          expect(getDashboardPathForRoles([alias])).toBe(dashboardPath);
          expect(isPathAllowedForRoles(dashboardPath, [alias])).toBe(true);
        }
      }
    );

    it("never falls back to a default role when role claims are missing or unrecognized", () => {
      expect(normalizeAppRole(null)).toBeNull();
      expect(normalizeAppRole("")).toBeNull();
      expect(normalizeAppRole("SuperHacker")).toBeNull();
      expect(normalizeUserRoles([])).toEqual([]);
      expect(getDashboardPathForRoles([])).toBeNull();
      expect(getDashboardPathForRoles(["UnrecognizedRole"])).toBeNull();
      expect(formatRoleLabel(null)).toBe("Unassigned");
    });

    it("enforces strict path isolation across all 9 roles via isPathAllowedForRoles", () => {
      for (const currentRole of OFFICIAL_ROLES) {
        const ownDashboard = ROLE_DASHBOARD_PATHS[currentRole];
        expect(isPathAllowedForRoles(ownDashboard, [currentRole])).toBe(true);

        for (const otherRole of OFFICIAL_ROLES) {
          if (otherRole === currentRole) continue;
          const otherDashboard = ROLE_DASHBOARD_PATHS[otherRole];
          expect(isPathAllowedForRoles(otherDashboard, [currentRole])).toBe(false);
        }
      }
    });
  });

  describe("2. ProtectedRoute Authorization & Status Enforcement Across All 9 Roles", () => {
    function renderProtectedTestApp(initialPath: string) {
      return render(
        <AuthProvider>
          <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
              <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
              <Route
                path="/setup-password"
                element={<div data-testid="setup-password-page">Setup Password Page</div>}
              />
              <Route path="/access-denied" element={<AccessDeniedPage />} />

              {OFFICIAL_ROLES.map((role) => (
                <Route
                  key={role}
                  path={ROLE_BASE_PATHS[role]}
                  element={<ProtectedRoute allowedRoles={[role]} />}
                >
                  <Route
                    path="dashboard"
                    element={<div data-testid={`dashboard-${role}`}>{role} Dashboard</div>}
                  />
                </Route>
              ))}

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      );
    }

    it("redirects unauthenticated users to /login when accessing any protected role dashboard", () => {
      for (const role of OFFICIAL_ROLES) {
        const { unmount } = renderProtectedTestApp(ROLE_DASHBOARD_PATHS[role]);
        expect(screen.getByTestId("login-page")).toBeInTheDocument();
        unmount();
      }
    });

    it.each(OFFICIAL_ROLES)(
      "allows an active authenticated %s user to access their own dashboard",
      async (role) => {
        seedAuthenticatedSession([role]);
        renderProtectedTestApp(ROLE_DASHBOARD_PATHS[role]);
        expect(await screen.findByTestId(`dashboard-${role}`)).toBeInTheDocument();
      }
    );

    it("blocks cross-role access (e.g., Citizen accessing Admin, Partner, CaseManager, or EmergencyCoordinator routes) and redirects to /access-denied", async () => {
      seedAuthenticatedSession(["Citizen"], { fullName: "Nimal Citizen" });

      const forbiddenPaths = [
        "/admin/dashboard",
        "/case-manager/dashboard",
        "/emergency-coordinator/dashboard",
        "/funding-officer/dashboard",
        "/partner/dashboard",
        "/resource-manager/dashboard",
        "/shelter-admin/dashboard",
        "/volunteer-coordinator/dashboard",
      ];

      for (const path of forbiddenPaths) {
        const { unmount } = renderProtectedTestApp(path);
        expect(
          await screen.findByText(/Unauthorized Workspace Access/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/Return to My Authorized Dashboard/i)
        ).toBeInTheDocument();
        expect(screen.getByText(`Restricted Route: ${path}`)).toBeInTheDocument();
        unmount();
      }
    });

    it("blocks Admin from accessing Citizen-only routes and shows Return to My Authorized Dashboard on /access-denied", async () => {
      seedAuthenticatedSession(["Admin"], { fullName: "System Admin" });
      renderProtectedTestApp("/citizen/dashboard");

      expect(
        await screen.findByText(/Unauthorized Workspace Access/i)
      ).toBeInTheDocument();
      expect(screen.getByText("System Administrator")).toBeInTheDocument();
      expect(
        screen.getByText(/Return to My Authorized Dashboard/i)
      ).toBeInTheDocument();
    });

    it("blocks PendingApproval PartnerOfficer accounts from accessing /partner/dashboard", async () => {
      seedAuthenticatedSession(["PartnerOfficer"], {
        isActive: false,
        accountStatus: "PendingApproval",
      });
      renderProtectedTestApp("/partner/dashboard");

      expect(
        await screen.findByText(/pending administrator verification/i)
      ).toBeInTheDocument();
    });

    it("blocks Rejected accounts and displays rejection notice on /access-denied", async () => {
      seedAuthenticatedSession(["PartnerOfficer"], {
        isActive: false,
        accountStatus: "Rejected",
      });
      renderProtectedTestApp("/partner/dashboard");

      expect(
        await screen.findByText(/registration was not approved by an administrator/i)
      ).toBeInTheDocument();
    });

    it("blocks Disabled accounts and displays disabled notice on /access-denied", async () => {
      seedAuthenticatedSession(["CaseManager"], {
        isActive: false,
        accountStatus: "Disabled",
      });
      renderProtectedTestApp("/case-manager/dashboard");

      expect(
        await screen.findByText(/currently disabled or inactive/i)
      ).toBeInTheDocument();
    });

    it("redirects PendingPasswordSetup accounts to /setup-password", async () => {
      seedAuthenticatedSession(["EmergencyCoordinator"], {
        isActive: true,
        accountStatus: "PendingPasswordSetup",
        requiresPasswordSetup: true,
      });
      renderProtectedTestApp("/emergency-coordinator/dashboard");

      expect(await screen.findByTestId("setup-password-page")).toBeInTheDocument();
    });

    it("blocks authenticated users with missing or invalid role claims and redirects to /access-denied", async () => {
      seedAuthenticatedSession([]);
      renderProtectedTestApp("/citizen/dashboard");

      expect(
        await screen.findByText(/does not have an active role assignment/i)
      ).toBeInTheDocument();
    });

    it("renders 404 NotFoundPage for unknown routes instead of silently redirecting", async () => {
      seedAuthenticatedSession(["ResourceManager"]);
      renderProtectedTestApp("/non-existent-module/unknown-page");

      expect(await screen.findByText(/404 · Page Not Found/i)).toBeInTheDocument();
      expect(screen.getByText("/non-existent-module/unknown-page")).toBeInTheDocument();
      expect(
        await screen.findByText(/Return to My Dashboard/i)
      ).toBeInTheDocument();
    });
  });

  describe("3. Standardized Sidebar & Topbar Design Across All 9 Roles", () => {
    it("applies identical width, background, header height, and menu item design across all 9 role sidebars while preserving role-specific menus", () => {
      seedAuthenticatedSession(["Admin"], { fullName: "Test Officer" });

      const sidebarConfigs = [
        {
          role: "Admin",
          element: <AdminSidebar open={false} onClose={() => {}} />,
          expectedMenuItem: "System Overview",
        },
        {
          role: "CaseManager",
          element: <CaseManagerSidebar open={false} onClose={() => {}} />,
          expectedMenuItem: "Case Dashboard",
        },
        {
          role: "Citizen",
          element: <CitizenSidebar isOpen={false} onClose={() => {}} />,
          expectedMenuItem: "Request Help",
        },
        {
          role: "EmergencyCoordinator",
          element: <EmergencySidebar mobileOpen={false} onClose={() => {}} />,
          expectedMenuItem: "Operations Dashboard",
        },
        {
          role: "FundingOfficer",
          element: <FundingSidebar open={false} onClose={() => {}} />,
          expectedMenuItem: "Funding Dashboard",
        },
        {
          role: "PartnerOfficer",
          element: <PartnerOfficerSidebar isOpen={false} onClose={() => {}} />,
          expectedMenuItem: "Partner Dashboard",
        },
        {
          role: "ResourceManager",
          element: <ResourceSidebar isOpen={false} onClose={() => {}} />,
          expectedMenuItem: "Resource Dashboard",
        },
        {
          role: "ShelterAdministrator",
          element: <ShelterSidebar open={false} onClose={() => {}} />,
          expectedMenuItem: "Shelter Management",
        },
        {
          role: "VolunteerCoordinator",
          element: <VolunteerSidebar open={false} onClose={() => {}} />,
          expectedMenuItem: "Volunteer Dashboard",
        },
      ];

      for (const cfg of sidebarConfigs) {
        const { container, unmount } = render(
          <AuthProvider>
            <MemoryRouter initialEntries={["/"]}>{cfg.element}</MemoryRouter>
          </AuthProvider>
        );

        const aside = container.querySelector("aside");
        expect(aside).not.toBeNull();
        expect(aside?.className).toContain(SIDEBAR_THEME.widthExpanded);
        expect(aside?.className).toContain("bg-[#153E5D]");
        expect(screen.getByText(cfg.expectedMenuItem)).toBeInTheDocument();
        expect(screen.getByLabelText(/Collapse sidebar/i)).toBeInTheDocument();

        unmount();
      }
    });

    it("applies identical height, border, search bar, and profile trigger styling across all 9 role topbars", () => {
      seedAuthenticatedSession(["Admin"], { fullName: "Test Officer" });

      const topbarElements = [
        <AdminTopbar key="admin" onMenu={() => {}} />,
        <CaseManagerTopbar key="cm" onMenuClick={() => {}} />,
        <CitizenTopbar key="citizen" onMenuClick={() => {}} />,
        <EmergencyTopbar key="ec" onMenuClick={() => {}} />,
        <FundingTopbar key="fo" onMenuClick={() => {}} />,
        <PartnerOfficerTopbar key="po" onMenuClick={() => {}} />,
        <ResourceTopbar key="rm" onMenuClick={() => {}} />,
        <ShelterTopbar key="sa" onMenuClick={() => {}} />,
        <VolunteerTopbar key="vc" onMenuClick={() => {}} />,
      ];

      for (const el of topbarElements) {
        const { container, unmount } = render(
          <AuthProvider>
            <MemoryRouter initialEntries={["/"]}>{el}</MemoryRouter>
          </AuthProvider>
        );

        const header = container.querySelector("header");
        expect(header).not.toBeNull();
        expect(header?.className).toBe(TOPBAR_THEME.header);

        unmount();
      }
    });
  });
});
