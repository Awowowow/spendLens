import { NextResponse } from "next/server";

import { runAudit } from "../../../lib/audit/engine";
import type { AuditInput } from "../../../lib/audit/types";
import { isAuditInput } from "../../../lib/audit/validation";
import { generateAuditSummary } from "../../../lib/llm/summary";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

interface SummaryRequest {
  auditId: string;
}

interface SavedAuditForSummary {
  team_size: number;
  use_case: AuditInput["useCase"];
  tools: AuditInput["tools"];
}

const isSummaryRequest = (body: unknown): body is SummaryRequest => {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Partial<SummaryRequest>;

  return typeof candidate.auditId === "string" && candidate.auditId.length > 0;
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid summary request." },
      { status: 400 },
    );
  }

  if (!isSummaryRequest(body)) {
    return NextResponse.json(
      { error: "Invalid summary request." },
      { status: 400 },
    );
  }

  let supabase: ReturnType<typeof createServerSupabaseClient>;

  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json(
      { error: "Audit storage is not configured." },
      { status: 503 },
    );
  }

  const { data: savedAudit, error: lookupError } = await supabase
    .from("audits")
    .select("team_size, use_case, tools")
    .eq("id", body.auditId)
    .maybeSingle<SavedAuditForSummary>();

  if (lookupError) {
    return NextResponse.json(
      { error: "Could not load audit for summary." },
      { status: 500 },
    );
  }

  if (!savedAudit) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  }

  const input = {
    teamSize: Number(savedAudit.team_size),
    useCase: savedAudit.use_case,
    tools: savedAudit.tools,
  };

  if (!isAuditInput(input)) {
    return NextResponse.json(
      { error: "Stored audit input is invalid." },
      { status: 500 },
    );
  }

  const summary = await generateAuditSummary(input, runAudit(input));
  const { error: updateError } = await supabase
    .from("audits")
    .update({ summary })
    .eq("id", body.auditId);

  if (updateError) {
    return NextResponse.json(
      { error: "Could not save audit summary." },
      { status: 500 },
    );
  }

  return NextResponse.json({ summary });
}
