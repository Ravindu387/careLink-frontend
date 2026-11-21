import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AIRecommendationReview from "../AIRecommendationReview";
import { aiRecommendationService } from "../../../services/aiRecommendationService";
import type {
  AiRecommendationDetail,
  AiRecommendationMetrics,
  AiRecommendationSummary,
} from "../../../types/aiRecommendation";

describe("AIRecommendationReview Component", () => {
  const mockMetrics: AiRecommendationMetrics = {
    totalRecommendations: 8,
    totalCases: 8,
    awaitingReviewCount: 6,
    approvedCount: 1,
    modifiedCount: 0,
    deferredCount: 1,
    rejectedCount: 0,
    averageConfidence: 94,
  };

  const mockList: AiRecommendationSummary[] = [
    {
      id: "AI-9041",
      crisisId: "CR-2025-018",
      crisisName: "Monsoon Floods 2025",
      requestId: "REQ-2841",
      category: "ShelterIntake",
      title: "Emergency shelter evacuation",
      action: "Evacuate household to North Community Hall",
      timestamp: new Date().toISOString(),
      recommendedPriority: "Critical",
      confidence: 94,
      reviewState: "Awaiting Review",
      explanation: "Active water ingress in living area",
      alternative: "High School shelter",
      location: "Riverside, North Ward",
    },
    {
      id: "AI-9038",
      crisisId: "CR-2025-018",
      crisisName: "Monsoon Floods 2025",
      requestId: "REQ-2839",
      category: "ResourceAllocation",
      title: "Medical Supplies Dispatch",
      action: "Dispatch 24 Trauma Kits",
      timestamp: new Date().toISOString(),
      recommendedPriority: "High",
      confidence: 91,
      reviewState: "Awaiting Review",
      explanation: "Patients isolated with chronic insulin requirements",
      alternative: "Local clinic dispatch",
      location: "Sector 4",
    },
  ];

  const mockDetail: AiRecommendationDetail = {
    id: "AI-9041",
    crisisId: "CR-2025-018",
    crisisName: "Monsoon Floods 2025",
    requestId: "REQ-2841",
    category: "ShelterIntake",
    title: "Emergency shelter evacuation",
    summary: "Household evacuation to North Community Hall",
    createdAt: new Date().toISOString(),
    requestCategory: "Emergency shelter",
    reportedUrgency: "Reported urgent",
    location: "Riverside, North Ward",
    vulnerabilityFactors: "Children, limited mobility",
    affectedPeople: 6,
    submittedTime: "12 minutes ago",
    verificationStatus: "Contact verified",
    evidenceNote: "Flood line inspection confirmed",
    relevantInformation: ["Standing water 1.2m", "Infant and elderly resident"],
    modelName: "Priority Assist v2.4 (Gemini)",
    modelTimestamp: "13:01 UTC",
    recommendedPriority: "Critical",
    confidence: 94,
    explanation: "Immediate evacuation required due to active water rise.",
    recommendedAction: "Evacuation + accessible shelter",
    alternatives: [{ priority: "High", likelihoodPercentage: 6 }],
    reviewState: "Awaiting Review",
    immediatePriorities: ["Safe evacuation transport", "Bedding assignment"],
    risks: ["Power failure in sector"],
    assumptions: ["Shelter road remains passable"],
    missingInformation: [],
    warningMessage: "",
    isDecisionRecorded: false,
    shelterRecommendations: [
      {
        shelterName: "North Community Hall",
        location: "North Ward",
        capacity: 500,
        currentOccupancy: 284,
        remainingCapacity: 216,
        recommendedEvacueeCount: 6,
        suitabilityReason: "Wheelchair ramp and operational hot meals",
        safetyAndAccessibilityNotes: "Ramp and clear exits",
      },
    ],
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(aiRecommendationService, "getMetrics").mockResolvedValue(mockMetrics);
    vi.spyOn(aiRecommendationService, "getRecommendations").mockResolvedValue(mockList);
    vi.spyOn(aiRecommendationService, "getRecommendationById").mockResolvedValue(mockDetail);
  });

  it("renders page header and metric counters correctly", async () => {
    render(
      <MemoryRouter>
        <AIRecommendationReview />
      </MemoryRouter>
    );

    expect(screen.getByText("HUMAN-IN-THE-LOOP CRISIS INTELLIGENCE")).toBeInTheDocument();
    expect(screen.getByText("AI recommendation review")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Total Cases")).toBeInTheDocument();
      expect(screen.getAllByText("Awaiting Review").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Approved").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Modified").length).toBeGreaterThan(0);
    });
  });

  it("renders recommendation case pills and loads active case details", async () => {
    render(
      <MemoryRouter>
        <AIRecommendationReview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText("AI-9041").length).toBeGreaterThan(0);
      expect(screen.getByText("AI-9038")).toBeInTheDocument();
    });

    // Verify operational context of selected case
    await waitFor(() => {
      expect(screen.getAllByText(/Riverside, North Ward/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Evacuation \+ accessible shelter/i)).toBeInTheDocument();
    });
  });

  it("switches to another recommendation when case pill is clicked", async () => {
    const detail9038: AiRecommendationDetail = {
      ...mockDetail,
      id: "AI-9038",
      requestId: "REQ-2839",
      category: "ResourceAllocation",
      title: "Medical Supplies Dispatch",
      recommendedPriority: "High",
      confidence: 91,
      recommendedAction: "Deliver 24 Trauma Kits",
    };

    const getDetailSpy = vi
      .spyOn(aiRecommendationService, "getRecommendationById")
      .mockImplementation(async (id: string) => {
        if (id === "AI-9038") return detail9038;
        return mockDetail;
      });

    render(
      <MemoryRouter>
        <AIRecommendationReview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("AI-9038")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("AI-9038"));

    await waitFor(() => {
      expect(getDetailSpy).toHaveBeenCalledWith("AI-9038");
      expect(screen.getByText("Deliver 24 Trauma Kits")).toBeInTheDocument();
    });
  });

  it("completes approval workflow when Approve decision is confirmed", async () => {
    const recordSpy = vi.spyOn(aiRecommendationService, "recordDecision").mockResolvedValue({
      ...mockDetail,
      reviewState: "Approved",
      reviewedBy: "Coordinator Reviewer",
      reviewedAt: new Date().toISOString(),
      decisionRationale: "Verified and approved.",
    });

    render(
      <MemoryRouter>
        <AIRecommendationReview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Approve decision")).toBeInTheDocument();
    });

    // Click Approve decision button to open confirmation modal
    fireEvent.click(screen.getByText("Approve decision"));

    await waitFor(() => {
      expect(screen.getByText("Confirm Triage Decision")).toBeInTheDocument();
    });

    // Confirm action
    const confirmButton = screen.getByRole("button", { name: /Confirm Decision/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(recordSpy).toHaveBeenCalledWith(
        "AI-9041",
        expect.objectContaining({
          priority: "Critical",
        })
      );
    });
  });

  it("completes rejection workflow with mandatory reason", async () => {
    const user = userEvent.setup();
    const rejectSpy = vi.spyOn(aiRecommendationService, "rejectRecommendation").mockResolvedValue({
      ...mockDetail,
      reviewState: "Rejected",
      reviewedBy: "Coordinator Reviewer",
      rejectionReason: "Duplicate request handled by partner NGO",
    });

    render(
      <MemoryRouter>
        <AIRecommendationReview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^Reject$/i })).toBeInTheDocument();
    });

    // Open reject modal
    fireEvent.click(screen.getByRole("button", { name: /^Reject$/i }));

    await waitFor(() => {
      expect(screen.getByText("Reject AI Recommendation")).toBeInTheDocument();
    });

    // Type mandatory reason
    const reasonInput = screen.getByPlaceholderText(/e\.g\. Field team already resolved the incident/i);
    await user.type(reasonInput, "Duplicate request handled by partner NGO");

    // Click confirm rejection
    const confirmRejectBtn = screen.getByRole("button", { name: /Confirm Rejection/i });
    fireEvent.click(confirmRejectBtn);

    await waitFor(() => {
      expect(rejectSpy).toHaveBeenCalledWith(
        "AI-9041",
        expect.objectContaining({
          rejectionReason: "Duplicate request handled by partner NGO",
        })
      );
    });
  });

  it("opens AI Generator modal and generates grounded Crisis Analysis", async () => {
    const generateSpy = vi.spyOn(aiRecommendationService, "generateCrisisAnalysis").mockResolvedValue({
      ...mockDetail,
      id: "AI-9055",
      category: "CrisisAnalysis",
      summary: "Newly generated situation assessment",
      isLiveAiGenerated: true,
    });

    render(
      <MemoryRouter>
        <AIRecommendationReview />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Generate AI Analysis/i })).toBeInTheDocument();
    });

    // Click Generate button to open modal
    fireEvent.click(screen.getByRole("button", { name: /Generate AI Analysis/i }));

    await waitFor(() => {
      expect(screen.getByText("Generate AI Crisis Recommendations")).toBeInTheDocument();
    });

    // Submit generation
    const executeBtn = screen.getByRole("button", { name: /Run AI Analysis/i });
    fireEvent.click(executeBtn);

    await waitFor(() => {
      expect(generateSpy).toHaveBeenCalledWith(
        "CR-2025-018",
        expect.anything()
      );
    });
  });
});
