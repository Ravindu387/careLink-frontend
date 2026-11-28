import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../authService";
import { userService, mapRoleToBackendRole } from "../userService";
import * as apiModule from "../api";

vi.mock("../api", () => ({
  request: vi.fn(),
}));

describe("CareLink Auth & User Management Service Tests", () => {
  const mockRequest = vi.mocked(apiModule.request);

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("Citizen registration immediately stores token and user as Active", async () => {
    mockRequest.mockResolvedValueOnce({
      success: true,
      message: "Citizen registration completed successfully.",
      data: {
        id: "usr-citizen-1",
        email: "citizen@carelink.org",
        fullName: "Nimal Perera",
        accountStatus: "Active",
        isActive: true,
        emailConfirmed: true,
        requiresEmailVerification: false,
        requiresAdminApproval: false,
        token: "jwt-citizen-token",
        expiresAt: new Date().toISOString(),
        message: "Citizen registration completed successfully.",
        user: {
          id: "usr-citizen-1",
          userName: "citizen@carelink.org",
          fullName: "Nimal Perera",
          email: "citizen@carelink.org",
          roles: ["Citizen"],
          permissions: ["Requests.Create"],
          isActive: true,
          accountStatus: "Active",
          createdAt: new Date().toISOString(),
        },
      },
    });

    const result = await authService.register({
      fullName: "Nimal Perera",
      email: "citizen@carelink.org",
      password: "Password123!",
      phoneNumber: "+94771112233",
      role: "Citizen",
    });

    expect(result.accountStatus).toBe("Active");
    expect(result.requiresAdminApproval).toBe(false);
    expect(authService.getToken()).toBe("jwt-citizen-token");
    expect(authService.getStoredUser()?.roles).toContain("Citizen");
  });

  it("Volunteer registration immediately activates account with skills and availability", async () => {
    mockRequest.mockResolvedValueOnce({
      success: true,
      message: "Volunteer registration completed successfully.",
      data: {
        id: "usr-vol-1",
        email: "volunteer@carelink.org",
        fullName: "Kavindi Silva",
        accountStatus: "Active",
        isActive: true,
        emailConfirmed: true,
        requiresEmailVerification: false,
        requiresAdminApproval: false,
        token: "jwt-volunteer-token",
        expiresAt: new Date().toISOString(),
        message: "Volunteer registration completed successfully.",
        user: {
          id: "usr-vol-1",
          userName: "volunteer@carelink.org",
          fullName: "Kavindi Silva",
          email: "volunteer@carelink.org",
          roles: ["Volunteer"],
          permissions: ["Volunteers.View"],
          isActive: true,
          accountStatus: "Active",
          skills: "First Aid, Search & Rescue",
          availability: "Immediate",
          createdAt: new Date().toISOString(),
        },
      },
    });

    const result = await authService.register({
      fullName: "Kavindi Silva",
      email: "volunteer@carelink.org",
      password: "Password123!",
      phoneNumber: "+94772223344",
      role: "Volunteer",
      skills: "First Aid, Search & Rescue",
      availability: "Immediate",
    });

    expect(result.accountStatus).toBe("Active");
    expect(result.user?.skills).toBe("First Aid, Search & Rescue");
    expect(authService.getToken()).toBe("jwt-volunteer-token");
  });

  it("Partner Organization registration sets PendingApproval and does NOT store an active session token", async () => {
    mockRequest.mockResolvedValueOnce({
      success: true,
      message: "Pending administrator approval.",
      data: {
        id: "usr-partner-1",
        email: "partner@globalrelief.org",
        fullName: "Sara Khan",
        accountStatus: "PendingApproval",
        isActive: false,
        emailConfirmed: true,
        requiresEmailVerification: false,
        requiresAdminApproval: true,
        token: null,
        expiresAt: null,
        message: "Pending administrator approval.",
        user: {
          id: "usr-partner-1",
          userName: "partner@globalrelief.org",
          fullName: "Sara Khan",
          email: "partner@globalrelief.org",
          roles: ["PartnerOfficer"],
          permissions: [],
          organizationName: "Global Relief Network",
          isActive: false,
          accountStatus: "PendingApproval",
          createdAt: new Date().toISOString(),
        },
      },
    });

    const result = await authService.register({
      fullName: "Sara Khan",
      email: "partner@globalrelief.org",
      password: "Password123!",
      phoneNumber: "+94112223344",
      role: "PartnerOfficer",
      organizationName: "Global Relief Network",
    });

    expect(result.accountStatus).toBe("PendingApproval");
    expect(result.requiresAdminApproval).toBe(true);
    expect(authService.getToken()).toBeNull();
  });

  it("Admin approvePartner and rejectPartner call the correct backend endpoints", async () => {
    mockRequest.mockResolvedValueOnce({
      success: true,
      message: "Approved",
      data: {
        id: "usr-partner-1",
        fullName: "Sara Khan",
        email: "partner@globalrelief.org",
        roles: ["PartnerOfficer"],
        role: "PartnerOfficer",
        isActive: true,
        accountStatus: "Active",
        emailConfirmed: true,
        createdAt: new Date().toISOString(),
        lastActive: "Just now",
      },
    });

    const approved = await userService.approvePartner("usr-partner-1", "Verified NGO");
    expect(mockRequest).toHaveBeenCalledWith("/users/usr-partner-1/approve", {
      method: "POST",
      body: JSON.stringify({ notes: "Verified NGO" }),
    });
    expect(approved.accountStatus).toBe("Active");

    mockRequest.mockResolvedValueOnce({
      success: true,
      message: "Rejected",
      data: {
        id: "usr-partner-2",
        fullName: "Rejected Org",
        email: "reject@ngo.org",
        roles: ["PartnerOfficer"],
        role: "PartnerOfficer",
        isActive: false,
        accountStatus: "Rejected",
        rejectionReason: "Invalid registration certificate",
        emailConfirmed: true,
        createdAt: new Date().toISOString(),
        lastActive: "Never",
      },
    });

    const rejected = await userService.rejectPartner(
      "usr-partner-2",
      "Invalid registration certificate"
    );
    expect(mockRequest).toHaveBeenCalledWith("/users/usr-partner-2/reject", {
      method: "POST",
      body: JSON.stringify({ reason: "Invalid registration certificate" }),
    });
    expect(rejected.accountStatus).toBe("Rejected");
    expect(rejected.rejectionReason).toBe("Invalid registration certificate");
  });

  it("Admin-created user password setup calls /auth/setup-password with email, token, and newPassword", async () => {
    mockRequest.mockResolvedValueOnce({
      success: true,
      message: "Your password has been set and your account is now active.",
      data: true,
    });

    const msg = await authService.setupPassword({
      email: "coord@carelink.org",
      token: "single-use-setup-token",
      newPassword: "NewCoordinatorPass123!",
      confirmPassword: "NewCoordinatorPass123!",
    });

    expect(mockRequest).toHaveBeenCalledWith("/auth/setup-password", {
      method: "POST",
      body: JSON.stringify({
        email: "coord@carelink.org",
        token: "single-use-setup-token",
        newPassword: "NewCoordinatorPass123!",
        confirmPassword: "NewCoordinatorPass123!",
      }),
    });
    expect(msg).toContain("active");
  });

  it("normalizes all 9 Create / Invite User Account role dropdown labels to backend-compatible role identifiers", async () => {
    const expectedMappings: Array<[string, string]> = [
      ["System Administrator", "SystemAdmin"],
      ["Admin", "SystemAdmin"],
      ["Case Manager", "IncidentManager"],
      ["Citizen", "Citizen"],
      ["Emergency Coordinator", "EmergencyCoordinator"],
      ["Funding Officer", "Donor"],
      ["Partner Officer", "PartnerOfficer"],
      ["Resource Manager", "LogisticsManager"],
      ["Shelter Administrator", "ShelterAdmin"],
      ["Volunteer Coordinator", "VolunteerCoordinator"],
      ["Volunteer", "Volunteer"],
    ];

    for (const [uiLabel, backendToken] of expectedMappings) {
      expect(mapRoleToBackendRole(uiLabel)).toBe(backendToken);

      mockRequest.mockResolvedValueOnce({
        success: true,
        message: "Created",
        data: {
          id: "usr-test",
          fullName: "Asanka Saviduni",
          email: "ravindu.dev.gaming@gmail.com",
          roles: [backendToken],
          role: backendToken,
          isActive: true,
          accountStatus: "PendingPasswordSetup",
          requiresPasswordSetup: true,
          emailSent: true,
          emailConfirmed: true,
          createdAt: new Date().toISOString(),
          lastActive: "Just now",
        },
      });

      await userService.createUser({
        fullName: "Asanka Saviduni",
        email: "ravindu.dev.gaming@gmail.com",
        role: uiLabel,
        isActive: true,
      });

      expect(mockRequest).toHaveBeenLastCalledWith("/users", {
        method: "POST",
        body: JSON.stringify({
          fullName: "Asanka Saviduni",
          email: "ravindu.dev.gaming@gmail.com",
          role: backendToken,
          isActive: true,
        }),
      });
    }
  });
});
