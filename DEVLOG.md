## Day 1 — 2026-05-20

**Hours worked:** 5

### What I did
- I brainstormed the product direction and researched Credex, their website, and the assignment context.
- I checked the prices for all 8 required tools by going to the official websites.
- I set up a new Next.js project with TypeScript and Tailwind.
- I made my first commit.
- I wrote a draft of `PRICING_DATA.md` with where I got the prices and when I checked them.
- I read the assignment's git history requirements and decided to use Conventional Commits.
- I created `src/lib/audit/types.ts` to define the first data shapes for the audit engine.

### What I learned

- GitHub Copilot is changing how it charges people. The price of $0.04 per request is going away on June 1, 2026 when GitHub starts charging based on usage, so I should not use that number for long-term cost estimates.
- Windsurf changed its prices in March 2026. People who already paid $15 per month for Pro get to keep that price. New users see $20 per month on the website.
- TypeScript has something called union types that can help make sure I type the right tool IDs in the audit engine.

### Blockers / decisions

- For Windsurf, I decided to use the prices that new users see today in the audit engine because that is what a new startup would pay.

- I chose to use Conventional Commit messages like `feat: define audit engine data types` instead of messages that do not explain what I did.
- I started working on the audit engine with `types.ts` before I did the user interface so all parts of the app can use the same data shape.

### Plan for tomorrow

- I will build the `AuditForm` component with all 8 tools.
- I will add a way to save the form data in the browser's storage.
- I will start a new file called `constants.ts` for the verified prices.
- I will add the first tests for the audit engine.

## Day 2 — 2026-05-21

**Hours worked:** 7

### What I did

- I added the verified pricing data to `src/lib/audit/constants.ts`, so the code uses the same prices I documented in `PRICING_DATA.md`.
- I built the first complete version of the audit engine in `src/lib/audit/engine.ts`.
- I added audit rules for pricing benchmark checks, high API spending, unused seats, same-vendor downgrades, duplicate coding tools, and use-case fit.
- I found and fixed a double-counting issue where one tool could create multiple recommendations, making savings appear larger than they were.
- I added 11 tests in `src/lib/audit/engine.test.ts` for the main audit rules.
- I added a `test` script so I can run the test suite with `npm run test`.
- I adjusted the use-case values to match the assignment: coding, writing, data, research, and mixed.

### What I learned

- TypeScript slowed me down at first, but it helped catch real mistakes like missing tool pricing keys and nullable prices.
- Public pricing should serve as a benchmark, not as proof that someone is definitely overspending.
- The audit engine needs to avoid stacking overlapping savings, or the numbers become hard to trust.
- Writing tests was useful because it made the audit rules feel more concrete, rather than just being ideas.
- Naming variables clearly took more time than I expected.

### Blockers / what I'm stuck on

- I still need to build the actual form UI and connect it to the audit engine.
- I need to ensure the form stores data across page reloads, as that is required in the assignment.
- I have not started on Supabase, email, AI summary, or shareable audit URLs yet.
- I need to complete the three real user interviews and use them to improve the product.

### Plan for tomorrow

- Build the `AuditForm` component with all required tools and plans.
- Add form persistence using `localStorage`.
- Show audit results on-screen after the user submits the form.
- Start writing `TESTS.md` with the audit-engine tests I added.


## Day 3 — 2026-05-22

**Hours worked:** 8

### What I did

- I built the working `AuditForm` UI and connected it to the audit engine.
- I added `useFormPersistence` so the form data stays saved after a page reload.
- I fixed a hydration mismatch that happened when saved browser data loaded too early.
- I changed the form so it stores typed number fields as strings, then converts them to numbers when the audit runs.
- I split the results page into smaller components: `AuditResults`, `SavingsHero`, and `RecommendationCard`.
- I redesigned the results dashboard to make the savings number stand out more clearly.
- I set up the GitHub Actions CI workflow and confirmed that lint and all 11 audit-engine tests pass.
- I created the database schema for Supabase in `supabase/schema.sql`.

### What I learned

- In a server-rendered React app, browser-only data needs to be loaded carefully.
- Number inputs work better when the typed value is stored as a string and converted during submission.
- The results page needs stronger hierarchy than the input form because it is what people are most likely to share.
- Pricing should be shown as a benchmark, not as a final billing statement.
- A committed database schema makes the backend design easier to review.

### Blockers / decisions

- I decided not to add login because it is not required for the assignment and email capture after the audit is enough for lead generation.
- I paused deeper UI polish because backend persistence and shareable URLs are higher priority for the MVP.
- I decided to store audit results separately from leads so public share pages do not expose private information.
- I still need to connect the API routes to Supabase and build the public audit page.

### Plan for tomorrow

- Build a way to save audit results to the database.
- Generate a unique slug for each audit so people can share their results.
- Create the public audit page and make sure it does not expose private information.
- Start the lead capture API once the share URL flow is working.