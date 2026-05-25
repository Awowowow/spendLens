# LLM Prompt And Fallback Policy

## Where AI Is Used

SpendLens uses Gemini only to write a short personalized paragraph after the deterministic audit has been calculated and saved. The LLM does not choose prices, compute savings, select thresholds, or decide whether Credex should be shown. Those decisions remain inspectable TypeScript rules.

## Production Summary Prompt

The application constructs the prompt below in `src/lib/llm/summary.ts`, filling in the audit values and recommendation list:

```text
Write one short paragraph for a startup AI spend audit.

Rules:
- Use plain English.
- Keep it between 70 and 100 words.
- Do not invent pricing numbers.
- Do not mention that you are an AI.
- Be honest if savings are low.

Audit context:
- Team size: {teamSize}
- Use case: {useCase}
- Monthly savings: ${totalMonthlySavings}
- Annual savings: ${totalAnnualSavings}

Recommendations:
{recommendation actions and reasons, or "No major savings recommendations."}
```

## Why The Prompt Is Written This Way

- **One paragraph:** the summary sits inside a dashboard and should be quickly readable.
- **70 to 100 words:** this matches the assignment request for an approximately 100-word personalized summary without turning the report into marketing copy.
- **Values supplied by the app:** the model describes calculated findings instead of making up costs.
- **Honest low-savings instruction:** an already-efficient stack should receive reassurance, not invented savings.
- **Recommendation reasons included:** the summary has context about why the opportunity exists, while the rule engine remains the source of truth.

## What Changed During Testing

The first implementation requested a shorter summary. In production testing, Gemini returned an incomplete fragment: `"This audit for your"`. I changed the prompt to request a fuller paragraph and added a validation guard. A model response is accepted only if it is a complete sentence between 55 and 115 words; otherwise the app uses a deterministic fallback.

## Fallback Behavior

There are three fallback paragraphs in `src/lib/llm/fallbackSummary.ts`:

- Low-savings audit: explains that the stack already looks lean and should be rechecked when usage or pricing changes.
- High-savings audit: explains the large optimization opportunity and suggests a Credex credit review.
- Normal audit: summarizes plan fit and overlap review without overstating certainty.

Fallback is used when the Gemini key is absent, the request fails, Gemini returns an error, or the returned paragraph fails the completeness check.

## Provider Choice

The assignment states that Anthropic is preferred but permits any LLM. I chose Gemini Flash because it allowed production summary generation without making access to Anthropic credits a blocker. Since all calculations are outside the model prompt, changing providers later would affect the prose-generation function rather than the audit logic.
