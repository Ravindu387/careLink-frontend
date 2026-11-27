import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import HomePage from "../HomePage";
import { AuthProvider } from "../../../context/AuthContext";

describe("Redesigned CareLink HomePage", () => {
  const renderHomePage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it("renders the CareLink branding with official logo and tagline", () => {
    renderHomePage();
    const brandTitles = screen.getAllByText("CareLink");
    expect(brandTitles.length).toBeGreaterThanOrEqual(1);

    const taglines = screen.getAllByText(/Connecting Help\. Saving Lives\./i);
    expect(taglines.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the primary navigation links", () => {
    renderHomePage();
    expect(screen.getByRole("button", { name: "Home" })).toBeDefined();
    expect(screen.getByRole("button", { name: "About" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Our Services" })).toBeDefined();
    expect(screen.getByRole("button", { name: "How It Works" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Emergency Response" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Contact" })).toBeDefined();
  });

  it("renders emergency action highlight cards", () => {
    renderHomePage();
    expect(screen.getAllByText("Request Assistance").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Find Shelter Support")).toBeDefined();
    expect(screen.getAllByText("Join as a Volunteer").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Partner Organisation")).toBeDefined();
  });

  it("renders platform impact statistics with demonstration benchmark disclaimer", () => {
    renderHomePage();
    expect(screen.getByText(/Demonstration Benchmark Overview/i)).toBeDefined();
    expect(screen.getByText("3 Active Responses")).toBeDefined();
    expect(screen.getByText("5,979+ Citizens")).toBeDefined();
  });

  it("renders the 6 modular humanitarian services", () => {
    renderHomePage();
    expect(screen.getByText("Emergency Incident Management")).toBeDefined();
    expect(screen.getByText("AI-Assisted Decision Support")).toBeDefined();
    expect(screen.getByText("Resource & Logistics Coordination")).toBeDefined();
    expect(screen.getByText("Shelter Management")).toBeDefined();
    expect(screen.getByText("Volunteer Coordination")).toBeDefined();
    expect(screen.getByText("Donations & Aid Tracking")).toBeDefined();
  });

  it("renders the 4-step crisis response workflow", () => {
    renderHomePage();
    expect(screen.getByText("How CareLink Coordinates a Response")).toBeDefined();
    expect(screen.getByText("Identify the Need")).toBeDefined();
    expect(screen.getByText("Verify & Assess")).toBeDefined();
    expect(screen.getByText("Coordinate Support")).toBeDefined();
    expect(screen.getByText("Monitor the Response")).toBeDefined();
  });

  it("renders the multi-agency partner collaboration framework", () => {
    renderHomePage();
    expect(screen.getByText("Working Together for Humanitarian Support")).toBeDefined();
    expect(screen.getByText("National Disaster Management Centre")).toBeDefined();
  });

  it("renders the footer with official national hotlines (117, 1990, 119)", () => {
    renderHomePage();
    expect(screen.getByText("117")).toBeDefined();
    expect(screen.getByText("1990")).toBeDefined();
    expect(screen.getByText("119")).toBeDefined();
    expect(screen.getByText("support@carelink.org")).toBeDefined();
  });

  it("renders hero carousel navigation controls and slide indicators cleanly", () => {
    renderHomePage();
    expect(screen.getByRole("button", { name: "Previous Slide" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Next Slide" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Go to slide 1" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Go to slide 2" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Go to slide 3" })).toBeDefined();
  });
});
