import type { AuditInput, AuditResult } from "../audit/types";
import { createFallbackSummary } from "./fallbackSummary";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

const isUsableSummary = (summary: string) => {
  const wordCount = summary.split(/\s+/).filter(Boolean).length;

  return wordCount >= 55 && wordCount <= 115 && /[.!?]$/.test(summary);
};

const buildSummaryPrompt = (input: AuditInput, result: AuditResult) => {
  const recommendations = result.recommendations
    .map(
      (recommendation) =>
        `- ${recommendation.action}: ${recommendation.reason}`,
    )
    .join("\n");

  return `
Write one short paragraph for a startup AI spend audit.

Rules:
- Use plain English.
- Keep it between 70 and 100 words.
- Do not invent pricing numbers.
- Do not mention that you are an AI.
- Be honest if savings are low.

Audit context:
- Team size: ${input.teamSize}
- Use case: ${input.useCase}
- Monthly savings: $${result.totalMonthlySavings}
- Annual savings: $${result.totalAnnualSavings}

Recommendations:
${recommendations || "- No major savings recommendations."}
`;
};

export const generateAuditSummary = async (
  input: AuditInput,
  result: AuditResult,
) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const fallbackSummary = createFallbackSummary(input, result);

  if (!apiKey) {
    return fallbackSummary;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: buildSummaryPrompt(input, result) }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 180,
            temperature: 0.4,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      },
    );

    if (!response.ok) {
      return fallbackSummary;
    }

    const data = (await response.json()) as GeminiResponse;
    const summary = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .join("")
      .trim();

    if (!summary || !isUsableSummary(summary)) {
      return fallbackSummary;
    }

    return summary;
  } catch {
    return fallbackSummary;
  }
};
