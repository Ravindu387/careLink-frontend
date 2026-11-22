import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { aiRecommendationService } from "../aiRecommendationService";
import * as apiModule from "../api";
import type {
  AiRecommendationDetail,
  AiRecommendationMetrics,
  AiRecommendationSummary,
} from "../../types/aiRecommendation";

describe("aiRecommendationService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getRecommendations", () => {
    it("fetches recommendations with query parameters", async () => {
      const mockSummaries: AiRecommendationSummary[] = [
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
          explanation: "Flood rising quickly",
          alternative: "High School shelter",
          location: "Riverside, North Ward",
        },
      ];

      const requestSpy = vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: mockSummaries,
        message: "Success",
        errors: [],
      });

      const result = await aiRecommendationService.getRecommendations({
        status: "Awaiting Review",
        priority: "Critical",
        category: "ShelterIntake",
        crisisId: "CR-2025-018",
        search: "Riverside",
      });

      expect(requestSpy).toHaveBeenCalledWith(
        expect.stringContaining("/ai-recommendations?status=Awaiting+Review&priority=Critical&category=ShelterIntake&crisisId=CR-2025-018&search=Riverside"),
        { method: "GET" }
      );
      expect(result).toEqual(mockSummaries);
    });

    it("omits 'All' query filter parameters", async () => {
      const requestSpy = vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: [],
        message: "Success",
        errors: [],
      });

      await aiRecommendationService.getRecommendations({
        status: "All",
        priority: "All",
        category: "All",
        crisisId: "All",
      });

      expect(requestSpy).toHaveBeenCalledWith("/ai-recommendations", {
        method: "GET",
      });
    });
  });

  describe("getMetrics", () => {
    it("fetches dashboard aggregate metrics", async () => {
      const mockMetrics: AiRecommendationMetrics = {
        totalRecommendations: 8,
        totalCases: 8,
        awaitingReviewCount: 5,
        approvedCount: 2,
        modifiedCount: 0,
        deferredCount: 1,
        rejectedCount: 0,
        averageConfidence: 92,
      };

      vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: mockMetrics,
        message: "Success",
        errors: [],
      });

      const result = await aiRecommendationService.getMetrics();
      expect(result).toEqual(mockMetrics);
    });
  });

  describe("getRecommendationById and byRequestId", () => {
    it("retrieves recommendation detail by ID", async () => {
      const mockDetail: Partial<AiRecommendationDetail> = {
        id: "AI-9041",
        crisisId: "CR-2025-018",
        category: "ShelterIntake",
        recommendedPriority: "Critical",
        confidence: 94,
        reviewState: "Awaiting Review",
      };

      const requestSpy = vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: mockDetail as AiRecommendationDetail,
        message: "Success",
        errors: [],
      });

      const result = await aiRecommendationService.getRecommendationById("AI-9041");
      expect(requestSpy).toHaveBeenCalledWith("/ai-recommendations/AI-9041", {
        method: "GET",
      });
      expect(result.id).toBe("AI-9041");
    });

    it("retrieves recommendation detail by Request ID", async () => {
      const mockDetail: Partial<AiRecommendationDetail> = {
        id: "AI-9041",
        requestId: "REQ-2841",
      };

      const requestSpy = vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: mockDetail as AiRecommendationDetail,
        message: "Success",
        errors: [],
      });

      const result = await aiRecommendationService.getRecommendationByRequestId("REQ-2841");
      expect(requestSpy).toHaveBeenCalledWith("/ai-recommendations/by-request/REQ-2841", {
        method: "GET",
      });
      expect(result.requestId).toBe("REQ-2841");
    });
  });

  describe("AI Generation Workflows (Gemini grounded)", () => {
    it("Test 1: triggers Crisis Analysis generation", async () => {
      const mockDetail: Partial<AiRecommendationDetail> = {
        id: "AI-9050",
        crisisId: "CR-2025-018",
        category: "CrisisAnalysis",
        recommendedPriority: "Critical",
        summary: "Flooding impacting 1,284 individuals across 4 sectors",
        isLiveAiGenerated: true,
      };

      const requestSpy = vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: mockDetail as AiRecommendationDetail,
        message: "Success",
        errors: [],
      });

      const result = await aiRecommendationService.generateCrisisAnalysis("CR-2025-018", {
        focusArea: "Sector 4",
        additionalContext: "Inundation of low-lying roadways",
      });

      expect(requestSpy).toHaveBeenCalledWith(
        "/ai/crises/CR-2025-018/analysis",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            focusArea: "Sector 4",
            additionalContext: "Inundation of low-lying roadways",
          }),
        })
      );
      expect(result.category).toBe("CrisisAnalysis");
      expect(result.isLiveAiGenerated).toBe(true);
    });

    it("Test 2: triggers Resource Recommendations with inventory verification", async () => {
      const mockDetail: Partial<AiRecommendationDetail> = {
        id: "AI-9051",
        crisisId: "CR-2025-018",
        category: "ResourceAllocation",
        resourceRecommendations: [
          {
            resourceName: "Water - 10L",
            category: "Water Supplies",
            recommendedQuantity: 2500,
            availableQuantity: 8420,
            isShortage: false,
            shortageQuantity: 0,
            targetCrisisLocation: "Central Logistics Hub",
            priority: "Critical",
            rationale: "Immediate hydration for flood displaced families",
            alternativeResource: "Bottled water packs",
          },
        ],
      };

      const requestSpy = vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: mockDetail as AiRecommendationDetail,
        message: "Success",
        errors: [],
      });

      const result = await aiRecommendationService.generateResourceRecommendations("CR-2025-018", {
        urgency: "High",
      });

      expect(requestSpy).toHaveBeenCalledWith(
        "/ai/crises/CR-2025-018/resources",
        expect.objectContaining({ method: "POST" })
      );
      expect(result.resourceRecommendations?.[0].resourceName).toBe("Water - 10L");
      expect(result.resourceRecommendations?.[0].isShortage).toBe(false);
    });

    it("Test 3: triggers Shelter Recommendations with capacity validation", async () => {
      const mockDetail: Partial<AiRecommendationDetail> = {
        id: "AI-9052",
        crisisId: "CR-2025-018",
        category: "ShelterIntake",
        shelterRecommendations: [
          {
            shelterName: "North Community Hall",
            location: "North Ward",
            capacity: 500,
            currentOccupancy: 284,
            remainingCapacity: 216,
            recommendedEvacueeCount: 15,
            suitabilityReason: "Accessible entrance and emergency kitchen",
            safetyAndAccessibilityNotes: "Ramp access verified",
          },
        ],
      };

      const requestSpy = vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: mockDetail as AiRecommendationDetail,
        message: "Success",
        errors: [],
      });

      const result = await aiRecommendationService.generateShelterRecommendations("CR-2025-018", {
        needsAccessible: true,
      });

      expect(requestSpy).toHaveBeenCalledWith(
        "/ai/crises/CR-2025-018/shelters",
        expect.objectContaining({ method: "POST" })
      );
      const shelter = result.shelterRecommendations?.[0];
      expect(shelter?.remainingCapacity).toBe(216);
      expect(shelter?.capacity! - shelter?.currentOccupancy!).toBe(shelter?.remainingCapacity);
    });

    it("Test 4: triggers Volunteer Recommendations with skill cohort matching", async () => {
      const mockDetail: Partial<AiRecommendationDetail> = {
        id: "AI-9053",
        crisisId: "CR-2025-018",
        category: "VolunteerDeployment",
        volunteerRecommendations: [
          {
            skillGroup: "Search & Rescue",
            recommendedCount: 4,
            suggestedTask: "Boat navigation and resident extraction",
            priority: "Critical",
            rationale: "Rapid evacuation of isolated households",
          },
        ],
      };

      const requestSpy = vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: mockDetail as AiRecommendationDetail,
        message: "Success",
        errors: [],
      });

      const result = await aiRecommendationService.generateVolunteerRecommendations("CR-2025-018", {
        skillFilter: "Search & Rescue",
      });

      expect(requestSpy).toHaveBeenCalledWith(
        "/ai/crises/CR-2025-018/volunteers",
        expect.objectContaining({ method: "POST" })
      );
      expect(result.volunteerRecommendations?.[0].skillGroup).toBe("Search & Rescue");
    });
  });

  describe("Test 5: Human Decision Review Workflows (Approve / Reject / Defer / Reset)", () => {
    it("approves recommendation with reviewer notes", async () => {
      const mockApproved: Partial<AiRecommendationDetail> = {
        id: "AI-9041",
        reviewState: "Approved",
        reviewedBy: "Coordinator Admin",
        decisionRationale: "Approved based on flood line verification",
      };

      const requestSpy = vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: mockApproved as AiRecommendationDetail,
        message: "Success",
        errors: [],
      });

      const result = await aiRecommendationService.approveRecommendation("AI-9041", {
        notes: "Approved based on flood line verification",
      });

      expect(requestSpy).toHaveBeenCalledWith(
        "/ai-recommendations/AI-9041/approve",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ notes: "Approved based on flood line verification" }),
        })
      );
      expect(result.reviewState).toBe("Approved");
    });

    it("rejects recommendation with mandatory rationale", async () => {
      const mockRejected: Partial<AiRecommendationDetail> = {
        id: "AI-9038",
        reviewState: "Rejected",
        rejectionReason: "Supplies already dispatched by Red Cross",
      };

      const requestSpy = vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: mockRejected as AiRecommendationDetail,
        message: "Success",
        errors: [],
      });

      const result = await aiRecommendationService.rejectRecommendation("AI-9038", {
        rejectionReason: "Supplies already dispatched by Red Cross",
        notes: "Verified by phone at 13:00",
      });

      expect(requestSpy).toHaveBeenCalledWith(
        "/ai-recommendations/AI-9038/reject",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            rejectionReason: "Supplies already dispatched by Red Cross",
            notes: "Verified by phone at 13:00",
          }),
        })
      );
      expect(result.reviewState).toBe("Rejected");
    });

    it("defers recommendation for later review", async () => {
      const mockDeferred: Partial<AiRecommendationDetail> = {
        id: "AI-9032",
        reviewState: "Deferred",
      };

      const requestSpy = vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: mockDeferred as AiRecommendationDetail,
        message: "Success",
        errors: [],
      });

      const result = await aiRecommendationService.deferRecommendation("AI-9032", {
        reason: "Waiting for water level report",
      });

      expect(requestSpy).toHaveBeenCalledWith(
        "/ai-recommendations/AI-9032/defer",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ reason: "Waiting for water level report" }),
        })
      );
      expect(result.reviewState).toBe("Deferred");
    });

    it("resets recommendation back to Awaiting Review", async () => {
      const mockReset: Partial<AiRecommendationDetail> = {
        id: "AI-9041",
        reviewState: "Awaiting Review",
      };

      const requestSpy = vi.spyOn(apiModule, "request").mockResolvedValue({
        success: true,
        data: mockReset as AiRecommendationDetail,
        message: "Success",
        errors: [],
      });

      const result = await aiRecommendationService.resetRecommendation("AI-9041");
      expect(requestSpy).toHaveBeenCalledWith("/ai-recommendations/AI-9041/reset", {
        method: "POST",
      });
      expect(result.reviewState).toBe("Awaiting Review");
    });
  });
});
