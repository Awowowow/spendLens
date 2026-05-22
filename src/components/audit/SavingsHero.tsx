import type { AuditResult } from "../../lib/audit/types";
import { formatCurrency } from "../../lib/utils";

interface SavingsHeroProps {
  result: AuditResult;
  totalCurrentSpend: number;
  toolsReviewed: number;
  opportunityCount: number;
}

export const SavingsHero = ({
  result,
  totalCurrentSpend,
  toolsReviewed,
  opportunityCount,
}: SavingsHeroProps) => {
  const savingsRate =
    totalCurrentSpend > 0
      ? Math.round((result.totalMonthlySavings / totalCurrentSpend) * 100)
      : 0;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="rounded-2xl border border-[var(--audit-border)] bg-[var(--audit-surface-soft)] p-6">
        <p className="text-sm font-medium text-[var(--audit-text-secondary)]">
          Potential monthly savings
        </p>

        <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
          <p className="font-mono text-5xl font-semibold tracking-normal text-[var(--audit-success)] sm:text-6xl">
            {formatCurrency(result.totalMonthlySavings)}
          </p>
          <p className="pb-2 text-lg font-medium text-[var(--audit-text-secondary)]">
            / month
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--audit-success-bg)] px-3 py-1 text-xs font-semibold text-[var(--audit-success)]">
            {savingsRate}% optimizable
          </span>
          <span className="rounded-full border border-[var(--audit-border)] px-3 py-1 text-xs font-medium text-[var(--audit-text-secondary)]">
            {toolsReviewed} tools reviewed
          </span>
          <span className="rounded-full border border-[var(--audit-border)] px-3 py-1 text-xs font-medium text-[var(--audit-text-secondary)]">
            {opportunityCount} opportunities
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-2xl border border-[var(--audit-border)] bg-[var(--audit-surface-soft)] p-5">
          <p className="text-sm font-medium text-[var(--audit-text-secondary)]">
            Current spend
          </p>
          <p className="mt-3 font-mono text-2xl font-semibold tracking-normal text-[var(--audit-text-primary)]">
            {formatCurrency(totalCurrentSpend)}
          </p>
          <p className="mt-1 text-xs text-[var(--audit-text-muted)]">
            per month
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--audit-border)] bg-[var(--audit-surface-soft)] p-5">
          <p className="text-sm font-medium text-[var(--audit-text-secondary)]">
            Annualized savings
          </p>
          <p className="mt-3 font-mono text-2xl font-semibold tracking-normal text-[var(--audit-success)]">
            {formatCurrency(result.totalAnnualSavings)}
          </p>
          <p className="mt-1 text-xs text-[var(--audit-text-muted)]">
            12 month estimate
          </p>
        </div>
      </div>
    </section>
  );
};