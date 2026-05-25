"use client";

import { useState } from "react";

import type { AuditResult, ToolSpendInput } from "../../lib/audit/types";
import { RecommendationCard } from "./RecommendationCard";
import { SavingsHero } from "./SavingsHero";

interface AuditResultsProps {
  isLoadingSummary?: boolean;
  result: AuditResult;
  summary?: string | null;
  totalCurrentSpend: number;
  tools: ToolSpendInput[];
}

export const AuditResults = ({
  isLoadingSummary = false,
  result,
  summary,
  totalCurrentSpend,
  tools,
}: AuditResultsProps) => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const opportunityCount = result.recommendations.length;

  return (
    <section
      className="rounded-3xl border border-[var(--audit-border)] bg-[var(--audit-bg)] p-5 shadow-2xl shadow-black/25 sm:p-6"
      data-audit-theme={theme}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--audit-success)]">
            Audit complete
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--audit-text-primary)]">
            Savings snapshot
          </h2>
        </div>

        <button
          className="rounded-full border border-[var(--audit-border)] bg-[var(--audit-surface)] px-4 py-2 text-xs font-medium text-[var(--audit-text-secondary)] transition hover:text-[var(--audit-text-primary)]"
          onClick={() =>
            setTheme((currentTheme) =>
              currentTheme === "dark" ? "light" : "dark",
            )
          }
          type="button"
        >
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>

      <SavingsHero
        opportunityCount={opportunityCount}
        result={result}
        toolsReviewed={tools.length}
        totalCurrentSpend={totalCurrentSpend}
      />

      {isLoadingSummary || summary ? (
        <div className="mt-5 rounded-2xl border border-[var(--audit-border)] bg-[var(--audit-surface-soft)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--audit-text-muted)]">
            AI summary
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--audit-text-secondary)]">
            {isLoadingSummary
              ? "Writing a short summary for this audit..."
              : summary}
          </p>
        </div>
      ) : null}

      {result.shouldShowCredexCta ? (
        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[var(--audit-border)] bg-[var(--audit-partner-bg)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--audit-partner)]">
              Credex partner feature
            </p>
            <h3 className="mt-2 text-base font-semibold text-[var(--audit-text-primary)]">
              This stack qualifies for a deeper credit review.
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--audit-text-secondary)]">
              SpendLens found more than $500/month in possible savings. The
              next step is verifying whether discounted AI credits apply after
              the billing details are checked.
            </p>
          </div>

          <a
            className="shrink-0 rounded-xl bg-[var(--audit-partner)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            href="#credit-review"
          >
            Request credit review
          </a>
        </div>
      ) : null}

      {result.isLowSavings ? (
        <div className="mt-5 rounded-2xl border border-[var(--audit-border)] bg-[var(--audit-success-bg)] p-4">
          <p className="text-sm font-semibold text-[var(--audit-success)]">
            You&apos;re spending well.
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--audit-text-secondary)]">
            Based on public pricing benchmarks, there may not be much obvious
            spend to cut right now.
          </p>
        </div>
      ) : null}

      <div className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--audit-border)] pb-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--audit-text-primary)]">
              Recommendations
            </h3>
            <p className="mt-1 text-sm text-[var(--audit-text-secondary)]">
              Public pricing is used as a benchmark, not a final billing
              statement.
            </p>
          </div>
        </div>

        {result.recommendations.length > 0 ? (
          <div>
            {result.recommendations.map((recommendation) => (
              <RecommendationCard
                currentMonthlySpend={
                  tools.find((tool) => tool.toolId === recommendation.toolId)
                    ?.monthlySpend
                }
                key={`${recommendation.toolId}-${recommendation.action}`}
                recommendation={recommendation}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-[var(--audit-border)] bg-[var(--audit-surface-soft)] p-4 text-sm leading-6 text-[var(--audit-text-secondary)]">
            No obvious savings were found from the current benchmark rules.
            Keep the report and re-check when pricing or team usage changes.
          </div>
        )}
      </div>
    </section>
  );
};
