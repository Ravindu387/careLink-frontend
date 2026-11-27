# CareLink Crisis Management System – Actor and Use Case Specification

> **Document Reference**: `NSBM-SA-CARELINK-UCD-01`  
> **Module**: Software Architecture (University Final Project Report)  
> **Target Section**: Section 2.4 – System Use Case Modeling and Actor Specifications  
> **Platform Version**: CareLink v1.0.0 (Clean Architecture .NET 10 + React 19 SPA)  
> **Date**: November 2026  

---

## 1. System Architectural Overview

The **CareLink Crisis Management System** is an enterprise-grade humanitarian relief and emergency response coordination platform. The system facilitates end-to-end disaster triage, crisis telemetry tracking, humanitarian supply chain logistics, temporary emergency shelter allocations, volunteer corps mobilization, donor financial transparency, and inter-agency partner collaboration.

The application is structured following **Clean Architecture principles**:
- **Presentation Layer**: 48 REST API Controllers (`CareLink.API`) exposing JSON endpoints over HTTPS (`http://localhost:5277`) and a Single Page Application (SPA) built using React 19, TypeScript, Vite, and Tailwind CSS (`http://localhost:5173`).
- **Application Layer**: Business logic, commands, queries, and orchestration services (`CareLink.Application`) utilizing fluent validation and strongly-typed Data Transfer Objects (DTOs).
- **Domain Layer**: 78 domain entities, value objects, and permission matrices (`CareLink.Core`).
- **Infrastructure Layer**: Dual-context data persistence utilizing Microsoft SQL Server (`ApplicationDbContext`) for identity, partner governance, AI recommendations, and chatbot conversations, alongside an EF Core In-Memory database (`CareLinkDbContext`) for shelter and financial operations (`CareLink.Infrastructure`).

---

## 2. Actor Specifications

CareLink defines **nine (9) primary human actors** corresponding to distinct operational roles, and **two (2) external system actors** that interact directly with backend services.

```
+---------------------------------------------------------------------------------------------------+
|                                      CARELINK ACTOR ROLES                                         |
+-----------------------------------+-----------------------------------+---------------------------+
| Public & Field Operators          | Administrative & Coordination     | Operational & Logistics   |
+-----------------------------------+-----------------------------------+---------------------------+
| 1. Citizen                        | 3. Admin (System Administrator)   | 7. Resource Manager       |
| 2. Partner Officer                | 4. Case Manager                   | 8. Shelter Administrator  |
|                                   | 5. Emergency Coordinator          | 9. Funding Officer        |
|                                   | 6. Volunteer Coordinator          |                           |
+-----------------------------------+-----------------------------------+---------------------------+
| External Systems: 10. Google Gemini AI API (gemini-1.5-flash) | 11. Email / SMTP Service (Gmail)  |
+---------------------------------------------------------------------------------------------------+
```

### 2.1 Human Actors

#### 1. Citizen (Affected Public User)
- **Role Definition**: Vulnerable citizens and affected individuals within disaster-affected zones who require immediate humanitarian relief, medical assistance, emergency evacuation, food supplies, or temporary shelter.
- **Access Level**: Public self-registration (`/register` $\rightarrow$ `Citizen` option). Account is activated **immediately** upon registration (`IsActive = true`, `AccountStatus = "Active"`).
- **Frontend Workspace**: `/citizen/*` ([CitizenLayout.tsx](file:///d:/NSBM/SA-Project/careLink-frontend/src/layouts/CitizenLayout.tsx)).
- **Primary Capabilities**: Submit emergency assistance requests, attach supporting photos/documents, monitor request progress, communicate with assigned caseworkers, view safety bulletins, inspect nearby emergency shelters, manage family/household profiles, and interact with the trilingual CareLink AI Assistant chatbot.

#### 2. Partner Officer (Humanitarian Partner / NGO Representative)
- **Role Definition**: Authorized representative of an accredited non-governmental organization (NGO), international humanitarian agency, community relief network, or private donor corporation collaborating with CareLink.
- **Access Level**: Public partner registration (`/register` $\rightarrow$ `Partner Organisation` option). Subject to **mandatory administrative verification**. Initial state is `IsActive = false`, `AccountStatus = "PendingApproval"`. Protected dashboard access is strictly prevented until an Administrator approves the registration.
- **Frontend Workspace**: `/partner/*` ([PartnerOfficerLayout.tsx](file:///d:/NSBM/SA-Project/careLink-frontend/src/layouts/PartnerOfficerLayout.tsx)).
- **Primary Capabilities**: Register organization profiles, upload verification documents (Registration Certificate, Tax Exemption, Board Resolution, Annual Report), review verification feedback, submit additional requested verification evidence, accept assistance referrals, share resources with other agencies, submit joint field collaboration requests, log field team activities, and generate partnership impact reports.

#### 3. Admin (System Administrator)
- **Role Definition**: System superuser responsible for security policy enforcement, staff provisioning, role-based access control, institutional audit log oversight, partner accreditation, and system integrity.
- **Access Level**: Internal provisioned role (`admin@carelink.org`). Holds all 41 system permission claims (`Permissions.All`).
- **Frontend Workspace**: `/admin/*` ([AdminLayout.tsx](file:///d:/NSBM/SA-Project/careLink-frontend/src/layouts/AdminLayout.tsx)).
- **Primary Capabilities**: Full user management, staff account provisioning and single-use password token generation, role and permission claim configuration, partner organization verification review (approve, reject, or request additional information), review and final decision-making on AI recommendations, inspection of audit logs and security telemetry, system health monitoring, and SMTP diagnostics.

#### 4. Case Manager (Incident Triage & Verification Officer)
- **Role Definition**: Humanitarian social worker or caseworker tasked with triaging, verifying, and assigning incoming citizen requests to ensure aid reaches authentic victims and prevent duplicate relief distribution.
- **Access Level**: Admin-provisioned internal staff role (`casemanager@carelink.org`).
- **Frontend Workspace**: `/case-manager/*` ([CaseManagerLayout.tsx](file:///d:/NSBM/SA-Project/careLink-frontend/src/layouts/CaseManagerLayout.tsx)).
- **Primary Capabilities**: Claim unassigned citizen requests from the queue, verify applicant identity and vulnerability criteria, inspect attached evidence documents, detect and merge duplicate requests, escalate urgent cases, update case lifecycle status (`Under Review`, `Verified`, `Assigned`, `Fulfilled`, `Closed`), and review AI triage suggestions.

#### 5. Emergency Coordinator (Command Operations Lead)
- **Role Definition**: High-level disaster manager operating within the Emergency Operations Centre (EOC) responsible for cross-sectoral disaster response, operational situational awareness, and resource mobilization.
- **Access Level**: Admin-provisioned internal staff role (`coordinator@carelink.org`).
- **Frontend Workspace**: `/emergency-coordinator/*` ([EmergencyCoordinatorLayout.tsx](file:///d:/NSBM/SA-Project/careLink-frontend/src/layouts/EmergencyCoordinatorLayout.tsx)).
- **Primary Capabilities**: Monitor active crises via the live telemetry dashboard and geographic operations map, declare disaster incidents and severity levels (Level 1 to Level 5), generate situation reports (SitReps), trigger multi-sectoral crisis situation analysis, generate grounded AI response recommendations (resource distribution, shelter allocation, volunteer deployment), review and decide on AI recommendations (Approve, Reject, Modify, Defer, Reset), and orchestrate inter-agency partner resources.

#### 6. Volunteer Coordinator (Volunteer & Field Operations Lead)
- **Role Definition**: Personnel manager responsible for registering, verifying, organizing, tasking, and deploying volunteers across disaster response operations.
- **Access Level**: Admin-provisioned role or elevated volunteer supervisor (`volunteercoordinator@carelink.org`). In the CareLink architecture, volunteers also access the volunteer workspace (`volunteer@carelink.org`).
- **Frontend Workspace**: `/volunteer-coordinator/*` ([VolunteerLayout.tsx](file:///d:/NSBM/SA-Project/careLink-frontend/src/layouts/VolunteerLayout.tsx)).
- **Primary Capabilities**: Maintain the volunteer directory, verify volunteer credentials and background checks, manage skill sets and availability schedules, create response tasks, match volunteers to tasks using AI skill matching algorithms, monitor field attendance and shift check-ins, record completed volunteer hours, broadcast volunteer communications, and utilize the CareLink AI Assistant chatbot for operational guidance.

#### 7. Shelter Administrator (Facility & Occupancy Lead)
- **Role Definition**: On-site manager responsible for operating designated emergency evacuation shelters, safe havens, and community relief centres.
- **Access Level**: Admin-provisioned internal staff role (`shelteradmin@carelink.org`).
- **Frontend Workspace**: `/shelter-admin/*` ([ShelterLayout.tsx](file:///d:/NSBM/SA-Project/careLink-frontend/src/layouts/ShelterLayout.tsx)).
- **Primary Capabilities**: Maintain shelter facility profiles, configure room and bed inventory, monitor live capacity and occupancy thresholds, process incoming accommodation requests, perform resident check-in/checkout admissions, manage on-site food and relief stock, assign shelter staff shifts, log health and safety incidents, and publish emergency facility status alerts.

#### 8. Resource Manager (Inventory, Warehouse & Logistics Lead)
- **Role Definition**: Supply chain and warehouse controller ensuring relief goods, medical equipment, drinking water, and dry rations are received, safely stored, and distributed efficiently without stockouts.
- **Access Level**: Admin-provisioned internal staff role (`resourcemanager@carelink.org`).
- **Frontend Workspace**: `/resource-manager/*` ([ResourceManagerLayout.tsx](file:///d:/NSBM/SA-Project/careLink-frontend/src/layouts/ResourceManagerLayout.tsx)).
- **Primary Capabilities**: Track warehouse stock inventories across central and regional hubs, log incoming stock receipts, monitor low-stock threshold alerts, fulfill resource requisitions from shelters and field coordinators, create dispatch tracking records, manage inter-warehouse stock transfers, and oversee supplier procurement orders.

#### 9. Funding Officer (Donations, Campaigns & Financial Auditor)
- **Role Definition**: Financial controller and donor relations officer responsible for tracking financial aid, corporate donor contributions, humanitarian relief campaigns, fund allocations, and financial transparency.
- **Access Level**: Admin-provisioned internal staff role (`funding@carelink.org`).
- **Frontend Workspace**: `/funding-officer/*` ([FundingOfficerLayout.tsx](file:///d:/NSBM/SA-Project/careLink-frontend/src/layouts/FundingOfficerLayout.tsx)).
- **Primary Capabilities**: Maintain institutional donor records, record direct monetary donations and in-kind contributions, create public relief fundraising campaigns, allocate funding to verified disaster operations, track relief expenditures against approved budgets, review flagged high-risk or suspicious transactions, and generate public transparency audit reports.

---

### 2.2 External System Actors

#### 10. Google Gemini AI API (`gemini-1.5-flash`)
- **Stereotype**: `<<External System>>`
- **Role Definition**: Cloud-hosted Large Language Model (LLM) service accessed over HTTPS via Google Generative AI REST endpoints.
- **Interface**: Implemented by `CareLink.Infrastructure.Services.GeminiService`.
- **Interactions**:
  1. **AI Recommendation Engine** (`AiRecommendationService.cs`): Generates structured JSON recommendations for crisis situation analysis, resource allocation, shelter matching, and volunteer deployment with low sampling temperature (`temperature = 0.2`) and strict schema validation.
  2. **CareLink AI Assistant Chatbot** (`ChatbotService.cs`): Powers multi-turn trilingual conversations (English, Sinhala, Tamil) grounded in real-time user requests, active shelter capacities, and national emergency hotline safety guardrails (DMC 117, 1990 Suwa Seriya, 119 Police).

#### 11. Email / SMTP Service (Gmail SMTP)
- **Stereotype**: `<<External System>>`
- **Role Definition**: Standard mail transfer agent (`smtp.gmail.com:587` with STARTTLS) responsible for delivering mission-critical notifications and security credentials.
- **Interface**: Implemented by `CareLink.Infrastructure.Services.EmailService`.
- **Interactions**:
  1. Sends welcome confirmations to newly registered Citizens and Volunteers.
  2. Dispatches partner registration notifications to applicants and alerts administrators of pending partner verification queues.
  3. Delivers secure, single-use, 24-hour password setup links to newly provisioned staff members (ensuring setup tokens never leak into API responses).
  4. Delivers partner accreditation decision notifications (approval confirmations or detailed rejection reasons).

---

## 3. Subsystem Breakdown and Complete Use Case Catalog

The CareLink Crisis Management System boundary encompasses **56 verified use cases** organized into **10 functional subsystems**.

```
+---------------------------------------------------------------------------------------------------+
|                           CARELINK FUNCTIONAL SUBSYSTEMS (UC01 - UC56)                            |
+----+---------------------------------------------------------------+--------------+---------------+
| #  | Subsystem Package Name                                        | Use Cases    | Target Roles  |
+----+---------------------------------------------------------------+--------------+---------------+
| 1  | Authentication, Registration & Account Onboarding             | UC01 - UC04, | All 9 Roles,  |
|    |                                                               | UC37 - UC38  | Citizen, NGO  |
| 2  | Citizen Relief Portal & AI Humanitarian Chatbot               | UC25 - UC31  | Citizen, Vol. |
| 3  | Partner Organisation Collaboration & Field Operations         | UC39 - UC42  | Partner Off.  |
| 4  | System Administration, User Provisioning & Governance         | UC05 - UC13  | Administrator |
| 5  | Case Management, Verification & Request Triage                | UC14 - UC18  | Case Manager  |
| 6  | Emergency Coordination & Human-in-the-Loop AI Decision Support| UC19 - UC24  | Emg. Coord.,  |
|    |                                                               |              | Admin, Case M.|
| 7  | Volunteer Coordination, AI Matching & Field Deployment        | UC52 - UC56  | Vol. Coord.   |
| 8  | Shelter Administration, Capacity & Resident Management        | UC48 - UC51  | Shelter Admin |
| 9  | Resource, Inventory, Warehouse & Logistics Management         | UC43 - UC47  | Resource Mgr. |
| 10 | Funding, Donations, Allocations & Financial Auditing          | UC32 - UC36  | Funding Off.  |
+----+---------------------------------------------------------------+--------------+---------------+
```

---

### Subsystem 1: Authentication, Registration & Account Onboarding

| UC ID | Use Case Name | Primary Actors | Secondary Actors | UML Relation | Trigger & Description | Implementation Status |
|:---|:---|:---|:---|:---|:---|:---|
| **UC01** | Login & Authenticate | All 9 Roles | None | Association | User inputs email and password. System validates credentials via ASP.NET Core Identity PBKDF2 hash, checks `IsActive == true` and `AccountStatus == "Active"`, and issues a signed 24-hour JWT token. | **Fully Implemented** (`POST /api/auth/login`) |
| **UC02** | Register Public Account | Citizen, Volunteer | SmtpService | Association | Public user registers as a Citizen or Volunteer. System verifies unique email, hashes password, assigns role, activates account immediately, and dispatches a welcome email via SMTP. | **Fully Implemented** (`POST /api/auth/register`) |
| **UC03** | Register Partner Organisation | Partner Officer | SmtpService | `<<include>>` UC37 | Humanitarian organization representative registers entity details across 6 sections. System sets `IsActive=false`, `AccountStatus="PendingApproval"`, stores documents, and alerts admins. | **Fully Implemented** (`POST /api/auth/register`) |
| **UC04** | Complete Single-Use Staff Password Setup | Internal Staff (Admin-Invited) | None | `<<extend>>` UC01 | Invited staff member accesses emailed setup link (`/setup-account?email=...&token=...`), submits new password. System validates token, sets password, flags `PasswordSetupTokenUsed=true`, and activates user. | **Fully Implemented** (`POST /api/auth/setup-password`) |
| **UC37** | Submit Organisation Verification Documents | Partner Officer | None | Included by UC03 | Representative uploads official legal documents (Registration, Tax Exemption, Board Resolution, Annual Report). System verifies magic bytes (`%PDF`, `FF D8 FF`, `89 50 4E 47`) and enforces a 10 MB limit. | **Fully Implemented** (`dbo.OrganizationDocuments`) |
| **UC38** | Submit Requested Additional Verification Info | Partner Officer | None | `<<extend>>` UC03 | When an admin flags an application with `AdditionalInfoRequired`, the partner submits clarification text and supplemental documents from the login screen to resume review. | **Fully Implemented** (`POST /api/auth/partner-additional-info`) |

---

### Subsystem 2: Citizen Relief Portal & AI Humanitarian Chatbot

| UC ID | Use Case Name | Primary Actors | Secondary Actors | UML Relation | Trigger & Description | Implementation Status |
|:---|:---|:---|:---|:---|:---|:---|
| **UC25** | Manage Citizen Profile & Household Members | Citizen | None | Association | Citizen registers household dependents, special medical requirements (infants, elderly, disability), and contact address to expedite family triage. | **Partially Implemented** (`CitizenProfileController`, `HouseholdController`) |
| **UC26** | Submit Emergency Assistance Request | Citizen | None | Association | Citizen submits urgent aid request specifying category (Food, Medical, Rescue, Shelter), geolocation, affected head count, and priority. | **Fully Implemented** (`CitizenRequestsController`, `AssistanceRequestsController`) |
| **UC27** | Upload Supporting Evidence Documents | Citizen | None | `<<extend>>` UC26 | Citizen optionally attaches situational photos or identity verification documents to substantiate urgent aid claims. | **Partially Implemented** (`DocumentsController`, in-memory storage) |
| **UC28** | View & Update Submitted Assistance Requests | Citizen | None | Association | Citizen reviews history of active and past aid requests, edits details before verification, or cancels resolved requests. | **Fully Implemented** (`GET/PATCH /api/citizen/requests`) |
| **UC29** | Track Request Status & Case Messaging | Citizen | None | Association | Citizen views live status lifecycle badges (`Submitted`, `Under Review`, `Dispatched`, `Fulfilled`) and exchanges messages with assigned caseworkers. | **Partially Implemented** (`MessagesController`, live polling) |
| **UC30** | View Shelters, Nearby Support & Safety Updates | Citizen | None | Association | Citizen views live shelter bed availability, active relief distribution points, and government safety bulletins. | **Fully Implemented** (`SheltersController`, `SafetyUpdatesController`) |
| **UC31** | Use CareLink AI Assistant Chatbot | Citizen, Volunteer | GeminiAPI | Association | User converses with the CareLink AI Assistant in English, Sinhala, or Tamil. The bot grounds responses in live database state and emergency hotlines. | **Fully Implemented** (`ChatbotController`, `GeminiService`) |

---

### Subsystem 3: Partner Organisation Collaboration & Field Operations

| UC ID | Use Case Name | Primary Actors | Secondary Actors | UML Relation | Trigger & Description | Implementation Status |
|:---|:---|:---|:---|:---|:---|:---|
| **UC39** | Manage Organisation Profile & View Verification Status | Partner Officer | None | Association | Partner views accredited organization profile, headquarters data, operational regions, and administrator approval state (`Pending`, `Active`, `Rejected`). | **Fully Implemented** (`OrganisationProfileController`, `OrganizationsController`) |
| **UC40** | Manage Assistance Referrals & Shared Crisis Events | Partner Officer | None | Association | Partner inspects government-referred citizen assistance requests and accepts operational responsibility for assigned regional zones. | **Partially Implemented** (`AssistanceReferralsController`, `CrisisEventsController`) |
| **UC41** | Manage Resource Sharing & Collaboration Requests | Partner Officer | None | Association | Partner publishes surplus emergency resources (e.g., water purification units) for inter-agency sharing and issues joint collaboration requests. | **Partially Implemented** (`ResourceSharingController`, `CollaborationRequestsController`) |
| **UC42** | Log Field Activities, Team Contacts & Partner Reports | Partner Officer | None | Association | Partner logs deployed field teams, contact directories, daily activity progress feeds, and exports summary partnership reports. | **Partially Implemented** (`FieldActivitiesController`, `TeamContactsController`) |

---

### Subsystem 4: System Administration, User Provisioning & Governance

| UC ID | Use Case Name | Primary Actors | Secondary Actors | UML Relation | Trigger & Description | Implementation Status |
|:---|:---|:---|:---|:---|:---|:---|
| **UC05** | Manage Users & Account Status | Admin | None | Association | Administrator browses full user directory, filters by role and status, toggles account active status (`IsActive`), and deactivates accounts. | **Fully Implemented** (`UsersController`, `ApplicationDbContext`) |
| **UC06** | Create & Invite Internal Staff Account | Admin | SmtpService | `<<include>>` UC07 | Administrator provisions internal staff (Case Manager, Coordinator, etc.) by specifying email, name, and role. System emails an invitation link without exposing passwords. | **Fully Implemented** (`POST /api/users`, `UserService`) |
| **UC07** | Generate Single-Use Password Setup Token | Admin | SmtpService | Included by UC06 | System generates cryptographically secure reset token via `UserManager.GeneratePasswordResetTokenAsync`, encodes as Base64Url, sets 24h expiry, and dispatches via SMTP. | **Fully Implemented** (`UserService.cs`, `EmailService.cs`) |
| **UC08** | Manage Roles & Role Hierarchy | Admin | None | Association | Administrator creates custom role definitions, inspects role membership counts, and adjusts role assignments. | **Fully Implemented** (`RolesController`, `ApplicationDbContext`) |
| **UC09** | Manage Fine-Grained Permissions | Admin | None | Association | Administrator inspects and modifies the 41 granular security permission claims (`Permissions.cs`) assigned to specific roles. | **Fully Implemented** (`PermissionsController`, `RoleClaims`) |
| **UC10** | Verify Partner Organisations (Approve / Reject) | Admin | SmtpService | Association | Administrator audits submitted NGO documentation in the verification queue, approves accreditation, or rejects with mandatory reason and automated email notice. | **Fully Implemented** (`POST /api/users/{id}/approve`, `reject`) |
| **UC11** | Request Additional Partner Verification Info | Admin | SmtpService | `<<extend>>` UC10 | Administrator conditionally requests clarification or missing legal documentation from applicant before making an approval decision. | **Fully Implemented** (`POST /api/organizations/{id}/review`) |
| **UC12** | Monitor System Activities, Audit Logs & Security Events | Admin | None | Association | Administrator reviews immutable security event logs, failed login attempts, privilege escalations, and system modification audit trails. | **Partially Implemented** (`AuditLogsController`, `SecurityEventsController`) |
| **UC13** | System Oversight, Analytics & SMTP Diagnostics | Admin | SmtpService | Association | Administrator inspects operational throughput telemetry, database connectivity, and executes live SMTP diagnostic test emails. | **Fully Implemented** (`AdminDashboardController`, `UsersController`) |

---

### Subsystem 5: Case Management, Verification & Request Triage

| UC ID | Use Case Name | Primary Actors | Secondary Actors | UML Relation | Trigger & Description | Implementation Status |
|:---|:---|:---|:---|:---|:---|:---|
| **UC14** | View & Claim Unassigned Assistance Requests | Case Manager | None | Association | Caseworker inspects the global unassigned intake queue, reviews priority tags, and self-assigns cases for investigation. | **Partially Implemented** (`CaseManagementController`, `MyCasesController`) |
| **UC15** | Verify Assistance Requests & Applicant Identity | Case Manager | None | Association | Caseworker validates submitted contact phone, residential address, family size, and cross-checks government vulnerability registries. | **Partially Implemented** (`CaseVerificationController`) |
| **UC16** | Review Case Details & Manage Case Information | Case Manager | None | Association | Caseworker reviews comprehensive incident narratives, updates beneficiary needs, and records internal caseworker assessment notes. | **Partially Implemented** (`CaseManagementController`) |
| **UC17** | Triage Cases, Escalate & Resolve Duplicates | Case Manager | None | Association | Caseworker flags life-safety urgent cases to emergency coordinators and merges duplicate relief submissions from the same household. | **Partially Implemented** (`DuplicatesController`, `EscalatedCasesController`) |
| **UC18** | Update Case Status & Final Resolution | Case Manager | None | Association | Caseworker transitions case workflow lifecycle to `Verified`, `Assigned`, `Fulfilled`, or `Closed` upon relief delivery confirmation. | **Partially Implemented** (`CaseManagementController`) |

---

### Subsystem 6: Emergency Coordination & AI Decision Support

| UC ID | Use Case Name | Primary Actors | Secondary Actors | UML Relation | Trigger & Description | Implementation Status |
|:---|:---|:---|:---|:---|:---|:---|
| **UC19** | View Crisis Operations Dashboard & Live Map | Emergency Coordinator | None | Association | Coordinator monitors multi-hazard situation overview, regional disaster hotspots, active response teams, and operational telemetry metrics. | **Partially Implemented** (`OperationDashboardController`, `LiveOperationsMapController`) |
| **UC20** | Manage Crisis Incidents & Severity Levels | Emergency Coordinator | None | Association | Coordinator logs new disaster incidents (floods, landslides, cyclones), designates geographic impact radius, and assigns severity levels (Level 1–5). | **Partially Implemented** (`CrisisEventsController`, in-memory store) |
| **UC21** | Coordinate Emergency Responses & Situation Reports | Emergency Coordinator | None | Association | Coordinator dispatches cross-functional relief directives, coordinates lead agencies (NDRAs), and exports official daily Situation Reports (SitReps). | **Partially Implemented** (`SituationReportsController`, `OperationDashboardController`) |
| **UC22** | Analyse Crisis Situations | Emergency Coordinator | None | `<<include>>` UC23 | Coordinator triggers automated multi-dimensional situation assessment comparing regional crisis needs against available logistical capacity. | **Fully Implemented** (`POST /api/ai/crises/{id}/analysis`) |
| **UC23** | Generate & View Grounded AI Recommendations | Emergency Coordinator, Admin, Case Manager | GeminiAPI | Included by UC22 | System calls Gemini API (`gemini-1.5-flash`) with live crisis, inventory, shelter, and volunteer telemetry, receiving strongly-typed JSON recommendations. | **Fully Implemented** (`AiRecommendationService`, `GeminiService`) |
| **UC24** | Review AI Recommendations (Human-in-the-Loop) | Emergency Coordinator, Admin | None | `<<extend>>` UC23 | Authorized reviewer inspects AI proposals and executes mandatory human decision: **Approve**, **Reject** (requires reason), **Modify Priority**, **Defer**, or **Reset**. | **Fully Implemented** (`POST /api/ai-recommendations/{id}/decision`) |

---

### Subsystem 7: Volunteer Coordination, AI Matching & Field Deployment

| UC ID | Use Case Name | Primary Actors | Secondary Actors | UML Relation | Trigger & Description | Implementation Status |
|:---|:---|:---|:---|:---|:---|:---|
| **UC52** | View & Verify Volunteer Directory & Records | Volunteer Coordinator | None | Association | Coordinator audits registered volunteer personnel, verifies identity credentials, and tracks police/medical clearances. | **Partially Implemented** (`VolunteerDirectoryController`, `VolunteerVerificationsController`) |
| **UC53** | Manage Volunteer Profiles, Skills & Training | Volunteer Coordinator | None | Association | Coordinator classifies volunteer capabilities (First Aid, Search & Rescue, Boat Operation, Counseling), availability hours, and training credentials. | **Partially Implemented** (`SkillsAvailabilityController`, `TrainingCertificationsController`) |
| **UC54** | Create & Manage Volunteer Tasks & AI Skill Matching | Volunteer Coordinator | GeminiAPI | Association | Coordinator logs field response tasks and utilizes AI matching algorithms to identify the most suitable qualified volunteer cohorts. | **Partially Implemented** (`VolunteerTasksController`, `AIVolunteerMatchingController`) |
| **UC55** | Assign & Deploy Volunteers to Field Operations | Volunteer Coordinator | None | Association | Coordinator assigns verified volunteers to specific disaster incidents, shifts, or evacuation shelters with automated deployment notifications. | **Partially Implemented** (`AssignmentsController`) |
| **UC56** | Monitor Volunteer Activities & Communications | Volunteer Coordinator | None | Association | Coordinator monitors on-site volunteer attendance check-ins, tracks completed service hours, and broadcasts operational alerts to field teams. | **Partially Implemented** (`ActivityTrackingController`, `CommunicationsController`) |

---

### Subsystem 8: Shelter Administration, Capacity & Resident Management

| UC ID | Use Case Name | Primary Actors | Secondary Actors | UML Relation | Trigger & Description | Implementation Status |
|:---|:---|:---|:---|:---|:---|:---|
| **UC48** | Manage Shelter Details, Rooms & Bed Inventory | Shelter Administrator | None | Association | Administrator maintains shelter facilities, room configurations, bed statuses (`Available`, `Occupied`, `Maintenance`), and physical amenities. | **Implemented (EF Core In-Memory)** (`SheltersController`, `RoomBedController`) |
| **UC49** | View & Update Shelter Capacity & Thresholds | Shelter Administrator | None | Association | Administrator tracks total capacity, occupied beds, remaining capacity, and sets yellow/red occupancy warning thresholds (e.g. 85%, 95%). | **Implemented (EF Core In-Memory)** (`OccupancyController`, `ShelterService`) |
| **UC50** | Process Accommodation Requests & Manage Residents | Shelter Administrator | None | Association | Administrator admits displaced families, assigns room and bed numbers, maintains resident registers, and manages discharge checkout workflows. | **Implemented (EF Core In-Memory)** (`AccommodationRequestsController`, `ResidentsController`) |
| **UC51** | Track Shelter Availability, Staff & Safety | Shelter Administrator | None | Association | Administrator manages shelter relief stock, schedules staff work shifts, logs health and safety incidents, and tracks building maintenance orders. | **Implemented (EF Core In-Memory)** (`StaffController`, `HealthSafetyController`) |

---

### Subsystem 9: Resource, Inventory, Warehouse & Logistics Management

| UC ID | Use Case Name | Primary Actors | Secondary Actors | UML Relation | Trigger & Description | Implementation Status |
|:---|:---|:---|:---|:---|:---|:---|
| **UC43** | View & Manage Resource Inventory & Warehouses | Resource Manager | None | Association | Manager tracks physical stock holdings (food packs, medical kits, blankets, hygiene packs) across centralized storage warehouses. | **Partially Implemented** (`InventoryController`, `WarehousesController`) |
| **UC44** | Update Resource Quantities & Low-Stock Alerts | Resource Manager | None | Association | Manager logs stock additions and adjustments, monitoring real-time automated low-stock warnings when inventory drops below safety buffers. | **Partially Implemented** (`InventoryController`, `AlertsController`) |
| **UC45** | Review Resource Requests & Allocate Resources | Resource Manager | None | Association | Manager evaluates resource requisitions submitted by emergency response teams and allocates requested relief quantities from available stock. | **Partially Implemented** (`ResourceRequestsController`, `AllocationsController`) |
| **UC46** | Track Resource Allocation, Dispatches & Stock Transfers | Resource Manager | None | Association | Manager tracks dispatched logistics convoys, delivery manifests, driver details, transit milestones, and inter-warehouse stock rebalancing. | **Partially Implemented** (`DispatchesController`, `TransfersController`) |
| **UC47** | Manage Procurement Orders & Supplier Contracts | Resource Manager | None | Association | Manager generates purchase orders for critical relief supplies, tracks supplier fulfillment lead times, and maintains approved vendor lists. | **Partially Implemented** (`ProcurementController`, `SuppliersController`) |

---

### Subsystem 10: Funding, Donations, Allocations & Financial Auditing

| UC ID | Use Case Name | Primary Actors | Secondary Actors | UML Relation | Trigger & Description | Implementation Status |
|:---|:---|:---|:---|:---|:---|:---|
| **UC32** | View & Manage Donors & Humanitarian Campaigns | Funding Officer | None | Association | Officer maintains donor profiles (individual, corporate, institutional) and configures public humanitarian fundraising campaign targets. | **Implemented (EF Core In-Memory)** (`DonorsController`, `CampaignsController`) |
| **UC33** | Record & Manage Donations & In-Kind Contributions | Funding Officer | None | Association | Officer records received financial donations, payment methods (bank transfer, credit card), and logs physical goods contributions. | **Implemented (EF Core In-Memory)** (`DonationsController`, `ResourceContributionsController`) |
| **UC34** | Record Funding Allocations & Manage Expenditures | Funding Officer | None | Association | Officer allocates received funds to specific crisis operations and tracks relief operational expenditures against budgetary spending limits. | **Implemented (EF Core In-Memory)** (`FundAllocationsController`, `ExpendituresController`) |
| **UC35** | Monitor Financial Activities & Flagged Transactions | Funding Officer | None | Association | Officer audits transaction telemetry, reviews automated anomaly alerts on high-value donations, and monitors money laundering/fraud risks. | **Implemented (EF Core In-Memory)** (`FlaggedTransactionsController`, `FundingDashboardController`) |
| **UC36** | Generate Funding & Transparency Reports | Funding Officer | None | Association | Officer compiles public financial accountability summaries, calculates fund utilization ratios, and publishes audited transparency reports. | **Implemented (EF Core In-Memory)** (`TransparencyReportsController`, `FundingReportsController`) |

---

## 4. UML Relationship Analysis and Verification

### 4.1 Association Relationships (`Actor` $\rightarrow$ `Use Case`)
- Every human actor is associated only with the use cases that correspond to authorized capabilities according to their role claim matrix in `DefaultRolePermissions.cs` and frontend navigation permissions.
- All nine human actors participate in **UC01: Login & Authenticate**, representing the centralized JWT authentication gateway.
- Public users (Citizen and Volunteer) participate in **UC02: Register Public Account**, reflecting self-service onboarding.
- Partner Organizations participate in **UC03: Register Partner Organisation**, reflecting institutional onboarding.
- Admin-provisioned internal staff (Case Manager, Emergency Coordinator, Volunteer Coordinator, Shelter Administrator, Resource Manager, Funding Officer) participate in **UC04: Complete Single-Use Staff Password Setup**, reflecting secure invitee activation.
- External systems (`GeminiAPI` and `SmtpService`) are associated with backend-driven use cases where automated inference or communication occurs.

### 4.2 Include Relationships (`<<include>>`)
A use case *includes* another when the target behavior is a mandatory, non-optional step in the execution of the base use case:
1. **UC03: Register Partner Organisation $\xrightarrow{<<include>>}$ UC37: Submit Organisation Verification Documents**:
   - In CareLink, partner registration cannot be completed without uploading mandatory verification documentation (Registration Certificate and Board Resolution). The application enforces document checks during registration.
2. **UC06: Create & Invite Internal Staff Account $\xrightarrow{<<include>>}$ UC07: Generate Single-Use Password Setup Token**:
   - When an administrator creates an internal staff account, the system *always* generates a cryptographic password setup token and transmits it via SMTP. Staff creation cannot complete without token generation.
3. **UC22: Analyse Crisis Situations $\xrightarrow{<<include>>}$ UC23: Generate & View Grounded AI Recommendations**:
   - Situational crisis analysis unconditionally triggers the generation and storage of grounded AI recommendations (resource, shelter, and volunteer plans) via `AiRecommendationService.cs`.

### 4.3 Extend Relationships (`<<extend>>`)
A use case *extends* another when the extended behavior is optional, conditional, or triggered only under specific operational circumstances:
1. **UC04: Complete Single-Use Staff Password Setup $\xrightarrow{<<extend>>}$ UC01: Login & Authenticate** `[Condition: First-Time Staff Onboarding]`:
   - Password setup extends the general authentication process only when an uninitialized user attempts onboarding before their initial password exists.
2. **UC38: Submit Requested Additional Verification Info $\xrightarrow{<<extend>>}$ UC03: Register Partner Organisation** `[Condition: Additional Info Requested by Administrator]`:
   - Supplemental document submission occurs only if an administrator flagged the application with `AdditionalInfoRequired` during queue review.
3. **UC11: Request Additional Partner Verification Info $\xrightarrow{<<extend>>}$ UC10: Verify Partner Organisations** `[Condition: Clarification Needed]`:
   - The admin only requests additional evidence if the submitted legal documents require clarification before an approve/reject decision can be made.
4. **UC27: Upload Supporting Evidence Documents $\xrightarrow{<<extend>>}$ UC26: Submit Emergency Assistance Request** `[Condition: Supporting Evidence Attached]`:
   - Attaching photographic or document evidence to a relief request is optional; citizens can submit text-only emergency requests when bandwidth is constrained.
5. **UC24: Review AI Recommendations $\xrightarrow{<<extend>>}$ UC23: Generate & View Grounded AI Recommendations** `[Condition: Human Review Decision Required]`:
   - Recommendations remain in `Awaiting Review` state until an authorized human operator explicitly approves, modifies, rejects, or defers them. AI outputs are never automatically executed.

---

## 5. Implementation Status and Academic Verification

To maintain strict academic integrity in the university report, the functional use cases are classified based on the actual codebase implementation:

```
+----------------------------------------------------------------------------------------------------+
|                                    IMPLEMENTATION STATUS AUDIT                                     |
+--------------------------+-------------------------------------------------------------------------+
| Category                 | Scope & Characteristics in Codebase                                     |
+--------------------------+-------------------------------------------------------------------------+
| Fully Implemented        | Complete vertical slice: React UI, REST API, C# Application Service,   |
| (18 Use Cases)           | SQL Server database table, entity migration, and live external service. |
|                          | Examples: UC01, UC02, UC03, UC04, UC05, UC06, UC07, UC08, UC09, UC10,    |
|                          | UC11, UC13, UC22, UC23, UC24, UC26, UC31, UC37, UC38.                   |
+--------------------------+-------------------------------------------------------------------------+
| Implemented via EF Core  | Complete vertical slice: React UI, REST API, C# Application Service,   |
| In-Memory Database       | EF Core LINQ repository, seeded with realistic operational data in      |
| (9 Use Cases)            | CareLinkDbContext. Examples: UC32, UC33, UC34, UC35, UC36, UC48,        |
|                          | UC49, UC50, UC51.                                                       |
+--------------------------+-------------------------------------------------------------------------+
| Partially Implemented    | Complete React UI & REST API Controller, backed by in-memory singleton  |
| (29 Use Cases)           | C# repositories (InMemory*Repository) or secondary backend project.     |
|                          | Demonstrates working workflows during live execution but does not       |
|                          | persist to SQL Server. Examples: UC12, UC14-UC21, UC25, UC27-UC30,      |
|                          | UC39-UC47, UC52-UC56.                                                   |
+--------------------------+-------------------------------------------------------------------------+
```

---

## 6. Report Section 2.4 Text (Draft for Final University Submission)

*The following text can be directly included in Section 2.4 of the university Software Architecture report:*

> ### 2.4 System Use Case Modeling and Actor Specifications
>
> The functional requirements and user interaction boundaries of the CareLink Crisis Management System were modeled using UML 2.5 Use Case notation, as illustrated in Figure 2.4.1. The system architecture enforces a multi-tenant, role-governed humanitarian relief platform comprising nine primary human actors and two external systems interacting across fifty-six distinct use cases.
>
> To reflect the real-world operational realities of disaster response while maintaining enterprise security standards, the system distinguishes between self-service public actors (*Citizen* and *Volunteer*) and institutional administrative actors. Citizens and Volunteers are permitted direct self-registration with immediate activation, whereas institutional *Partner Officers* representing accredited humanitarian NGOs must undergo formal identity verification and document authentication prior to receiving system clearance. All internal command and logistics roles (*Case Manager*, *Emergency Coordinator*, *Volunteer Coordinator*, *Shelter Administrator*, *Resource Manager*, and *Funding Officer*) are provisioned exclusively through administrative invitation using secure, single-use, time-limited password establishment tokens transmitted via the external *Email / SMTP Service*.
>
> A core architectural contribution of CareLink is its **Human-in-the-Loop AI Decision Support Subsystem**. Integrated with the *Google Gemini AI API (`gemini-1.5-flash`)*, the platform automates crisis situation analysis by cross-referencing real-time citizen demand against logistical inventory, available shelter capacities, and verified volunteer cohorts. In strict adherence to safety-critical software engineering principles, AI recommendations cannot be autonomously executed; rather, they extend the generation workflow into an obligatory human decision state machine (*Approve*, *Reject*, *Modify*, *Defer*, or *Reset*), ensuring that high-stakes resource allocation decisions remain firmly under human command oversight.

---

## 7. Deliverable File Manifest

All diagram and specification files are maintained within the project documentation directory:

1. **PlantUML Source**: [`CareLink_Complete_Use_Case_Diagram.puml`](file:///d:/NSBM/SA-Project/careLink-frontend/CareLink_Complete_Use_Case_Diagram.puml)
2. **Scalable Vector Graphic**: [`CareLink_Complete_Use_Case_Diagram.svg`](file:///d:/NSBM/SA-Project/careLink-frontend/CareLink_Complete_Use_Case_Diagram.svg)
3. **High-Resolution PNG (3000 x 2120 @ 300 DPI)**: [`CareLink_Complete_Use_Case_Diagram.png`](file:///d:/NSBM/SA-Project/careLink-frontend/CareLink_Complete_Use_Case_Diagram.png)
4. **A4 Landscape Report-Ready PDF**: [`CareLink_Complete_Use_Case_Diagram.pdf`](file:///d:/NSBM/SA-Project/careLink-frontend/CareLink_Complete_Use_Case_Diagram.pdf)
5. **Actor & Use Case Specification**: [`CareLink_Use_Case_Actor_Description.md`](file:///d:/NSBM/SA-Project/careLink-frontend/CareLink_Use_Case_Actor_Description.md)
