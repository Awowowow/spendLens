# Reflection

## 1. The Hardest Bug I Hit This Week

The most important bug was not a compile error. It was a trust problem in the audit engine: one tool could trigger several savings rules and all of them were added together. For example, a team-plan subscription could be counted once for being above a public benchmark and again for a cheaper downgrade. The page looked impressive because it showed larger savings, but the number was not defensible.

My first hypothesis was that each rule was individually correct, so summing them would also be correct. After walking through a single Copilot Business example by hand, I realized the recommendations described overlapping actions against the same bill. I changed the engine so it gathers candidate recommendations for each tool and counts only the highest-value non-overlapping one. I then added a test specifically checking that one tool does not inflate the total.

Later, live testing found two smaller production bugs: Gemini returned an incomplete fragment instead of a useful paragraph, and the lead form tried to reset `event.currentTarget` after an asynchronous request when the value could be null. In final review I also found that the summary and lead routes accepted calculated values from the browser. I changed those routes to reload the saved audit and derive their values on the server. These bugs taught me that passing TypeScript and unit tests is necessary, but it does not replace testing the full deployed flow and its trust boundaries.

## 2. A Decision I Reversed Mid-Week

Early in the project I planned to put rate limiting in Next.js middleware because it appeared to be the central place for blocking repeated requests. I reversed that decision after looking at how the app actually stores rate-limit state. The limiter uses Supabase and records a hashed IP address, action, time window, and count. Middleware runs in an edge runtime, while this implementation was already based around server route handlers and Supabase access.

Making middleware responsible for rate limiting would have pushed me toward adding another edge-compatible service such as Redis only to support one MVP protection. That would create extra configuration and another production failure point. Instead, I placed the rate-limit check inside the lead API route, immediately before inserting a lead, and added a hidden honeypot field for simple bot submissions.

This change made the architecture less flashy but easier to explain. The API route owns the action being limited and can reject the lead before storage or email. It also gave me a useful rule for the rest of the project: a technical choice should follow the actual data flow and failure modes, not just look advanced in a diagram.

## 3. What I Would Build In Week 2

The first improvement would come directly from the user interviews. The current MVP collects a single monthly-spend number for each tool. Two interviewees described a more complicated reality: teams may have normal subscription costs plus extra credits purchased during urgent work or after repeatedly reaching limits. I would add optional fields for recurring extra-credit spend and how often usage limits are reached: never, occasionally, monthly, or weekly.

I would also show possible savings as a percentage of current spend, not only as dollars. One interviewee said that a 10-20% reduction would be worth reviewing, while a student interviewee cared about a smaller absolute monthly amount because it came from his own budget. This would let the audit be more honest for different user types.

On the engineering side, I would add route-level integration tests for audit persistence, public-report privacy, lead rate limiting, and LLM fallback behavior. I would store a pricing revision identifier with each audit so a shared result remains clear about which verified prices generated it. Finally, I would add a real consultation handoff for high-intent leads, so Credex could measure booked reviews and credit purchases rather than stopping at email capture.

## 4. How I Used AI Tools

I used Claude and Codex during this project for explanation, code review, drafting, and debugging support. I already knew JavaScript and React, but I was learning TypeScript and Next.js App Router while building. AI helped me understand typed data shapes, server and client boundaries, route handlers, and why browser-only persisted form state can create hydration problems. I also used AI to critique the audit logic and improve the structure of documentation drafts.

I did not trust AI with pricing verification, interview facts, or final audit numbers. I checked official pricing pages manually, gathered the interview information from real conversations, ran the tests, inspected Git history, deployed the app, and tested the live API and UI flow.

One specific correction was the early idea of putting Supabase-backed rate limiting in middleware. After checking the runtime implications, I changed it to a route-handler implementation rather than adding an unnecessary service. Another production example was Gemini returning the incomplete summary `"This audit for your"` during live testing. Instead of treating any model response as acceptable, I added validation and fallback behavior. AI helped accelerate the work, but I still needed to decide what was trustworthy and prove the app worked.

## 5. Self-Rating

| Area | Score | Reason |
| --- | ---: | --- |
| Discipline | 8/10 | I kept meaningful commits across the required days, maintained a devlog, and worked through deployment failures instead of ignoring them. |
| Code quality | 7/10 | The audit engine is typed and tested and routes now validate trusted values, but I would still add API integration tests. |
| Design sense | 7/10 | I improved the results screen into a shareable dashboard, but more mobile testing and polish could still improve it. |
| Problem-solving | 8/10 | I found and corrected double-counted savings, deployment configuration failures, incomplete AI output, and the async form-reset bug. |
| Entrepreneurial thinking | 7/10 | Interviews changed the roadmap toward percentage savings and recurring credit spend, but I still need more evidence from live users and actual consultation conversions. |

The rating I am most confident about is problem-solving because several important issues only appeared when I challenged assumptions or tested production. The rating I would most want to improve is entrepreneurial thinking: the tool is deployed and the funnel is defined, but real customer behavior after launch would be the stronger proof.
