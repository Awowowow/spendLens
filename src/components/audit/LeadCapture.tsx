"use client";

import { useState } from "react";
import type { FormEvent } from "react";

interface LeadCaptureProps {
  auditId: string;
  shareUrl: string;
  teamSize: number;
  totalMonthlySavings: number;
}

type LeadStatus = "idle" | "submitting" | "success" | "error";

export const LeadCapture = ({
  auditId,
  shareUrl,
  teamSize,
  totalMonthlySavings,
}: LeadCaptureProps) => {
  const [status, setStatus] = useState<LeadStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(form);

    const payload = {
      auditId,
      email: String(formData.get("email") ?? ""),
      company: String(formData.get("company") ?? ""),
      role: String(formData.get("role") ?? ""),
      shareUrl,
      website: String(formData.get("website") ?? ""),
      teamSize,
      totalMonthlySavings,
    };

    try {
      const response = await fetch("/api/leads", {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };

        throw new Error(data.error ?? "Could not save lead.");
      }

      setStatus("success");
      form.reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again.",
      );
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-white">Send me this report</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          Leave an email after seeing the result. SpendLens stores this
          separately from the public audit page.
        </p>
      </div>

      {status === "success" ? (
        <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm text-emerald-200">
          Saved. You can keep using the share link above for the public report.
        </div>
      ) : (
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <input
            autoComplete="off"
            className="hidden"
            name="website"
            tabIndex={-1}
            type="text"
          />

          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-300">
                Work email
              </span>
              <input
                className="h-11 w-full rounded-xl border border-white/10 bg-[#12141c] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                name="email"
                placeholder="founder@company.com"
                required
                type="email"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-300">
                Company
              </span>
              <input
                className="h-11 w-full rounded-xl border border-white/10 bg-[#12141c] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                name="company"
                placeholder="Optional"
                type="text"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-300">Role</span>
              <input
                className="h-11 w-full rounded-xl border border-white/10 bg-[#12141c] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
                name="role"
                placeholder="Optional"
                type="text"
              />
            </label>
          </div>

          {status === "error" ? (
            <p className="text-sm text-red-300">{errorMessage}</p>
          ) : null}

          <button
            className="h-11 rounded-xl bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={status === "submitting"}
            type="submit"
          >
            {status === "submitting" ? "Saving..." : "Send report"}
          </button>
        </form>
      )}
    </section>
  );
};
