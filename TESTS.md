# Tests

## How To Run

```bash
npm run lint
npm run test
npm run build
```

GitHub Actions runs these three checks on every push to `main`.

## Automated Audit Engine Tests

**File:** `src/lib/audit/engine.test.ts`
**Runner:** Vitest
**Command:** `npm run test`

| Test | What It Covers |
| --- | --- |
| `calculates annual savings as monthly savings times 12` | Monthly opportunity totals are converted into annual totals correctly. |
| `marks the audit as low savings when the stack is already lean` | A plan at its public benchmark produces no manufactured saving and shows the honest low-savings state. |
| `shows the Credex CTA when estimated savings are above 500 dollars` | Large API optimization opportunities cross the `$500/month` Credex threshold. |
| `recommends reviewing duplicate coding assistants generically` | Paid Cursor/Windsurf overlap is surfaced as a review, rather than an unsupported forced cancellation. |
| `does not create negative savings when entered spend is below benchmark` | Below-benchmark spend never becomes a negative recommendation. |
| `recommends a cheaper same-vendor plan for a team plan` | GitHub Copilot Business can be compared against a cheaper same-vendor option where it fits. |
| `uses only the best per-tool recommendation to avoid double-counting savings` | Multiple rules for the same bill do not inflate the savings total. |
| `does not treat Gemini app subscriptions as API spend` | Consumer Gemini subscriptions do not accidentally trigger API-spend logic. |
| `treats Gemini API model spend as API spend` | Gemini API model usage does trigger the API review rule. |
| `suggests Claude Pro as an alternative for non-coding use cases using coding tools` | A named alternative is considered where use case and tool category do not match. |
| `does not recommend Claude Pro when Claude is already in the stack` | The engine avoids suggesting a tool the user already pays for. |
| `does not double-count a duplicate tool that already has a billing recommendation` | A cross-tool overlap recommendation does not add savings already attributed to the same subscription. |

## Manual Production Verification

The deployed flow was also checked manually on the live Vercel URL:

- Created an audit and received a Supabase-backed public report URL.
- Opened the shared report page and confirmed that only audit information is displayed.
- Downloaded a PDF copy of a public report and confirmed it contains the public audit output.
- Confirmed Gemini summary generation has a fallback for incomplete or failed model output.
- Submitted a lead after the audit and confirmed Resend returned successful email delivery during testing.
- Ran Lighthouse against the deployed URL: Performance `94`, Accessibility `100`, Best Practices `100`.

## Known Coverage Gap

The automated tests currently focus on the audit-engine calculations required by the assignment. API route integration, rate limiting, public report privacy, PDF generation, and email delivery have been manually verified but would be the next automated tests to add.
