import type { AuditInput, AuditResult } from "../audit/types";

export const createFallbackSummary = (
  input: AuditInput,
  result: AuditResult,
) => {
  if (result.isLowSavings) {
    return `This ${input.teamSize}-person team is already keeping AI spend fairly lean. SpendLens did not find a major obvious cut, so the best next step is to re-check the stack when team usage or vendor pricing changes.`;
  }

  if (result.shouldShowCredexCta) {
    return `This ${input.teamSize}-person team has a larger AI spend optimization opportunity. The biggest next step is to review the listed recommendations and verify whether discounted AI credits can reduce the monthly bill.`;
  }

  return `This ${input.teamSize}-person team has a few practical AI spend optimizations to review. The recommendations focus on plan fit, overlapping tools, and public pricing benchmarks rather than assuming every line item should be cut.`;
};
