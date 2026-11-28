# CareLink Crisis Management System – Complete UML Use Case & Actor Specification

**Project Title**: CareLink – Humanitarian Aid and Crisis Management Platform  
**Document Purpose**: Section 2.4 UML Use Case Model, Actor Specification, and Code-Verified Functional Traceability for the NSBM Software Architecture Final Report  
**Repositories Inspected**:  
- **Backend**: `D:\NSBM\SA-Project\careLink-backend` (`CareLink.API`, `CareLink.Application`, `CareLink.Core`, `CareLink.Infrastructure`, `CareLink.Tests`, and root `CareLink.Backend`)  
- **Frontend**: `D:\NSBM\SA-Project\careLink-frontend` (React 19, TypeScript, Vite, Tailwind CSS v4)

---

## 1. Visual UML Use Case Diagram Files

The following diagram artifacts have been generated and verified in both the project root and the `docs/` folder:

1. **Editable PlantUML Source**:  
   - [CareLink_Complete_Use_Case_Diagram.puml](file:///d:/NSBM/SA-Project/careLink-frontend/CareLink_Complete_Use_Case_Diagram.puml)  
   - [docs/CareLink_Complete_Use_Case_Diagram.puml](file:///d:/NSBM/SA-Project/careLink-frontend/docs/CareLink_Complete_Use_Case_Diagram.puml)
2. **Scalable Vector Graphic (SVG)**:  
   - [CareLink_Complete_Use_Case_Diagram.svg](file:///d:/NSBM/SA-Project/careLink-frontend/CareLink_Complete_Use_Case_Diagram.svg)  
   - [docs/CareLink_Complete_Use_Case_Diagram.svg](file:///d:/NSBM/SA-Project/careLink-frontend/docs/CareLink_Complete_Use_Case_Diagram.svg)
3. **High-Resolution PNG (`3000 × 2120` px, 300 DPI A4 Landscape)**:  
   - [CareLink_Complete_Use_Case_Diagram.png](file:///d:/NSBM/SA-Project/careLink-frontend/CareLink_Complete_Use_Case_Diagram.png)  
   - [docs/CareLink_Complete_Use_Case_Diagram.png](file:///d:/NSBM/SA-Project/careLink-frontend/docs/CareLink_Complete_Use_Case_Diagram.png)
4. **Print-Ready A4 Landscape PDF**:  
   - [CareLink_Complete_Use_Case_Diagram.pdf](file:///d:/NSBM/SA-Project/careLink-frontend/CareLink_Complete_Use_Case_Diagram.pdf)  
   - [docs/CareLink_Complete_Use_Case_Diagram.pdf](file:///d:/NSBM/SA-Project/careLink-frontend/docs/CareLink_Complete_Use_Case_Diagram.pdf)

---

## 2. Primary Human Actors (All 9 Canonical Roles)

CareLink defines nine canonical application roles in `CareLink.Core/Constants/UserRoles.cs` and `src/constants/roles.ts`, governed by 41 fine-grained permission claims in `CareLink.Core/Constants/Permissions.cs` and `DefaultRolePermissions.cs`.

| # | Actor Name (UML Stick Figure) | Canonical Role & Alias | Onboarding & Authentication Mechanism | Primary Responsibilities in CareLink |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Admin** *(System Administrator)* | `Admin` (`SystemAdmin`) | Seeded / Admin-provisioned internal account (`admin@carelink.org`); JWT Bearer authentication (`UC01`). Holds all 41 permission claims. | Full platform governance: creates and invites internal staff accounts (`UC06`) using 24-hour single-use password setup tokens (`UC07`), manages user lifecycles (`UC05`), configures roles (`UC08`) and 41 granular permissions (`UC09`), reviews and approves/rejects Partner Organisation applications (`UC10`, `UC11`), audits human-in-the-loop AI recommendations (`UC23`, `UC24`), and monitors audit logs, security events, integration health, and SMTP diagnostics (`UC12`, `UC13`). |
| **2** | **Case Manager** | `CaseManager` (`IncidentManager`) | Admin-provisioned internal staff account; completes single-use password setup (`UC04`) prior to first JWT login (`UC01`). Holds 11 permission claims. | Humanitarian case lifecycle ownership: claims unassigned assistance requests (`UC14`), verifies applicant identity and request validity (`UC15`), reviews and updates case details (`UC16`), triages priority queues, resolves duplicate requests, handles escalated cases (`UC17`), updates case resolution statuses (`UC18`), and reviews AI recommendations (`UC23`). |
| **3** | **Citizen** | `Citizen` | Self-registers via public registration form (`UC02`) with immediate account activation (`IsActive = true`, `AccountStatus = "Active"`) and welcome email; logs in via JWT (`UC01`). Holds 5 permission claims. | Affected public beneficiary: manages personal and household member profiles (`UC25`), submits emergency assistance requests (`UC26`) with optional supporting documents (`UC27`), views and edits submitted requests (`UC28`), tracks request progress and messages (`UC29`), locates nearby shelters and safety alerts (`UC30`), and interacts with the trilingual (English/Sinhala/Tamil) **CareLink AI Assistant Chatbot** (`UC31`). |
| **4** | **Emergency Coordinator** | `EmergencyCoordinator` | Admin-provisioned internal staff account; completes single-use password setup (`UC04`) and logs in via JWT (`UC01`). Holds 22 permission claims. | Command-level crisis orchestration: monitors live operations dashboards and geospatial maps (`UC19`), declares and updates crisis events and severity levels (`UC20`), coordinates multi-agency responses and situation reports (`UC21`), triggers grounded AI crisis analyses (`UC22`) to generate AI recommendations (`UC23`), and exercises human-in-the-loop authority to approve, reject, modify, defer, or reset AI recommendations (`UC24`). |
| **5** | **Funding Officer** | `FundingOfficer` (`Donor`) | Admin-provisioned internal staff account; completes single-use password setup (`UC04`) and logs in via JWT (`UC01`). Holds 6 permission claims. | Humanitarian financial stewardship: manages donor profiles and relief campaigns (`UC32`), records and verifies monetary donations and in-kind resource contributions (`UC33`), allocates funds to operational units and tracks expenditures (`UC34`), investigates flagged financial transactions (`UC35`), and publishes financial transparency reports (`UC36`). |
| **6** | **Partner Officer** | `PartnerOfficer` | Self-registers via the 6-section Partner Organisation registration workflow (`UC03`) with mandatory magic-byte-validated verification documents (`UC37`). Account starts in `PendingApproval` until verified by Admin (`UC10`); can submit additional requested info (`UC38`) before login (`UC01`). Holds 10 permission claims. | External NGO / humanitarian agency representative: maintains verified organisation profile and views verification status (`UC39`), processes assistance referrals and shared crisis events (`UC40`), coordinates inter-agency resource sharing and collaboration requests (`UC41`), and logs field activities, team contacts, and partner reports (`UC42`). |
| **7** | **Resource Manager** | `ResourceManager` (`LogisticsManager`) | Admin-provisioned internal staff account; completes single-use password setup (`UC04`) and logs in via JWT (`UC01`). Holds 8 permission claims. | Supply chain and warehouse operations: manages multi-warehouse inventory catalogs (`UC43`), adjusts stock quantities and configures low-stock alerts (`UC44`), reviews resource requests and approves allocations (`UC45`), tracks dispatches and inter-warehouse stock transfers (`UC46`), and manages procurement purchase orders and suppliers (`UC47`). |
| **8** | **Shelter Administrator** | `ShelterAdministrator` (`ShelterAdmin`) | Admin-provisioned internal staff account; completes single-use password setup (`UC04`) and logs in via JWT (`UC01`). Holds 8 permission claims. | Emergency shelter facility administration: registers and updates shelter details, rooms, and bed layouts (`UC48`), monitors and updates real-time shelter capacity and occupancy thresholds (`UC49`), processes accommodation requests and resident check-in/check-out (`UC50`), and tracks shelter supplies, staff shifts, health/safety incidents, and maintenance requests (`UC51`). |
| **9** | **Volunteer Coordinator** | `VolunteerCoordinator` (`Volunteer`) | Internal coordinators are provisioned by Admin (`UC04` + `UC01`); individual volunteers self-register via public registration (`UC02` + `UC01`) and share the `/volunteer-coordinator/*` workspace. Holds 6 permission claims (`VolunteerCoordinator`) / 5 claims (`Volunteer`). | Volunteer workforce mobilization: manages the volunteer directory and verifies credentials (`UC52`), maintains volunteer skills, availability, and training records (`UC53`), creates field tasks and runs AI skill matching (`UC54`), assigns and deploys volunteers to operations (`UC55`), monitors attendance and communications (`UC56`), reviews AI recommendations (`UC23`), and uses the **CareLink AI Assistant Chatbot** (`UC31`). |

---

## 3. External Systems (Stereotyped UML `<<External System>>` Actors)

Only true external systems outside the CareLink application process boundary are represented as external system actors:

1. **Google Gemini AI API (`gemini-1.5-flash`)** `<<External System>>`
   - **Integration Class**: `CareLink.Infrastructure/Services/GeminiService.cs` (`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`).
   - **Interactions**:
     - Invoked by **`UC23` (Generate & View Grounded AI Recommendations)** via `GenerateStructuredContentAsync<T>` (`responseMimeType = "application/json"`, `temperature = 0.2`) to produce structured JSON crisis analyses, resource shortage plans, shelter bed matching plans, volunteer cohort assignments, and integrated response plans.
     - Invoked by **`UC31` (Use CareLink AI Assistant Chatbot)** via `GenerateChatReplyAsync` to provide trilingual (English, Sinhala, Tamil) humanitarian support grounded in live user requests and shelter availability.
2. **Email / SMTP Service (`Gmail SMTP · smtp.gmail.com:587`)** `<<External System>>`
   - **Integration Class**: `CareLink.Infrastructure/Services/EmailService.cs` & `EmailTemplates.cs` (`System.Net.Mail.SmtpClient` with STARTTLS).
   - **Interactions**:
     - Invoked by **`UC02` (Register Public Account)** to send Citizen and Volunteer welcome emails.
     - Invoked by **`UC03` (Register Partner Organisation)** to send pending-verification acknowledgement emails to the partner representative and review-alert emails to System Administrators.
     - Invoked by **`UC07` (Generate Single-Use Password Setup Token)** during **`UC06` (Create & Invite Internal Staff Account)** to deliver the 24-hour single-use password setup link (`/setup-account?email=...&token=...`) exclusively via email (never exposed in API responses).
     - Invoked by **`UC10` (Verify Partner Organisations)** to send official approval, rejection (with reason), or additional-information request emails.

*(Note: Internal infrastructure services such as `JwtTokenGenerator`, `ApplicationDbContext`, `CareLinkDbContext`, and `OrganizationDocumentStorageService` reside inside the CareLink system boundary and are not depicted as external actors.)*

---

## 4. Complete Catalog of Included Use Cases Grouped by Subsystem & Actor

### Subsystem 1: Authentication, Registration & Account Onboarding
| Code | Use Case Name | Participating Actors | UML Relationships | Backend API & Service Implementation | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC01** | **Login & Authenticate (JWT Bearer Session)** | All 9 Human Actors | Extended by `UC04` (`<<extend>>` on first-time staff onboarding) | `POST /api/auth/login`, `GET /api/auth/me` (`AuthController.cs`, `AuthService.cs`, `JwtTokenGenerator.cs`) | **Fully Implemented** (SQL Server + Real-time JWT `OnTokenValidated` status check) |
| **UC02** | **Register Public Account (Citizen / Volunteer)** | Citizen, Volunteer Coordinator (`Volunteer`), Email / SMTP Service | Association to `SmtpService` | `POST /api/auth/register` (`AuthController.cs`, `AuthService.cs` — restricts public self-registration strictly to `Citizen`, `Volunteer`, and `PartnerOfficer`) | **Fully Implemented** (SQL Server `dbo.Users` + SMTP welcome email) |
| **UC03** | **Register Partner Organisation** | Partner Officer, Email / SMTP Service | Includes `UC37` (`<<include>>`); Extended by `UC38` (`<<extend>>`) | `POST /api/auth/register` with 6-section organisation payload (`AccountStatus = "PendingApproval"`, `IsActive = false`) | **Fully Implemented** (SQL Server `dbo.Organizations` + `dbo.Users` + SMTP) |
| **UC04** | **Complete Single-Use Staff Password Setup** | Case Manager, Emergency Coordinator, Funding Officer, Resource Manager, Shelter Administrator, Volunteer Coordinator | Extends `UC01` (`<<extend>> [First-Time Staff Login]`) | `GET /api/auth/verify-setup-token`, `POST /api/auth/setup-password` (`AuthController.cs`, `SetupPasswordPage.tsx`) | **Fully Implemented** (SQL Server single-use 24h Base64Url token validation) |
| **UC37** | **Submit Organisation Verification Documents** | Partner Officer *(via `UC03`)* | Included by `UC03` (`<<include>>`) | `OrganizationDocumentStorageService.cs` (validates `.pdf`/`.jpg`/`.png`, 10 MB limit, binary magic bytes `%PDF`, `FF D8 FF`, `89 50 4E 47`, blocks `MZ` executables) | **Fully Implemented** (SQL Server `dbo.OrganizationDocuments`) |
| **UC38** | **Submit Requested Additional Verification Info** | Partner Officer | Extends `UC03` (`<<extend>> [Info Requested]`) | `POST /api/auth/partner-additional-info` (`AuthController.cs`, `LoginPage.tsx` inline modal) | **Fully Implemented** (SQL Server + resets org to `PendingVerification`) |

### Subsystem 2: Citizen Relief Portal & AI Humanitarian Chatbot
| Code | Use Case Name | Participating Actors | UML Relationships | Backend API & Service Implementation | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC25** | **Manage Citizen Profile & Household Members** | Citizen | Direct association | `GET/PUT /api/citizen/profile`, `GET/POST/PUT/DELETE /api/household/members` (`CitizenProfileController.cs`, `HouseholdController.cs`) | **Implemented** (REST API + UI backed by `InMemory*Repository`) |
| **UC26** | **Submit Emergency Assistance Request** | Citizen | Extended by `UC27` (`<<extend>>`) | `POST /api/citizen/requests`, `POST /api/citizen/home/requests` (`CitizenRequestsController.cs`, `CitizenHomeController.cs`) | **Implemented** (REST API + UI backed by `InMemoryCitizenRequestRepository`) |
| **UC27** | **Upload Supporting Evidence Documents** | Citizen *(via `UC26`)* | Extends `UC26` (`<<extend>> [Attach Evidence]`) | `GET/POST /api/documents` (`DocumentsController.cs`, `MyDocumentsPage.tsx`) | **Implemented** (REST API + UI backed by `InMemoryDocumentRepository`) |
| **UC28** | **View & Update Submitted Assistance Requests** | Citizen | Direct association | `GET/PATCH/DELETE /api/citizen/requests/{id}` (`CitizenRequestsController.cs`, `MyRequestsPage.tsx`) | **Implemented** (REST API + UI backed by `InMemoryCitizenRequestRepository`) |
| **UC29** | **Track Request Status & Case Messaging** | Citizen | Direct association | `GET /api/citizen/requests`, `GET/POST /api/messages` (`MessagesController.cs`, `MessagesPage.tsx`) | **Implemented** (REST API + UI backed by `InMemoryMessageRepository`) |
| **UC30** | **View Shelters, Nearby Support & Safety Updates** | Citizen | Direct association | `GET /api/shelters`, `GET /api/citizen/home/overview`, `GET /api/safety-updates`, `POST /api/feedback` (`SafetyUpdatesController.cs`, `FeedbackController.cs`) | **Implemented** (EF Core InMemory `Shelters` + `InMemorySafetyUpdateRepository`) |
| **UC31** | **Use CareLink AI Assistant Chatbot (EN / SI / TA)** | Citizen, Volunteer Coordinator (`Volunteer`), Google Gemini AI API | Association to `GeminiAPI` | `POST /api/chatbot/message`, `GET /api/chatbot/conversations`, `DELETE /api/chatbot/conversations/{id}` (`ChatbotController.cs`, `ChatbotService.cs`, `CareLinkChatbot.tsx`) | **Fully Implemented** (SQL Server `dbo.ChatbotConversations` & `dbo.ChatbotMessages` + Live Gemini API + Trilingual Fallback) |

### Subsystem 3: Partner Organisation Collaboration & Field Operations
| Code | Use Case Name | Participating Actors | UML Relationships | Backend API & Service Implementation | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC39** | **Manage Organisation Profile & View Verification Status** | Partner Officer | Direct association | `GET/PUT /api/organisation-profile`, `GET /api/organizations/{id}`, `GET /api/partner-dashboard` (`OrganisationProfileController.cs`, `OrganizationsController.cs`) | **Fully Implemented** (SQL Server `dbo.Organizations` + Partner Workspace REST API) |
| **UC40** | **Manage Assistance Referrals & Shared Crisis Events** | Partner Officer | Direct association | `GET/POST/PATCH /api/assistance-referrals`, `GET /api/crisis-events` (`AssistanceReferralsController.cs`, `SharedCrisisEvents.tsx`) | **Implemented** (REST API + UI backed by `InMemoryAssistanceReferralRepository`) |
| **UC41** | **Manage Resource Sharing & Collaboration Requests** | Partner Officer | Direct association | `GET/POST/PATCH /api/resource-sharing`, `GET/POST/PATCH /api/collaboration-requests` (`ResourceSharingController.cs`, `CollaborationRequestsController.cs`) | **Implemented** (REST API + UI backed by `InMemory*Repository`) |
| **UC42** | **Log Field Activities, Team Contacts & Partner Reports** | Partner Officer | Direct association | `GET/POST /api/field-activities`, `GET/POST /api/team-contacts`, `GET/POST /api/partner-reports` (`FieldActivitiesController.cs`, `TeamContactsController.cs`, `PartnerReportsController.cs`) | **Implemented** (REST API + UI backed by `InMemory*Repository`) |

### Subsystem 4: System Administration, User Provisioning & Governance
| Code | Use Case Name | Participating Actors | UML Relationships | Backend API & Service Implementation | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC05** | **Manage Users & Account Status** | Admin | Direct association | `GET /api/users`, `PUT /api/users/{id}`, `PATCH /api/users/{id}/status`, `DELETE /api/users/{id}` (`UsersController.cs`, `UserService.cs`) | **Fully Implemented** (SQL Server `dbo.Users` + `[HasPermission(Permissions.Users.*)]`) |
| **UC06** | **Create & Invite Internal Staff Account** | Admin | Includes `UC07` (`<<include>>`) | `POST /api/users`, `POST /api/users/{id}/resend-invitation` (`UsersController.cs`, `UserManagement.tsx`) | **Fully Implemented** (SQL Server + zero token leakage in API response) |
| **UC07** | **Generate Single-Use Password Setup Token** | Admin *(via `UC06`)*, Email / SMTP Service | Included by `UC06` (`<<include>>`); Association to `SmtpService` | `UserService.CreateUserAsync` (`GeneratePasswordResetTokenAsync` + `UrlTokenEncoder.Encode` + `EmailService.SendAdminCreatedUserEmailWithResultAsync`) | **Fully Implemented** (SQL Server + Gmail SMTP) |
| **UC08** | **Manage Roles & Role Hierarchy** | Admin | Direct association | `GET/POST/PUT/DELETE /api/roles` (`RolesController.cs`, `RoleService.cs`, `RolesPermissions.tsx`) | **Fully Implemented** (SQL Server `dbo.Roles`) |
| **UC09** | **Manage Fine-Grained Permissions (41 Claims)** | Admin | Direct association | `GET /api/permissions`, `GET/PUT /api/permissions/roles/{roleId}`, `PUT /api/roles/{id}/permissions` (`PermissionsController.cs`, `PermissionService.cs`) | **Fully Implemented** (SQL Server `dbo.RoleClaims`) |
| **UC10** | **Verify Partner Organisations (Approve / Reject)** | Admin, Email / SMTP Service | Extended by `UC11` (`<<extend>>`); Association to `SmtpService` | `POST /api/organizations/{id}/verify`, `POST /api/organizations/{id}/review`, `POST /api/users/{id}/approve`, `POST /api/users/{id}/reject`, `POST /api/verification/{id}/decision` | **Fully Implemented** (SQL Server `dbo.Organizations` & `dbo.Users` + SMTP notification) |
| **UC11** | **Request Additional Partner Verification Info** | Admin *(via `UC10`)* | Extends `UC10` (`<<extend>> [Clarification Needed]`) | `POST /api/organizations/{id}/review` with `Decision = "RequestInfo"` (`OrganizationService.cs`, `UserManagement.tsx`) | **Fully Implemented** (SQL Server `AdditionalInfoRequest` + SMTP email) |
| **UC12** | **Monitor System Activities, Audit Logs & Security Events** | Admin | Direct association | `GET /api/audit-logs`, `GET/POST/PATCH /api/security-events`, `GET/POST /api/integrations` (`AuditLogsController.cs`, `SecurityEventsController.cs`, `IntegrationsController.cs`) | **Implemented** (REST API + live in-memory event recording during auth/AI operations) |
| **UC13** | **System Oversight, Analytics & SMTP Diagnostics** | Admin | Direct association | `GET /api/admin/dashboard`, `GET /api/users/smtp-diagnostics`, `POST /api/users/test-email`, `GET/POST /api/reports`, `GET/PUT /api/settings` | **Fully Implemented** (`AdminDashboardController.cs`, `UsersController.cs`) |

### Subsystem 5: Case Management, Verification & Triage
| Code | Use Case Name | Participating Actors | UML Relationships | Backend API & Service Implementation | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC14** | **View & Claim Unassigned Assistance Requests** | Case Manager | Direct association | `GET /api/casemanagement`, `GET /api/unassigned-cases`, `POST /api/casemanagement/claim` (`CaseManagementController.cs`, `UnassignedCasesController.cs`) | **Partially Implemented** (Root project controllers + comprehensive frontend fallback service) |
| **UC15** | **Verify Assistance Requests & Applicant Identity** | Case Manager | Direct association | `GET/POST /api/caseverification`, `POST /api/verification/{id}/decision` (`CaseVerificationController.cs`, `VerificationController.cs`) | **Implemented** (`VerificationController` in `CareLink.API` + `CaseVerificationController` in root) |
| **UC16** | **Review Case Details & Manage Case Information** | Case Manager | Direct association | `GET/POST/PUT /api/mycases`, `GET /api/request-history` (`MyCasesController.cs`, `RequestHistoryController.cs`) | **Partially Implemented** (Root project controllers + frontend service state) |
| **UC17** | **Triage Cases, Escalate & Resolve Duplicates** | Case Manager | Direct association | `GET/POST /api/priority-queue`, `GET/POST /api/escalatedcases`, `GET/POST /api/duplicates` (`PriorityQueueController.cs`, `EscalatedCasesController.cs`, `DuplicatesController.cs`) | **Implemented** (`PriorityQueueController` in `CareLink.API`; `EscalatedCases`/`Duplicates` in root) |
| **UC18** | **Update Case Status & Final Resolution** | Case Manager | Direct association | `PATCH /api/mycases/{id}/status`, `PATCH /api/assistance-requests/{id}/status` | **Implemented** (`AssistanceRequestsController` in `CareLink.API` + `MyCasesController`) |

### Subsystem 6: Emergency Coordination & Human-in-the-Loop AI Decision Support
| Code | Use Case Name | Participating Actors | UML Relationships | Backend API & Service Implementation | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC19** | **View Crisis Operations Dashboard & Live Map** | Emergency Coordinator | Direct association | `GET /api/operation-dashboard`, `GET /api/live-operations-map` (`OperationDashboardController.cs`, `LiveOperationsMapController.cs`) | **Implemented** (REST API + UI backed by `InMemory*Repository`) |
| **UC20** | **Manage Crisis Incidents & Severity Levels** | Emergency Coordinator | Direct association | `GET/POST/PUT/PATCH /api/crisis-events` (`CrisisEventsController.cs`, `CrisisEvent.tsx`) | **Implemented** (REST API + UI backed by `InMemoryCrisisEventRepository`) |
| **UC21** | **Coordinate Emergency Responses & Situation Reports** | Emergency Coordinator | Direct association | `GET/PATCH /api/assistance-requests`, `GET/POST /api/priority-queue`, `GET/POST /api/situation-reports` (`SituationReportsController.cs`) | **Implemented** (REST API + UI backed by `InMemory*Repository`) |
| **UC22** | **Analyse Crisis Situations (Resources, Shelters, Volunteers)** | Emergency Coordinator | Includes `UC23` (`<<include>>`) | `POST /api/ai/crises/{crisisId}/analysis`, `/resources`, `/shelters`, `/volunteers`, `/response-plan` (`AiRecommendationsController.cs`, `AiRecommendationService.cs`) | **Fully Implemented** (Gathers real inventory shortages, shelter remaining bed capacity, and volunteer skills) |
| **UC23** | **Generate & View Grounded AI Recommendations** | Emergency Coordinator, Admin, Case Manager, Volunteer Coordinator, Google Gemini AI API | Included by `UC22` (`<<include>>`); Extended by `UC24` (`<<extend>>`); Association to `GeminiAPI` | `GET /api/ai-recommendations`, `GET /api/ai-recommendations/metrics`, `GeminiService.GenerateStructuredContentAsync<T>` (creates records in `ReviewState = "Awaiting Review"`) | **Fully Implemented** (SQL Server `dbo.AiRecommendations` + Live Gemini 1.5 Flash + Deterministic Fallback) |
| **UC24** | **Review AI Recommendations (Approve / Reject / Modify / Defer / Reset)** | Emergency Coordinator, Admin | Extends `UC23` (`<<extend>> [Human Review Decision]`) | `POST /api/ai-recommendations/{id}/approve`, `/reject` (mandatory `RejectionReason`), `/decision` (modify priority + rationale), `/defer`, `/reset` | **Fully Implemented** (SQL Server persistence + state machine validation + audit logging) |

### Subsystem 7: Volunteer Coordination, AI Matching & Field Deployment
| Code | Use Case Name | Participating Actors | UML Relationships | Backend API & Service Implementation | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC52** | **View & Verify Volunteer Directory & Records** | Volunteer Coordinator | Direct association | `GET/POST/PUT /api/volunteer/directory`, `GET/POST /api/volunteer-verifications` (`VolunteerDirectoryController.cs`, `VolunteerVerificationsController.cs`) | **Partially Implemented** (Volunteer accounts stored in SQL Server `dbo.Users`; directory controllers in root project) |
| **UC53** | **Manage Volunteer Profiles, Skills, Availability & Training** | Volunteer Coordinator | Direct association | `GET/POST/PUT /api/volunteer/skills-availability`, `GET/POST /api/volunteer/training` (`SkillsAvailabilityController.cs`, `TrainingCertificationsController.cs`) | **Partially Implemented** (`Skills`, `Availability`, `PreferredLocation` on `ApplicationUser` in SQL Server; root controllers) |
| **UC54** | **Create & Manage Volunteer Tasks & AI Skill Matching** | Volunteer Coordinator | Direct association | `GET/POST/PUT /api/volunteer/tasks`, `GET/POST /api/ai-volunteer-matching`, `POST /api/ai/crises/{crisisId}/volunteers` | **Implemented** (`AiRecommendationsController` in `CareLink.API` + root task controllers) |
| **UC55** | **Assign & Deploy Volunteers to Field Operations** | Volunteer Coordinator | Direct association | `GET/POST/PATCH /api/assignments` (`AssignmentsController.cs`, `AssignmentsPage.tsx`) | **Partially Implemented** (Root project controller + frontend stateful service) |
| **UC56** | **Monitor Volunteer Activities, Attendance & Communications** | Volunteer Coordinator | Direct association | `GET /api/volunteer/dashboard`, `GET/POST /api/activity-tracking`, `GET/POST /api/communications` | **Partially Implemented** (Root project controllers + frontend stateful service) |

### Subsystem 8: Shelter Administration, Capacity & Resident Management
| Code | Use Case Name | Participating Actors | UML Relationships | Backend API & Service Implementation | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC48** | **Manage Shelter Details, Rooms & Bed Inventory** | Shelter Administrator | Direct association | `GET/POST/PUT/DELETE /api/shelters`, `GET/POST /api/rooms`, `POST /api/rooms/{id}/beds`, `PATCH /api/rooms/{roomId}/beds/{bedId}/status` (`SheltersController.cs`, `RoomBedController.cs`) | **Implemented** (EF Core In-Memory Database `CareLinkDbContext` seeded via `DataSeeder.cs`) |
| **UC49** | **View & Update Shelter Capacity & Thresholds** | Shelter Administrator | Direct association | `GET /api/occupancy`, `POST /api/occupancy/admissions`, `PUT /api/occupancy/thresholds` (`OccupancyController.cs`, `OccupancyManagement.tsx`) | **Implemented** (EF Core In-Memory Database `CareLinkDbContext`) |
| **UC50** | **Process Accommodation Requests & Manage Residents** | Shelter Administrator | Direct association | `GET/POST/PATCH /api/accommodation-requests`, `GET/POST/PUT /api/residents`, `POST /api/residents/{id}/checkout` (`AccommodationRequestsController.cs`, `ResidentsController.cs`) | **Implemented** (EF Core In-Memory Database `CareLinkDbContext`) |
| **UC51** | **Track Shelter Availability, Supplies, Staff & Safety** | Shelter Administrator | Direct association | `GET/POST /api/shelters/resources`, `GET/POST/PUT /api/staff`, `GET/POST /api/health-safety`, `GET/POST/PATCH /api/maintenance-requests`, `GET/POST /api/disaster-updates` | **Implemented** (EF Core In-Memory Database `CareLinkDbContext`) |

### Subsystem 9: Resource, Inventory, Warehouse & Logistics Management
| Code | Use Case Name | Participating Actors | UML Relationships | Backend API & Service Implementation | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC43** | **View & Manage Resource Inventory & Warehouses** | Resource Manager | Direct association | `GET /api/resource-dashboard`, `GET/POST/PUT/DELETE /api/inventory`, `GET/POST/PUT /api/warehouses` (`ResourceDashboardController.cs`, `InventoryController.cs`, `WarehousesController.cs`) | **Implemented** (REST API + UI backed by `InMemoryInventoryRepository` & `InMemoryWarehouseRepository`) |
| **UC44** | **Update Resource Quantities & Low-Stock Alerts** | Resource Manager | Direct association | `PATCH /api/inventory/{id}/adjust`, `GET/POST/PATCH /api/alerts`, `PUT /api/alerts/rules` (`InventoryController.cs`, `AlertsController.cs`) | **Implemented** (REST API + UI backed by `InMemory*Repository`) |
| **UC45** | **Review Resource Requests & Allocate Resources** | Resource Manager | Direct association | `GET/POST/PATCH /api/resource-requests`, `GET/POST/PATCH /api/allocations` (`ResourceRequestsController.cs`, `AllocationsController.cs`) | **Implemented** (REST API + UI backed by `InMemory*Repository`) |
| **UC46** | **Track Resource Allocation, Dispatches & Stock Transfers** | Resource Manager | Direct association | `GET/POST/PATCH /api/dispatches`, `GET/POST/PATCH /api/stock-transfers` (`DispatchesController.cs`, `TransfersController.cs`) | **Implemented** (REST API + UI backed by `InMemory*Repository`) |
| **UC47** | **Manage Procurement Orders & Supplier Contracts** | Resource Manager | Direct association | `GET/POST/PATCH /api/procurement`, `GET/POST/PUT /api/suppliers` (`ProcurementController.cs`, `SuppliersController.cs`) | **Implemented** (REST API + UI backed by `InMemory*Repository`) |

### Subsystem 10: Funding, Donations, Allocations & Financial Auditing
| Code | Use Case Name | Participating Actors | UML Relationships | Backend API & Service Implementation | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC32** | **View & Manage Donors & Humanitarian Campaigns** | Funding Officer | Direct association | `GET/POST/PUT /api/donors`, `GET/POST/PUT /api/campaigns` (`DonorsController.cs`, `CampaignsController.cs`) | **Implemented** (EF Core In-Memory Database `CareLinkDbContext` seeded via `DataSeeder.cs`) |
| **UC33** | **Record & Manage Donations & In-Kind Contributions** | Funding Officer | Direct association | `GET/POST/PATCH /api/donations`, `GET/POST/PATCH /api/resource-contributions` (`DonationsController.cs`, `ResourceContributionsController.cs`) | **Implemented** (EF Core In-Memory Database `CareLinkDbContext`) |
| **UC34** | **Record Funding Allocations & Manage Expenditures** | Funding Officer | Direct association | `GET/POST/PATCH /api/fund-allocations`, `GET/POST/PATCH /api/expenditures` (`FundAllocationsController.cs`, `ExpendituresController.cs`) | **Implemented** (EF Core In-Memory Database `CareLinkDbContext`) |
| **UC35** | **Monitor Financial Activities & Flagged Transactions** | Funding Officer | Direct association | `GET /api/funding-dashboard`, `GET/POST/PATCH /api/flagged-transactions` (`FundingDashboardController.cs`, `FlaggedTransactionsController.cs`) | **Implemented** (EF Core In-Memory Database `CareLinkDbContext`) |
| **UC36** | **Generate Funding & Transparency Reports** | Funding Officer | Direct association | `GET/POST /api/transparency-reports`, `POST /api/transparency-reports/{id}/publish`, `GET /api/funding-reports` (`TransparencyReportsController.cs`, `FundingReportsController.cs`) | **Implemented** (EF Core In-Memory Database `CareLinkDbContext`) |

---

## 5. Functionality & Architectural Nuances Identified During Source Code Verification

In accordance with academic rigor, the following implementation nuances were verified directly from the source code and reflected in the use case specification:

1. **Persistence Stratification Across Modules**:
   - **SQL Server (`ApplicationDbContext` – `CareLinkDB`)**: Persists `Users`, `Roles`, `UserRoles`, `RoleClaims`, `UserClaims`, `Organizations`, `OrganizationDocuments`, `AiRecommendations`, `ChatbotConversations`, and `ChatbotMessages`.
   - **EF Core In-Memory Database (`CareLinkDbContext` – `CareLinkDb`)**: Persists the 18 Shelter Administration entities and 9 Funding Officer entities with full LINQ repository queries and startup seeding (`DataSeeder.cs`).
   - **In-Memory Singleton Repositories (`InMemory*Repository`)**: Back the Citizen Portal, Emergency Coordinator, Partner Officer workspace, Resource Manager, and Audit/Security Event modules inside `CareLink.API`.
   - **Dual-Host Solution Split (`CareLink.API.csproj` vs Root `CareLink.Backend.csproj`)**: The 9 Case Manager controllers (`CaseManagementController`, `MyCasesController`, etc.) and 11 Volunteer Coordinator controllers (`VolunteerDashboardController`, `VolunteerDirectoryController`, etc.) exist in the root `D:\NSBM\SA-Project\careLink-backend\Controllers\` project rather than `CareLink.API/Controllers/`. When running `CareLink.API`, those two frontend dashboards gracefully operate using their built-in client-side service state while still connecting to `CareLink.API` for JWT authentication (`AuthController`), AI recommendations (`AiRecommendationsController`), verification (`VerificationController`), and the Volunteer AI Chatbot (`ChatbotController`).
2. **Role Alias Normalization (`Volunteer` and `VolunteerCoordinator`)**:
   - While `UserRoles.cs` defines 9 core roles plus 5 backward-compatible aliases (`SystemAdmin`, `IncidentManager`, `LogisticsManager`, `ShelterAdmin`, `Volunteer`, `Donor`), `src/constants/roles.ts` maps both `"Volunteer"` and `"VolunteerCoordinator"` to the `/volunteer-coordinator/*` layout (`VolunteerLayout.tsx`), where `<CareLinkChatbot forcedRole="Volunteer" />` is mounted.
3. **Features Confirmed Not Present (Excluded from Diagram)**:
   - **No Refresh Token Endpoint**: Session management uses 24-hour stateless JWT bearer tokens (`Jwt:ExpiryHours = 24`) with real-time database account status validation on every request (`OnTokenValidated`).
   - **No Autonomous AI Execution**: AI recommendations (`UC23`) cannot self-execute or auto-dispatch resources; every recommendation is persisted in `ReviewState = "Awaiting Review"` and requires an explicit human decision (`UC24`) by an authorized reviewer.
   - **No External Payment Gateway / SMS Gateway**: Donations (`UC33`) are recorded and verified as ledger entries without a third-party Stripe/PayHere integration, and notifications use Gmail SMTP (`EmailService.cs`) and in-app notification feeds rather than an external SMS gateway.

---

## 6. Academic Narrative for Section 2.4 of the NSBM Software Architecture Final Report

> ### 2.4 UML Use Case Model and Functional Scope
>
> The functional architecture of the **CareLink Crisis Management System** is formalized through a comprehensive UML 2.5 Use Case Model encompassing **nine primary human actors**, **two external system actors**, and **56 code-verified use cases** partitioned across **ten cohesive functional subsystems** within the system boundary.
>
> **1. Role-Based Actor Taxonomy and Onboarding Governance**  
> CareLink enforces a strict separation between public self-registration and internal staff provisioning. Public actors—specifically **Citizens** (`UC02`) and individual **Volunteers**—self-register for immediate platform access, whereas **Partner Officers** register external humanitarian organizations (`UC03`) through a multi-stage verification pipeline that mandates binary-validated document uploads (`UC37`, `<<include>>`) and places accounts in a `PendingApproval` state until a **System Administrator** completes formal verification (`UC10`) or requests additional clarification (`UC11`, `UC38`, `<<extend>>`). Conversely, internal operational actors—**Case Managers**, **Emergency Coordinators**, **Funding Officers**, **Resource Managers**, **Shelter Administrators**, and **Volunteer Coordinators**—cannot self-register; their accounts are provisioned exclusively by the **Admin** (`UC06`), which triggers `UC07` (`<<include>>`) to dispatch a 24-hour, single-use password setup link via the external **Email / SMTP Service** (`UC04`, `<<extend>>` on `UC01`).
>
> **2. End-to-End Humanitarian Relief Lifecycle**  
> Operational workflows are decoupled across specialized domain subsystems while sharing situational data:
> - **Citizen Relief & Case Triage**: Affected **Citizens** submit emergency assistance requests (`UC26`) with optional supporting evidence (`UC27`, `<<extend>>`), track progress (`UC29`), and locate safe shelters (`UC30`). **Case Managers** claim unassigned requests (`UC14`), verify applicant identities (`UC15`), resolve duplicate or escalated cases (`UC17`), and update case outcomes (`UC18`).
> - **Crisis Command, Logistics, Shelters, Volunteers, Partners & Funding**: **Emergency Coordinators** manage crisis incidents (`UC20`) and coordinate multi-agency responses (`UC21`). **Resource Managers** oversee warehouse inventories (`UC43`), stock alerts (`UC44`), allocations (`UC45`), dispatches (`UC46`), and procurement (`UC47`). **Shelter Administrators** govern shelter facilities, room/bed inventory (`UC48`), real-time occupancy thresholds (`UC49`), and resident check-ins (`UC50`). **Volunteer Coordinators** verify volunteer credentials (`UC52`), manage skills and training (`UC53`), and deploy field teams (`UC55`). **Partner Officers** collaborate on referrals (`UC40`) and resource sharing (`UC41`), while **Funding Officers** manage campaigns (`UC32`), donations (`UC33`), fund allocations (`UC34`), flagged transactions (`UC35`), and transparency reports (`UC36`).
>
> **3. Human-in-the-Loop AI Decision Support and Trilingual AI Assistant**  
> CareLink integrates the external **Google Gemini AI API (`gemini-1.5-flash`)** across two distinct architectural pathways. First, during crisis operations, the **Emergency Coordinator** initiates situational crisis analysis (`UC22`), which mandatorily includes (`<<include>>`) grounded AI recommendation generation (`UC23`) constrained by real-time warehouse stock shortages, remaining shelter bed capacities, and volunteer skill cohorts. To uphold humanitarian accountability, AI recommendations are never automatically executed; they enter an `Awaiting Review` state and are extended (`<<extend>>`) by human review (`UC24`), where authorized decision-makers (**Emergency Coordinator** or **Admin**) must explicitly approve, modify with rationale, defer, or reject with a mandatory reason. Second, **Citizens** and **Volunteers** interact with the **CareLink AI Assistant Chatbot** (`UC31`), which delivers trilingual (English, Sinhala, and Tamil) relief guidance grounded in live user requests and shelter availability while enforcing life-safety emergency hotline guardrails.
