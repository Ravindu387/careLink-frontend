import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

// Public & Authentication Pages
import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import SetupPasswordPage from "../pages/auth/SetupPasswordPage";
import AccessDeniedPage from "../pages/public/AccessDeniedPage";
import NotFoundPage from "../pages/public/NotFoundPage";

// 1. Admin Layout & Pages
import AdminLayout from "../layouts/AdminLayout";
import SystemDashboard from "../pages/admin/Dashboard";
import AssistanceRequests from "../pages/admin/AssistanceRequests";
import AdminPlaceholder from "../pages/admin/AdminPlaceholder";
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
import AdminNotificationsPage from "../pages/admin/NotificationsPage";

// 2. CaseManager Layout & Pages
import CaseManagerLayout from "../layouts/CaseManagerLayout";
import CaseManagementDashboard from "../pages/CaseManager/CaseManagementDashboard";
import MyCases from "../pages/CaseManager/MyCases";
import UnassignedCases from "../pages/CaseManager/UnassignedCases";
import CaseVerification from "../pages/CaseManager/CaseVerification";
import CasePriorityQueue from "../pages/CaseManager/PriorityQueue";
import PotentialDuplicates from "../pages/CaseManager/PotentialDuplicates";
import EscalatedCases from "../pages/CaseManager/EscalatedCases";
import RequestHistory from "../pages/CaseManager/RequestHistory";
import CaseManagerNotifications from "../pages/CaseManager/Notifications";
import CaseReportsAnalytics from "../pages/CaseManager/CaseReportsAnalytics";
import CaseManagerSettings from "../pages/CaseManager/Settings";

// 3. Citizen Layout & Pages
import CitizenLayout from "../layouts/CitizenLayout";
import CitizenHomePage from "../pages/citizen/HomePage";
import CitizenDashboard from "../pages/citizen/CitizenDashboard";
import RequestHelpPage from "../pages/citizen/RequestHelpPage";
import MyRequestsPage from "../pages/citizen/MyRequestsPage";
import NearbySupportPage from "../pages/citizen/NearbySupportPage";
import CitizenSheltersPage from "../pages/citizen/SheltersPage";
import SafetyUpdatesPage from "../pages/citizen/SafetyUpdatesPage";
import MyHouseholdPage from "../pages/citizen/MyHouseholdPage";
import MyDocumentsPage from "../pages/citizen/MyDocumentsPage";
import MessagesPage from "../pages/citizen/MessagesPage";
import CitizenNotificationsPage from "../pages/citizen/NotificationsPage";
import FeedbackPage from "../pages/citizen/FeedbackPage";
import CitizenProfileSettings from "../pages/citizen/ProfileSettings";

// 4. EmergencyCoordinator Layout & Pages
import EmergencyCoordinatorLayout from "../layouts/EmergencyCoordinatorLayout";
import OperationsDashboard from "../pages/Emegency Coordinator/OperationDashboard";
import CrisisEvents from "../pages/Emegency Coordinator/CrisisEvent";
import CoordinatorAssistanceRequests from "../pages/Emegency Coordinator/AssistanceRequests";
import CoordinatorPriorityQueue from "../pages/Emegency Coordinator/PriorityQueue";
import CoordinatorAIRecommendations from "../pages/Emegency Coordinator/AIRecommendations";
import ResourceOverview from "../pages/Emegency Coordinator/ResourceOverview";
import ShelterOverview from "../pages/Emegency Coordinator/ShelterOverview";
import PartnerOrganisations from "../pages/Emegency Coordinator/PartnerOrganisations";
import LiveOperationsMap from "../pages/Emegency Coordinator/LiveOperationsMap";
import SituationReports from "../pages/Emegency Coordinator/SituationReports";
import AuditTimeline from "../pages/Emegency Coordinator/AuditTimeline";
import CoordinatorNotifications from "../pages/Emegency Coordinator/Notifications";
import CoordinatorSettings from "../pages/Emegency Coordinator/Settings";

// 5. FundingOfficer Layout & Pages
import FundingOfficerLayout from "../layouts/FundingOfficerLayout";
import FundingOfficerDashboard from "../pages/Funding_Officer/FundingOfficerDashboard";
import Campaigns from "../pages/Funding_Officer/Campaigns";
import DonationRecords from "../pages/Funding_Officer/DonationRecords";
import DonorManagement from "../pages/Funding_Officer/DonorManagement";
import Expenditure from "../pages/Funding_Officer/Expenditure";
import FlaggedTransactions from "../pages/Funding_Officer/FlaggedTransactions";
import FundAllocations from "../pages/Funding_Officer/FundAllocations";
import FundingReportsAnalytics from "../pages/Funding_Officer/FundingReportsAnalytics";
import FundingNotificationsPage from "../pages/Funding_Officer/NotificationsPage";
import ResourceContributions from "../pages/Funding_Officer/ResourceContributions";
import TransparencyReports from "../pages/Funding_Officer/TransparencyReports";
import FundingSettingsPage from "../pages/Funding_Officer/FundingSettingsPage";

// 6. PartnerOfficer Layout & Pages
import PartnerOfficerLayout from "../layouts/PartnerOfficerLayout";
import PartnerDashboard from "../pages/PartnerOfficer/Dashboard";
import PartnerOrganisationProfile from "../pages/PartnerOfficer/OrganisationProfile";
import SharedCrisisEvents from "../pages/PartnerOfficer/SharedCrisisEvents";
import AssistanceReferrals from "../pages/PartnerOfficer/AssistanceReferrals";
import ResourceSharing from "../pages/PartnerOfficer/ResourceSharing";
import CollaborationRequests from "../pages/PartnerOfficer/CollaborationRequests";
import FieldActivities from "../pages/PartnerOfficer/FieldActivities";
import TeamContacts from "../pages/PartnerOfficer/TeamContacts";
import PartnerDocuments from "../pages/PartnerOfficer/Documents";
import PartnerReports from "../pages/PartnerOfficer/Reports";
import PartnerNotifications from "../pages/PartnerOfficer/Notifications";
import PartnerAuditLog from "../pages/PartnerOfficer/AuditLog";
import PartnerSettings from "../pages/PartnerOfficer/Settings";

// 7. ResourceManager Layout & Pages
import ResourceManagerLayout from "../layouts/ResourceManagerLayout";
import ResourceDashboard from "../pages/ResourceManager/ResourceDashboard";
import InventoryPage from "../pages/ResourceManager/InventoryPage";
import WarehousePage from "../pages/ResourceManager/WarehousePage";
import ResourceRequestsPage from "../pages/ResourceManager/ResourceRequestsPage";
import AllocationPage from "../pages/ResourceManager/AllocationPage";
import DispatchTrackingPage from "../pages/ResourceManager/DispatchTrackingPage";
import StockTransferPage from "../pages/ResourceManager/StockTransferPage";
import ProcurementPage from "../pages/ResourceManager/ProcurementPage";
import SupplierPage from "../pages/ResourceManager/SupplierPage";
import AlertsPage from "../pages/ResourceManager/AlertsPage";
import ResourceReportsAnalyticsPage from "../pages/ResourceManager/ReportsAnalyticsPage";
import ResourceAuditLogPage from "../pages/ResourceManager/AuditLogPage";
import ResourceSettingsPage from "../pages/ResourceManager/SettingsPage";

// 8. ShelterAdministrator Layout & Pages
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
import ShelterReportsAnalytics from "../pages/Shelter_Administrator/ReportsAnalytics";
import DisasterUpdates from "../pages/Shelter_Administrator/DisasterUpdates";
import ShelterNotifications from "../pages/Shelter_Administrator/Notifications";
import ShelterSettingsPage from "../pages/Shelter_Administrator/Settings";

// 9. VolunteerCoordinator Layout & Pages
import VolunteerLayout from "../layouts/VolunteerLayout";
import VolunteerCoordinationDashboard from "../pages/VolunteerCoordinator/VolunteerCoordinationDashboard";
import VolunteerDirectory from "../pages/VolunteerCoordinator/VolunteerDirectory";
import PendingVerification from "../pages/VolunteerCoordinator/PendingVerification";
import SkillsAvailability from "../pages/VolunteerCoordinator/SkillsAvailability";
import TasksPage from "../pages/VolunteerCoordinator/TasksPage";
import AssignmentsPage from "../pages/VolunteerCoordinator/AssignmentsPage";
import AIVolunteerMatchingPage from "../pages/VolunteerCoordinator/AIVolunteerMatchingPage";
import ActivityTrackingPage from "../pages/VolunteerCoordinator/ActivityTrackingPage";
import TrainingCertificationsPage from "../pages/VolunteerCoordinator/TrainingCertificationsPage";
import CommunicationsPage from "../pages/VolunteerCoordinator/CommunicationsPage";
import VolunteerReportsAnalyticsPage from "../pages/VolunteerCoordinator/ReportsAnalyticsPage";
import VolunteerNotificationsPage from "../pages/VolunteerCoordinator/NotificationsPage";
import VolunteerSettingsPage from "../pages/VolunteerCoordinator/SettingsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ============================================================== */}
          {/* PUBLIC & AUTHENTICATION ROUTES                                 */}
          {/* ============================================================== */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/setup-account" element={<SetupPasswordPage />} />
          <Route path="/setup-password" element={<SetupPasswordPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* ============================================================== */}
          {/* 1. ADMIN ROUTES (/admin/*)                                     */}
          {/* ============================================================== */}
          <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<SystemDashboard />} />
              <Route path="/admin/requests" element={<AssistanceRequests />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route
                path="/admin/ai-review"
                element={<AIRecommendationReview />}
              />
              <Route
                path="/admin/ai-recommendations"
                element={<AIRecommendationReview />}
              />
              <Route
                path="/admin/organisations"
                element={<OrganisationManagement />}
              />
              <Route
                path="/admin/verification"
                element={<VerificationQueue />}
              />
              <Route
                path="/admin/integrations"
                element={<IntegrationHealth />}
              />
              <Route
                path="/admin/security-events"
                element={<SecurityEvents />}
              />
              <Route path="/admin/roles" element={<RolesPermissions />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route
                path="/admin/notifications"
                element={<AdminNotificationsPage />}
              />
              <Route path="/admin/crises" element={<CrisisEvents />} />
              <Route path="/admin/resources" element={<ResourceOverview />} />
              <Route path="/admin/shelters" element={<ShelterOverview />} />
              <Route
                path="/admin/volunteers"
                element={<VolunteerDirectory />}
              />
              <Route path="/admin/donations" element={<DonationRecords />} />
              <Route
                path="/admin/situation-reports"
                element={<SituationReports />}
              />
              <Route
                path="/admin/operations-map"
                element={<LiveOperationsMap />}
              />
              <Route path="/admin/:tab" element={<AdminPlaceholder />} />
            </Route>
          </Route>

          {/* ============================================================== */}
          {/* 2. CASE MANAGER ROUTES (/case-manager/*)                       */}
          {/* ============================================================== */}
          <Route element={<ProtectedRoute allowedRoles={["CaseManager"]} />}>
            <Route
              path="/case-manager"
              element={<Navigate to="/case-manager/dashboard" replace />}
            />
            <Route element={<CaseManagerLayout />}>
              <Route
                path="/case-manager/dashboard"
                element={<CaseManagementDashboard />}
              />
              <Route path="/case-manager/my-cases" element={<MyCases />} />
              <Route
                path="/case-manager/unassigned-cases"
                element={<UnassignedCases />}
              />
              <Route
                path="/case-manager/verification"
                element={<CaseVerification />}
              />
              <Route
                path="/case-manager/priority-queue"
                element={<CasePriorityQueue />}
              />
              <Route
                path="/case-manager/potential-duplicates"
                element={<PotentialDuplicates />}
              />
              <Route
                path="/case-manager/escalated-cases"
                element={<EscalatedCases />}
              />
              <Route
                path="/case-manager/request-history"
                element={<RequestHistory />}
              />
              <Route
                path="/case-manager/notifications"
                element={<CaseManagerNotifications />}
              />
              <Route
                path="/case-manager/reports"
                element={<CaseReportsAnalytics />}
              />
              <Route
                path="/case-manager/settings"
                element={<CaseManagerSettings />}
              />
            </Route>
          </Route>

          {/* ============================================================== */}
          {/* 3. CITIZEN ROUTES (/citizen/*)                                 */}
          {/* ============================================================== */}
          <Route element={<ProtectedRoute allowedRoles={["Citizen"]} />}>
            <Route
              path="/citizen"
              element={<Navigate to="/citizen/dashboard" replace />}
            />
            <Route element={<CitizenLayout />}>
              <Route path="/citizen/dashboard" element={<CitizenHomePage />} />
              <Route path="/citizen/home" element={<CitizenHomePage />} />
              <Route path="/citizen/overview" element={<CitizenDashboard />} />
              <Route
                path="/citizen/request-help"
                element={<RequestHelpPage />}
              />
              <Route path="/citizen/my-requests" element={<MyRequestsPage />} />
              <Route
                path="/citizen/nearby-support"
                element={<NearbySupportPage />}
              />
              <Route
                path="/citizen/shelters"
                element={<CitizenSheltersPage />}
              />
              <Route
                path="/citizen/safety-updates"
                element={<SafetyUpdatesPage />}
              />
              <Route
                path="/citizen/my-household"
                element={<MyHouseholdPage />}
              />
              <Route
                path="/citizen/my-documents"
                element={<MyDocumentsPage />}
              />
              <Route path="/citizen/messages" element={<MessagesPage />} />
              <Route
                path="/citizen/notifications"
                element={<CitizenNotificationsPage />}
              />
              <Route path="/citizen/feedback" element={<FeedbackPage />} />
              <Route
                path="/citizen/profile"
                element={<CitizenProfileSettings />}
              />
              <Route
                path="/citizen/settings"
                element={<CitizenProfileSettings />}
              />
            </Route>
          </Route>

          {/* ============================================================== */}
          {/* 4. EMERGENCY COORDINATOR ROUTES (/emergency-coordinator/*)     */}
          {/* ============================================================== */}
          <Route
            element={<ProtectedRoute allowedRoles={["EmergencyCoordinator"]} />}
          >
            <Route
              path="/emergency-coordinator"
              element={
                <Navigate to="/emergency-coordinator/dashboard" replace />
              }
            />
            <Route element={<EmergencyCoordinatorLayout />}>
              <Route
                path="/emergency-coordinator/dashboard"
                element={<OperationsDashboard />}
              />
              <Route
                path="/emergency-coordinator/crisis-events"
                element={<CrisisEvents />}
              />
              <Route
                path="/emergency-coordinator/assistance-requests"
                element={<CoordinatorAssistanceRequests />}
              />
              <Route
                path="/emergency-coordinator/priority-queue"
                element={<CoordinatorPriorityQueue />}
              />
              <Route
                path="/emergency-coordinator/ai-recommendations"
                element={<CoordinatorAIRecommendations />}
              />
              <Route
                path="/emergency-coordinator/resource-overview"
                element={<ResourceOverview />}
              />
              <Route
                path="/emergency-coordinator/shelter-overview"
                element={<ShelterOverview />}
              />
              <Route
                path="/emergency-coordinator/partners"
                element={<PartnerOrganisations />}
              />
              <Route
                path="/emergency-coordinator/live-map"
                element={<LiveOperationsMap />}
              />
              <Route
                path="/emergency-coordinator/situation-reports"
                element={<SituationReports />}
              />
              <Route
                path="/emergency-coordinator/audit-timeline"
                element={<AuditTimeline />}
              />
              <Route
                path="/emergency-coordinator/notifications"
                element={<CoordinatorNotifications />}
              />
              <Route
                path="/emergency-coordinator/settings"
                element={<CoordinatorSettings />}
              />
            </Route>
          </Route>

          {/* ============================================================== */}
          {/* 5. FUNDING OFFICER ROUTES (/funding-officer/*)                 */}
          {/* ============================================================== */}
          <Route element={<ProtectedRoute allowedRoles={["FundingOfficer"]} />}>
            <Route
              path="/funding-officer"
              element={<Navigate to="/funding-officer/dashboard" replace />}
            />
            <Route element={<FundingOfficerLayout />}>
              <Route
                path="/funding-officer/dashboard"
                element={<FundingOfficerDashboard />}
              />
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
                path="/funding-officer/reports"
                element={<FundingReportsAnalytics />}
              />
              <Route
                path="/funding-officer/resources"
                element={<ResourceContributions />}
              />
              <Route
                path="/funding-officer/transparency"
                element={<TransparencyReports />}
              />
              <Route
                path="/funding-officer/notifications"
                element={<FundingNotificationsPage />}
              />
              <Route
                path="/funding-officer/settings"
                element={<FundingSettingsPage />}
              />
            </Route>
          </Route>

          {/* ============================================================== */}
          {/* 6. PARTNER OFFICER ROUTES (/partner/*)                         */}
          {/* ============================================================== */}
          <Route element={<ProtectedRoute allowedRoles={["PartnerOfficer"]} />}>
            <Route
              path="/partner"
              element={<Navigate to="/partner/dashboard" replace />}
            />
            <Route element={<PartnerOfficerLayout />}>
              <Route path="/partner/dashboard" element={<PartnerDashboard />} />
              <Route
                path="/partner/organisation-profile"
                element={<PartnerOrganisationProfile />}
              />
              <Route
                path="/partner/shared-crisis-events"
                element={<SharedCrisisEvents />}
              />
              <Route
                path="/partner/assistance-referrals"
                element={<AssistanceReferrals />}
              />
              <Route
                path="/partner/resource-sharing"
                element={<ResourceSharing />}
              />
              <Route
                path="/partner/collaboration-requests"
                element={<CollaborationRequests />}
              />
              <Route
                path="/partner/field-activities"
                element={<FieldActivities />}
              />
              <Route path="/partner/team-contacts" element={<TeamContacts />} />
              <Route
                path="/partner/documents"
                element={<PartnerDocuments />}
              />
              <Route path="/partner/reports" element={<PartnerReports />} />
              <Route
                path="/partner/notifications"
                element={<PartnerNotifications />}
              />
              <Route path="/partner/audit-log" element={<PartnerAuditLog />} />
              <Route path="/partner/settings" element={<PartnerSettings />} />
            </Route>
          </Route>

          {/* ============================================================== */}
          {/* 7. RESOURCE MANAGER ROUTES (/resource-manager/*)               */}
          {/* ============================================================== */}
          <Route
            element={<ProtectedRoute allowedRoles={["ResourceManager"]} />}
          >
            <Route
              path="/resource-manager"
              element={<Navigate to="/resource-manager/dashboard" replace />}
            />
            <Route element={<ResourceManagerLayout />}>
              <Route
                path="/resource-manager/dashboard"
                element={<ResourceDashboard />}
              />
              <Route
                path="/resource-manager/inventory"
                element={<InventoryPage />}
              />
              <Route
                path="/resource-manager/warehouses"
                element={<WarehousePage />}
              />
              <Route
                path="/resource-manager/requests"
                element={<ResourceRequestsPage />}
              />
              <Route
                path="/resource-manager/allocations"
                element={<AllocationPage />}
              />
              <Route
                path="/resource-manager/dispatch"
                element={<DispatchTrackingPage />}
              />
              <Route
                path="/resource-manager/transfers"
                element={<StockTransferPage />}
              />
              <Route
                path="/resource-manager/procurement"
                element={<ProcurementPage />}
              />
              <Route
                path="/resource-manager/suppliers"
                element={<SupplierPage />}
              />
              <Route path="/resource-manager/alerts" element={<AlertsPage />} />
              <Route
                path="/resource-manager/reports"
                element={<ResourceReportsAnalyticsPage />}
              />
              <Route
                path="/resource-manager/audit-log"
                element={<ResourceAuditLogPage />}
              />
              <Route
                path="/resource-manager/settings"
                element={<ResourceSettingsPage />}
              />
            </Route>
          </Route>

          {/* ============================================================== */}
          {/* 8. SHELTER ADMINISTRATOR ROUTES (/shelter-admin/*)             */}
          {/* ============================================================== */}
          <Route
            element={<ProtectedRoute allowedRoles={["ShelterAdministrator"]} />}
          >
            <Route
              path="/shelter-admin"
              element={<Navigate to="/shelter-admin/dashboard" replace />}
            />
            <Route element={<ShelterLayout />}>
              <Route
                path="/shelter-admin/dashboard"
                element={<ShelterAdminDashboard />}
              />
              <Route
                path="/shelter-admin/shelters"
                element={<ShelterManagement />}
              />
              <Route
                path="/shelter-admin/occupancy"
                element={<OccupancyManagement />}
              />
              <Route
                path="/shelter-admin/requests"
                element={<AccommodationRequests />}
              />
              <Route
                path="/shelter-admin/residents"
                element={<ResidentManagement />}
              />
              <Route
                path="/shelter-admin/rooms"
                element={<RoomBedManagement />}
              />
              <Route
                path="/shelter-admin/resources"
                element={<ResourceInventory />}
              />
              <Route
                path="/shelter-admin/staff"
                element={<StaffManagement />}
              />
              <Route
                path="/shelter-admin/health-safety"
                element={<HealthSafety />}
              />
              <Route
                path="/shelter-admin/maintenance"
                element={<MaintenanceIncidents />}
              />
              <Route
                path="/shelter-admin/reports"
                element={<ShelterReportsAnalytics />}
              />
              <Route
                path="/shelter-admin/disaster-updates"
                element={<DisasterUpdates />}
              />
              <Route
                path="/shelter-admin/notifications"
                element={<ShelterNotifications />}
              />
              <Route
                path="/shelter-admin/settings"
                element={<ShelterSettingsPage />}
              />
            </Route>
          </Route>

          {/* ============================================================== */}
          {/* 9. VOLUNTEER COORDINATOR ROUTES (/volunteer-coordinator/*)     */}
          {/* ============================================================== */}
          <Route
            element={<ProtectedRoute allowedRoles={["VolunteerCoordinator"]} />}
          >
            <Route
              path="/volunteer-coordinator"
              element={
                <Navigate to="/volunteer-coordinator/dashboard" replace />
              }
            />
            <Route element={<VolunteerLayout />}>
              <Route
                path="/volunteer-coordinator/dashboard"
                element={<VolunteerCoordinationDashboard />}
              />
              <Route
                path="/volunteer-coordinator/directory"
                element={<VolunteerDirectory />}
              />
              <Route
                path="/volunteer-coordinator/verification"
                element={<PendingVerification />}
              />
              <Route
                path="/volunteer-coordinator/skills"
                element={<SkillsAvailability />}
              />
              <Route
                path="/volunteer-coordinator/tasks"
                element={<TasksPage />}
              />
              <Route
                path="/volunteer-coordinator/assignments"
                element={<AssignmentsPage />}
              />
              <Route
                path="/volunteer-coordinator/ai-matching"
                element={<AIVolunteerMatchingPage />}
              />
              <Route
                path="/volunteer-coordinator/activity"
                element={<ActivityTrackingPage />}
              />
              <Route
                path="/volunteer-coordinator/training"
                element={<TrainingCertificationsPage />}
              />
              <Route
                path="/volunteer-coordinator/communications"
                element={<CommunicationsPage />}
              />
              <Route
                path="/volunteer-coordinator/reports"
                element={<VolunteerReportsAnalyticsPage />}
              />
              <Route
                path="/volunteer-coordinator/notifications"
                element={<VolunteerNotificationsPage />}
              />
              <Route
                path="/volunteer-coordinator/settings"
                element={<VolunteerSettingsPage />}
              />
            </Route>
          </Route>

          {/* ============================================================== */}
          {/* 404 NOT FOUND ROUTE                                            */}
          {/* ============================================================== */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
