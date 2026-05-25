import type { AuditInput, AuditResult } from "../audit/types";

export const createFallbackSummary = (
  input: AuditInput,
  result: AuditResult,
) => {
  if (result.isLowSavings) {
    return `This ${input.teamSize}-person team is already keeping AI spend fairly lean based on the public plan benchmarks checked by SpendLens. The audit did not find a major obvious cut, which is a useful result rather than a reason to force a recommendation. Keep this report and re-check the stack if seat counts, API usage, or vendor pricing change. You can also request updates when a new optimization becomes relevant to the tools you use.`;
  }

  if (result.shouldShowCredexCta) {
    return `This ${input.teamSize}-person team has a larger AI spend optimization opportunity based on the entered tools and public pricing benchmarks. Review the listed recommendations first, especially any recurring API or credit usage, without assuming that productive usage should simply be cut. Because the estimated opportunity is significant, the next practical step is a Credex credit review to check whether the same AI usage can be purchased more efficiently while preserving the team's workflow.`;
  }

  return `This ${input.teamSize}-person team has practical AI spend optimizations worth reviewing. SpendLens compared the entered stack against public pricing benchmarks and focused on plan fit, overlapping tools, and usage patterns rather than assuming every paid tool should be removed. Review the recommendations with whoever owns the budget, then use the shared report to decide whether the estimated monthly saving is large enough to act on without disrupting the team's existing workflow.`;
};
