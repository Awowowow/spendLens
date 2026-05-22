"use client";

import { useState } from "react";
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

const STORAGE_KEY = "spendlens-audit-form";

const TOOL_IDS = Object.keys(TOOL_PRICING) as ToolId[];

const USE_CASE_OPTIONS: { value: UseCase; label: string }[] = [
  { value: "coding", label: "Coding" },
  { value: "writing", label: "Writing" },
  { value: "data", label: "Data" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed" },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);

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

const createToolInput = (toolId: ToolId = "cursor"): ToolSpendInput => {
  const firstPlan = getPlanOptions(toolId)[0];

  return {
    toolId,
    planId: firstPlan?.id ?? "",
    monthlySpend: 0,
    seats: 1,
  };
};

const initialForm: AuditInput = {
  teamSize: 1,
  useCase: "coding",
  tools: [createToolInput()],
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

export const AuditForm = () => {
  const [form, setForm, hasLoadedForm] = useFormPersistence<AuditInput>(
    STORAGE_KEY,
    initialForm,
  );
  const [result, setResult] = useState<AuditResult | null>(null);

  const updateForm = (nextForm: AuditInput) => {
    setForm(nextForm);
    setResult(null);
  };

  const updateTeamSize = (event: ChangeEvent<HTMLInputElement>) => {
    updateForm({
      ...form,
      teamSize: parseSeatInput(event.target.value),
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
    updates: Partial<ToolSpendInput>,
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
      tools: [...form.tools, createToolInput(nextToolId)],
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResult(runAudit(form));
  };

  if (!hasLoadedForm) {
    return (
      <section className="w-full bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-600">
            Loading saved audit form...
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-slate-50 px-4 py-10 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            SpendLens
          </p>
          <div className="space-y-3">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-950">
              Find the quiet leaks in your AI stack.
            </h1>
            <p className="max-w-xl text-base leading-7 text-slate-600">
              Enter your current tools, seats, and monthly spend. SpendLens
              compares them against public pricing benchmarks and returns a
              practical audit.
            </p>
          </div>
        </div>

        <form
          className="space-y-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Team size
              </span>
              <input
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                min={1}
                onChange={updateTeamSize}
                onFocus={(event) => event.target.select()}
                type="number"
                value={form.teamSize}
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                Primary use case
              </span>
              <select
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-950">
                AI tools
              </h2>
              <button
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700"
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
                    className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2"
                    key={`${tool.toolId}-${index}`}
                  >
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">
                        Tool
                      </span>
                      <select
                        className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                      <span className="text-sm font-medium text-slate-700">
                        Plan or model
                      </span>
                      <select
                        className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
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
                      <span className="text-sm font-medium text-slate-700">
                        Monthly spend
                      </span>
                      <input
                        className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        min={0}
                        onChange={(event) =>
                          updateTool(index, {
                            monthlySpend: parseMoneyInput(event.target.value),
                          })
                        }
                        onFocus={(event) => event.target.select()}
                        type="number"
                        value={tool.monthlySpend === 0 ? "" : tool.monthlySpend}
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">
                        Seats
                      </span>
                      <input
                        className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        min={1}
                        onChange={(event) =>
                          updateTool(index, {
                            seats: parseSeatInput(event.target.value),
                          })
                        }
                        onFocus={(event) => event.target.select()}
                        type="number"
                        value={tool.seats}
                      />
                    </label>

                    <div className="sm:col-span-2">
                      <button
                        className="text-sm font-medium text-slate-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:text-slate-300"
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
            className="h-12 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800"
            type="submit"
          >
            Run audit
          </button>
        </form>

        {result ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-start-2">
            <p className="text-sm font-medium text-slate-500">
              Estimated savings
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-3xl font-semibold text-slate-950">
                  {formatCurrency(result.totalMonthlySavings)}
                </p>
                <p className="text-sm text-slate-500">per month</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-slate-950">
                  {formatCurrency(result.totalAnnualSavings)}
                </p>
                <p className="text-sm text-slate-500">per year</p>
              </div>
            </div>

            {result.isLowSavings ? (
              <p className="mt-5 rounded-md bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">
                Your AI stack looks lean. Based on public pricing benchmarks,
                there may not be much obvious spend to cut right now.
              </p>
            ) : null}

            {result.shouldShowCredexCta ? (
              <p className="mt-5 rounded-md bg-slate-950 p-3 text-sm leading-6 text-white">
                This audit shows a larger savings opportunity. Credex could help
                review whether discounted AI credits apply to this stack.
              </p>
            ) : null}

            <div className="mt-5 space-y-3">
              {result.recommendations.map((recommendation) => (
                <article
                  className="rounded-lg border border-slate-200 p-4"
                  key={`${recommendation.toolId}-${recommendation.action}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        {recommendation.action}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {recommendation.reason}
                      </p>
                    </div>
                    <p className="shrink-0 rounded-md bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-800">
                      {formatCurrency(
                        recommendation.estimatedMonthlySavings,
                      )}
                      /mo
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};