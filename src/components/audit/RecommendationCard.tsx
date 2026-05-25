import { TOOL_PRICING } from "../../lib/audit/constants";
import type { Recommendation } from "../../lib/audit/types";
import { formatCurrency } from "../../lib/utils";

interface RecommendationCardProps {
  currentMonthlySpend?: number;
  recommendation: Recommendation;
}

const priorityLabels: Record<Recommendation["priority"], string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const priorityDotStyles: Record<Recommendation["priority"], string> = {
  high: "bg-[var(--audit-danger)]",
  medium: "bg-[var(--audit-partner)]",
  low: "bg-[var(--audit-text-muted)]",
};

const getToolInitials = (toolName: string) => {
  return toolName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export const RecommendationCard = ({
  currentMonthlySpend,
  recommendation,
}: RecommendationCardProps) => {
  const toolName = TOOL_PRICING[recommendation.toolId].name;
  const toolInitials = getToolInitials(toolName);

  return (
    <article className="border-b border-[var(--audit-border)] py-4 last:border-b-0">
      <div className="grid gap-4 md:grid-cols-[220px_1fr_160px] md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border border-[var(--audit-border)] bg-[var(--audit-surface-soft)] font-mono text-xs font-semibold text-[var(--audit-text-primary)]">
            {toolInitials}
          </div>

          <div>
            <p className="text-sm font-semibold tracking-tight text-[var(--audit-text-primary)]">
              {toolName}
            </p>
            {currentMonthlySpend !== undefined ? (
              <p className="mt-1 font-mono text-xs text-[var(--audit-text-muted)]">
                Current {formatCurrency(currentMonthlySpend)}/mo
              </p>
            ) : null}
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  priorityDotStyles[recommendation.priority]
                }`}
              />
              <span className="text-xs text-[var(--audit-text-secondary)]">
                {priorityLabels[recommendation.priority]} priority
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold tracking-tight text-[var(--audit-text-primary)]">
            {recommendation.action}
          </h4>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--audit-text-secondary)]">
            {recommendation.reason}
          </p>
        </div>

        <div className="font-mono md:text-right">
          <p className="text-xl font-semibold tracking-normal text-[var(--audit-success)]">
            {formatCurrency(recommendation.estimatedMonthlySavings)}
          </p>
          <p className="text-xs text-[var(--audit-text-muted)]">/ month</p>
        </div>
      </div>
    </article>
  );
};
