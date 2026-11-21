
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import AccessDeniedPage from "../pages/public/AccessDeniedPage";

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

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

<<<<<<< HEAD
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="/citizen" element={<Navigate to="/" replace />} />
=======
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/citizen" element={<Navigate to="/" replace />} />
>>>>>>> parent of 75fb8ca (feat: add core frontend layout, authentication context, and admin dashboard views)

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<SystemDashboard />} />
          <Route path="/admin/requests" element={<AssistanceRequests />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/ai-review" element={<AIRecommendationReview />} />
          <Route path="/admin/organisations" element={<OrganisationManagement />} />
          <Route path="/admin/verification" element={<VerificationQueue />} />
          <Route path="/admin/integrations" element={<VerificationQueue />} />
          <Route path="/admin/:tab" element={<AdminPlaceholder />} />
        </Route>

        {/* Officer Routes */}
        <Route
          path="/officer/dashboard"
          element={<OperationsDashboard />}
        />

        {/* Other Role Routes - Add pages when ready */}
        <Route
          path="/volunteer/dashboard"
          element={<div>Volunteer Dashboard Coming Soon</div>}
        />

        <Route
          path="/user/dashboard"
          element={<div>Affected User Dashboard Coming Soon</div>}
        />

        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
