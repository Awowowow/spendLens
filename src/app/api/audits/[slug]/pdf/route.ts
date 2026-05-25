import { NextResponse } from "next/server";

import type { Recommendation, ToolSpendInput, UseCase } from "../../../../../lib/audit/types";
import { buildAuditPdf } from "../../../../../lib/pdf/audit-report";
import { createServerSupabaseClient } from "../../../../../lib/supabase/server";

export const runtime = "nodejs";

interface AuditPdfRow {
  created_at: string;
  recommendations: Recommendation[];
  slug: string;
  summary: string | null;
  team_size: number;
  tools: ToolSpendInput[];
  total_annual_savings: number;
  total_monthly_savings: number;
  use_case: UseCase;
}

interface PdfRouteProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: Request, { params }: PdfRouteProps) {
  const { slug } = await params;
  let supabase: ReturnType<typeof createServerSupabaseClient>;

  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json(
      { error: "Audit export is not configured." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("audits")
    .select(
      "slug, team_size, use_case, total_monthly_savings, total_annual_savings, tools, recommendations, summary, created_at",
    )
    .eq("slug", slug)
    .maybeSingle<AuditPdfRow>();

  if (error || !data) {
    return NextResponse.json({ error: "Audit report not found." }, { status: 404 });
  }

  const pdfBytes = await buildAuditPdf({
    createdAt: data.created_at,
    recommendations: data.recommendations,
    slug: data.slug,
    summary: data.summary,
    teamSize: data.team_size,
    tools: data.tools,
    totalAnnualSavings: Number(data.total_annual_savings),
    totalMonthlySavings: Number(data.total_monthly_savings),
    useCase: data.use_case,
  });

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Disposition": `attachment; filename="spendlens-${data.slug}.pdf"`,
      "Content-Type": "application/pdf",
    },
  });
}
