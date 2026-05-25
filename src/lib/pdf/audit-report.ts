import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PDFFont } from "pdf-lib";

import { TOOL_PRICING } from "../audit/constants";
import type { Recommendation, ToolSpendInput, UseCase } from "../audit/types";
import { formatCurrency } from "../utils";

export interface AuditPdfData {
  createdAt: string;
  recommendations: Recommendation[];
  slug: string;
  summary: string | null;
  teamSize: number;
  tools: ToolSpendInput[];
  totalAnnualSavings: number;
  totalMonthlySavings: number;
  useCase: UseCase;
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const GREEN = rgb(0.02, 0.55, 0.37);
const INK = rgb(0.08, 0.1, 0.14);
const MUTED = rgb(0.38, 0.42, 0.48);
const BORDER = rgb(0.87, 0.89, 0.92);
const PALE_GREEN = rgb(0.93, 0.98, 0.96);

const cleanPdfText = (text: string) => {
  return text
    .replaceAll("\u2013", "-")
    .replaceAll("\u2014", "-")
    .replaceAll("\u2018", "'")
    .replaceAll("\u2019", "'")
    .replaceAll("\u201c", '"')
    .replaceAll("\u201d", '"')
    .replace(/[^\x20-\x7E]/g, "");
};

const wrapLines = (
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) => {
  const words = cleanPdfText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;

    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }

    if (line) {
      lines.push(line);
    }

    line = word;
  }

  if (line) {
    lines.push(line);
  }

  return lines;
};

export const buildAuditPdf = async (audit: AuditPdfData) => {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.CourierBold);
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  const newPage = () => {
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
    page.drawText("SpendLens - AI Spend Audit", {
      color: MUTED,
      font: bold,
      size: 9,
      x: MARGIN,
      y,
    });
    page.drawText(audit.slug, {
      color: MUTED,
      font: regular,
      size: 9,
      x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(audit.slug, 9),
      y,
    });
    y -= 27;
  };

  const ensureSpace = (requiredHeight: number) => {
    if (y - requiredHeight < MARGIN) {
      newPage();
    }
  };

  const drawWrappedText = (
    text: string,
    x: number,
    maxWidth: number,
    size: number,
    font: PDFFont,
    color = INK,
    lineHeight = size + 5,
  ) => {
    const lines = wrapLines(text, font, size, maxWidth);

    for (const line of lines) {
      page.drawText(line, { color, font, size, x, y });
      y -= lineHeight;
    }
  };

  page.drawText("SPENDLENS", {
    color: GREEN,
    font: bold,
    size: 11,
    x: MARGIN,
    y,
  });
  y -= 33;
  page.drawText("AI Spend Audit Report", {
    color: INK,
    font: bold,
    size: 27,
    x: MARGIN,
    y,
  });
  y -= 27;
  drawWrappedText(
    "Benchmark-based opportunities from public pricing. This is a first-pass review, not a final billing statement.",
    MARGIN,
    CONTENT_WIDTH,
    10,
    regular,
    MUTED,
    15,
  );
  y -= 13;

  const dateLabel = new Date(audit.createdAt).toISOString().slice(0, 10);
  page.drawText(`Report date: ${dateLabel}`, {
    color: MUTED,
    font: regular,
    size: 10,
    x: MARGIN,
    y,
  });
  page.drawText(`Team size: ${audit.teamSize}  |  Use case: ${audit.useCase}`, {
    color: MUTED,
    font: regular,
    size: 10,
    x: PAGE_WIDTH - MARGIN - regular.widthOfTextAtSize(
      `Team size: ${audit.teamSize}  |  Use case: ${audit.useCase}`,
      10,
    ),
    y,
  });
  y -= 34;

  page.drawRectangle({
    borderColor: BORDER,
    borderWidth: 1,
    color: PALE_GREEN,
    height: 92,
    width: CONTENT_WIDTH,
    x: MARGIN,
    y: y - 92,
  });
  page.drawText("POTENTIAL MONTHLY SAVINGS", {
    color: MUTED,
    font: bold,
    size: 9,
    x: MARGIN + 18,
    y: y - 23,
  });
  page.drawText(formatCurrency(audit.totalMonthlySavings), {
    color: GREEN,
    font: mono,
    size: 30,
    x: MARGIN + 18,
    y: y - 61,
  });
  page.drawText(`${formatCurrency(audit.totalAnnualSavings)} annualized`, {
    color: INK,
    font: bold,
    size: 13,
    x: MARGIN + 295,
    y: y - 52,
  });
  y -= 119;

  if (audit.summary) {
    ensureSpace(86);
    page.drawText("SUMMARY", { color: MUTED, font: bold, size: 9, x: MARGIN, y });
    y -= 20;
    drawWrappedText(audit.summary, MARGIN, CONTENT_WIDTH, 10, regular, INK, 15);
    y -= 15;
  }

  ensureSpace(70);
  page.drawText("TOOLS REVIEWED", {
    color: MUTED,
    font: bold,
    size: 9,
    x: MARGIN,
    y,
  });
  y -= 22;

  for (const tool of audit.tools) {
    ensureSpace(27);
    const toolName = TOOL_PRICING[tool.toolId].name;
    const planLabel =
      TOOL_PRICING[tool.toolId].plans.find((plan) => plan.id === tool.planId)
        ?.label ??
      TOOL_PRICING[tool.toolId].apiModels?.find(
        (model) => model.id === tool.planId,
      )?.label ??
      tool.planId;
    const label = `${toolName} - ${planLabel} - ${tool.seats} seat(s)`;
    const spend = `${formatCurrency(tool.monthlySpend)}/month`;

    page.drawText(cleanPdfText(label), {
      color: INK,
      font: regular,
      size: 10,
      x: MARGIN,
      y,
    });
    page.drawText(spend, {
      color: INK,
      font: bold,
      size: 10,
      x: PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize(spend, 10),
      y,
    });
    y -= 16;
    page.drawLine({
      color: BORDER,
      end: { x: PAGE_WIDTH - MARGIN, y },
      start: { x: MARGIN, y },
      thickness: 0.5,
    });
    y -= 11;
  }

  y -= 12;
  ensureSpace(60);
  page.drawText("RECOMMENDATIONS", {
    color: MUTED,
    font: bold,
    size: 9,
    x: MARGIN,
    y,
  });
  y -= 23;

  if (audit.recommendations.length === 0) {
    drawWrappedText(
      "No obvious savings were found from the current benchmark rules.",
      MARGIN,
      CONTENT_WIDTH,
      10,
      regular,
      INK,
    );
  }

  for (const recommendation of audit.recommendations) {
    const reasonLines = wrapLines(recommendation.reason, regular, 10, 368);
    const rowHeight = 37 + reasonLines.length * 15;
    ensureSpace(rowHeight);
    const name = TOOL_PRICING[recommendation.toolId].name;
    const amount = `${formatCurrency(recommendation.estimatedMonthlySavings)}/month`;

    page.drawText(cleanPdfText(`${name} - ${recommendation.priority} priority`), {
      color: MUTED,
      font: bold,
      size: 9,
      x: MARGIN,
      y,
    });
    y -= 17;
    page.drawText(cleanPdfText(recommendation.action), {
      color: INK,
      font: bold,
      size: 11,
      x: MARGIN,
      y,
    });
    page.drawText(amount, {
      color: GREEN,
      font: bold,
      size: 11,
      x: PAGE_WIDTH - MARGIN - bold.widthOfTextAtSize(amount, 11),
      y,
    });
    y -= 18;

    for (const line of reasonLines) {
      page.drawText(line, {
        color: MUTED,
        font: regular,
        size: 10,
        x: MARGIN,
        y,
      });
      y -= 15;
    }

    y -= 13;
  }

  ensureSpace(43);
  page.drawLine({
    color: BORDER,
    end: { x: PAGE_WIDTH - MARGIN, y },
    start: { x: MARGIN, y },
    thickness: 1,
  });
  y -= 20;
  drawWrappedText(
    "SpendLens uses cited public plan benchmarks. Check invoices, usage patterns, taxes, add-ons, and contract terms before making a purchasing change.",
    MARGIN,
    CONTENT_WIDTH,
    9,
    regular,
    MUTED,
    13,
  );

  return pdf.save();
};
