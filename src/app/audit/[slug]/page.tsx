import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuditResults } from "../../../components/audit/AuditResults";
import type {
  AuditResult,
  Recommendation,
  ToolSpendInput,
} from "../../../lib/audit/types";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

interface PublicAuditRow {
  slug: string;
  total_monthly_savings: number;
  total_annual_savings: number;
  tools: ToolSpendInput[];
  recommendations: Recommendation[];
  summary: string | null;
}

interface PublicAuditPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const formatDollars = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount);
};

export async function generateMetadata({
  params,
}: PublicAuditPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from("audits")
      .select("total_monthly_savings, total_annual_savings")
      .eq("slug", slug)
      .maybeSingle<{
        total_monthly_savings: number;
        total_annual_savings: number;
      }>();

    if (!data) {
      return {
        title: "SpendLens shared AI spend audit",
      };
    }

    const monthlySavings = formatDollars(Number(data.total_monthly_savings));
    const annualSavings = formatDollars(Number(data.total_annual_savings));
    const title = `${monthlySavings}/mo AI savings found | SpendLens`;
    const description = `A public SpendLens audit found ${monthlySavings}/month and ${annualSavings}/year in benchmark-based AI spend opportunities.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
    };
  } catch {
    return {
      title: "SpendLens shared AI spend audit",
    };
  }
}

export default async function PublicAuditPage({
  params,
}: PublicAuditPageProps) {
  const { slug } = await params;
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("audits")
    .select(
      "slug, total_monthly_savings, total_annual_savings, tools, recommendations, summary",
    )
    .eq("slug", slug)
    .single<PublicAuditRow>();

  if (error || !data) {
    notFound();
  }

  const totalMonthlySavings = Number(data.total_monthly_savings);
  const totalAnnualSavings = Number(data.total_annual_savings);

  const result: AuditResult = {
    totalMonthlySavings,
    totalAnnualSavings,
    recommendations: data.recommendations,
    isLowSavings: totalMonthlySavings < 100,
    shouldShowCredexCta: totalMonthlySavings > 500,
  };

  const totalCurrentSpend = data.tools.reduce(
    (sum, tool) => sum + tool.monthlySpend,
    0,
  );

  return (
    <main className="min-h-screen bg-[#090a0f] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              SpendLens
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Shared AI spend audit
            </h1>
          </div>

          <p className="max-w-sm text-sm leading-6 text-slate-400">
            This public report shows benchmark-based savings opportunities. It
            does not include lead contact details or private company fields.
          </p>
        </header>

        <AuditResults
          result={result}
          summary={data.summary}
          toolsReviewed={data.tools.length}
          totalCurrentSpend={totalCurrentSpend}
        />
      </div>
    </main>
  );
}
