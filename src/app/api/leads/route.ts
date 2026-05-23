import { NextResponse } from "next/server";

import { sendLeadConfirmationEmail } from "../../../lib/email/resend";
import { checkRateLimit } from "../../../lib/rate-limit";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

interface CreateLeadRequest {
  auditId: string;
  email: string;
  company?: string;
  role?: string;
  shareUrl?: string;
  teamSize: number;
  totalMonthlySavings: number;
  website?: string;
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
    typeof candidate.email === "string" &&
    typeof candidate.teamSize === "number" &&
    typeof candidate.totalMonthlySavings === "number"
  );
};

export async function POST(request: Request) {
  const body = await request.json();

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

  const { error } = await supabase.from("leads").insert({
    audit_id: body.auditId,
    email,
    company: body.company?.trim() || null,
    role: body.role?.trim() || null,
    team_size: body.teamSize,
    total_monthly_savings: body.totalMonthlySavings,
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
    shareUrl: body.shareUrl,
    totalMonthlySavings: body.totalMonthlySavings,
  });

  return NextResponse.json({ ok: true, emailSent: emailResult.sent });
}
