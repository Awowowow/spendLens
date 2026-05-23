import { NextResponse } from "next/server";

import type { AuditInput, AuditResult } from "../../../lib/audit/types";
import { generateAuditSummary } from "../../../lib/llm/summary";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

interface SummaryRequest {
  auditId: string;
  input: AuditInput;
  result: AuditResult;
}

const isSummaryRequest = (body: unknown): body is SummaryRequest => {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Partial<SummaryRequest>;

  return (
    typeof candidate.auditId === "string" &&
    typeof candidate.input === "object" &&
    typeof candidate.result === "object"
  );
};

export async function POST(request: Request) {
  const body = await request.json();

  if (!isSummaryRequest(body)) {
    return NextResponse.json(
      { error: "Invalid summary request." },
      { status: 400 },
    );
  }

  const summary = await generateAuditSummary(body.input, body.result);

  let supabase: ReturnType<typeof createServerSupabaseClient>;

  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json({ summary });
  }

  await supabase
    .from("audits")
    .update({ summary })
    .eq("id", body.auditId);

  return NextResponse.json({ summary });
}
