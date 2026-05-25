# Metrics

## North Star Metric

My North Star metric is **qualified credit-review requests per month**.

SpendLens is not a product people need to open every day, so daily active users would be misleading. The product creates value for Credex when a team with a real savings opportunity sees an audit, trusts it enough to share contact information, and requests a conversation about AI credits. I would define a qualified request as a submitted lead attached to an audit showing either more than `$500/month` in estimated savings or recurring additional-credit spend once that field is added.

## Input Metrics

| Input Metric | Why It Matters |
| --- | --- |
| Audit completion rate | Measures whether the landing copy and form are clear enough for visitors to reach value. |
| High-opportunity audit rate | Measures whether distribution is attracting real credit-spending teams rather than mostly low-spend curiosity traffic. |
| Result-to-lead conversion rate | Measures whether the result is trustworthy and the post-value email/credit-review action is persuasive. |

I would also watch public report shares as a supporting signal, because a developer may generate the audit while a manager or founder decides whether to act.

## What I Would Instrument First

The first events would be:

- `audit_started`
- `audit_completed`, with anonymous savings band and use case
- `high_savings_cta_shown`
- `credit_review_clicked`
- `lead_submitted`
- `public_report_opened`
- `consultation_booked`, recorded when Credex follows up
- `credit_purchase_completed`, recorded from the sales outcome

I would store only what is needed for funnel measurement and avoid placing email addresses in analytics events.

## Pivot Trigger

After the first `100` completed audits, I would expect at least `5` high-opportunity audits and at least `2` qualified credit-review requests. If fewer than `5%` of audits show meaningful savings, distribution is reaching the wrong audience. If high-opportunity audits appear but fewer than `20%` of those users request a review, the trust, recommendation quality, or CTA needs to change before investing further in distribution.
