import { TOOL_PRICING } from "./constants";

import type { AuditInput, ToolId, ToolSpendInput, UseCase } from "./types";

const USE_CASES: UseCase[] = [
  "coding",
  "writing",
  "data",
  "research",
  "mixed",
];

const isToolId = (value: unknown): value is ToolId => {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(TOOL_PRICING, value)
  );
};

const isUseCase = (value: unknown): value is UseCase => {
  return USE_CASES.includes(value as UseCase);
};

const isToolSpendInput = (value: unknown): value is ToolSpendInput => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const tool = value as Partial<ToolSpendInput>;

  if (
    !isToolId(tool.toolId) ||
    typeof tool.planId !== "string" ||
    typeof tool.monthlySpend !== "number" ||
    !Number.isFinite(tool.monthlySpend) ||
    tool.monthlySpend < 0 ||
    typeof tool.seats !== "number" ||
    !Number.isInteger(tool.seats) ||
    tool.seats < 1
  ) {
    return false;
  }

  const pricing = TOOL_PRICING[tool.toolId];
  const knownPlanIds = [
    ...pricing.plans.map((plan) => plan.id),
    ...(pricing.apiModels ?? []).map((model) => model.id),
  ];

  return knownPlanIds.includes(tool.planId);
};

export const isAuditInput = (value: unknown): value is AuditInput => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const input = value as Partial<AuditInput>;

  return (
    typeof input.teamSize === "number" &&
    Number.isInteger(input.teamSize) &&
    input.teamSize >= 1 &&
    isUseCase(input.useCase) &&
    Array.isArray(input.tools) &&
    input.tools.length > 0 &&
    input.tools.every(isToolSpendInput)
  );
};
