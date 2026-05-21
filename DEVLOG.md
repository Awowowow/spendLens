## Day 1 — 2026-05-20

**Hours worked:** 5

### What I did
- I did brainstorming first and researched about the project and the credex company and their work.
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
- I made a note about grandfathered Windsurf prices in `PRICING_DATA.md`, but I did not use them to calculate savings.
- I started working on the audit engine with `types.ts` before I did the user interface so all parts of the app can use the same data shape.
- I chose to use Conventional Commit messages like `feat: define audit engine data types` instead of messages that do not explain what I did.
- I started working on the audit engine with `types.ts` before I did the user interface so all parts of the app can use the same data shape.

### Plan for tomorrow

- I will build the `AuditForm` component with all 8 tools.
- I will add a way to save the form data in the browser's storage.
- I will start a new file called `constants.ts` for the verified prices.
- I will add the first tests for the audit engine.