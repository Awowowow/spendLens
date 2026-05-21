import { AUDIT_THRESHOLDS, TOOL_PRICING } from "./constants";

import type {
  AuditInput,
  AuditResult,
  Recommendation,
  ToolSpendInput,
  UseCase,
} from "./types";

const CODING_TOOL_IDS: ToolSpendInput["toolId"][] = [
  "cursor",
  "github_copilot",
  "windsurf",
];

const getPriorityFromSavings = (
  savings: number,
): Recommendation["priority"] => {
  if (savings >= 500) {
    return "high";
  }

  if (savings >= 100) {
    return "medium";
  }

  return "low";
};

const findPlan = (tool: ToolSpendInput) => {
  const pricing = TOOL_PRICING[tool.toolId];

  return pricing.plans.find((plan) => plan.id === tool.planId);
};

const getPublicBenchmarkMonthlyCost = (tool: ToolSpendInput): number | null => {
  const plan = findPlan(tool);

  if (!plan || plan.monthlyPrice === null) {
    return null;
  }

  return plan.monthlyPrice * Math.max(1, tool.seats);
};

const getBestRecommendation = (
  recommendations: Recommendation[],
): Recommendation | null => {
  if (recommendations.length === 0) {
    return null;
  }

  return [...recommendations].sort(
    (a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings,
  )[0];
};

const getBillingMismatchRecommendation = (
  tool: ToolSpendInput,
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
      "Entered spend is above the public plan benchmark. Check for extra seats, add-ons, taxes, old pricing, or billing setup differences.",
    estimatedMonthlySavings: possibleSavings,
    priority: getPriorityFromSavings(possibleSavings),
  };
};

const isApiSpendTool = (tool: ToolSpendInput): boolean => {
  if (tool.toolId === "anthropic_api" || tool.toolId === "openai_api") {
    return true;
  }

  if (tool.toolId !== "gemini") {
    return false;
  }

  const geminiApiModels = TOOL_PRICING.gemini.apiModels ?? [];

  return geminiApiModels.some((model) => model.id === tool.planId);
};

const getApiSpendRecommendation = (
  tool: ToolSpendInput,
): Recommendation | null => {
  if (
    !isApiSpendTool(tool) ||
    tool.monthlySpend < AUDIT_THRESHOLDS.apiSpendReviewMonthly
  ) {
    return null;
  }

  const estimatedSavings =
    tool.monthlySpend * AUDIT_THRESHOLDS.estimatedApiSavingsRate;

  const pricing = TOOL_PRICING[tool.toolId];

  return {
    toolId: tool.toolId,
    action: `Review ${pricing.name} usage`,
    reason:
      "Monthly API spend is high enough to review model mix, caching, batching, and routing before assuming the current setup is optimal.",
    estimatedMonthlySavings: estimatedSavings,
    priority: getPriorityFromSavings(estimatedSavings),
  };
};

const getIdleSeatRecommendation = (
  tool: ToolSpendInput,
  teamSize: number,
): Recommendation | null => {
  const plan = findPlan(tool);

  if (
    !plan ||
    plan.monthlyPrice === null ||
    tool.seats <= teamSize ||
    plan.category !== "team"
  ) {
    return null;
  }

  const unusedSeats = tool.seats - teamSize;
  const estimatedSavings = unusedSeats * plan.monthlyPrice;
  const pricing = TOOL_PRICING[tool.toolId];

  return {
    toolId: tool.toolId,
    action: `Reduce unused ${pricing.name} seats`,
    reason: `This audit lists ${tool.seats} paid seat(s) for a team of ${teamSize}. Reducing unused seats could lower the monthly bill.`,
    estimatedMonthlySavings: estimatedSavings,
    priority: getPriorityFromSavings(estimatedSavings),
  };
};

const getPlanDowngradeRecommendation = (
  tool: ToolSpendInput,
  teamSize: number,
): Recommendation | null => {
  const currentPlan = findPlan(tool);

  if (
    !currentPlan ||
    currentPlan.category !== "team" ||
    currentPlan.monthlyPrice === null
  ) {
    return null;
  }

  const currentMonthlyPrice = currentPlan.monthlyPrice;
  const pricing = TOOL_PRICING[tool.toolId];

  const cheaperIndividualPlan = pricing.plans
    .filter(
      (plan) =>
        plan.category === "individual" &&
        plan.monthlyPrice !== null &&
        plan.monthlyPrice > 0 &&
        plan.monthlyPrice < currentMonthlyPrice,
    )
    .sort((a, b) => (a.monthlyPrice ?? 0) - (b.monthlyPrice ?? 0))[0];

  if (!cheaperIndividualPlan || cheaperIndividualPlan.monthlyPrice === null) {
    return null;
  }

  const seatsToPrice = Math.max(1, Math.min(tool.seats, teamSize));
  const currentCost = currentMonthlyPrice * tool.seats;
  const cheaperCost = cheaperIndividualPlan.monthlyPrice * seatsToPrice;
  const estimatedSavings = Math.max(0, currentCost - cheaperCost);

  if (estimatedSavings === 0) {
    return null;
  }

  return {
    toolId: tool.toolId,
    action: `Consider ${cheaperIndividualPlan.label} instead of ${currentPlan.label}`,
    reason: `${currentPlan.label} may be more plan than this team needs. A lower same-vendor plan could cover the usage with less monthly spend.`,
    estimatedMonthlySavings: estimatedSavings,
    priority: getPriorityFromSavings(estimatedSavings),
  };
};

const getUseCaseAlternativeRecommendation = (
  tool: ToolSpendInput,
  useCase: UseCase,
  allTools: ToolSpendInput[],
): Recommendation | null => {
  const isCodingTool = CODING_TOOL_IDS.includes(tool.toolId);
  const isNonCodingUseCase = useCase === "writing" || useCase === "research";

  if (!isCodingTool || !isNonCodingUseCase || tool.monthlySpend <= 0) {
    return null;
  }

  const alreadyHasClaude = allTools.some(
    (existingTool) =>
      existingTool.toolId === "claude" && existingTool.monthlySpend > 0,
  );

  if (alreadyHasClaude) {
    return null;
  }

  const claudePro = TOOL_PRICING.claude.plans.find(
    (plan) => plan.id === "pro",
  );

  if (!claudePro || claudePro.monthlyPrice === null) {
    return null;
  }

  const replacementCost = claudePro.monthlyPrice * Math.max(1, tool.seats);
  const estimatedSavings = Math.max(0, tool.monthlySpend - replacementCost);

  if (estimatedSavings === 0) {
    return null;
  }

  return {
    toolId: tool.toolId,
    action: `Compare against ${TOOL_PRICING.claude.name} ${claudePro.label}`,
    reason:
      "The selected use case is writing or research, while this tool is strongest for coding. Claude Pro is a named alternative to compare before keeping the current spend.",
    estimatedMonthlySavings: estimatedSavings,
    priority: getPriorityFromSavings(estimatedSavings),
  };
};

const getDuplicateCodingToolRecommendation = (
  tools: ToolSpendInput[],
): Recommendation | null => {
  const paidCodingTools = tools.filter(
    (tool) => CODING_TOOL_IDS.includes(tool.toolId) && tool.monthlySpend > 0,
  );

  if (paidCodingTools.length < 2) {
    return null;
  }

  const cheapestTool = [...paidCodingTools].sort(
    (a, b) => a.monthlySpend - b.monthlySpend,
  )[0];

  const estimatedSavings = cheapestTool.monthlySpend;

  return {
    toolId: cheapestTool.toolId,
    action: "Review duplicate coding assistants",
    reason:
      "Multiple paid coding assistants were listed. Standardizing on one primary tool could reduce overlap without cutting the whole AI stack.",
    estimatedMonthlySavings: estimatedSavings,
    priority: getPriorityFromSavings(estimatedSavings),
  };
};

export const runAudit = (input: AuditInput): AuditResult => {
  const recommendations: Recommendation[] = [];

  for (const tool of input.tools) {
    const perToolCandidates = [
      getBillingMismatchRecommendation(tool),
      getApiSpendRecommendation(tool),
      getIdleSeatRecommendation(tool, input.teamSize),
      getPlanDowngradeRecommendation(tool, input.teamSize),
      getUseCaseAlternativeRecommendation(tool, input.useCase, input.tools),
    ].filter((recommendation): recommendation is Recommendation =>
      Boolean(recommendation),
    );

    const bestRecommendation = getBestRecommendation(perToolCandidates);

    if (bestRecommendation) {
      recommendations.push(bestRecommendation);
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