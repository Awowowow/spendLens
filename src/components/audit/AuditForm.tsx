"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { useFormPersistence } from "../../hooks/useFormPersistence";
import { TOOL_PRICING } from "../../lib/audit/constants";
import { runAudit } from "../../lib/audit/engine";
import type {
  AuditInput,
  AuditResult,
  ToolId,
  ToolSpendInput,
  UseCase,
} from "../../lib/audit/types";
import { AuditResults } from "./AuditResults";

const STORAGE_KEY = "spendlens-audit-form";

const TOOL_IDS = Object.keys(TOOL_PRICING) as ToolId[];

const USE_CASE_OPTIONS: { value: UseCase; label: string }[] = [
  { value: "coding", label: "Coding" },
  { value: "writing", label: "Writing" },
  { value: "data", label: "Data" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed" },
];

interface ToolSpendDraft {
  toolId: ToolId;
  planId: string;
  monthlySpend: string;
  seats: string;
}

interface AuditFormDraft {
  teamSize: string;
  useCase: UseCase;
  tools: ToolSpendDraft[];
}

interface CreateAuditResponse {
  auditId: string;
  slug: string;
  shareUrl: string;
  result: AuditResult;
}

const getPlanOptions = (toolId: ToolId) => {
  const pricing = TOOL_PRICING[toolId];

  return [
    ...pricing.plans.map((plan) => ({
      id: plan.id,
      label: plan.label,
    })),
    ...(pricing.apiModels ?? []).map((model) => ({
      id: model.id,
      label: model.label,
    })),
  ];
};

const createToolDraft = (toolId: ToolId = "cursor"): ToolSpendDraft => {
  const firstPlan = getPlanOptions(toolId)[0];

  return {
    toolId,
    planId: firstPlan?.id ?? "",
    monthlySpend: "",
    seats: "1",
  };
};

const initialForm: AuditFormDraft = {
  teamSize: "1",
  useCase: "coding",
  tools: [createToolDraft()],
};

const parseMoneyInput = (value: string) => {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return Math.max(0, parsed);
};

const parseSeatInput = (value: string) => {
  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    return 1;
  }

  return Math.max(1, Math.floor(parsed));
};

const toAuditInput = (draft: AuditFormDraft): AuditInput => {
  return {
    teamSize: parseSeatInput(draft.teamSize),
    useCase: draft.useCase,
    tools: draft.tools.map((tool): ToolSpendInput => {
      return {
        toolId: tool.toolId,
        planId: tool.planId,
        monthlySpend: parseMoneyInput(tool.monthlySpend),
        seats: parseSeatInput(tool.seats),
      };
    }),
  };
};

export const AuditForm = () => {
  const [form, setForm, hasLoadedForm] =
    useFormPersistence<AuditFormDraft>(STORAGE_KEY, initialForm);

  const [result, setResult] = useState<AuditResult | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSavingAudit, setIsSavingAudit] = useState(false);

  const auditInput = useMemo(() => toAuditInput(form), [form]);

  const totalCurrentSpend = auditInput.tools.reduce(
    (sum, tool) => sum + tool.monthlySpend,
    0,
  );

  const updateForm = (nextForm: AuditFormDraft) => {
    setForm(nextForm);
    setResult(null);
    setShareUrl(null);
  };

  const updateTeamSize = (event: ChangeEvent<HTMLInputElement>) => {
    updateForm({
      ...form,
      teamSize: event.target.value,
    });
  };

  const updateUseCase = (event: ChangeEvent<HTMLSelectElement>) => {
    updateForm({
      ...form,
      useCase: event.target.value as UseCase,
    });
  };

  const updateTool = (
    toolIndex: number,
    updates: Partial<ToolSpendDraft>,
  ) => {
    updateForm({
      ...form,
      tools: form.tools.map((tool, index) =>
        index === toolIndex ? { ...tool, ...updates } : tool,
      ),
    });
  };

  const updateToolId = (
    toolIndex: number,
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const toolId = event.target.value as ToolId;
    const firstPlan = getPlanOptions(toolId)[0];

    updateTool(toolIndex, {
      toolId,
      planId: firstPlan?.id ?? "",
    });
  };

  const addTool = () => {
    const existingToolIds = new Set(form.tools.map((tool) => tool.toolId));
    const nextToolId =
      TOOL_IDS.find((toolId) => !existingToolIds.has(toolId)) ?? "cursor";

    updateForm({
      ...form,
      tools: [...form.tools, createToolDraft(nextToolId)],
    });
  };

  const removeTool = (toolIndex: number) => {
    if (form.tools.length === 1) {
      return;
    }

    updateForm({
      ...form,
      tools: form.tools.filter((_, index) => index !== toolIndex),
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSavingAudit(true);

    try {
      const response = await fetch("/api/audits", {
        body: JSON.stringify({ input: auditInput }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Could not save audit.");
      }

      const data = (await response.json()) as CreateAuditResponse;

      setResult(data.result);
      setShareUrl(data.shareUrl);
    } catch {
      setResult(runAudit(auditInput));
      setShareUrl(null);
    } finally {
      setIsSavingAudit(false);
    }
  };

  if (!hasLoadedForm) {
    return (
      <section className="min-h-screen bg-[#090a0f] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm text-slate-400">Loading saved audit form...</p>
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-[#090a0f] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              SpendLens
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Audit your AI spend before it quietly becomes infrastructure tax.
            </h1>
          </div>

          <p className="max-w-sm text-sm leading-6 text-slate-400">
            Compare tools, seats, and spend against public pricing benchmarks.
            The output is a practical first-pass savings report, not a final
            billing statement.
          </p>
        </header>

        {result ? (
          <div className="space-y-6">
            <AuditResults
              result={result}
              toolsReviewed={auditInput.tools.length}
              totalCurrentSpend={totalCurrentSpend}
            />

            {shareUrl ? (
              <div className="flex flex-col gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Saved report ready
                  </p>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                    This audit now has a public share page. The shared page
                    keeps the results available after refresh and excludes
                    private lead details.
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-emerald-300">
                    {shareUrl}
                  </p>
                </div>

                <a
                  className="shrink-0 rounded-xl bg-emerald-400 px-4 py-2 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                  href={shareUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open saved report
                </a>
              </div>
            ) : null}

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-white">
                    Edit inputs
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Change the numbers and run the audit again.
                  </p>
                </div>
              </div>

              <AuditFields
                addTool={addTool}
                form={form}
                isSavingAudit={isSavingAudit}
                removeTool={removeTool}
                updateTeamSize={updateTeamSize}
                updateTool={updateTool}
                updateToolId={updateToolId}
                updateUseCase={updateUseCase}
                onSubmit={handleSubmit}
              />
            </section>
          </div>
        ) : (
          <section className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30">
            <div className="mb-6 border-b border-white/10 pb-5">
              <h2 className="text-xl font-semibold tracking-tight text-white">
                Build your spend profile
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Start with the tools you actually pay for. You can add more
                tools, choose plans or API models, and enter your current spend.
              </p>
            </div>

            <AuditFields
              addTool={addTool}
              form={form}
              isSavingAudit={isSavingAudit}
              removeTool={removeTool}
              updateTeamSize={updateTeamSize}
              updateTool={updateTool}
              updateToolId={updateToolId}
              updateUseCase={updateUseCase}
              onSubmit={handleSubmit}
            />
          </section>
        )}
      </div>
    </main>
  );
};

interface AuditFieldsProps {
  form: AuditFormDraft;
  isSavingAudit: boolean;
  addTool: () => void;
  removeTool: (toolIndex: number) => void;
  updateTeamSize: (event: ChangeEvent<HTMLInputElement>) => void;
  updateUseCase: (event: ChangeEvent<HTMLSelectElement>) => void;
  updateToolId: (
    toolIndex: number,
    event: ChangeEvent<HTMLSelectElement>,
  ) => void;
  updateTool: (toolIndex: number, updates: Partial<ToolSpendDraft>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const inputClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-[#12141c] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10";

const labelClassName = "text-sm font-medium text-slate-300";

const AuditFields = ({
  form,
  isSavingAudit,
  addTool,
  removeTool,
  updateTeamSize,
  updateUseCase,
  updateTool,
  updateToolId,
  onSubmit,
}: AuditFieldsProps) => {
  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className={labelClassName}>Team size</span>
          <input
            className={inputClassName}
            inputMode="numeric"
            min={1}
            onChange={updateTeamSize}
            placeholder="1"
            type="number"
            value={form.teamSize}
          />
        </label>

        <label className="space-y-2">
          <span className={labelClassName}>Primary use case</span>
          <select
            className={inputClassName}
            onChange={updateUseCase}
            value={form.useCase}
          >
            {USE_CASE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight text-white">
            AI tools
          </h2>

          <button
            className="rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-emerald-400 hover:text-emerald-300"
            onClick={addTool}
            type="button"
          >
            Add tool
          </button>
        </div>

        <div className="space-y-3">
          {form.tools.map((tool, index) => {
            const planOptions = getPlanOptions(tool.toolId);

            return (
              <div
                className="rounded-2xl border border-white/10 bg-[#12141c] p-4"
                key={`${tool.toolId}-${index}`}
              >
                <div className="grid gap-4 md:grid-cols-[1.1fr_1.2fr_0.8fr_0.6fr]">
                  <label className="space-y-2">
                    <span className={labelClassName}>Tool</span>
                    <select
                      className={inputClassName}
                      onChange={(event) => updateToolId(index, event)}
                      value={tool.toolId}
                    >
                      {TOOL_IDS.map((toolId) => (
                        <option key={toolId} value={toolId}>
                          {TOOL_PRICING[toolId].name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className={labelClassName}>Plan or model</span>
                    <select
                      className={inputClassName}
                      onChange={(event) =>
                        updateTool(index, { planId: event.target.value })
                      }
                      value={tool.planId}
                    >
                      {planOptions.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className={labelClassName}>Monthly spend</span>
                    <input
                      className={inputClassName}
                      inputMode="decimal"
                      min={0}
                      onChange={(event) =>
                        updateTool(index, {
                          monthlySpend: event.target.value,
                        })
                      }
                      placeholder="0"
                      type="number"
                      value={tool.monthlySpend}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className={labelClassName}>Seats</span>
                    <input
                      className={inputClassName}
                      inputMode="numeric"
                      min={1}
                      onChange={(event) =>
                        updateTool(index, {
                          seats: event.target.value,
                        })
                      }
                      placeholder="1"
                      type="number"
                      value={tool.seats}
                    />
                  </label>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    className="text-sm font-medium text-slate-500 transition hover:text-red-400 disabled:cursor-not-allowed disabled:text-slate-700"
                    disabled={form.tools.length === 1}
                    onClick={() => removeTool(index)}
                    type="button"
                  >
                    Remove tool
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="h-12 w-full rounded-xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSavingAudit}
        type="submit"
      >
        {isSavingAudit ? "Saving audit..." : "Generate audit"}
      </button>
    </form>
  );
};
