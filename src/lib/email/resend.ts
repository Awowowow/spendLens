import { Resend } from "resend";

interface LeadConfirmationEmail {
  to: string;
  shareUrl?: string;
  totalMonthlySavings: number;
}

const cleanEnvValue = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const trimmedValue = value.trim().replace(/^["']|["']$/g, "");
  const assignmentMatch = trimmedValue.match(/^[A-Z0-9_]+=(.+)$/);

  return (assignmentMatch?.[1] ?? trimmedValue)
    .trim()
    .replace(/^["']|["']$/g, "");
};

export const sendLeadConfirmationEmail = async ({
  to,
  shareUrl,
  totalMonthlySavings,
}: LeadConfirmationEmail) => {
  const resendApiKey = cleanEnvValue(process.env.RESEND_API_KEY);
  const fromEmail = cleanEnvValue(process.env.RESEND_FROM_EMAIL);

  if (!resendApiKey || !fromEmail) {
    return { sent: false };
  }

  const resend = new Resend(resendApiKey);
  const savingsText = new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(totalMonthlySavings);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject: "Your SpendLens audit report",
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h1 style="margin-bottom: 8px;">Your SpendLens audit is ready</h1>
        <p>SpendLens found an estimated <strong>${savingsText}/month</strong> in benchmark-based savings opportunities.</p>
        ${
          shareUrl
            ? `<p>You can view the public report here: <a href="${shareUrl}">${shareUrl}</a></p>`
            : ""
        }
        <p style="color: #6b7280; font-size: 14px;">Pricing is used as a benchmark, not a final billing statement.</p>
      </div>
    `,
  });

  if (error) {
    console.warn("Resend email failed:", error.message);
    return { sent: false };
  }

  return { sent: true };
};
