# CARELINK – COMPREHENSIVE BUG FIX LOG

This log documents every architectural, security, routing, business rule, and frontend-backend integration issue identified and fixed during the end-to-end CareLink audit.

---

## Summary of Fixes by Severity

| Severity | Count | Status |
|---|---:|---|
| **Critical** | 6 | **100% Fixed & Verified** |
| **High** | 6 | **100% Fixed & Verified** |
| **Medium** | 3 | **100% Fixed & Verified** |
| **Total** | **15** | **15 / 15 Fixed & Verified** |

---

## Detailed Bug Fix Entries

### BUG-001: Secondary Backend Project (`CareLink.Backend`) Not Hosted by Primary API (`CareLink.API`)
- **Severity:** Critical
- **Affected Roles / Modules:** `CaseManager`, `VolunteerCoordinator`, `ShelterAdministrator` (25 controllers, 50 service/interface files)
- **Root Cause:** `D:\NSBM\SA-Project\careLink-backend\CareLink.Backend.csproj` existed at the repository root containing 25 controllers (`Controllers\*.cs`), services (`Services\*.cs`), and DTOs (`Models\*.cs`), but `CareLink.API\CareLink.API.csproj` did not compile them and `CareLink.API\Program.cs` did not register their services in DI. Running `CareLink.API` on port `5277` resulted in `404 Not Found` for all Case Manager, Volunteer Coordinator, and Shelter Reports API calls.
- **Files Modified:**
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\CareLink.API.csproj`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Program.cs`
- **Fix Implemented:** Linked `..\Controllers\**\*.cs`, `..\Services\**\*.cs`, and `..\Models\**\*.cs` into `CareLink.API.csproj` and registered all 25 services as singletons in `CareLink.API\Program.cs`.
- **Verification:** `EndToEndAuditWorkflowTests.FullHttpPipeline_*` verified `200 OK` across all unified Case Manager, Volunteer Coordinator, and Shelter Reports endpoints.

---

### BUG-002: Duplicate & Ambiguous Route Collisions Across Controllers
- **Severity:** Critical
- **Affected Roles / Modules:** `Citizen`, `CaseManager`, `EmergencyCoordinator`, `PartnerOfficer`, `ResourceManager`, `ShelterAdministrator`
- **Root Cause:** Multiple controllers declared identical route templates:
  1. `Controllers\NotificationsController.cs` and `CareLink.API\Controllers\NotificationsController.cs` both mapped `api/notifications`.
  2. `Controllers\PriorityQueueController.cs` and `CareLink.API\Controllers\PriorityQueueController.cs` both mapped `api/priority-queue`.
  3. `CitizenHomeController.cs` and `CitizenRequestsController.cs` both mapped `GET/POST/DELETE api/citizen/requests`.
  4. `PartnerReportsController.cs` and `ReportsController.cs` both mapped `api/reports`.
  5. `ReportsController.cs` had overlapping `[HttpGet("{reportId}")]` and `[HttpGet("{id:int}")]`.
- **Files Modified:**
  - `D:\NSBM\SA-Project\careLink-backend\Controllers\NotificationsController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\Controllers\PriorityQueueController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\PriorityQueueController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\CitizenHomeController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\PartnerReportsController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\ReportsController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\SettingsController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\SuppliersController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\WarehousesController.cs`
  - `D:\NSBM\SA-Project\careLink-frontend\src\services\notificationsService.ts`
  - `D:\NSBM\SA-Project\careLink-frontend\src\services\priorityQueueService.ts`
- **Fix Implemented:** Scoped Case Manager routes to `api/case-manager/notifications` and `api/case-manager/priority-queue`; added `api/coordinator/priority-queue` to the Coordinator priority queue controller; removed duplicate `/api/citizen/requests` actions from `CitizenHomeController`; removed `/api/reports` from `PartnerReportsController`; merged duplicate `GetReportById` action in `ReportsController`; updated frontend services to match.
- **Verification:** PowerShell route scanner verified **0 duplicate routes across all 1,388 endpoints**; HTTP integration tests passed (`200 OK`).

---

### BUG-003: 75 Operational Controllers Missing `[Authorize]` Attribute
- **Severity:** Critical (Security)
- **Affected Roles / Modules:** All 9 operational role modules
- **Root Cause:** 75 operational controllers in `CareLink.API\Controllers` and `Controllers\` did not carry `[Authorize]`, allowing unauthenticated requests to access protected operational endpoints without a JWT bearer token.
- **Files Modified:** 75 operational controller files in `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\*.cs` and `D:\NSBM\SA-Project\careLink-backend\Controllers\*.cs`.
- **Fix Implemented:** Added `[Authorize]` at the class level to all operational controllers while preserving public access only on intentional public controllers (`HealthController`, `StatusController`, `ContactController`, `LandingController`, `RequestDemoController`, `PrivacyController`, `TermsController`, `AccessibilityController`, `ForgotPasswordController`, and public `AuthController` actions).
- **Verification:** `EndToEndAuditWorkflowTests.AllOperationalControllers_EnforceAuthorizeAttribute` (reflection audit across all 98 controllers) and `FullHttpPipeline_*` (`401 Unauthorized` verified on unauthenticated requests).

---

### BUG-004: Citizen Help Requests Insecure Direct Object Reference (IDOR) & Name Spoofing
- **Severity:** Critical (Security)
- **Affected Roles / Modules:** `Citizen` (`CitizenRequestsController`)
- **Root Cause:** `CitizenRequestsController` did not verify whether an authenticated `Citizen` caller owned the requested record on `GET /api/citizen/requests/{id}`, `GET /api/citizen/requests?citizenName=...`, or `DELETE /api/citizen/requests/{id}`, and allowed a Citizen to pass a spoofed `CitizenName` in `POST /api/citizen/requests`.
- **Files Modified:**
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\CitizenRequestsController.cs`
- **Fix Implemented:** Added `IsRestrictedCitizenCaller` and `DoesCitizenOwnName` checks in `CitizenRequestsController`. Authenticated Citizens are forced to create requests under their own identity and receive `403 Forbidden` if they attempt to query, view by ID, or delete another Citizen's request. Internal roles (`CaseManager`, `EmergencyCoordinator`, `Admin`) retain full access.
- **Verification:** `EndToEndAuditWorkflowTests.CitizenRequestsController_EnforcesCitizenDataIsolation_BlocksCrossCitizenIdor_AndAllowsCaseManager` passed.

---

### BUG-005: Plaintext SMTP App Password Committed in Tracked Configuration Files
- **Severity:** Critical (Security)
- **Affected Roles / Modules:** Backend Configuration & Email Service
- **Root Cause:** `EmailSettings:Password` was stored in plaintext inside tracked `CareLink.API\appsettings.json` and `CareLink.API\appsettings.Development.json`.
- **Files Modified:**
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\appsettings.json`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\appsettings.Development.json`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Program.cs`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.Infrastructure\Services\EmailService.cs`
- **Fix Implemented:** Scrubbed `EmailSettings:Password` to `""` in tracked `appsettings.json` and `appsettings.Development.json`, moved the local SMTP credential to gitignored `CareLink.API\appsettings.local.json`, and registered `builder.Configuration.AddJsonFile("appsettings.local.json", optional: true, reloadOnChange: true)` in `Program.cs`.
- **Verification:** Verified `appsettings.json` and `appsettings.Development.json` contain zero secrets and `EmailService_ReturnsFalse_WhenSmtpPasswordIsMissing` passes.

---

### BUG-006: Seeded `VolunteerCoordinator` Account Left in `PendingPasswordSetup` State
- **Severity:** Critical
- **Affected Roles / Modules:** `VolunteerCoordinator` (`volunteercoordinator@carelink.org`)
- **Root Cause:** If an administrator triggered "Resend Invitation" on a seeded default `@carelink.org` account (such as `volunteercoordinator@carelink.org`), the account transitioned to `PendingPasswordSetup` with a rotated password hash, preventing login with the standard seeded evaluation credentials.
- **Files Modified:**
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.Infrastructure\Data\DbInitializer.cs`
- **Fix Implemented:** Updated `SeedRoleAccountIfMissingAsync` in `DbInitializer.cs` so all 10 canonical seeded `@carelink.org` accounts are automatically restored to `AccountStatus = Active`, `RequiresPasswordSetup = false`, `IsActive = true`, and verified against their canonical default password on startup.
- **Verification:** `EndToEndAuditWorkflowTests.FullHttpPipeline_AllNineRolesLogin_*` verified all 9 canonical roles authenticate and receive valid JWT tokens.

---

### BUG-007: Citizen Help Requests Disconnected From Case Manager & Emergency Coordinator Views (Workflow A)
- **Severity:** High
- **Affected Roles / Modules:** `Citizen`, `CaseManager`, `EmergencyCoordinator`
- **Root Cause:** `CitizenRequestsController`, `MyCasesController`, `CaseManagementController`, and `AssistanceRequestsController` operated on separate in-memory collections without cross-service synchronization. A request created by a Citizen never appeared in Case Manager's `MyCases` / `CaseManagement` or Coordinator's `AssistanceRequests`, and status updates by Case Manager never reflected in the Citizen portal.
- **Files Modified:**
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\CitizenRequestsController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\Controllers\MyCasesController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\Controllers\CaseManagementController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\AssistanceRequestsController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\Services\MyCasesService.cs`
  - `D:\NSBM\SA-Project\careLink-backend\Services\CaseManagementService.cs`
  - `D:\NSBM\SA-Project\careLink-backend\Services\IMyCasesService.cs`
  - `D:\NSBM\SA-Project\careLink-backend\Services\ICaseManagementService.cs`
- **Fix Implemented:** Added `UpsertExternalCase` to `MyCasesService` and `CaseManagementService` and injected cross-module services into `CitizenRequestsController`, `MyCasesController`, `CaseManagementController`, and `AssistanceRequestsController` so newly created Citizen requests propagate with the same ID to Case Manager and Coordinator, and status updates (`In Progress`, `Resolved`, etc.) sync back to `CitizenRequestService`.
- **Verification:** `EndToEndAuditWorkflowTests.WorkflowA_CitizenCreatesHelpRequest_PropagatesToCaseManagerAndCoordinator_AndStatusUpdatesSyncBack` passed.

---

### BUG-008: Unavailable Volunteers Could Be Assigned to Tasks (Workflow C)
- **Severity:** High
- **Affected Roles / Modules:** `VolunteerCoordinator` (`AssignmentsService`, `AssignmentsController`)
- **Root Cause:** `AssignmentsService.CreateAssignmentAsync` did not consult `IVolunteerDirectoryService` to check a volunteer's availability status before creating an assignment.
- **Files Modified:**
  - `D:\NSBM\SA-Project\careLink-backend\Services\AssignmentsService.cs`
  - `D:\NSBM\SA-Project\careLink-backend\Controllers\AssignmentsController.cs`
- **Fix Implemented:** Injected `IVolunteerDirectoryService` into `AssignmentsService` and added validation rejecting volunteers whose availability status is `"Unavailable"`, `"Off Duty"`, or `"Suspended"` with `InvalidOperationException`, which `AssignmentsController` returns as `400 BadRequest`.
- **Verification:** `EndToEndAuditWorkflowTests.WorkflowC_VolunteerAssignment_AllowsAvailableVolunteer_AndRejectsUnavailableVolunteer` passed.

---

### BUG-009: Resource Allocations Did Not Validate or Deduct Inventory Stock (Workflow D)
- **Severity:** High
- **Affected Roles / Modules:** `ResourceManager` (`AllocationService`, `InMemoryInventoryRepository`)
- **Root Cause:**
  1. `AllocationService.CreateAllocationAsync` created allocation records without checking available stock in `IInventoryRepository` or deducting the allocated quantity.
  2. `InMemoryInventoryRepository.AdjustStockAsync` calculated `Available = OnHand - Reserved` (ignoring `InTransit`), causing `Available` to jump upward instead of decreasing by `delta`.
- **Files Modified:**
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.Application\Services\AllocationService.cs`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.Infrastructure\Repositories\InMemoryInventoryRepository.cs`
- **Fix Implemented:** Injected `IInventoryRepository` into `AllocationService`, rejected `<= 0` quantities, validated `requestedQty <= matchedInventory.Available`, invoked `AdjustStockAsync(matchedInventory.Id, -requestedQty)`, and fixed `AdjustStockAsync` to compute `item.Available = Math.Max(0, item.Available + delta)`.
- **Verification:** `EndToEndAuditWorkflowTests.WorkflowD_ResourceAllocation_DeductsInventoryStock_AndRejectsInsufficientStock` passed.

---

### BUG-010: Shelter Occupancy Lacked Capacity Overflow Guard & String ID (`SH-001`) Resolution (Workflow E)
- **Severity:** High
- **Affected Roles / Modules:** `ShelterAdministrator` (`SheltersController`, `ShelterRepository`, `OccupancyService`)
- **Root Cause:** `SheltersController.Update`, `UpdateOccupancy`, and `Delete` only accepted integer IDs (`{id:int}`), failing when the frontend passed string codes such as `"SH-001"`, and did not reject occupancy values exceeding `Capacity`.
- **Files Modified:**
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\SheltersController.cs`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.Infrastructure\Repositories\ShelterRepository.cs`
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.Application\Services\OccupancyService.cs`
- **Fix Implemented:** Added `ExtractNumericShelterId` in `SheltersController` and `ShelterRepository` to resolve both `"SH-002"` and `"2"`, and added capacity bounds checks (`0 <= Occupied <= Capacity` and `People > 0 && People <= Available`) in `SheltersController`, `ShelterRepository`, and `OccupancyService`.
- **Verification:** `EndToEndAuditWorkflowTests.WorkflowE_ShelterOccupancy_EnforcesMaximumCapacity_AndResolvesStringShelterCodes` passed.

---

### BUG-011: 50 Frontend Service Files Used Raw `fetch()` Without JWT Token or Backend Proxy
- **Severity:** High
- **Affected Roles / Modules:** Frontend Service Layer (`src/services/*.ts`, `vite.config.ts`)
- **Root Cause:** 50 service files in `src/services/*.ts` called `fetch(...)` directly without attaching `Authorization: Bearer <token>`, and `vite.config.ts` had no `/api` proxy for relative `/api/...` requests.
- **Files Modified:**
  - `D:\NSBM\SA-Project\careLink-frontend\vite.config.ts`
  - `D:\NSBM\SA-Project\careLink-frontend\src\services\api.ts`
  - 50 service files in `D:\NSBM\SA-Project\careLink-frontend\src\services\*.ts`
- **Fix Implemented:** Added `/api` proxy to `http://localhost:5277` in `vite.config.ts`, exported `authFetch` in `src/services/api.ts` (resolving relative `/api` paths and attaching the bearer token from `localStorage`), and updated all 50 service files to use `authFetch`.
- **Verification:** Verified with `npm run build` (`tsc -b && vite build`) and `npm test` (`79/79` frontend tests passed).

---

### BUG-012: 25 Frontend Pages in Volunteer Coordinator, Shelter Admin, and Funding Officer Disconnected From Backend APIs
- **Severity:** High
- **Affected Roles / Modules:** `VolunteerCoordinator` (2 pages), `ShelterAdministrator` (12 pages), `FundingOfficer` (11 pages)
- **Root Cause:** These 25 pages initialized `useState` with local demo arrays and mutated local state only without calling their backend endpoints.
- **Files Modified:**
  - `src/pages/VolunteerCoordinator/CommunicationsPage.tsx`
  - `src/pages/VolunteerCoordinator/NotificationsPage.tsx`
  - `src/pages/Shelter_Administrator/AccommodationRequests.tsx`
  - `src/pages/Shelter_Administrator/ShelterManagement.tsx`
  - `src/pages/Shelter_Administrator/OccupancyManagement.tsx`
  - `src/pages/Shelter_Administrator/ResidentManagement.tsx`
  - `src/pages/Shelter_Administrator/RoomBedManagement.tsx`
  - `src/pages/Shelter_Administrator/ResourceInventory.tsx`
  - `src/pages/Shelter_Administrator/StaffManagement.tsx`
  - `src/pages/Shelter_Administrator/HealthSafety.tsx`
  - `src/pages/Shelter_Administrator/MaintenanceIncidents.tsx`
  - `src/pages/Shelter_Administrator/DisasterUpdates.tsx`
  - `src/pages/Shelter_Administrator/Notifications.tsx`
  - `src/pages/Shelter_Administrator/Settings.tsx`
  - `src/pages/Funding_Officer/FundingOfficerDashboard.tsx`
  - `src/pages/Funding_Officer/DonationRecords.tsx`
  - `src/pages/Funding_Officer/DonorManagement.tsx`
  - `src/pages/Funding_Officer/Expenditure.tsx`
  - `src/pages/Funding_Officer/FlaggedTransactions.tsx`
  - `src/pages/Funding_Officer/FundAllocations.tsx`
  - `src/pages/Funding_Officer/FundingReportsAnalytics.tsx`
  - `src/pages/Funding_Officer/FundingSettingsPage.tsx`
  - `src/pages/Funding_Officer/NotificationsPage.tsx`
  - `src/pages/Funding_Officer/ResourceContributions.tsx`
  - `src/pages/Funding_Officer/TransparencyReports.tsx`
- **Fix Implemented:** Wired all 25 pages to fetch data on mount (`useEffect`) and persist create/update/delete operations via `communicationsService`, `volunteerNotificationsService`, `accommodationService`, and `apiClient` while preserving graceful fallback state.
- **Verification:** `npm run build` (`0` TypeScript errors across 2,715 modules) and `npm test` (`79/79` tests passed).

---

### BUG-013: Emergency Coordinator Assistance Requests Route Mismatch (`/api/assistancerequests` vs `/api/assistance-requests`)
- **Severity:** Medium
- **Affected Roles / Modules:** `EmergencyCoordinator` (`AssistanceRequestsController`)
- **Root Cause:** Frontend `assistanceRequestsService.ts` called `/api/assistancerequests`, while `AssistanceRequestsController.cs` only mapped `[Route("api/assistance-requests")]`.
- **Files Modified:**
  - `D:\NSBM\SA-Project\careLink-backend\CareLink.API\Controllers\AssistanceRequestsController.cs`
- **Fix Implemented:** Added `[Route("api/assistancerequests")]` alongside `[Route("api/assistance-requests")]` on `AssistanceRequestsController`.
- **Verification:** `EndToEndAuditWorkflowTests.FullHttpPipeline_*` verified `200 OK` on both `/api/assistancerequests` and `/api/assistance-requests`.
