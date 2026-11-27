import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import UserManagement from "../UserManagement";
import SetupPasswordPage from "../../auth/SetupPasswordPage";
import RegisterPage from "../../auth/RegisterPage";
import { userService } from "../../../services/userService";
import { authService } from "../../../services/authService";

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    register: vi.fn(),
    login: vi.fn(),
    user: null,
    isAuthenticated: false,
  }),
}));

vi.mock("../../../services/userService", () => ({
  userService: {
    getUsers: vi.fn(),
    getUserStats: vi.fn(),
    createUser: vi.fn(),
    resendInvitation: vi.fn(),
    updateUser: vi.fn(),
    updateUserStatus: vi.fn(),
    approvePartner: vi.fn(),
    rejectPartner: vi.fn(),
    deleteUser: vi.fn(),
    updateUserRoles: vi.fn(),
  },
}));

vi.mock("../../../services/authService", () => ({
  authService: {
    verifySetupToken: vi.fn(),
    setupPassword: vi.fn(),
  },
}));

describe("Admin UserManagement & SetupPasswordPage Workflow Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(userService.getUsers).mockResolvedValue({
      items: [
        {
          id: "USR-101",
          userName: "admin@carelink.org",
          fullName: "System Administrator",
          email: "admin@carelink.org",
          roles: ["SystemAdmin"],
          role: "SystemAdmin",
          isActive: true,
          accountStatus: "Active",
          emailConfirmed: true,
          createdAt: new Date().toISOString(),
          lastActive: "Just now",
        },
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 100,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });
    vi.mocked(userService.getUserStats).mockResolvedValue({
      totalUsers: 1,
      activeUsers: 1,
      pendingUsers: 0,
      pendingSetupUsers: 0,
      rejectedUsers: 0,
      disabledUsers: 0,
      privilegedUsers: 1,
    });
  });

  it("creates a user and displays a clean success message WITHOUT any setup link or token", async () => {
    vi.mocked(userService.createUser).mockResolvedValueOnce({
      id: "USR-202",
      userName: "oshadi@carelink.org",
      fullName: "Oshadi Vidarshana",
      email: "oshadi@carelink.org",
      roles: ["EmergencyCoordinator"],
      role: "EmergencyCoordinator",
      isActive: true,
      accountStatus: "PendingPasswordSetup",
      requiresPasswordSetup: true,
      emailSent: true,
      emailDeliveryStatus: "Sent",
      emailConfirmed: true,
      createdAt: new Date().toISOString(),
      lastActive: "Never",
    });

    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Create / Invite User")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create / Invite User"));

    fireEvent.change(screen.getByLabelText(/Full name/i), {
      target: { value: "Oshadi Vidarshana" },
    });
    fireEvent.change(screen.getByLabelText(/Email address \(Username\)/i), {
      target: { value: "oshadi@carelink.org" },
    });
    fireEvent.change(screen.getByLabelText(/Assign role/i), {
      target: { value: "Emergency Coordinator" },
    });

    fireEvent.click(screen.getByText(/Create User & Send Invitation/i));

    await waitFor(() => {
      const statusAlert = screen.getByRole("status");
      expect(statusAlert).toHaveTextContent(
        "Account created successfully for Oshadi Vidarshana."
      );
      expect(statusAlert).toHaveTextContent("oshadi@carelink.org");
      expect(statusAlert).toHaveTextContent("Emergency Coordinator");
      // Must NEVER contain any setup link or token
      expect(statusAlert.textContent).not.toContain("/setup-account");
      expect(statusAlert.textContent).not.toContain("/setup-password");
      expect(statusAlert.textContent).not.toContain("token=");
      expect(statusAlert.textContent).not.toContain("Generated Password Setup Link");
    });
  });

  it("displays an honest warning when user is created but SMTP email delivery fails, and supports Resend Invitation", async () => {
    vi.mocked(userService.createUser).mockResolvedValueOnce({
      id: "USR-203",
      userName: "failed.smtp@carelink.org",
      fullName: "Rohan Silva",
      email: "failed.smtp@carelink.org",
      roles: ["LogisticsManager"],
      role: "LogisticsManager",
      isActive: true,
      accountStatus: "PendingPasswordSetup",
      requiresPasswordSetup: true,
      emailSent: false,
      emailDeliveryStatus: "Failed",
      emailConfirmed: true,
      createdAt: new Date().toISOString(),
      lastActive: "Never",
    });

    vi.mocked(userService.getUsers).mockResolvedValue({
      items: [
        {
          id: "USR-203",
          userName: "failed.smtp@carelink.org",
          fullName: "Rohan Silva",
          email: "failed.smtp@carelink.org",
          roles: ["LogisticsManager"],
          role: "LogisticsManager",
          isActive: true,
          accountStatus: "PendingPasswordSetup",
          requiresPasswordSetup: true,
          emailSent: false,
          emailDeliveryStatus: "Failed",
          emailConfirmed: true,
          createdAt: new Date().toISOString(),
          lastActive: "Never",
        },
      ],
      totalCount: 1,
      pageNumber: 1,
      pageSize: 100,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    });

    vi.mocked(userService.resendInvitation).mockResolvedValueOnce({
      id: "USR-203",
      userName: "failed.smtp@carelink.org",
      fullName: "Rohan Silva",
      email: "failed.smtp@carelink.org",
      roles: ["LogisticsManager"],
      role: "LogisticsManager",
      isActive: true,
      accountStatus: "PendingPasswordSetup",
      requiresPasswordSetup: true,
      emailSent: true,
      emailDeliveryStatus: "Sent",
      emailConfirmed: true,
      createdAt: new Date().toISOString(),
      lastActive: "Never",
    });

    render(
      <MemoryRouter>
        <UserManagement />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Create / Invite User"));
    fireEvent.change(screen.getByLabelText(/Full name/i), {
      target: { value: "Rohan Silva" },
    });
    fireEvent.change(screen.getByLabelText(/Email address \(Username\)/i), {
      target: { value: "failed.smtp@carelink.org" },
    });
    fireEvent.click(screen.getByText(/Create User & Send Invitation/i));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /invitation email could not be delivered/i
      );
    });

    // Click Resend Invitation button in table
    const resendBtn = await screen.findByText("Resend Invitation");
    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(userService.resendInvitation).toHaveBeenCalledWith("USR-203");
      expect(screen.getByRole("status")).toHaveTextContent(
        /invitation email resent successfully to failed.smtp@carelink.org/i
      );
    });
  });

  it("SetupPasswordPage shows expired token state when token is expired", async () => {
    vi.mocked(authService.verifySetupToken).mockRejectedValueOnce(
      new Error("This account setup link has expired.")
    );

    render(
      <MemoryRouter
        initialEntries={[
          "/setup-account?email=oshadi%40carelink.org&token=expired-token",
        ]}
      >
        <Routes>
          <Route path="/setup-account" element={<SetupPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("setup-expired-state")).toBeInTheDocument();
      expect(screen.getByText("Setup Link Expired")).toBeInTheDocument();
    });
  });

  it("SetupPasswordPage shows invalid token state when token is invalid", async () => {
    vi.mocked(authService.verifySetupToken).mockRejectedValueOnce(
      new Error("Invalid or expired account setup token.")
    );

    render(
      <MemoryRouter
        initialEntries={[
          "/setup-account?email=oshadi%40carelink.org&token=invalid-token",
        ]}
      >
        <Routes>
          <Route path="/setup-account" element={<SetupPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("setup-invalid-state")).toBeInTheDocument();
      expect(screen.getByText("Invalid Setup Link")).toBeInTheDocument();
    });
  });

  it("SetupPasswordPage validates password confirmation and completes setup on valid token", async () => {
    vi.mocked(authService.verifySetupToken).mockResolvedValueOnce(true);
    vi.mocked(authService.setupPassword).mockResolvedValueOnce(
      "Your password has been set and your account is now active."
    );

    render(
      <MemoryRouter
        initialEntries={[
          "/setup-account?email=oshadi%40carelink.org&token=valid-token-123",
        ]}
      >
        <Routes>
          <Route path="/setup-account" element={<SetupPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByLabelText(/New password \*/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/New password \*/i), {
      target: { value: "StrongPass123!" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm password \*/i), {
      target: { value: "MismatchPass!" },
    });
    fireEvent.click(screen.getByText(/Complete Setup & Activate/i));

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Confirm password \*/i), {
      target: { value: "StrongPass123!" },
    });
    fireEvent.click(screen.getByText(/Complete Setup & Activate/i));

    await waitFor(() => {
      expect(screen.getByTestId("setup-success-state")).toBeInTheDocument();
      expect(screen.getByText("Account Setup Complete")).toBeInTheDocument();
    });
  });

  it("RegisterPage displays Partner Organisation sections only when Partner Organisation is selected", async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Step 1: Select Affected Citizen first -> Step 2 should NOT show Partner Organisation sections
    fireEvent.click(screen.getByText("Continue"));
    expect(
      screen.queryByText(/A\. Organisation Basic Information/i)
    ).not.toBeInTheDocument();

    // Go back to Step 1 and select Partner Organisation
    fireEvent.click(screen.getByText("Previous"));
    fireEvent.click(screen.getByText("Partner Organisation"));
    fireEvent.click(screen.getByText("Continue"));

    // Step 2 for Partner Organisation must display Sections A, B, C, and D
    expect(
      screen.getByText(/A\. Organisation Basic Information/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/B\. Humanitarian Operational Information/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/C\. Authorised Representative Information/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/D\. Account Login Information/i)
    ).toBeInTheDocument();
  });
});
