import { AUDIT_THRESHOLDS, TOOL_PRICING } from "./constants";

import type { AuditInput, Recommendation, ToolSpendInput, AuditResult } from "./types";

const findPlan = (tool: ToolSpendInput) => {
  const pricing = TOOL_PRICING[tool.toolId];

  return pricing.plans.find((plan) => plan.id === tool.planId);
};

const getPublicBenchmarkMonthlyCost = (tool: ToolSpendInput) => {
  const plan = findPlan(tool);

  if (!plan || plan.monthlyPrice === null) {
    return null;
  }

  return plan.category === "team"
    ? plan.monthlyPrice * tool.seats
    : plan.monthlyPrice;
};

const getBillingMismatchRecommendation = (
  tool: ToolSpendInput
): Recommendation | null => {
  const benchmarkCost = getPublicBenchmarkMonthlyCost(tool);

  if (benchmarkCost === null || tool.monthlySpend <= benchmarkCost) {
    return null;
  }

  const possibleSavings = tool.monthlySpend - benchmarkCost;

  const pricing = TOOL_PRICING[tool.toolId];

  return {
    toolId: tool.toolId,
    action: `Review ${pricing.name} billing`,
    reason:
      "You're paying more than the standard plan rate — worth checking for unused seats, add-ons, or old pricing you haven't been moved off.",
    estimatedMonthlySavings: possibleSavings,
    priority: possibleSavings >= 100 ? "medium" : "low",
  };
};

const getApiSpendRecommendation = (
  tool: ToolSpendInput
): Recommendation | null => {
  const isApiTool =
    tool.toolId === "anthropic_api" ||
    tool.toolId === "openai_api" ||
    tool.toolId === "gemini";

    if (!isApiTool || tool.monthlySpend < AUDIT_THRESHOLDS.apiSpendReviewMonthly){
        return null;
    }

    const estimatedSavings = tool.monthlySpend * AUDIT_THRESHOLDS.estimatedApiSavingsRate

    const pricing = TOOL_PRICING[tool.toolId]

    return {
        toolId: tool.toolId,
        action: `Review ${pricing.name} usage`,
        reason:
          "Monthly API spend is high enough to review model mix, caching, batching, and routing before assuming the current setup is optimal.",
        estimatedMonthlySavings: estimatedSavings,
        priority: estimatedSavings >= 100 ? "high" : "medium",
    }
};

const getDuplicateCodingToolRecommendation = (
    tools: ToolSpendInput[],
): Recommendation | null =>{
    const cursor = tools.find(
        (tool) => tool.toolId === "cursor" && tool.monthlySpend > 0
    );

    const copilot = tools.find(
        (tool) => tool.toolId === "github_copilot" && tool.monthlySpend > 0
    );

    if(!cursor || !copilot){
        return null;
    }

    const lowerSpend = Math.min(cursor.monthlySpend, copilot.monthlySpend);

    return {
        toolId: "github_copilot",
        action: "Review duplicate coding assistants",
        reason:
        "Cursor and GitHub Copilot overlap for coding work, so a small team may be able to standardize on one primary assistant.",
        estimatedMonthlySavings: lowerSpend,
        priority: lowerSpend >= 100 ? "high" : "medium",
    }
}

export const runAudit = (input: AuditInput): AuditResult => {
    const recommendations: Recommendation[] = [];
  
    for (const tool of input.tools) {
      const billingMismatch = getBillingMismatchRecommendation(tool);
      const apiSpend = getApiSpendRecommendation(tool);
  
      if (billingMismatch) {
        recommendations.push(billingMismatch);
      }
  
      if (apiSpend) {
        recommendations.push(apiSpend);
      }
    }
  
    const duplicateCodingTools = getDuplicateCodingToolRecommendation(input.tools);
  
    if (duplicateCodingTools) {
      recommendations.push(duplicateCodingTools);
    }
  
    const totalMonthlySavings = recommendations.reduce(
      (sum, recommendation) => sum + recommendation.estimatedMonthlySavings,
      0,
    );
  
    return {
      totalMonthlySavings,
      totalAnnualSavings: totalMonthlySavings * 12,
      recommendations,
      isLowSavings: totalMonthlySavings < AUDIT_THRESHOLDS.lowSavingsMonthly,
      shouldShowCredexCta:
        totalMonthlySavings > AUDIT_THRESHOLDS.credexCtaMonthly,
    };
  };
