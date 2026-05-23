import { createHash } from "node:crypto";

import type { createServerSupabaseClient } from "./supabase/server";

type SupabaseServerClient = ReturnType<typeof createServerSupabaseClient>;

interface RateLimitOptions {
  supabase: SupabaseServerClient;
  ipAddress: string;
  action: string;
  limit: number;
  windowMs: number;
}

const hashIpAddress = (ipAddress: string) => {
  return createHash("sha256").update(ipAddress).digest("hex");
};

const getWindowStart = (windowMs: number) => {
  const windowStartMs = Math.floor(Date.now() / windowMs) * windowMs;

  return new Date(windowStartMs).toISOString();
};

export const checkRateLimit = async ({
  supabase,
  ipAddress,
  action,
  limit,
  windowMs,
}: RateLimitOptions) => {
  const ipHash = hashIpAddress(ipAddress);
  const windowStart = getWindowStart(windowMs);

  const { data: existingLimit, error: lookupError } = await supabase
    .from("rate_limits")
    .select("id, request_count")
    .eq("ip_hash", ipHash)
    .eq("action", action)
    .eq("window_start", windowStart)
    .maybeSingle();

  if (lookupError) {
    return false;
  }

  if (!existingLimit) {
    const { error: insertError } = await supabase.from("rate_limits").insert({
      ip_hash: ipHash,
      action,
      window_start: windowStart,
      request_count: 1,
    });

    return !insertError;
  }

  if (existingLimit.request_count >= limit) {
    return false;
  }

  const { error: updateError } = await supabase
    .from("rate_limits")
    .update({
      request_count: existingLimit.request_count + 1,
    })
    .eq("id", existingLimit.id);

  return !updateError;
};
