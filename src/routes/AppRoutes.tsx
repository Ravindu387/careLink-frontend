
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import Campaigns from "../pages/Funding_Officer/Campaigns";
import FundingOfficerLayout from "../layouts/FundingOfficerLayout";
import DonationRecords from "../pages/Funding_Officer/DonationRecords";
import DonorManagement from "../pages/Funding_Officer/DonorManagement";
import Expenditure from "../pages/Funding_Officer/Expenditure";
import FlaggedTransactions from "../pages/Funding_Officer/FlaggedTransactions";
import FundAllocations from "../pages/Funding_Officer/FundAllocations";
import FundingOfficerDashboard from "../pages/Funding_Officer/FundingOfficerDashboard";
import FundingReportsAnalytics from "../pages/Funding_Officer/FundingReportsAnalytics";
import NotificationsPage from "../pages/Funding_Officer/NotificationsPage";
import ResourceContributions from "../pages/Funding_Officer/ResourceContributions";
import TransparencyReports from "../pages/Funding_Officer/TransparencyReports";
import FundingSettingsPage from "../pages/Funding_Officer/FundingSettingsPage";
import ShelterLayout from "../layouts/ShelterLayout";
import ShelterAdminDashboard from "../pages/Shelter_Administrator/ShelterAdminDashboard";
import ShelterManagement from "../pages/Shelter_Administrator/ShelterManagement";
import OccupancyManagement from "../pages/Shelter_Administrator/OccupancyManagement";
import AccommodationRequests from "../pages/Shelter_Administrator/AccommodationRequests";
import ResidentManagement from "../pages/Shelter_Administrator/ResidentManagement";
import RoomBedManagement from "../pages/Shelter_Administrator/RoomBedManagement";
import ResourceInventory from "../pages/Shelter_Administrator/ResourceInventory";
import StaffManagement from "../pages/Shelter_Administrator/StaffManagement";
import HealthSafety from "../pages/Shelter_Administrator/HealthSafety";
import MaintenanceIncidents from "../pages/Shelter_Administrator/MaintenanceIncidents";
import ReportsAnalytics from "../pages/Shelter_Administrator/ReportsAnalytics";
import DisasterUpdates from "../pages/Shelter_Administrator/DisasterUpdates";
import ShelterNotifications from "../pages/Shelter_Administrator/Notifications";
import SettingsPage from "../pages/Shelter_Administrator/Settings";

// Admin Layout & Pages
// import AdminLayout from "../layouts/AdminLayout";
// import SystemDashboard from "../pages/admin/Dashboard";
// import AssistanceRequests from "../pages/admin/AssistanceRequests";
// import AdminPlaceholder from "../pages/admin/AdminPlaceholder";

// Officer Dashboard
// import OperationsDashboard from "../pages/officer/OperationsDashboard";
// import UserManagement from "../pages/admin/UserManagement";
// import AIRecommendationReview from "../pages/admin/AIRecommendationReview";
// import OrganisationManagement from "../pages/admin/OrganisationManagement";
// import VerificationQueue from "../pages/admin/VerificationQueue";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/citizen" element={<Navigate to="/" replace />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        {/* <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<SystemDashboard />} />
          <Route path="/admin/requests" element={<AssistanceRequests />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/ai-review" element={<AIRecommendationReview />} />
          <Route path="/admin/organisations" element={<OrganisationManagement />} />
          <Route path="/admin/verification" element={<VerificationQueue />} />
          <Route path="/admin/integrations" element={<VerificationQueue />} />
          <Route path="/admin/:tab" element={<AdminPlaceholder />} />
        </Route> */}

        {/* Officer Routes */}
        {/* <Route
          path="/officer/dashboard"
          element={<OperationsDashboard />}
        /> */}

        <Route element={<FundingOfficerLayout />}>
          <Route
            path="/funding-officer/campaigns"
            element={<Campaigns />}
          />
          <Route
            path="/funding-officer/donations"
            element={<DonationRecords />}
          />
          <Route
            path="/funding-officer/donors"
            element={<DonorManagement />}
          />
          <Route
            path="/funding-officer/expenditure"
            element={<Expenditure />}
          />
          <Route
            path="/funding-officer/flagged"
            element={<FlaggedTransactions />}
          />
          <Route
            path="/funding-officer/allocations"
            element={<FundAllocations />}
          />
          <Route
            path="/funding-officer/dashboard"
            element={<FundingOfficerDashboard />}
          />
          <Route
            path="/funding-officer/reports"
            element={<FundingReportsAnalytics />}
          />
          <Route
            path="/funding-officer/settings"
            element={<FundingSettingsPage/>}
          />
          <Route
            path="/funding-officer/notifications"
            element={<NotificationsPage/>}
          />
          <Route
            path="/funding-officer/resources"
            element={<ResourceContributions/>}
          />
          <Route
            path="/funding-officer/transparency"
            element={<TransparencyReports/>}
          />
        </Route>

        <Route element={<ShelterLayout />}>

          <Route
            path="/shelter-admin/dashboard"
            element={<ShelterAdminDashboard/>}
          />
          <Route
            path="/shelter-admin/shelters"
            element={<ShelterManagement/>}
          />
          <Route
            path="/shelter-admin/occupancy"
            element={<OccupancyManagement/>}
          />
          <Route
            path="/shelter-admin/requests"
            element={<AccommodationRequests/>}
          />
          <Route
            path="/shelter-admin/residents"
            element={<ResidentManagement/>}
          />
          <Route
            path="/shelter-admin/rooms"
            element={<RoomBedManagement/>}
          />
          <Route
            path="/shelter-admin/resources"
            element={<ResourceInventory/>}
          />
          <Route
            path="/shelter-admin/staff"
            element={<StaffManagement/>}
          />
          <Route
            path="/shelter-admin/health-safety"
            element={<HealthSafety/>}
          />
          <Route
            path="/shelter-admin/maintenance"
            element={<MaintenanceIncidents/>}
          />
          <Route
            path="/shelter-admin/reports"
            element={<ReportsAnalytics/>}
          />
          <Route
            path="/shelter-admin/disaster-updates"
            element={<DisasterUpdates/>}
          />
          <Route
            path="/shelter-admin/notifications"
            element={<ShelterNotifications/>}
          />
          <Route
            path="/shelter-admin/settings"
            element={<SettingsPage/>}
          />
        </Route>
        
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
