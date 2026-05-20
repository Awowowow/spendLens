export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type UseCase = "coding" | "writing" | "research" | "api" | "mixed";

export interface ToolSpendInput {
  toolId: ToolId;
  planId: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  teamSize: number;
  useCase: UseCase;
  tools: ToolSpendInput[];
}

export interface Recommendation {
    toolId: ToolId;
    action: string;
    reason: string;
    estimatedMonthlySavings: number;
    priority: "low" | "medium" | "high";
}

export interface AuditResult {
    totalMonthlySavings: number;
    totalAnnualSavings: number;
    recommendations: Recommendation[];
    isLowSavings: boolean;
    shouldShowCredexCta: boolean;
  }