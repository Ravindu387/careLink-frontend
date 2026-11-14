
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

// Public Pages
import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

// Admin Layout & Pages
import AdminLayout from "../layouts/AdminLayout";
import SystemDashboard from "../pages/admin/Dashboard";
import AssistanceRequests from "../pages/admin/AssistanceRequests";
import AdminPlaceholder from "../pages/admin/AdminPlaceholder";

// Officer Dashboard
import OperationsDashboard from "../pages/officer/OperationsDashboard";
import UserManagement from "../pages/admin/UserManagement";
import AIRecommendationReview from "../pages/admin/AIRecommendationReview";
import OrganisationManagement from "../pages/admin/OrganisationManagement";
import VerificationQueue from "../pages/admin/VerificationQueue";
import SecurityEvents from "../pages/admin/SecurityEvents";
import IntegrationHealth from "../pages/admin/IntegrationHealth";
import RolesPermissions from "../pages/admin/RolesPermissions";
import AuditLogs from "../pages/admin/AuditLogs";
import SystemSettings from "../pages/admin/SystemSettings";
import ReportsPage from "../pages/admin/ReportsPage";
import NotificationsPage from "../pages/admin/NotificationsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/citizen" element={<Navigate to="/" replace />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<SystemDashboard />} />
              <Route path="/admin/requests" element={<AssistanceRequests />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/ai-review" element={<AIRecommendationReview />} />
              <Route path="/admin/organisations" element={<OrganisationManagement />} />
              <Route path="/admin/verification" element={<VerificationQueue />} />
              <Route path="/admin/integrations" element={<IntegrationHealth />} />
              <Route path="/admin/security-events" element={<SecurityEvents />} />
              <Route path="/admin/roles" element={<RolesPermissions />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/notifications" element={<NotificationsPage />} />
              <Route path="/admin/:tab" element={<AdminPlaceholder />} />
            </Route>

            {/* Officer Routes */}
            <Route
              path="/officer/dashboard"
              element={<OperationsDashboard />}
            />

            {/* Other Role Routes */}
            <Route
              path="/volunteer/dashboard"
              element={<div>Volunteer Dashboard Coming Soon</div>}
            />

            <Route
              path="/user/dashboard"
              element={<div>Affected User Dashboard Coming Soon</div>}
            />
          </Route>

          {/* Unknown Routes */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
