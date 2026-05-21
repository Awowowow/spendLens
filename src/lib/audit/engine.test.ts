import { describe, expect, it } from "vitest";

import { runAudit } from "./engine";

describe("runAudit", () => {
  it("calculates annual savings as monthly savings times 12", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "coding",
      tools: [
        {
          toolId: "cursor",
          planId: "pro",
          monthlySpend: 50,
          seats: 1,
        },
      ],
    });

    expect(result.totalMonthlySavings).toBe(30);
    expect(result.totalAnnualSavings).toBe(360);
  });

  it("marks the audit as low savings when the stack is already lean", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "coding",
      tools: [
        {
          toolId: "cursor",
          planId: "pro",
          monthlySpend: 20,
          seats: 1,
        },
      ],
    });

    expect(result.totalMonthlySavings).toBe(0);
    expect(result.recommendations).toHaveLength(0);
    expect(result.isLowSavings).toBe(true);
    expect(result.shouldShowCredexCta).toBe(false);
  });

  it("shows the Credex CTA when estimated savings are above 500 dollars", () => {
    const result = runAudit({
      teamSize: 8,
      useCase: "data",
      tools: [
        {
          toolId: "openai_api",
          planId: "gpt_5_4",
          monthlySpend: 3000,
          seats: 1,
        },
      ],
    });

    expect(result.totalMonthlySavings).toBe(600);
    expect(result.shouldShowCredexCta).toBe(true);
    expect(result.isLowSavings).toBe(false);
  });

  it("recommends reviewing duplicate coding assistants generically", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "coding",
      tools: [
        {
          toolId: "cursor",
          planId: "pro",
          monthlySpend: 20,
          seats: 1,
        },
        {
          toolId: "windsurf",
          planId: "pro",
          monthlySpend: 20,
          seats: 1,
        },
      ],
    });

    expect(result.recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "Review duplicate coding assistants",
          estimatedMonthlySavings: 20,
        }),
      ]),
    );
  });

  it("does not create negative savings when entered spend is below benchmark", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "coding",
      tools: [
        {
          toolId: "cursor",
          planId: "pro",
          monthlySpend: 10,
          seats: 1,
        },
      ],
    });

    expect(result.totalMonthlySavings).toBe(0);
    expect(result.recommendations).toHaveLength(0);
    expect(result.isLowSavings).toBe(true);
  });

  it("recommends a cheaper same-vendor plan for a team plan", () => {
    const result = runAudit({
      teamSize: 2,
      useCase: "coding",
      tools: [
        {
          toolId: "github_copilot",
          planId: "business",
          monthlySpend: 38,
          seats: 2,
        },
      ],
    });

    expect(result.totalMonthlySavings).toBe(18);
    expect(result.recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          toolId: "github_copilot",
          estimatedMonthlySavings: 18,
          priority: "low",
        }),
      ]),
    );
  });

  it("uses only the best per-tool recommendation to avoid double-counting savings", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "coding",
      tools: [
        {
          toolId: "github_copilot",
          planId: "business",
          monthlySpend: 40,
          seats: 1,
        },
      ],
    });

    expect(result.recommendations).toHaveLength(1);
    expect(result.totalMonthlySavings).toBe(21);
  });

  it("does not treat Gemini app subscriptions as API spend", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "research",
      tools: [
        {
          toolId: "gemini",
          planId: "google_ai_pro",
          monthlySpend: 19.99,
          seats: 1,
        },
      ],
    });

    expect(result.recommendations).toHaveLength(0);
    expect(result.totalMonthlySavings).toBe(0);
  });

  it("treats Gemini API model spend as API spend", () => {
    const result = runAudit({
      teamSize: 4,
      useCase: "data",
      tools: [
        {
          toolId: "gemini",
          planId: "gemini_2_5_flash",
          monthlySpend: 1000,
          seats: 1,
        },
      ],
    });

    expect(result.totalMonthlySavings).toBe(200);
    expect(result.recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "Review Gemini usage",
          estimatedMonthlySavings: 200,
        }),
      ]),
    );
  });

  it("suggests Claude Pro as an alternative for non-coding use cases using coding tools", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "writing",
      tools: [
        {
          toolId: "windsurf",
          planId: "max",
          monthlySpend: 200,
          seats: 1,
        },
      ],
    });

    expect(result.recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "Compare against Claude Pro",
          estimatedMonthlySavings: 180,
        }),
      ]),
    );
  });

  it("does not recommend Claude Pro when Claude is already in the stack", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "writing",
      tools: [
        {
          toolId: "windsurf",
          planId: "max",
          monthlySpend: 200,
          seats: 1,
        },
        {
          toolId: "claude",
          planId: "pro",
          monthlySpend: 20,
          seats: 1,
        },
      ],
    });

    expect(result.recommendations).toHaveLength(0);
    expect(result.totalMonthlySavings).toBe(0);
  });
});