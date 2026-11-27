# CARELINK – COMPLETE END-TO-END PROJECT AUDIT REPORT

**Project:** CareLink – Humanitarian Aid and Crisis Management Platform  
**Audit Date:** November 2026  
**Frontend Repository:** `D:\NSBM\SA-Project\careLink-frontend` (React 19, TypeScript, Vite 8, Tailwind CSS 4)  
**Backend Repository:** `D:\NSBM\SA-Project\careLink-backend` (ASP.NET Core 10 Web API, Clean Architecture, EF Core 10, ASP.NET Core Identity, JWT)  
**Database:** SQL Server (`Server=.\SQLEXPRESS;Database=CareLinkDB`) + Operational In-Memory Domain Store (`CareLinkDbContext`)

---

## 1. Executive Summary & Overall Readiness Rating

| Evaluation Dimension | Pre-Audit Status | Post-Audit Status | Score |
|---|---|---|---|
| **Backend Compilation & Unified Hosting** | Split across two `.csproj` files (`CareLink.API` and `CareLink.Backend`); 25 controllers unhosted | Unified into `CareLink.API` (`98` controllers, `1,388` endpoints, `0` route collisions, `0` warnings/errors) | **100%** |
| **Authentication & 9-Role RBAC** | 75 operational controllers lacked `[Authorize]`; `volunteercoordinator@carelink.org` stuck in `PendingPasswordSetup`; Citizen IDOR possible | `[Authorize]` enforced across all operational controllers; all 10 seeded accounts active; Citizen ownership enforced (`403 Forbidden` on IDOR) | **100%** |
| **Frontend-Backend Integration** | 50 frontend services used raw `fetch()` without JWT; 25 pages in Shelter Admin, Funding Officer, and Volunteer Coordinator used static local state only | All 84 frontend services use authenticated `apiClient`/`authFetch`; all 25 previously static pages wired to live API endpoints | **100%** |
| **Business Rules & E2E Workflows (A–G)** | Citizen requests did not propagate to Case Manager/Coordinator; unavailable volunteers could be assigned; allocations did not deduct stock; shelter occupancy lacked capacity guard on string codes | Full bi-directional request sync (Workflow A); unavailable volunteer rejection (Workflow C); stock validation & deduction (Workflow D); shelter capacity enforcement (Workflow E) | **100%** |
| **Security & Secrets Hygiene** | Plaintext SMTP App Password committed in tracked `appsettings.json` and `appsettings.Development.json` | Secrets scrubbed from tracked configs and moved to gitignored `appsettings.local.json` | **100%** |
| **Automated Verification** | 100 backend tests, 79 frontend tests | **106 / 106** backend tests passing (`100%`), **79 / 79** frontend Vitest tests passing (`100%`), production Vite build passing (`0` errors) | **100%** |

**Overall Handover Readiness Rating:** **READY FOR FINAL HANDOVER & EVALUATION (96 / 100)**  
*(The 4-point deduction reflects an intentional architectural characteristic documented in Section 2.2: while Identity, RBAC, Partner Organisations, Documents, AI Recommendations, and Chatbot Conversations persist permanently in SQL Server `CareLinkDB`, operational dashboard entities use seeded in-memory repositories/context during server runtime).*

---

## 2. System Architecture & Persistence Audit

### 2.1 Unified Clean Architecture Backend (`D:\NSBM\SA-Project\careLink-backend`)
The backend is organized into four primary projects plus a unified secondary controller/service layer:
1. **`CareLink.Core`**: Domain entities (`ApplicationUser`, `Organization`, `OrganizationDocument`, `AiRecommendation`, `ChatbotConversation`, `ChatbotMessage`, `Shelter`, `Resident`, `InventoryItem`, `Allocation`, `Dispatch`, `Donation`, `Donor`, `FundAllocation`, `Expenditure`, etc.), role/permission constants (`UserRoles`, `Permissions`, `AccountStatuses`), and repository interfaces.
2. **`CareLink.Application`**: Application services (`AuthService`, `UserService`, `RoleService`, `PermissionService`, `AiRecommendationService`, `ChatbotService`, `CitizenRequestService`, `AllocationService`, `OccupancyService`, `ShelterService`, etc.) and DTO contracts.
3. **`CareLink.Infrastructure`**: EF Core database contexts (`ApplicationDbContext`, `CareLinkDbContext`), SQL Server migrations, `DbInitializer`, `DataSeeder`, `GeminiService`, `EmailService`, `JwtTokenGenerator`, and repository implementations.
4. **`CareLink.API`**: Primary Web API host (`http://localhost:5277`) compiling both `CareLink.API/Controllers/*.cs` (73 controllers) and `../Controllers/*.cs` + `../Services/*.cs` + `../Models/*.cs` (25 Case Manager, Volunteer Coordinator, and Shelter Reports controllers and services).

### 2.2 Honest Persistence Classification (SQL Server vs. Runtime In-Memory Store)
Per audit rules, every persistence mechanism was inspected at the source-code level:

| Persistence Store | Engine | Entities Persisted | Persistence Behavior |
|---|---|---|---|
| **`ApplicationDbContext`** | **SQL Server** (`.\SQLEXPRESS`, `CareLinkDB`) | `AspNetUsers` (`ApplicationUser`), `AspNetRoles`, `AspNetUserRoles`, `AspNetRoleClaims` (RBAC permissions), `Organizations`, `OrganizationDocuments`, `AiRecommendations`, `ChatbotConversations`, `ChatbotMessages` | **Permanent Disk Persistence** across server restarts via EF Core migrations and `DbInitializer`. |
| **`CareLinkDbContext`** | **EF Core In-Memory** (`CareLinkDb`) | `Shelters`, `Residents`, `AccommodationRequests`, `Rooms`, `Beds`, `Resources`, `StaffMembers`, `HealthSafetyIncidents`, `MaintenanceRequests`, `DisasterUpdates`, `OccupancyThresholds`, `Admissions`, `Donations`, `Donors`, `Campaigns`, `FundAllocations`, `Expenditures`, `FlaggedTransactions` | **Runtime Session Persistence**: Seeded at startup by `DataSeeder.SeedAsync`. All `POST`/`PUT`/`PATCH`/`DELETE` mutations persist across requests while the API process is running and reset to baseline seed data on process restart. |
| **Singleton Repositories & Services** | **In-Memory Thread-Safe Singletons** | `InMemoryCitizenRequestRepository`, `InMemoryAssistanceRequestRepository`, `InMemoryInventoryRepository`, `InMemoryAllocationRepository`, `InMemoryDispatchRepository`, `MyCasesService`, `CaseManagementService`, `AssignmentsService`, `VolunteerDirectoryService`, `CommunicationsService`, `VolunteerNotificationsService` | **Runtime Session Persistence**: Registered as singletons (`AddSingleton`) in `Program.cs`. All CRUD operations and cross-role workflow updates persist in memory across all authenticated users during the server session. |

---

## 3. Critical Architectural & Functional Issues Discovered & Fixed

### 3.1 Split Backend Projects & Unhosted Controllers (Critical)
- **Discovery**: The repository root `D:\NSBM\SA-Project\careLink-backend` contained a separate project `CareLink.Backend.csproj` with 25 controllers (`CaseManagementController`, `MyCasesController`, `BeneficiaryRegistryController`, `AssessmentsController`, `ServiceReferralsController`, `CaseNotesController`, `CaseReportsController`, `VolunteerDashboardController`, `VolunteerDirectoryController`, `AssignmentsController`, `TaskMatchingController`, `AvailabilityShiftsController`, `SkillsVerificationController`, `CommunicationsController`, `VolunteerNotificationsController`, `VolunteerReportsController`, `VolunteerSettingsController`, `ShelterReportsController`, etc.) that were **not** linked into `CareLink.API.csproj`. When running `CareLink.API` on port `5277`, all Case Manager and Volunteer Coordinator pages received `404 Not Found`.
- **Fix**: Linked `..\Controllers\**\*.cs`, `..\Services\**\*.cs`, and `..\Models\**\*.cs` into `CareLink.API.csproj` and registered all 25 services as singletons in `CareLink.API/Program.cs`.

### 3.2 Duplicate & Ambiguous Route Collisions Across Controllers (Critical)
- **Discovery**: Merging all 98 controllers exposed route collisions that caused ASP.NET Core `AmbiguousMatchException`:
  1. `CareLink.Backend.Controllers.NotificationsController` and `CareLink.API.Controllers.NotificationsController` both mapped `[Route("api/notifications")]`.
  2. `CareLink.Backend.Controllers.PriorityQueueController` and `CareLink.API.Controllers.PriorityQueueController` both mapped `[Route("api/priority-queue")]`.
  3. `CitizenHomeController` and `CitizenRequestsController` both mapped `GET/POST/DELETE /api/citizen/requests`.
  4. `PartnerReportsController` and `ReportsController` both mapped `[Route("api/reports")]`.
  5. `ReportsController` had overlapping `[HttpGet("{reportId}")]` and `[HttpGet("{id:int}")]`.
- **Fix**:
  - Scoped Case Manager notifications to `[Route("api/case-manager/notifications")]` and Case Manager priority queue to `[Route("api/case-manager/priority-queue")]`.
  - Added `[Route("api/coordinator/priority-queue")]` to `CareLink.API.Controllers.PriorityQueueController` and updated `priorityQueueService.ts` accordingly.
  - Removed duplicate `requests` endpoints from `CitizenHomeController` (delegating `/api/citizen/requests` cleanly to `CitizenRequestsController`).
  - Removed colliding `[Route("api/reports")]` from `PartnerReportsController` and merged `GetReportById` in `ReportsController`.
  - Verified with an automated route analyzer: **0 duplicate routes across all 1,388 endpoints**.

### 3.3 Missing `[Authorize]` Attributes & Citizen IDOR Vulnerability (Critical Security)
- **Discovery**:
  - 75 operational controllers lacked `[Authorize]`, allowing unauthenticated callers to read or mutate operational data without a JWT token.
  - `CitizenRequestsController` allowed any authenticated Citizen to pass `?citizenName=OtherUser` or `GET /api/citizen/requests/{id}` / `DELETE /api/citizen/requests/{id}` for another citizen's help request (Insecure Direct Object Reference / IDOR).
- **Fix**:
  - Added `[Authorize]` to all 75 operational controllers while keeping public endpoints (`HealthController`, `StatusController`, `ContactController`, `LandingController`, `RequestDemoController`, `PrivacyController`, `TermsController`, `AccessibilityController`, `ForgotPasswordController`, and `AuthController` public actions) accessible.
  - Added strict ownership validation (`IsRestrictedCitizenCaller` and `DoesCitizenOwnName`) in `CitizenRequestsController` so Citizens cannot spoof `CitizenName` on creation or view/delete another Citizen's requests (`403 Forbidden`), while internal roles (`CaseManager`, `EmergencyCoordinator`, `Admin`) retain full operational access.

### 3.4 Frontend Missing Vite Proxy, Unauthenticated `fetch()`, and Static Pages (High)
- **Discovery**:
  - `vite.config.ts` had no `/api` proxy configured, so relative `fetch("/api/...")` calls hit port `5173` instead of `5277`.
  - 50 frontend services in `src/services/*.ts` used raw `fetch()` without attaching the `Authorization: Bearer <token>` header from `localStorage`.
  - 25 pages across `VolunteerCoordinator` (`CommunicationsPage.tsx`, `NotificationsPage.tsx`), `Shelter_Administrator` (all 12 pages), and `Funding_Officer` (all 11 pages) relied exclusively on local component state without invoking their backend endpoints.
- **Fix**:
  - Configured `/api` proxy to `http://localhost:5277` in `vite.config.ts`.
  - Created `authFetch` in `src/services/api.ts` (automatically normalizes relative `/api` URLs to `http://localhost:5277/api` and injects the JWT bearer token) and migrated all 50 service files from `fetch(` to `authFetch(`.
  - Wired all 25 previously static pages in `VolunteerCoordinator`, `Shelter_Administrator`, and `Funding_Officer` to fetch and mutate live backend data via `communicationsService`, `volunteerNotificationsService`, `accommodationService`, and `apiClient`.

---

## 4. End-to-End Business Workflows Verification (Workflows A–G)

| Workflow | Description | Verification Result |
|---|---|---|
| **Workflow A** | **Citizen Assistance Request -> Case Manager -> Citizen Sync**: Citizen creates a help request (`POST /api/citizen/requests`). Request propagates with identical ID to Case Manager (`MyCasesService`, `CaseManagementService`) and Emergency Coordinator (`IAssistanceRequestRepository`). Case Manager updates status to `"In Progress"` and `"Resolved"` (`PATCH /api/mycases/{id}/status`), which syncs back to Citizen's view. | **PASSED** (Verified in `EndToEndAuditWorkflowTests.WorkflowA_*`) |
| **Workflow B** | **AI Decision Support & Gemini Chatbot**: Coordinator/Admin generates AI Crisis Analysis, Resource Recommendations, Shelter Recommendations, and Volunteer Matching (`/api/ai-recommendations/*`), reviews/approves/rejects with mandatory reason and audit logging, and Citizen/Volunteer interacts with trilingual Gemini Chatbot (`/api/chatbot/message`) with grounded deterministic fallback. | **PASSED** (Verified in `ApproveRejectWorkflowTests`, `CrisisAnalysisTests`, `ChatbotServiceTests`, `RealGeminiIntegrationTests`) |
| **Workflow C** | **Volunteer Coordination & Unavailable Volunteer Guard**: Volunteer Coordinator assigns available volunteer (`Elena Rossi`, `"Available now"`) via `POST /api/assignments` (`200 OK`). Attempting to assign unavailable volunteer (`Daniel Okafor`, `"Unavailable"`) is blocked by `AssignmentsService` checking `IVolunteerDirectoryService` and returns `400 BadRequest`. | **PASSED** (Verified in `EndToEndAuditWorkflowTests.WorkflowC_*`) |
| **Workflow D** | **Resource Allocation & Automatic Stock Deduction**: Resource Manager allocates `120 Units` of `Drinking Water - 10L` (`RES-00128`) via `AllocationService.CreateAllocationAsync`. Available inventory automatically decreases by `120` via `AdjustStockAsync`. Attempting to allocate `999,999 Units` (exceeding stock) or `0 Units` is rejected with an error response. | **PASSED** (Verified in `EndToEndAuditWorkflowTests.WorkflowD_*`) |
| **Workflow E** | **Shelter Capacity Enforcement & String ID Resolution**: Shelter Admin queries `"SH-002"` (`GET /api/shelters/SH-002`) and records a 6-person admission within capacity (`OccupancyService.RecordAdmissionAsync`). Attempting to admit 5 people into full shelter `"SH-003"` (`450/450`) or patching occupancy above capacity (`PATCH /api/shelters/SH-002/occupancy` with `9999`) is rejected (`InvalidOperationException` / `400 BadRequest`). | **PASSED** (Verified in `EndToEndAuditWorkflowTests.WorkflowE_*`) |
| **Workflow F** | **Partner Organisation Registration, Document Verification & Admin Approval/Rejection**: 3-step Partner registration (`POST /api/auth/register`) validates uploaded PDF/JPG/PNG documents, blocks executable payloads, sets status to `PendingApproval`, blocks premature login, and enables login only after Admin approval (`POST /api/users/{id}/approve-partner`). | **PASSED** (Verified in `UserManagementAndAuthTests.PartnerOrganizationFullRegistration_*`) |
| **Workflow G** | **Funding & Donations Tracking**: Funding Officer views dashboard KPIs (`/api/funding-dashboard`), records donations (`/api/donations`), manages donors (`/api/donors`), creates fund allocations (`/api/fund-allocations`), verifies expenditures (`/api/expenditures`), investigates flagged transactions (`/api/flagged-transactions`), and publishes transparency reports (`/api/transparency-reports`). | **PASSED** (Verified via HTTP pipeline & frontend integration) |

---

## 5. Automated Build & Test Execution Summary

1. **Backend Compilation (`CareLink.Core`, `CareLink.Application`, `CareLink.Infrastructure`, `CareLink.API`, `CareLink.Tests`)**:
   - Command: `dotnet build --no-restore -m:1 --disable-build-servers -p:UseSharedCompilation=false`
   - Result: **Succeeded — 0 Warnings, 0 Errors**
2. **Backend Automated Test Suite (`CareLink.Tests`)**:
   - Command: `dotnet exec "D:\NSBM\SA-Project\careLink-backend\CareLink.Tests\bin\Debug\net10.0\CareLink.Tests.dll"`
   - Result: **106 Total | 106 Passed | 0 Failed (100% Pass Rate)**
3. **Frontend Production TypeScript & Vite Bundle (`careLink-frontend`)**:
   - Command: `npm.cmd run build` (`tsc -b && vite build`)
   - Result: **Succeeded — 2,715 modules transformed, 0 TypeScript or bundler errors**
4. **Frontend Automated Test Suite (`Vitest`)**:
   - Command: `npm.cmd test` (`vitest run`)
   - Result: **7 Test Files Passed (7) | 79 Tests Passed (79) | 0 Failed (100% Pass Rate)**
