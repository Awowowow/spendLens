import { NextResponse } from "next/server";

import { sendLeadConfirmationEmail } from "../../../lib/email/resend";
import { checkRateLimit } from "../../../lib/rate-limit";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

interface CreateLeadRequest {
  auditId: string;
  email: string;
  company?: string;
  role?: string;
  website?: string;
}

interface LeadAuditRow {
  slug: string;
  team_size: number;
  total_monthly_savings: number;
}

const LEAD_RATE_LIMIT = 5;
const LEAD_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
};

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isLeadRequest = (body: unknown): body is CreateLeadRequest => {
  if (!body || typeof body !== "object") {
    return false;
  }

  const candidate = body as Partial<CreateLeadRequest>;

  return (
    typeof candidate.auditId === "string" &&
    candidate.auditId.length > 0 &&
    typeof candidate.email === "string"
  );
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid lead request." },
      { status: 400 },
    );
  }

  if (!isLeadRequest(body)) {
    return NextResponse.json(
      { error: "Invalid lead request." },
      { status: 400 },
    );
  }

  if (body.website) {
    return NextResponse.json(
      { error: "Invalid lead request." },
      { status: 400 },
    );
  }

  const email = body.email.trim().toLowerCase();

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  let supabase: ReturnType<typeof createServerSupabaseClient>;

  try {
    supabase = createServerSupabaseClient();
  } catch {
    return NextResponse.json(
      { error: "Lead storage is not configured." },
      { status: 503 },
    );
  }

  const isAllowed = await checkRateLimit({
    supabase,
    ipAddress: getClientIp(request),
    action: "lead_capture",
    limit: LEAD_RATE_LIMIT,
    windowMs: LEAD_RATE_LIMIT_WINDOW_MS,
  });

  if (!isAllowed) {
    return NextResponse.json(
      { error: "Too many lead submissions. Try again later." },
      { status: 429 },
    );
  }

  const { data: audit, error: auditError } = await supabase
    .from("audits")
    .select("slug, team_size, total_monthly_savings")
    .eq("id", body.auditId)
    .maybeSingle<LeadAuditRow>();

  if (auditError) {
    return NextResponse.json(
      { error: "Could not load audit." },
      { status: 500 },
    );
  }

  if (!audit) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  }

  const totalMonthlySavings = Number(audit.total_monthly_savings);
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin
  ).replace(/\/$/, "");
  const shareUrl = `${siteUrl}/audit/${audit.slug}`;

  const { error } = await supabase.from("leads").insert({
    audit_id: body.auditId,
    email,
    company: body.company?.trim() || null,
    role: body.role?.trim() || null,
    team_size: audit.team_size,
    total_monthly_savings: totalMonthlySavings,
  });

  if (error) {
    return NextResponse.json(
      {
        error: "Could not save lead.",
        ...(process.env.NODE_ENV === "development"
          ? { details: error.message }
          : {}),
      },
      { status: 500 },
    );
  }

  const emailResult = await sendLeadConfirmationEmail({
    to: email,
    shareUrl,
    totalMonthlySavings,
  });

  return NextResponse.json({ ok: true, emailSent: emailResult.sent });
}
