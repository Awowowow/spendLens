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


## Day 4 — 2026-05-23

**Hours worked:** 8

### What I did

- I made the audit flow work with Supabase. Completed audits are now saved in the database.
- I added unique links for saved audits so each report has its own public share URL.
- I built the public audit page and made sure it only shows audit information.
- I added a saved report section after the audit result so users can open the permanent report.
- I changed the lead capture flow so users see the audit result before entering their email.
- I added a honeypot field and Supabase-backed rate limiting to reduce spam lead submissions.
- I added the Resend confirmation email path.
- I added a Gemini summary route. If the API key is missing or the model request fails, it shows a fallback summary.
- I added Open Graph metadata and a generated image for public audit pages.
- I fixed a GitHub Actions install failure caused by `package-lock.json` being out of sync with the Linux CI environment.

### What I learned

- A committed database schema is useful, but the SQL still needs to be run inside Supabase before the app can use the tables.
- Public share pages should only load the information they need and should not load lead data.
- The server should run the audit again before saving results instead of trusting data from the browser.
- Asking for email after the user has seen the report feels more honest.
- If `package.json` and `package-lock.json` are not synced, CI can fail before tests even run.

### Blockers / decisions

- I kept homepage results temporary because the permanent version now lives on the public share URL.
- I made Resend optional locally, so lead capture still works even if email sending is not configured.
- I made Gemini optional. If the API key is missing, the app shows a fallback summary.
- I did not add account login or audit history because the assignment is focused on shareable audit reports and lead capture.

### Plan for tomorrow

- Deploy the app on Vercel and add production environment variables.
- Test the deployed flow: audit, saved report, lead capture, summary, and public share page.
- Start writing the remaining documentation files.
- Add user interview notes and connect them to product decisions.
- Run mobile and accessibility checks.


## Day 5 — 2026-05-24

**Hours worked:** 7

### What I did

- I deployed SpendLens to Vercel and connected the production app to Supabase environment variables.
- I tested the deployed audit flow end to end: homepage, audit creation, saved public report URL, lead capture, and summary generation.
- I added production environment variables for Resend and Gemini.
- I found that Gemini could sometimes return a very short incomplete summary, so I added a fallback guard for incomplete AI summaries.
- I fixed the Resend sender configuration and confirmed the deployed lead endpoint can send a transactional email.
- I fixed a frontend bug in the lead capture form where the form reset could fail after the async request.
- I added a production build step to GitHub Actions so CI now checks lint, tests, and `next build`.
- I ran Lighthouse on the deployed URL and got scores above the assignment requirements.
- I added notes from my first real user interview with a lead frontend developer.

### What I learned

- A Vercel deployment can build successfully but still fail at runtime if production environment variables are missing or added to the wrong environment.
- It is not enough for an LLM route to return a response. The app also needs to reject bad or incomplete responses and fall back safely.
- Transactional email setup has two separate risks: the API key can be valid while the sender address is still invalid.
- UI bugs can appear after a successful API call, especially when a form uses async submission and then tries to reset itself.
- User interview feedback made it clear that savings should eventually be shown as a percentage as well as a dollar amount.

### Blockers / decisions

- I decided not to add a large bonus feature today because deployment, production QA, and documentation are more important for passing the required assignment checks.
- I kept the Gemini fallback even after adding the API key because the assignment specifically asks for graceful failure handling.
- I used `onboarding@resend.dev` for email sending because it is enough to prove the Resend path works, but a verified domain would be better for a real production launch.
- I still need two more real user interviews and the remaining documentation files.

### Plan for tomorrow

- Complete two more user interviews and write the notes while the conversations are still fresh.
- Fill in `README.md`, `ARCHITECTURE.md`, `TESTS.md`, `PROMPTS.md`, and the entrepreneurial files.
- Add the unit economics section with real assumptions and rough math.
- Re-check the deployed app after the documentation work is done.
- Make sure the latest GitHub Actions run is still green before submission.



## Day 6 — 2026-05-25

**Hours worked:** 6

### What I did

- I wrote `README.md` with the live link, setup instructions, environment variables, product decisions, and screenshots of the input form, results page, and public report.
- I wrote `ARCHITECTURE.md` to document the Next.js routes, Supabase tables, audit flow, summary fallback, lead capture, and privacy boundary between public audits and private leads.
- I wrote `TESTS.md` documenting the 11 audit-engine tests that existed at this point, plus the local and GitHub Actions commands used to run them.
- I wrote `PROMPTS.md` documenting the production Gemini summary prompt, why I constrained it, and what fallback behavior is needed.
- I wrote `GTM.md` with the target user, acquisition channels, first-100-audits plan, and the distribution idea around shareable reports.
- I wrote `ECONOMICS.md` with assumptions for lead value, CAC by channel, conversion rates, and a rough path to $1M ARR.
- I wrote `LANDING_COPY.md` with headline, subheadline, call-to-action copy, user-feedback social proof, and FAQ answers.
- I wrote `METRICS.md` defining the funnel metrics I would track after launch.
- I completed `REFLECTION.md` and condensed the three real conversations into `USER_INTERVIEWS.md`, including what changed in the product after each interview.
- I reviewed and updated `PRICING_DATA.md` so pricing notes and dated source links stayed consistent with the audit constants.
- I added downloadable PDF exports for saved public audit reports as the bonus feature.
- Adding the PDF package caused `npm ci` to fail in GitHub Actions because the lockfile was missing Linux optional dependencies. I updated the lockfile and confirmed that CI passed lint, tests, and build afterward.

### What I learned

- Writing `ECONOMICS.md` forced me to put numbers behind the funnel instead of saying the product could create leads without proving what those leads might be worth.
- Two professional interviewees judged an opportunity using a 10-20% saving threshold, while the student cared about an absolute monthly amount. That suggests the result page should eventually show both dollars and percentage.
- The PDF export looked like a small bonus feature, but its new dependency still affected deployment reliability through the lockfile.
- Documenting the production prompt was harder than expected because I had not written down every prompt decision while building. Keeping prompt notes earlier would make the final write-up easier.

### Blockers / decisions

- I kept the PDF feature limited to exporting an existing public report, instead of adding new user data or changing the main audit flow.
- The numbers in `ECONOMICS.md` are estimates because there is no real conversion history yet; I labelled the assumptions instead of presenting them as measured results.
- I did not expand the schema with future credit-usage fields suggested by interviews because completing and verifying the required MVP was more important before submission.

### Plan for tomorrow

- Review all required files against the PDF one final time.
- Confirm the deployed audit, public share URL, PDF download, lead form, and summary fallback still work.
- Check the latest GitHub Actions run and the commit-day requirement before submission.


## Day 7 — 2026-05-26

**Hours worked:** 2

### What I did

- I completed a final review of the app before submission and fixed server-side trust issues in the saved audit, AI summary, and lead-capture flows.
- I made sure the server validates audit input and calculates report values itself instead of trusting values sent from the browser.
- I fixed a possible double-counting case in the recommendation totals and added a 12th audit-engine test for that case.
- I updated the documentation so it matches the final implemented flow, including the downloadable PDF report bonus feature.
- I tested the live deployed app again: creating an audit, opening the public report URL, downloading the PDF, submitting the lead form, checking the summary fallback, and checking the mobile layout.
- I ran final checks for GitHub Actions, Lighthouse requirements, committed secrets, and distinct commit days.
- I corrected the Day 6 log wording so the development record is clearer and more accurate.

### What I learned

- Client-side values are not enough for a public report or saved lead. Important totals and share details should be rebuilt or loaded on the server.
- A final review is useful even when the main features are complete, because small data-trust issues can affect whether the results are believable.
- Bonus features still need the same verification as required features, especially when they add dependencies or new public routes.

### Blockers / decisions

- I did not add new product features during the final review because the required flow and PDF export were already complete; reliability was the priority.
- I kept the final corrections as normal commits instead of rewriting pushed Git history, so the submission record stays honest and traceable.

### Final submission check

- The deployed audit flow, public share page, PDF download, lead form, and summary fallback are working.
- GitHub Actions passes lint, automated tests, and production build.
- The repository now has a devlog entry for each calendar day represented in the project timeline.
