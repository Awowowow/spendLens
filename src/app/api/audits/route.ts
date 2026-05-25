import { NextResponse } from "next/server";

import { runAudit } from "../../../lib/audit/engine";
import type { AuditInput } from "../../../lib/audit/types";
import { isAuditInput } from "../../../lib/audit/validation";
import { createAuditSlug } from "../../../lib/slug";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

interface CreateAuditRequest {
  input: AuditInput;
}

const isValidAuditRequest = (body: unknown): body is CreateAuditRequest => {
  if (!body || typeof body !== "object") {
    return false;
  }

  if (!("input" in body)) {
    return false;
  }

  return isAuditInput(body.input);
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid audit request." },
      { status: 400 },
    );
  }

  if (!isValidAuditRequest(body)) {
    return NextResponse.json(
      { error: "Invalid audit request." },
      { status: 400 },
    );
  }

  const result = runAudit(body.input);
  const slug = createAuditSlug();
  let supabase: ReturnType<typeof createServerSupabaseClient>;

  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json(
      { error: "Audit storage is not configured." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("audits")
    .insert({
      slug,
      team_size: body.input.teamSize,
      use_case: body.input.useCase,
      total_monthly_savings: result.totalMonthlySavings,
      total_annual_savings: result.totalAnnualSavings,
      tools: body.input.tools,
      recommendations: result.recommendations,
      summary: null,
    })
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json(
      {
        error: "Could not save audit.",
        ...(process.env.NODE_ENV === "development"
          ? { details: error.message }
          : {}),
      },
      { status: 500 },
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return NextResponse.json({
    auditId: data.id,
    slug: data.slug,
    shareUrl: `${siteUrl}/audit/${data.slug}`,
    result,
  });
}
